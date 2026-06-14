import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type DocumentData,
} from 'firebase/firestore';
import type {
  Place,
  Discovery,
  Expedition,
  Journey,
  Relationship,
  PlaceKind,
  DiscoveryCategory,
  RecommendationVerdict,
  JourneyMode,
} from '../types';
import { countryName } from '../data/countries';
import { SEED_PLACES, SEED_DISCOVERIES, SEED_EXPEDITIONS } from '../lib/seed';
import { db } from '../lib/firebase';
import { useAuth } from './auth';

interface DataShape {
  places: Place[];
  discoveries: Discovery[];
  expeditions: Expedition[];
}

interface DataApi extends DataShape {
  loaded: boolean;
  /** True while reading from Firestore for a signed-in member. */
  cloud: boolean;
  addPlace: (input: {
    kind: PlaceKind;
    countryCode: string;
    name?: string;
    relationships: Relationship[];
    firstYear?: number;
  }) => void;
  removePlace: (id: string) => void;
  addDiscovery: (input: {
    name: string;
    category: DiscoveryCategory;
    countryCode?: string;
    city?: string;
    verdict?: RecommendationVerdict;
    note?: string;
  }) => void;
  removeDiscovery: (id: string) => void;
  addExpedition: (input: {
    title: string;
    countryCodes: string[];
    startDate?: string;
    endDate?: string;
    mode?: JourneyMode;
    from?: string;
    to?: string;
    note?: string;
  }) => void;
  removeExpedition: (id: string) => void;
}

const KEY = 'worldly:data:v1';
type Coll = 'places' | 'discoveries' | 'expeditions';

const noop = () => {};
const DataContext = createContext<DataApi>({
  places: [],
  discoveries: [],
  expeditions: [],
  loaded: false,
  cloud: false,
  addPlace: noop,
  removePlace: noop,
  addDiscovery: noop,
  removeDiscovery: noop,
  addExpedition: noop,
  removeExpedition: noop,
});

export function useData(): DataApi {
  return useContext(DataContext);
}

function newId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `id_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Strip undefined fields — Firestore rejects them. */
function clean<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

// --- Firestore <-> domain converters (mirror the web src/lib/*.ts contract:
//     top-level collections keyed by a `userId` field, serverTimestamp dates) --
function millis(ts: { toMillis?: () => number } | undefined): number {
  return ts?.toMillis?.() ?? Date.now();
}
function placeFromDoc(id: string, d: DocumentData): Place {
  return {
    id,
    userId: d.userId,
    kind: (d.kind ?? 'country') as PlaceKind,
    countryCode: d.countryCode ?? '',
    name: d.name ?? '',
    relationships: (d.relationships ?? []) as Relationship[],
    firstYear: typeof d.firstYear === 'number' ? d.firstYear : undefined,
    note: d.note || undefined,
    createdAt: millis(d.createdAt),
    updatedAt: millis(d.updatedAt),
  };
}
function discoveryFromDoc(id: string, d: DocumentData): Discovery {
  return {
    id,
    userId: d.userId,
    name: d.name ?? '',
    category: (d.category ?? 'food') as DiscoveryCategory,
    countryCode: d.countryCode || undefined,
    city: d.city || undefined,
    verdict: (d.verdict || undefined) as RecommendationVerdict | undefined,
    note: d.note || undefined,
    createdAt: millis(d.createdAt),
    updatedAt: millis(d.updatedAt),
  };
}
function expeditionFromDoc(id: string, d: DocumentData): Expedition {
  return {
    id,
    userId: d.userId,
    title: d.title ?? '',
    startDate: d.startDate || undefined,
    endDate: d.endDate || undefined,
    countryCodes: (d.countryCodes ?? []) as string[],
    journeys: (d.journeys ?? []) as Journey[],
    note: d.note || undefined,
    createdAt: millis(d.createdAt),
    updatedAt: millis(d.updatedAt),
  };
}

const SEED: DataShape = {
  places: SEED_PLACES,
  discoveries: SEED_DISCOVERIES,
  expeditions: SEED_EXPEDITIONS,
};

const EMPTY: DataShape = { places: [], discoveries: [], expeditions: [] };

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const cloud = Boolean(uid && db);

  const [data, setData] = useState<DataShape>(SEED);
  const [loaded, setLoaded] = useState(false);
  // Keep the latest local snapshot for functional updates without re-subscribing.
  const localRef = useRef<DataShape>(SEED);

  // --- Local (demo / signed-out) persistence -------------------------------
  useEffect(() => {
    if (cloud) return;
    let active = true;
    setLoaded(false);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (active && raw) {
          const parsed = JSON.parse(raw) as DataShape;
          localRef.current = parsed;
          setData(parsed);
        } else {
          localRef.current = SEED;
          setData(SEED);
          await AsyncStorage.setItem(KEY, JSON.stringify(SEED));
        }
      } catch {
        /* keep seed */
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [cloud]);

  // --- Cloud (signed-in) live subscriptions --------------------------------
  useEffect(() => {
    if (!cloud || !uid || !db) return;
    const fdb = db;
    setLoaded(false);
    setData(EMPTY);
    const ready: Record<Coll, boolean> = {
      places: false,
      discoveries: false,
      expeditions: false,
    };
    const markReady = (c: Coll) => {
      if (!ready[c]) {
        ready[c] = true;
        if (ready.places && ready.discoveries && ready.expeditions) setLoaded(true);
      }
    };
    const q = (c: Coll) => query(collection(fdb, c), where('userId', '==', uid));
    const unsubs = [
      onSnapshot(q('places'), (snap) => {
        setData((p) => ({ ...p, places: snap.docs.map((d) => placeFromDoc(d.id, d.data())) }));
        markReady('places');
      }),
      onSnapshot(q('discoveries'), (snap) => {
        setData((p) => ({ ...p, discoveries: snap.docs.map((d) => discoveryFromDoc(d.id, d.data())) }));
        markReady('discoveries');
      }),
      onSnapshot(q('expeditions'), (snap) => {
        setData((p) => ({ ...p, expeditions: snap.docs.map((d) => expeditionFromDoc(d.id, d.data())) }));
        markReady('expeditions');
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [cloud, uid]);

  function persistLocal(next: DataShape) {
    localRef.current = next;
    setData(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }

  const api = useMemo<DataApi>(() => {
    const fdb = db;
    function cloudCreate(coll: Coll, fields: Record<string, unknown>) {
      if (!fdb || !uid) return;
      addDoc(collection(fdb, coll), {
        userId: uid,
        ...fields,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(() => {});
    }
    function remove(coll: Coll, id: string) {
      if (cloud && fdb && uid) {
        deleteDoc(doc(fdb, coll, id)).catch(() => {});
      } else {
        const cur = localRef.current;
        const list = cur[coll] as { id: string }[];
        persistLocal({ ...cur, [coll]: list.filter((x) => x.id !== id) } as DataShape);
      }
    }

    return {
      ...data,
      loaded,
      cloud,
      addPlace: (input) => {
        const name =
          input.kind === 'country'
            ? countryName(input.countryCode)
            : (input.name ?? '').trim();
        if (cloud) {
          cloudCreate('places', {
            kind: input.kind,
            countryCode: input.countryCode,
            name,
            relationships: input.relationships,
            firstYear: input.firstYear ?? null,
            note: null,
          });
        } else {
          const now = Date.now();
          const place: Place = {
            id: newId(),
            userId: 'me',
            kind: input.kind,
            countryCode: input.countryCode,
            name,
            relationships: input.relationships,
            firstYear: input.firstYear,
            createdAt: now,
            updatedAt: now,
          };
          const cur = localRef.current;
          persistLocal({ ...cur, places: [...cur.places, place] });
        }
      },
      removePlace: (id) => remove('places', id),
      addDiscovery: (input) => {
        if (cloud) {
          cloudCreate('discoveries', {
            name: input.name.trim(),
            category: input.category,
            countryCode: input.countryCode || null,
            city: input.city?.trim() || null,
            verdict: input.verdict || null,
            note: input.note?.trim() || null,
          });
        } else {
          const now = Date.now();
          const discovery: Discovery = {
            id: newId(),
            userId: 'me',
            name: input.name.trim(),
            category: input.category,
            countryCode: input.countryCode,
            city: input.city?.trim() || undefined,
            verdict: input.verdict,
            note: input.note?.trim() || undefined,
            createdAt: now,
            updatedAt: now,
          };
          const cur = localRef.current;
          persistLocal({ ...cur, discoveries: [discovery, ...cur.discoveries] });
        }
      },
      removeDiscovery: (id) => remove('discoveries', id),
      addExpedition: (input) => {
        const journeys: Journey[] =
          input.mode && (input.from || input.to)
            ? [
                clean({
                  id: newId(),
                  mode: input.mode,
                  from: input.from?.trim() || undefined,
                  to: input.to?.trim() || undefined,
                }) as Journey,
              ]
            : [];
        if (cloud) {
          cloudCreate('expeditions', {
            title: input.title.trim(),
            startDate: input.startDate || null,
            endDate: input.endDate || null,
            countryCodes: input.countryCodes,
            journeys,
            note: input.note?.trim() || null,
          });
        } else {
          const now = Date.now();
          const expedition: Expedition = {
            id: newId(),
            userId: 'me',
            title: input.title.trim(),
            startDate: input.startDate,
            endDate: input.endDate,
            countryCodes: input.countryCodes,
            journeys,
            note: input.note?.trim() || undefined,
            createdAt: now,
            updatedAt: now,
          };
          const cur = localRef.current;
          persistLocal({ ...cur, expeditions: [expedition, ...cur.expeditions] });
        }
      },
      removeExpedition: (id) => remove('expeditions', id),
    };
  }, [data, loaded, cloud, uid]);

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>;
}

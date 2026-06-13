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
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
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
    const colls: Coll[] = ['places', 'discoveries', 'expeditions'];
    const unsubs = colls.map((c) =>
      onSnapshot(collection(fdb, 'users', uid, c), (snap) => {
        const rows = snap.docs.map((d) => d.data());
        setData((prev) => ({ ...prev, [c]: rows }) as DataShape);
        if (!ready[c]) {
          ready[c] = true;
          if (colls.every((k) => ready[k])) setLoaded(true);
        }
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [cloud, uid]);

  function persistLocal(next: DataShape) {
    localRef.current = next;
    setData(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }

  const api = useMemo<DataApi>(() => {
    function add(coll: Coll, entity: Place | Discovery | Expedition, prepend: boolean) {
      if (cloud && uid && db) {
        setDoc(doc(db, 'users', uid, coll, entity.id), clean(entity)).catch(() => {});
      } else {
        const cur = localRef.current;
        const list = cur[coll] as (Place | Discovery | Expedition)[];
        persistLocal({
          ...cur,
          [coll]: prepend ? [entity, ...list] : [...list, entity],
        });
      }
    }
    function remove(coll: Coll, id: string) {
      if (cloud && uid && db) {
        deleteDoc(doc(db, 'users', uid, coll, id)).catch(() => {});
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
        const now = Date.now();
        const place: Place = {
          id: newId(),
          userId: uid ?? 'me',
          kind: input.kind,
          countryCode: input.countryCode,
          name:
            input.kind === 'country'
              ? countryName(input.countryCode)
              : (input.name ?? '').trim(),
          relationships: input.relationships,
          firstYear: input.firstYear,
          createdAt: now,
          updatedAt: now,
        };
        add('places', place, false);
      },
      removePlace: (id) => remove('places', id),
      addDiscovery: (input) => {
        const now = Date.now();
        const discovery: Discovery = {
          id: newId(),
          userId: uid ?? 'me',
          name: input.name.trim(),
          category: input.category,
          countryCode: input.countryCode,
          city: input.city?.trim() || undefined,
          verdict: input.verdict,
          note: input.note?.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        };
        add('discoveries', discovery, true);
      },
      removeDiscovery: (id) => remove('discoveries', id),
      addExpedition: (input) => {
        const now = Date.now();
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
        const expedition: Expedition = {
          id: newId(),
          userId: uid ?? 'me',
          title: input.title.trim(),
          startDate: input.startDate,
          endDate: input.endDate,
          countryCodes: input.countryCodes,
          journeys,
          note: input.note?.trim() || undefined,
          createdAt: now,
          updatedAt: now,
        };
        add('expeditions', expedition, true);
      },
      removeExpedition: (id) => remove('expeditions', id),
    };
  }, [data, loaded, cloud, uid]);

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>;
}

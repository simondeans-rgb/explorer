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
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type DocumentData,
} from 'firebase/firestore';
import {
  ref,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import type {
  Place,
  Discovery,
  Expedition,
  Capture,
  Trip,
  Journey,
  Relationship,
  PlaceKind,
  DiscoveryCategory,
  RecommendationVerdict,
  JourneyMode,
} from '../types';
import { countryName } from '../data/countries';
import {
  SEED_PLACES,
  SEED_DISCOVERIES,
  SEED_EXPEDITIONS,
  SEED_CAPTURES,
  SEED_TRIPS,
} from '../lib/seed';
import { db, storage } from '../lib/firebase';
import { useAuth } from './auth';

interface DataShape {
  places: Place[];
  discoveries: Discovery[];
  expeditions: Expedition[];
  captures: Capture[];
  trips: Trip[];
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
    photo?: string;
  }) => Promise<void>;
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
  addCapture: (input: {
    dataUrl: string;
    countryCode?: string;
    city?: string;
    caption?: string;
  }) => Promise<void>;
  removeCapture: (id: string) => void;
  addTrip: (input: {
    title: string;
    countryCode: string;
    startDate: string;
    endDate?: string;
    note?: string;
  }) => void;
  removeTrip: (id: string) => void;
  /** Bulk import places (countries/cities), de-duplicating by code+name. */
  importPlaces: (
    rows: { kind: PlaceKind; countryCode: string; name?: string; firstYear?: number }[],
  ) => Promise<number>;
  /** Bulk import journeys/expeditions (e.g. from a Flighty CSV). */
  importExpeditions: (
    rows: {
      title: string;
      startDate?: string;
      endDate?: string;
      countryCodes: string[];
      journeys: Journey[];
      note?: string;
    }[],
  ) => Promise<number>;
}

const KEY = 'worldly:data:v1';
type Coll = 'places' | 'discoveries' | 'expeditions' | 'captures' | 'trips';

const noop = () => {};
const DataContext = createContext<DataApi>({
  places: [],
  discoveries: [],
  expeditions: [],
  captures: [],
  trips: [],
  loaded: false,
  cloud: false,
  addPlace: noop,
  removePlace: noop,
  addDiscovery: async () => {},
  removeDiscovery: noop,
  addExpedition: noop,
  removeExpedition: noop,
  addCapture: async () => {},
  removeCapture: noop,
  addTrip: noop,
  removeTrip: noop,
  importPlaces: async () => 0,
  importExpeditions: async () => 0,
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
    photo: d.photo || undefined,
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
function captureFromDoc(id: string, d: DocumentData): Capture {
  return {
    id,
    userId: d.userId,
    dataUrl: d.dataUrl ?? '',
    countryCode: d.countryCode || undefined,
    city: d.city || undefined,
    expeditionId: d.expeditionId || undefined,
    discoveryId: d.discoveryId || undefined,
    caption: d.caption || undefined,
    createdAt: millis(d.createdAt),
  };
}

function tripFromDoc(id: string, d: DocumentData): Trip {
  return {
    id,
    userId: d.userId,
    title: d.title ?? '',
    countryCode: d.countryCode ?? '',
    startDate: d.startDate ?? '',
    endDate: d.endDate || undefined,
    itinerary: Array.isArray(d.itinerary) ? d.itinerary : [],
    note: d.note || undefined,
    createdAt: millis(d.createdAt),
    updatedAt: millis(d.updatedAt),
  };
}

const SEED: DataShape = {
  places: SEED_PLACES,
  discoveries: SEED_DISCOVERIES,
  expeditions: SEED_EXPEDITIONS,
  captures: SEED_CAPTURES,
  trips: SEED_TRIPS,
};

const EMPTY: DataShape = {
  places: [],
  discoveries: [],
  expeditions: [],
  captures: [],
  trips: [],
};

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
          // Backfill arrays added in later versions so older persisted data
          // (e.g. saved before `captures` existed) still loads cleanly.
          const parsed = JSON.parse(raw) as Partial<DataShape>;
          const merged: DataShape = {
            places: parsed.places ?? [],
            discoveries: parsed.discoveries ?? [],
            expeditions: parsed.expeditions ?? [],
            captures: parsed.captures ?? [],
            trips: parsed.trips ?? [],
          };
          localRef.current = merged;
          setData(merged);
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
      captures: false,
      trips: false,
    };
    const markReady = (c: Coll) => {
      if (!ready[c]) {
        ready[c] = true;
        if (ready.places && ready.discoveries && ready.expeditions && ready.captures && ready.trips) {
          setLoaded(true);
        }
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
      onSnapshot(q('captures'), (snap) => {
        setData((p) => ({ ...p, captures: snap.docs.map((d) => captureFromDoc(d.id, d.data())) }));
        markReady('captures');
      }),
      onSnapshot(q('trips'), (snap) => {
        setData((p) => ({ ...p, trips: snap.docs.map((d) => tripFromDoc(d.id, d.data())) }));
        markReady('trips');
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
      addDiscovery: async (input) => {
        if (cloud && fdb && uid) {
          let photoUrl: string | null = null;
          let photoPath: string | null = null;
          if (storage && input.photo?.startsWith('data:')) {
            const path = `users/${uid}/discoveries/${newId()}.jpg`;
            const r = ref(storage, path);
            await uploadString(r, input.photo, 'data_url', {
              contentType: 'image/jpeg',
              cacheControl: 'public, max-age=31536000, immutable',
            });
            photoUrl = await getDownloadURL(r);
            photoPath = path;
          }
          await addDoc(collection(fdb, 'discoveries'), {
            userId: uid,
            name: input.name.trim(),
            category: input.category,
            countryCode: input.countryCode || null,
            city: input.city?.trim() || null,
            verdict: input.verdict || null,
            note: input.note?.trim() || null,
            photo: photoUrl,
            photoPath,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
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
            photo: input.photo,
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
      addCapture: async (input) => {
        if (cloud && fdb && uid) {
          let url = input.dataUrl;
          let storagePath: string | null = null;
          if (storage && input.dataUrl.startsWith('data:')) {
            const path = `users/${uid}/captures/${newId()}.jpg`;
            const r = ref(storage, path);
            await uploadString(r, input.dataUrl, 'data_url', {
              contentType: 'image/jpeg',
              cacheControl: 'public, max-age=31536000, immutable',
            });
            url = await getDownloadURL(r);
            storagePath = path;
          }
          await addDoc(collection(fdb, 'captures'), {
            userId: uid,
            dataUrl: url,
            countryCode: input.countryCode || null,
            city: input.city?.trim() || null,
            expeditionId: null,
            discoveryId: null,
            caption: input.caption?.trim() || null,
            storagePath,
            createdAt: serverTimestamp(),
          });
        } else {
          const capture: Capture = {
            id: newId(),
            userId: 'me',
            dataUrl: input.dataUrl,
            countryCode: input.countryCode,
            city: input.city?.trim() || undefined,
            caption: input.caption?.trim() || undefined,
            createdAt: Date.now(),
          };
          const cur = localRef.current;
          persistLocal({ ...cur, captures: [capture, ...cur.captures] });
        }
      },
      removeCapture: (id) => {
        if (cloud && fdb && uid) {
          (async () => {
            try {
              const snap = await getDoc(doc(fdb, 'captures', id));
              const path = snap.data()?.storagePath as string | undefined;
              if (storage && path) await deleteObject(ref(storage, path));
            } catch {
              /* best-effort image cleanup */
            }
            deleteDoc(doc(fdb, 'captures', id)).catch(() => {});
          })();
        } else {
          const cur = localRef.current;
          persistLocal({ ...cur, captures: cur.captures.filter((c) => c.id !== id) });
        }
      },
      addTrip: (input) => {
        if (cloud && fdb && uid) {
          cloudCreate('trips', {
            title: input.title.trim(),
            countryCode: input.countryCode,
            startDate: input.startDate,
            endDate: input.endDate || null,
            itinerary: [],
            note: input.note?.trim() || null,
          });
        } else {
          const now = Date.now();
          const trip: Trip = {
            id: newId(),
            userId: 'me',
            title: input.title.trim(),
            countryCode: input.countryCode,
            startDate: input.startDate,
            endDate: input.endDate || undefined,
            itinerary: [],
            note: input.note?.trim() || undefined,
            createdAt: now,
            updatedAt: now,
          };
          const cur = localRef.current;
          persistLocal({ ...cur, trips: [trip, ...cur.trips] });
        }
      },
      removeTrip: (id) => remove('trips', id),
      importPlaces: async (rows) => {
        // Skip places already present (same country code, or same city name).
        const existing = localRef.current.places;
        const haveCountry = new Set(existing.filter((p) => p.kind === 'country').map((p) => p.countryCode));
        const haveCity = new Set(existing.filter((p) => p.kind === 'city').map((p) => `${p.countryCode}|${p.name.toLowerCase()}`));
        const fresh = rows.filter((r) => {
          if (r.kind === 'country') return !haveCountry.has(r.countryCode);
          return !haveCity.has(`${r.countryCode}|${(r.name ?? '').toLowerCase()}`);
        });
        if (fresh.length === 0) return 0;

        if (cloud && fdb && uid) {
          for (const r of fresh) {
            await addDoc(collection(fdb, 'places'), {
              userId: uid,
              kind: r.kind,
              countryCode: r.countryCode,
              name: r.kind === 'country' ? countryName(r.countryCode) : (r.name ?? '').trim(),
              relationships: ['visited'],
              firstYear: r.firstYear ?? null,
              note: null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          }
        } else {
          const now = Date.now();
          const created: Place[] = fresh.map((r) => ({
            id: newId(),
            userId: 'me',
            kind: r.kind,
            countryCode: r.countryCode,
            name: r.kind === 'country' ? countryName(r.countryCode) : (r.name ?? '').trim(),
            relationships: ['visited'],
            firstYear: r.firstYear,
            createdAt: now,
            updatedAt: now,
          }));
          const cur = localRef.current;
          persistLocal({ ...cur, places: [...cur.places, ...created] });
        }
        return fresh.length;
      },
      importExpeditions: async (rows) => {
        if (rows.length === 0) return 0;
        if (cloud && fdb && uid) {
          for (const r of rows) {
            await addDoc(collection(fdb, 'expeditions'), {
              userId: uid,
              title: r.title.trim(),
              startDate: r.startDate || null,
              endDate: r.endDate || null,
              countryCodes: r.countryCodes,
              journeys: r.journeys,
              note: r.note?.trim() || null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }).catch(() => {});
          }
        } else {
          const now = Date.now();
          const created: Expedition[] = rows.map((r) => ({
            id: newId(),
            userId: 'me',
            title: r.title.trim(),
            startDate: r.startDate,
            endDate: r.endDate,
            countryCodes: r.countryCodes,
            journeys: r.journeys,
            note: r.note?.trim() || undefined,
            createdAt: now,
            updatedAt: now,
          }));
          const cur = localRef.current;
          persistLocal({ ...cur, expeditions: [...created, ...cur.expeditions] });
        }
        return rows.length;
      },
    };
  }, [data, loaded, cloud, uid]);

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>;
}

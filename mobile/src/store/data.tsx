import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Place, Discovery, Expedition, Relationship, PlaceKind } from '../types';
import { countryName } from '../data/countries';
import { SEED_PLACES, SEED_DISCOVERIES, SEED_EXPEDITIONS } from '../lib/seed';

interface DataShape {
  places: Place[];
  discoveries: Discovery[];
  expeditions: Expedition[];
}

interface DataApi extends DataShape {
  loaded: boolean;
  addPlace: (input: {
    kind: PlaceKind;
    countryCode: string;
    name?: string;
    relationships: Relationship[];
    firstYear?: number;
  }) => void;
  removePlace: (id: string) => void;
}

const KEY = 'worldly:data:v1';

const DataContext = createContext<DataApi>({
  places: [],
  discoveries: [],
  expeditions: [],
  loaded: false,
  addPlace: () => {},
  removePlace: () => {},
});

export function useData(): DataApi {
  return useContext(DataContext);
}

function newId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `id_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

const SEED: DataShape = {
  places: SEED_PLACES,
  discoveries: SEED_DISCOVERIES,
  expeditions: SEED_EXPEDITIONS,
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataShape>(SEED);
  const [loaded, setLoaded] = useState(false);

  // Load persisted data (or seed on first run).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (active && raw) setData(JSON.parse(raw) as DataShape);
        else await AsyncStorage.setItem(KEY, JSON.stringify(SEED));
      } catch {
        /* keep seed */
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function persist(next: DataShape) {
    setData(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }

  const api = useMemo<DataApi>(
    () => ({
      ...data,
      loaded,
      addPlace: (input) => {
        const now = Date.now();
        const place: Place = {
          id: newId(),
          userId: 'me',
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
        persist({ ...data, places: [...data.places, place] });
      },
      removePlace: (id) =>
        persist({ ...data, places: data.places.filter((p) => p.id !== id) }),
    }),
    [data, loaded],
  );

  return <DataContext.Provider value={api}>{children}</DataContext.Provider>;
}

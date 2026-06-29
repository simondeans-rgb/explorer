import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DistanceUnit } from '../lib/units';

const KEY = 'worldly:units:v1';

interface UnitsApi {
  /** Finished reading the persisted preference. */
  ready: boolean;
  /** The Member's chosen distance/area unit system. */
  unit: DistanceUnit;
  setUnit: (u: DistanceUnit) => void;
}

// Default to miles, which is what the app showed before this preference existed,
// so nothing changes for current users until they pick.
const UnitsContext = createContext<UnitsApi>({ ready: false, unit: 'mi', setUnit: () => {} });

export function useUnits(): UnitsApi {
  return useContext(UnitsContext);
}

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unit, setUnitState] = useState<DistanceUnit>('mi');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'mi' || v === 'km') setUnitState(v);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setUnit = useCallback((u: DistanceUnit) => {
    setUnitState(u);
    AsyncStorage.setItem(KEY, u).catch(() => {});
  }, []);

  return <UnitsContext.Provider value={{ ready, unit, setUnit }}>{children}</UnitsContext.Provider>;
}

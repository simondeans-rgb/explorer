import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DistanceUnit, TempUnit } from '../lib/units';

const KEY = 'worldly:units:v1';
const TEMP_KEY = 'worldly:tempUnit:v1';

interface UnitsApi {
  /** Finished reading the persisted preference. */
  ready: boolean;
  /** The Member's chosen distance/area unit system. */
  unit: DistanceUnit;
  setUnit: (u: DistanceUnit) => void;
  /** The Member's chosen temperature unit. */
  tempUnit: TempUnit;
  setTempUnit: (u: TempUnit) => void;
}

// Default to miles + Celsius, which is what the app showed before these
// preferences existed, so nothing changes for current users until they pick.
const UnitsContext = createContext<UnitsApi>({ ready: false, unit: 'mi', setUnit: () => {}, tempUnit: 'c', setTempUnit: () => {} });

export function useUnits(): UnitsApi {
  return useContext(UnitsContext);
}

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unit, setUnitState] = useState<DistanceUnit>('mi');
  const [tempUnit, setTempUnitState] = useState<TempUnit>('c');

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(KEY), AsyncStorage.getItem(TEMP_KEY)])
      .then(([u, t]) => {
        if (u === 'mi' || u === 'km') setUnitState(u);
        if (t === 'c' || t === 'f') setTempUnitState(t);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setUnit = useCallback((u: DistanceUnit) => {
    setUnitState(u);
    AsyncStorage.setItem(KEY, u).catch(() => {});
  }, []);

  const setTempUnit = useCallback((u: TempUnit) => {
    setTempUnitState(u);
    AsyncStorage.setItem(TEMP_KEY, u).catch(() => {});
  }, []);

  return <UnitsContext.Provider value={{ ready, unit, setUnit, tempUnit, setTempUnit }}>{children}</UnitsContext.Provider>;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { localeDistanceUnit, type DistanceUnit, type TempUnit } from '../lib/units';

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

// Default the distance unit from the device locale (km for most of the world,
// miles only for the few miles-using regions) until the Member picks in the
// Passport. Temperature stays Celsius by default.
const UnitsContext = createContext<UnitsApi>({ ready: false, unit: 'km', setUnit: () => {}, tempUnit: 'c', setTempUnit: () => {} });

export function useUnits(): UnitsApi {
  return useContext(UnitsContext);
}

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unit, setUnitState] = useState<DistanceUnit>(localeDistanceUnit);
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

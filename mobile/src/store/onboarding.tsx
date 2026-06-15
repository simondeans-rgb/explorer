import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'worldly:onboarded:v1';

interface OnboardingApi {
  /** Finished reading the persisted flag. */
  ready: boolean;
  /** Whether the onboarding overlay should show right now. */
  visible: boolean;
  finish: () => void;
  replay: () => void;
}

const OnboardingContext = createContext<OnboardingApi>({
  ready: false,
  visible: false,
  finish: () => {},
  replay: () => {},
});

export function useOnboarding(): OnboardingApi {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => setVisible(v !== '1'))
      .catch(() => setVisible(false))
      .finally(() => setReady(true));
  }, []);

  const finish = useCallback(() => {
    setVisible(false);
    AsyncStorage.setItem(KEY, '1').catch(() => {});
  }, []);

  const replay = useCallback(() => setVisible(true), []);

  return (
    <OnboardingContext.Provider value={{ ready, visible, finish, replay }}>
      {children}
    </OnboardingContext.Provider>
  );
}

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { seedDemoIfEmpty } from '../lib/localPlaces';
import { seedDemoDiscoveriesIfEmpty } from '../lib/localDiscoveries';
import { seedDemoExpeditionsIfEmpty } from '../lib/localExpeditions';

function seedDemo(uid: string) {
  seedDemoIfEmpty(uid);
  seedDemoDiscoveriesIfEmpty(uid);
  seedDemoExpeditionsIfEmpty(uid);
}

/** Minimal session identity shared by Firebase auth and the local demo. */
export interface SessionUser {
  uid: string;
  email: string | null;
}

const DEMO_USER: SessionUser = {
  uid: 'demo-explorer',
  email: 'demo@societyofdiscovery.app',
};
const DEMO_FLAG = 'explorer:demo';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  configured: boolean;
  demo: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No Firebase → offer the local demo, restoring it across refreshes.
    if (!auth) {
      try {
        if (localStorage.getItem(DEMO_FLAG)) {
          seedDemo(DEMO_USER.uid);
          setUser(DEMO_USER);
          setDemo(true);
        }
      } catch {
        /* ignore */
      }
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { uid: u.uid, email: u.email } : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseConfigured,
      demo,
      signIn: async (email, password) => {
        if (!auth) throw new Error('Firebase is not configured');
        await signInWithEmailAndPassword(auth, email, password);
      },
      signUp: async (email, password) => {
        if (!auth) throw new Error('Firebase is not configured');
        await createUserWithEmailAndPassword(auth, email, password);
      },
      signInDemo: () => {
        seedDemo(DEMO_USER.uid);
        try {
          localStorage.setItem(DEMO_FLAG, '1');
        } catch {
          /* ignore */
        }
        setUser(DEMO_USER);
        setDemo(true);
      },
      signOut: async () => {
        if (demo) {
          try {
            localStorage.removeItem(DEMO_FLAG);
          } catch {
            /* ignore */
          }
          setDemo(false);
          setUser(null);
          return;
        }
        if (!auth) return;
        await fbSignOut(auth);
      },
    }),
    [user, loading, demo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

interface AuthApi {
  /** True when EXPO_PUBLIC_FIREBASE_* env vars are present (cloud sync possible). */
  configured: boolean;
  /** Still resolving the persisted session. */
  loading: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthApi>({
  configured: false,
  loading: false,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  resetPassword: async () => {},
  signOutUser: async () => {},
});

export function useAuth(): AuthApi {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const api = useMemo<AuthApi>(
    () => ({
      configured: isFirebaseConfigured,
      loading,
      user,
      signIn: async (email, password) => {
        if (!auth) throw new Error('Cloud sync is not configured.');
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      signUp: async (email, password, name) => {
        if (!auth) throw new Error('Cloud sync is not configured.');
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      },
      resetPassword: async (email) => {
        if (!auth) throw new Error('Cloud sync is not configured.');
        await sendPasswordResetEmail(auth, email.trim());
      },
      signOutUser: async () => {
        if (auth) await signOut(auth);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

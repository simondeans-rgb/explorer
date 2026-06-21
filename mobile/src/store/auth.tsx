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
  signInWithCredential,
  OAuthProvider,
  GoogleAuthProvider,
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
  /** Native Sign in with Apple → Firebase. iOS-only; requires a native build. */
  signInWithApple: () => Promise<void>;
  /** Native Sign in with Google → Firebase. Requires a native build + config. */
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthApi>({
  configured: false,
  loading: false,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signInWithApple: async () => {},
  signInWithGoogle: async () => {},
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
      signInWithApple: async () => {
        if (!auth) throw new Error('Cloud sync is not configured.');
        // Lazy-load the native modules so merely starting the app (e.g. in Expo
        // Go, where they're absent) never pulls them in.
        const Apple = await import('expo-apple-authentication');
        const Crypto = await import('expo-crypto');
        // Nonce: send the SHA-256 hash to Apple, the raw value to Firebase.
        const rawNonce = Crypto.randomUUID();
        const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
        const result = await Apple.signInAsync({
          requestedScopes: [
            Apple.AppleAuthenticationScope.FULL_NAME,
            Apple.AppleAuthenticationScope.EMAIL,
          ],
          nonce: hashedNonce,
        });
        if (!result.identityToken) throw new Error('Apple sign-in did not return an identity token.');
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({ idToken: result.identityToken, rawNonce });
        const signed = await signInWithCredential(auth, credential);
        // Apple only sends the full name on the very first authorization — capture it.
        const apple = result.fullName;
        const name = [apple?.givenName, apple?.familyName].filter(Boolean).join(' ').trim();
        if (name && !signed.user.displayName) await updateProfile(signed.user, { displayName: name });
      },
      signInWithGoogle: async () => {
        if (!auth) throw new Error('Cloud sync is not configured.');
        // Public OAuth client ids for the Firebase project (safe to ship — they
        // live in every distributed app); overridable via env.
        const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '495314900593-8h1873abt0nmcnubrbr6bji825gh4g70.apps.googleusercontent.com';
        const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '495314900593-7m5rjdob53fnihjii0ubk73fsloitqef.apps.googleusercontent.com';
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
        GoogleSignin.configure({ webClientId, iosClientId });
        await GoogleSignin.hasPlayServices();
        const info = await GoogleSignin.signIn();
        // idToken location shifted across library versions — accept both shapes.
        const data = info as { idToken?: string; data?: { idToken?: string } };
        const idToken = data.data?.idToken ?? data.idToken;
        if (!idToken) throw new Error('Google sign-in did not return an ID token.');
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
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

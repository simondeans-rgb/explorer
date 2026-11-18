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
  reauthenticateWithCredential,
  EmailAuthProvider,
  OAuthProvider,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  type User,
  type AuthCredential,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';

// ── Provider credential helpers (shared by sign-in and re-authentication) ──
// A fresh Apple credential via native Sign in with Apple. Returns the full name
// too (Apple only sends it on the first authorization).
async function appleCredential(): Promise<{ credential: AuthCredential; fullName?: { givenName?: string | null; familyName?: string | null } | null }> {
  const Apple = await import('expo-apple-authentication');
  const Crypto = await import('expo-crypto');
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const result = await Apple.signInAsync({
    requestedScopes: [Apple.AppleAuthenticationScope.FULL_NAME, Apple.AppleAuthenticationScope.EMAIL],
    nonce: hashedNonce,
  });
  if (!result.identityToken) throw new Error('Apple sign-in did not return an identity token.');
  const credential = new OAuthProvider('apple.com').credential({ idToken: result.identityToken, rawNonce });
  return { credential, fullName: result.fullName };
}

// A fresh Google credential via native Sign in with Google.
async function googleCredential(): Promise<AuthCredential> {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '495314900593-8h1873abt0nmcnubrbr6bji825gh4g70.apps.googleusercontent.com';
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '495314900593-7m5rjdob53fnihjii0ubk73fsloitqef.apps.googleusercontent.com';
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  GoogleSignin.configure({ webClientId, iosClientId });
  await GoogleSignin.hasPlayServices();
  const info = await GoogleSignin.signIn();
  const data = info as { idToken?: string; data?: { idToken?: string } };
  const idToken = data.data?.idToken ?? data.idToken;
  if (!idToken) throw new Error('Google sign-in did not return an ID token.');
  return GoogleAuthProvider.credential(idToken);
}

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
  /** Re-authenticate the current user before a sensitive action (account
   *  deletion). Password is only used/required for email/password accounts;
   *  Apple/Google users re-confirm through their provider. */
  reauthenticate: (password?: string) => Promise<void>;
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
  reauthenticate: async () => {},
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
        const { credential, fullName } = await appleCredential();
        const signed = await signInWithCredential(auth, credential);
        // Apple only sends the full name on the very first authorization — capture it.
        const name = [fullName?.givenName, fullName?.familyName].filter(Boolean).join(' ').trim();
        if (name && !signed.user.displayName) await updateProfile(signed.user, { displayName: name });
      },
      signInWithGoogle: async () => {
        if (!auth) throw new Error('Cloud sync is not configured.');
        await signInWithCredential(auth, await googleCredential());
      },
      reauthenticate: async (password) => {
        if (!auth?.currentUser) throw new Error('Not signed in.');
        const current = auth.currentUser;
        const providerId = current.providerData[0]?.providerId;
        if (providerId === 'apple.com') {
          const { credential } = await appleCredential();
          await reauthenticateWithCredential(current, credential);
        } else if (providerId === 'google.com') {
          await reauthenticateWithCredential(current, await googleCredential());
        } else {
          if (!current.email || !password) throw new Error('Enter your password to continue.');
          await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, password));
        }
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

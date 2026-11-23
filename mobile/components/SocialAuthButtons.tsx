import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../src/lib/theme';
import { useAuth } from '../src/store/auth';
import { reportError } from '../src/lib/sentry';

/** Turn a Firebase/Google/Apple auth error into a readable message. */
function friendlyAuthError(err: { message?: string; code?: string }): string {
  switch (err.code) {
    case 'auth/account-exists-with-different-credential':
      return 'You already have an account with this email. Sign in with the method you used before (e.g. email & password), then link Google from settings.';
    case 'auth/network-request-failed':
      return 'Network error — check your connection and try again.';
    case 'auth/invalid-credential':
    case 'auth/invalid-verification-code':
      return 'Sign-in failed (invalid credential). Please try again.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method isn’t enabled for the app yet.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    default: {
      // Surface the underlying reason (incl. the auth/* code) so issues are diagnosable.
      const msg = (err.message || '').replace('Firebase:', '').trim();
      return msg || 'Could not sign in. Please try again.';
    }
  }
}

type Busy = null | 'google' | 'apple';

// Social sign-in needs the native modules, which only exist in a real iOS build
// (not Expo Go). Decide this with zero native calls — Platform + the Expo Go
// check from expo-constants — so nothing native runs while the screen mounts;
// the actual sign-in only touches native code on a button tap (inside try/catch).
const SOCIAL_AVAILABLE =
  Platform.OS === 'ios' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

/** Apple + Google sign-in buttons, shown only in a real iOS build (never in
 *  Expo Go). Apple comes first — App Review guideline 4.8 requires Sign in
 *  with Apple wherever a third-party login is offered, and Apple's HIG asks
 *  for it to be at least as prominent. On error, the real reason is surfaced
 *  to the screen and Sentry. */
export function SocialAuthButtons({
  onError,
  onBusyChange,
  guard,
  dimmed = false,
}: {
  onError: (msg: string | null) => void;
  onBusyChange?: (busy: boolean) => void;
  /** Called before a provider runs; return false to block (e.g. terms not yet
   *  agreed). The guard is responsible for messaging why. */
  guard?: () => boolean;
  /** Show the buttons as not-yet-available (terms not agreed). They stay
   *  tappable so the guard can explain what's needed. */
  dimmed?: boolean;
}) {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [busy, setBusy] = useState<Busy>(null);

  if (!SOCIAL_AVAILABLE) return null;

  async function run(which: Exclude<Busy, null>, fn: () => Promise<void>) {
    if (guard && !guard()) return;
    onError(null);
    setBusy(which);
    onBusyChange?.(true);
    try {
      await fn();
    } catch (e) {
      const err = e as { message?: string; code?: string };
      const cancelled =
        err.code === 'ERR_REQUEST_CANCELED' ||
        err.code === 'SIGN_IN_CANCELLED' ||
        err.code === '-5' ||
        /cancel/i.test(err.message ?? '');
      if (!cancelled) {
        reportError(e, { provider: which, code: err.code });
        onError(friendlyAuthError(err));
      }
    } finally {
      setBusy(null);
      onBusyChange?.(false);
    }
  }

  return (
    <View>
      {/* "or" divider */}
      <View className="flex-row items-center" style={{ gap: 12, marginVertical: 16 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(20,33,61,0.10)' }} />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.ink3 }}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(20,33,61,0.10)' }} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue with Apple"
        onPress={() => run('apple', signInWithApple)}
        disabled={busy !== null}
        className="flex-row items-center justify-center rounded-2xl"
        style={{ backgroundColor: '#000', paddingVertical: 14, gap: 9, opacity: busy ? 0.7 : dimmed ? 0.5 : 1, marginBottom: 10 }}
      >
        {busy === 'apple' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={{ fontSize: 18, color: '#fff', marginTop: -2 }}></Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Continue with Apple</Text>
          </>
        )}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        onPress={() => run('google', signInWithGoogle)}
        disabled={busy !== null}
        className="flex-row items-center justify-center rounded-2xl"
        style={{ backgroundColor: COLORS.card, borderWidth: 1, borderColor: 'rgba(20,33,61,0.14)', paddingVertical: 14, gap: 10, opacity: busy ? 0.7 : dimmed ? 0.5 : 1 }}
      >
        {busy === 'google' ? (
          <ActivityIndicator color={COLORS.ink2} />
        ) : (
          <>
            <GoogleMark />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.ink }}>Continue with Google</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

/** The official four-colour Google "G" (per Google's sign-in branding
 *  guidelines) — drawn as vector paths so it stays crisp at any size. */
function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityElementsHidden importantForAccessibility="no">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

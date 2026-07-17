import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
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
}: {
  onError: (msg: string | null) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [busy, setBusy] = useState<Busy>(null);

  if (!SOCIAL_AVAILABLE) return null;

  async function run(which: Exclude<Busy, null>, fn: () => Promise<void>) {
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
        style={{ backgroundColor: '#000', paddingVertical: 14, gap: 9, opacity: busy ? 0.7 : 1, marginBottom: 10 }}
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
        style={{ backgroundColor: COLORS.card, borderWidth: 1, borderColor: 'rgba(20,33,61,0.14)', paddingVertical: 14, gap: 10, opacity: busy ? 0.7 : 1 }}
      >
        {busy === 'google' ? (
          <ActivityIndicator color={COLORS.ink2} />
        ) : (
          <>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 17, fontWeight: '700', color: '#4285F4', marginTop: -1 }}>G</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.ink }}>Continue with Google</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

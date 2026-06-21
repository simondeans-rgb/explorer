import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import { COLORS } from '../src/lib/theme';
import { useAuth } from '../src/store/auth';

type Busy = null | 'apple' | 'google';

// Apple logo glyph (private-use codepoint in the system font) for the button.
const APPLE_GLYPH = '\uF8FF';

/** Apple / Google sign-in buttons. Each only renders when it's actually usable:
 *  Apple when the native module reports availability (a real iOS build), Google
 *  when its client id is configured at build time. So nothing broken shows in
 *  Expo Go or in builds where social sign-in isn't set up yet. */
export function SocialAuthButtons({
  onError,
  onBusyChange,
}: {
  onError: (msg: string | null) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { signInWithApple, signInWithGoogle } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const googleConfigured = Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

  useEffect(() => {
    let active = true;
    (async () => {
      if (Platform.OS !== 'ios') return;
      try {
        const Apple = await import('expo-apple-authentication');
        const ok = await Apple.isAvailableAsync();
        if (active) setAppleAvailable(ok);
      } catch {
        if (active) setAppleAvailable(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!appleAvailable && !googleConfigured) return null;

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
      if (!cancelled) onError(err.message?.includes('not configured') ? err.message : 'Could not sign in. Please try again.');
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

      {appleAvailable ? (
        <Pressable
          onPress={() => run('apple', signInWithApple)}
          disabled={busy !== null}
          className="flex-row items-center justify-center rounded-2xl"
          style={{ backgroundColor: '#000', paddingVertical: 14, gap: 8, marginBottom: 10, opacity: busy ? 0.7 : 1 }}
        >
          {busy === 'apple' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={{ fontSize: 18, color: '#fff', marginTop: -2 }}>{APPLE_GLYPH}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Continue with Apple</Text>
            </>
          )}
        </Pressable>
      ) : null}

      {googleConfigured ? (
        <Pressable
          onPress={() => run('google', signInWithGoogle)}
          disabled={busy !== null}
          className="flex-row items-center justify-center rounded-2xl"
          style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(20,33,61,0.14)', paddingVertical: 14, gap: 10, opacity: busy ? 0.7 : 1 }}
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
      ) : null}
    </View>
  );
}

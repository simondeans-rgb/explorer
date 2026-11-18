import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, UserPlus, X } from 'lucide-react-native';
import { WorldlyMark } from '../../components/Brand';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { useAuth } from '../../src/store/auth';
import { sendRequest } from '../../src/lib/connections';

type Phase = 'confirm' | 'working' | 'sent' | 'error' | 'signin';

/** Deep-link target for QR/invite links (`mobile://add/CODE`, and the web
 *  `/add/:code` page bounces here). It asks the member to CONFIRM before sending
 *  a connection request — a deep link is an untrusted input, and auto-sending on
 *  open would let a crafted link make someone request a stranger (leaking their
 *  identity) with a single unintended tap. */
export default function AddByCodeScreen() {
  const { code: raw } = useLocalSearchParams<{ code: string }>();
  const code = (Array.isArray(raw) ? raw[0] : raw ?? '').trim().toUpperCase();
  const { user, loading } = useAuth();
  const myName =
    user?.displayName || (user?.email ? user.email.split('@')[0] : 'You');

  const [phase, setPhase] = useState<Phase>('working');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!code) {
      setPhase('error');
      setDetail('That invite link is missing a code.');
      return;
    }
    // Never send automatically — wait for the member to confirm (or sign in).
    setPhase(user ? 'confirm' : 'signin');
  }, [loading, user, code]);

  function submit() {
    if (!user || !code) return;
    setPhase('working');
    setDetail('');
    sendRequest({ uid: user.uid, name: myName }, code)
      .then((res) => {
        if (res.ok) setPhase('sent');
        else {
          setPhase('error');
          setDetail(res.error ?? 'Couldn’t send the request.');
        }
      })
      .catch(() => {
        setPhase('error');
        setDetail('Couldn’t send the request. Please try again.');
      });
  }

  return (
    <LinearGradient
      colors={GRADIENTS.story}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}
    >
      <View
        className="rounded-full items-center justify-center"
        style={{ height: 64, width: 64, backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 22 }}
      >
        {phase === 'working' ? (
          <ActivityIndicator color="#fff" />
        ) : phase === 'sent' ? (
          <Check size={30} color="#fff" />
        ) : phase === 'error' ? (
          <X size={30} color="#fff" />
        ) : (
          <UserPlus size={28} color="#fff" />
        )}
      </View>

      <Text style={{ fontFamily: 'Fraunces', fontSize: 26, color: '#fff', textAlign: 'center' }}>
        {phase === 'working'
          ? 'Connecting…'
          : phase === 'sent'
            ? 'Request sent!'
            : phase === 'signin'
              ? 'Join the circle'
              : phase === 'confirm'
                ? 'Add to your circle'
                : 'Hmm, that didn’t work'}
      </Text>

      <Text
        style={{
          fontFamily: 'PlusJakarta',
          fontSize: 15,
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
          marginTop: 10,
          maxWidth: 320,
          lineHeight: 21,
        }}
      >
        {phase === 'working'
          ? `Sending your request to ${code}.`
          : phase === 'sent'
            ? 'They’ll appear in your circle as soon as they accept.'
            : phase === 'signin'
              ? `Sign in to add ${code} and start following each other’s travels.`
              : phase === 'confirm'
                ? `Send a connection request to ${code}? They’ll be able to follow your travels once they accept.`
                : detail}
      </Text>

      <View style={{ marginTop: 26, alignSelf: 'stretch', maxWidth: 360, width: '100%' }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {phase === 'confirm' ? (
            <>
              <Pressable
                onPress={() => router.replace('/friends')}
                accessibilityRole="button"
                accessibilityLabel="Not now"
                className="flex-1 items-center justify-center rounded-full"
                style={{ paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.18)' }}
              >
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Not now</Text>
              </Pressable>
              <Pressable
                onPress={submit}
                accessibilityRole="button"
                accessibilityLabel={`Send a connection request to ${code}`}
                className="flex-1 items-center justify-center rounded-full bg-white dark:bg-card"
                style={{ paddingVertical: 14 }}
              >
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.coral }}>Send request</Text>
              </Pressable>
            </>
          ) : (
            <>
              {phase === 'error' ? (
                <Pressable
                  onPress={submit}
                  accessibilityRole="button"
                  accessibilityLabel="Try again"
                  className="flex-1 items-center justify-center rounded-full"
                  style={{ paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.18)' }}
                >
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Try again</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => router.replace('/friends')}
                accessibilityRole="button"
                accessibilityLabel="Go to your circle"
                className="flex-1 items-center justify-center rounded-full bg-white dark:bg-card"
                style={{ paddingVertical: 14 }}
              >
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.coral }}>
                  {phase === 'signin' ? 'Continue' : 'Go to your circle'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 36, opacity: 0.85 }}>
        <WorldlyMark size={20} />
        <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: '#fff' }}>Worldly</Text>
      </View>
    </LinearGradient>
  );
}

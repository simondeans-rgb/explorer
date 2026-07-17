import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { DestinationImage } from './DestinationImage';
import { WorldlyLogo } from './WorldlyLogo';
import { SocialAuthButtons } from './SocialAuthButtons';
import { HERO_CODES } from '../src/lib/heroImages';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { useAuth } from '../src/store/auth';

const PRIVACY_URL = 'https://www.worldly-explorer.com/privacy.html';
const TERMS_URL = 'https://www.worldly-explorer.com/terms.html';

type Mode = 'in' | 'up';

/** Full-screen welcome + sign in / create account screen, shown whenever cloud
 *  sync is configured but no one is signed in. The home for authentication. */
export function AuthGate({ onContinueWithout }: { onContinueWithout: () => void }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function forgot() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Enter your email above, then tap “Forgot password”.');
      return;
    }
    try {
      await resetPassword(email);
      setNotice('Check your inbox — we’ve sent a password reset link.');
    } catch {
      setNotice('If that email has an account, a reset link is on its way.');
    }
  }

  async function submit() {
    setError(null);
    setNotice(null);
    if (mode === 'up' && !name.trim()) {
      setError('What should we call you? Add your name to continue.');
      return;
    }
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'in') await signIn(email, password);
      else await signUp(email, password, name);
      // On success the auth state changes and this gate unmounts itself.
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, '').trim());
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(mode === 'in' ? 'up' : 'in');
    setError(null);
    setNotice(null);
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: COLORS.night }}>
      <DestinationImage code={HERO_CODES.story[0]} codes={HERO_CODES.story} scrim motion style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,16,24,0.45)' }} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 56 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Brand + welcome */}
            <View style={{ alignItems: 'center', marginBottom: 26 }}>
              <WorldlyLogo white height={48} />
              <Text style={{ fontFamily: 'Fraunces', fontSize: 30, lineHeight: 36, color: '#fff', textAlign: 'center', marginTop: 22 }}>
                {mode === 'in' ? 'Welcome back' : 'Start your travel story'}
              </Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 6, maxWidth: 300 }}>
                {mode === 'in'
                  ? 'Sign in to sync every place, journey and discovery across your devices.'
                  : 'Create an account to save your world to the cloud — and keep it on every device.'}
              </Text>
            </View>

            {/* Form card */}
            <View className="rounded-3xl" style={{ backgroundColor: COLORS.card, padding: 18, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }}>
              {mode === 'up' ? (
                <Field>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={COLORS.ink3}
                    autoCapitalize="words"
                    style={INPUT}
                  />
                </Field>
              ) : null}

              <Field>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor={COLORS.ink3}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  style={INPUT}
                />
              </Field>

              <Field last>
                <View className="flex-row items-center">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={COLORS.ink3}
                    secureTextEntry={!show}
                    autoCapitalize="none"
                    autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                    style={[INPUT, { flex: 1 }]}
                  />
                  <Pressable onPress={() => setShow((s) => !s)} hitSlop={8} style={{ paddingLeft: 8 }}>
                    {show ? <EyeOff size={18} color={COLORS.ink3} /> : <Eye size={18} color={COLORS.ink3} />}
                  </Pressable>
                </View>
              </Field>

              {mode === 'in' ? (
                <Pressable onPress={forgot} hitSlop={6} style={{ alignSelf: 'flex-end', marginTop: 12 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>Forgot password?</Text>
                </Pressable>
              ) : null}

              {error ? (
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: '#E0245E', marginTop: 14 }}>{error}</Text>
              ) : null}
              {notice ? (
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: '#0E9F8F', marginTop: 14 }}>{notice}</Text>
              ) : null}

              <Pressable onPress={submit} disabled={busy} style={{ marginTop: error || notice || mode === 'in' ? 16 : 18, borderRadius: 18, overflow: 'hidden', opacity: busy ? 0.7 : 1 }}>
                <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-row items-center justify-center" style={{ paddingVertical: 16, gap: 8 }}>
                  {busy ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>
                        {mode === 'in' ? 'Sign in' : 'Create account'}
                      </Text>
                      <ArrowRight size={18} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <SocialAuthButtons onError={setError} onBusyChange={setBusy} />

              <Pressable onPress={switchMode} style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, color: COLORS.ink2 }}>
                  {mode === 'in' ? 'New to Worldly? ' : 'Already have an account? '}
                  <Text style={{ fontWeight: '800', color: COLORS.coral }}>{mode === 'in' ? 'Create an account' : 'Sign in'}</Text>
                </Text>
              </Pressable>
            </View>

            {/* Legal */}
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, lineHeight: 17, color: 'rgba(255,255,255,0.82)', textAlign: 'center', marginTop: 20, paddingHorizontal: 8 }}>
              By continuing you agree to our{' '}
              <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }} onPress={() => Linking.openURL(TERMS_URL)}>Terms</Text>
              {' '}and{' '}
              <Text style={{ fontWeight: '700', textDecorationLine: 'underline' }} onPress={() => Linking.openURL(PRIVACY_URL)}>Privacy Policy</Text>.
            </Text>

            {/* Escape hatch — the app works fully offline on this device. */}
            <Pressable onPress={onContinueWithout} hitSlop={8} style={{ alignItems: 'center', marginTop: 22 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff', opacity: 0.95 }}>Continue without an account</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>Explore on this device — you can sign in later</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </DestinationImage>
    </View>
  );
}

function Field({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <View className="rounded-2xl" style={{ backgroundColor: COLORS.warmwhite, paddingHorizontal: 14, paddingVertical: 12, marginBottom: last ? 0 : 10 }}>
      {children}
    </View>
  );
}

const INPUT = { fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink } as const;

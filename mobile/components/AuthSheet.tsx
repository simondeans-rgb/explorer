import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Linking } from 'react-native';
import { Check } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { SocialAuthButtons } from './SocialAuthButtons';
import { COLORS } from '../src/lib/theme';
import { useAuth } from '../src/store/auth';

const TERMS_URL = 'https://www.worldly-explorer.com/terms.html';
const PRIVACY_URL = 'https://www.worldly-explorer.com/privacy.html';

type Mode = 'in' | 'up';

export function AuthSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Guideline 1.2: agreement (incl. zero-tolerance policy) required before sign-in.
  function ensureAgreed(): boolean {
    if (!agreed) {
      setError('Please agree to the Terms & zero-tolerance policy to continue.');
      return false;
    }
    return true;
  }

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

  function reset() {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setNotice(null);
    setBusy(false);
  }
  function close() {
    reset();
    onClose();
  }
  async function submit() {
    setError(null);
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password of at least 6 characters.');
      return;
    }
    if (mode === 'up' && !name.trim()) {
      setError('What should we call you? Add your name to continue.');
      return;
    }
    if (!ensureAgreed()) return;
    setBusy(true);
    try {
      if (mode === 'in') await signIn(email, password);
      else await signUp(email, password, name);
      close();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, '').trim());
      setBusy(false);
    }
  }

  const title = mode === 'in' ? 'Welcome back' : 'Create your account';

  return (
    <SheetShell visible={visible} title={title} onClose={close}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginBottom: 14 }}>
          {mode === 'in'
            ? 'Sign in to sync your world across devices.'
            : 'Your travels, saved to the cloud and on every device.'}
        </Text>

        {mode === 'up' ? (
          <View className="bg-white dark:bg-card rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={COLORS.ink3}
              autoCapitalize="words"
              style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
            />
          </View>
        ) : null}

        <View className="bg-white dark:bg-card rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={COLORS.ink3}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        <View className="bg-white dark:bg-card rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={COLORS.ink3}
            secureTextEntry
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        {mode === 'in' ? (
          <Pressable onPress={forgot} hitSlop={6} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.coral }}>Forgot password?</Text>
          </Pressable>
        ) : null}

        {error ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: '#E0245E', marginTop: 12 }}>{error}</Text>
        ) : null}
        {notice ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.aqua, marginTop: 12 }}>{notice}</Text>
        ) : null}

        <Pressable
          onPress={submit}
          disabled={busy}
          className="rounded-2xl items-center justify-center flex-row"
          style={{ marginTop: 18, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: busy ? 0.6 : 1, gap: 8 }}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Check size={18} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>
                {mode === 'in' ? 'Sign in' : 'Create account'}
              </Text>
            </>
          )}
        </Pressable>

        <SocialAuthButtons onError={setError} onBusyChange={setBusy} guard={ensureAgreed} />

        {/* Guideline 1.2: terms + zero-tolerance agreement, required to proceed. */}
        <Pressable
          onPress={() => { setAgreed((a) => !a); setError(null); }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          accessibilityLabel="Agree to the Terms of Use and zero-tolerance policy"
          className="flex-row"
          style={{ marginTop: 16, gap: 10, alignItems: 'flex-start' }}
        >
          <View
            className="items-center justify-center rounded-md"
            style={{ height: 22, width: 22, marginTop: 1, borderWidth: 1.5, borderColor: agreed ? COLORS.coral : 'rgba(20,33,61,0.3)', backgroundColor: agreed ? COLORS.coral : 'transparent' }}
          >
            {agreed ? <Check size={15} color="#fff" /> : null}
          </View>
          <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 12, lineHeight: 17, color: COLORS.ink2 }}>
            I agree to the{' '}
            <Text style={{ fontWeight: '800', textDecorationLine: 'underline', color: COLORS.coral }} onPress={() => Linking.openURL(TERMS_URL)}>Terms of Use (EULA)</Text>
            {' '}and{' '}
            <Text style={{ fontWeight: '800', textDecorationLine: 'underline', color: COLORS.coral }} onPress={() => Linking.openURL(PRIVACY_URL)}>Privacy Policy</Text>
            , and understand Worldly has zero tolerance for objectionable content or abusive behaviour.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setMode(mode === 'in' ? 'up' : 'in');
            setError(null);
            setNotice(null);
          }}
          style={{ marginTop: 14, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2 }}>
            {mode === 'in' ? "New here? Create an account" : 'Already have an account? Sign in'}
          </Text>
        </Pressable>
      </View>
    </SheetShell>
  );
}

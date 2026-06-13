import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Check } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { useAuth } from '../src/store/auth';

type Mode = 'in' | 'up';

export function AuthSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
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
          <View className="bg-white rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 }}>
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

        <View className="bg-white rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10 }}>
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

        <View className="bg-white rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={COLORS.ink3}
            secureTextEntry
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        {error ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: '#E0245E', marginTop: 12 }}>{error}</Text>
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

        <Pressable
          onPress={() => {
            setMode(mode === 'in' ? 'up' : 'in');
            setError(null);
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

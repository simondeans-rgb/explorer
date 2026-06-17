import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Trash2, TriangleAlert } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { deleteAccountAndData } from '../src/lib/deleteAccount';
import { useToast } from '../src/store/toast';

const DANGER = '#E0245E';

export function DeleteAccountSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setPassword('');
    setError(null);
    setBusy(false);
    onClose();
  }

  async function confirm() {
    if (busy) return;
    if (!password) {
      setError('Enter your password to confirm.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteAccountAndData(password);
      toast.success('Your account and data have been deleted.');
      close();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      if (/password|credential|invalid-login/i.test(msg)) setError('Incorrect password. Please try again.');
      else setError("Couldn't delete your account — please try again.");
      setBusy(false);
    }
  }

  return (
    <SheetShell visible={visible} title="Delete account" onClose={close}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
        <View className="rounded-2xl flex-row" style={{ backgroundColor: 'rgba(224,36,94,0.08)', padding: 14, gap: 10 }}>
          <TriangleAlert size={18} color={DANGER} />
          <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, lineHeight: 19 }}>
            This permanently deletes your account and all your synced data — places, discoveries, trips, journeys, photos and profile. This can’t be undone.
          </Text>
        </View>

        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 16, marginBottom: 8 }}>Confirm your password to continue.</Text>
        <View className="bg-white rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={COLORS.ink3}
            secureTextEntry
            autoCapitalize="none"
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        {error ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: DANGER, marginTop: 12 }}>{error}</Text> : null}

        <Pressable
          onPress={confirm}
          disabled={busy}
          className="rounded-2xl items-center justify-center flex-row"
          style={{ marginTop: 18, paddingVertical: 15, backgroundColor: DANGER, opacity: busy ? 0.6 : 1, gap: 8 }}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Trash2 size={18} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Delete my account</Text>
            </>
          )}
        </Pressable>
        <Pressable onPress={close} style={{ marginTop: 14, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2 }}>Cancel</Text>
        </Pressable>
      </View>
    </SheetShell>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck, ShieldOff } from 'lucide-react-native';
import { BackButton } from '../components/BackButton';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { goBack } from '../src/lib/nav';
import { useAuth } from '../src/store/auth';
import { useToast } from '../src/store/toast';
import { loadBlockedList, unblockUser } from '../src/lib/moderation';
import { reconnect } from '../src/lib/connections';

/** Settings → Blocked accounts: review and reverse blocks. Blocking severs the
 *  friendship and hides a member's content (App Store Guideline 1.2); this
 *  screen lets the user undo that. */
export default function BlockedScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [list, setList] = useState<{ uid: string; name: string }[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(() => {
    loadBlockedList()
      .then(setList)
      .catch(() => setList([]));
  }, []);

  useEffect(refresh, [refresh]);

  // Blocking deletes the shared connection, so unblocking can't restore the
  // friendship on its own — offer to send a fresh request instead of leaving the
  // member silently disconnected.
  function offerReconnect(uid: string, name: string) {
    if (!user) return;
    const me = {
      uid: user.uid,
      name: user.displayName || (user.email ? user.email.split('@')[0] : 'You'),
    };
    Alert.alert(
      `Reconnect with ${name}?`,
      `Blocking removed your connection. Send ${name} a new request so you can see each other's travels again.`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Send request',
          onPress: async () => {
            const res = await reconnect(me, uid, name);
            if (res.ok) toast.success(`Request sent to ${name}`);
            else toast.error(res.error ?? "Couldn't send the request.");
          },
        },
      ],
    );
  }

  async function unblock(uid: string, name: string) {
    if (!user || busy) return;
    setBusy(uid);
    try {
      await unblockUser(user.uid, uid);
      setList((cur) => (cur ? cur.filter((b) => b.uid !== uid) : cur));
      toast.success(`Unblocked ${name}`);
      offerReconnect(uid, name);
    } catch {
      toast.error("Couldn't unblock — please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 60, paddingBottom: 26, paddingHorizontal: 22 }}>
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 58, left: 18, zIndex: 20 }} />
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.9, textAlign: 'center' }}>SAFETY</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, textAlign: 'center', marginTop: 2 }}>Blocked accounts</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.95, textAlign: 'center', marginTop: 4, paddingHorizontal: 10 }}>
            Blocked members can't see your travels and are hidden from yours. Unblock anyone below to reconnect.
          </Text>
        </LinearGradient>

        {list === null ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator color={COLORS.coral} />
          </View>
        ) : list.length === 0 ? (
          <View className="bg-white dark:bg-card rounded-3xl items-center" style={{ marginHorizontal: 20, marginTop: 20, padding: 26 }}>
            <ShieldCheck size={26} color={COLORS.aqua} />
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 10 }}>No blocked accounts</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
              Anyone you block will appear here so you can unblock them at any time.
            </Text>
          </View>
        ) : (
          list.map((b) => (
            <View key={b.uid} className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ marginHorizontal: 20, marginTop: 14, padding: 14, gap: 12 }}>
              <View className="rounded-full items-center justify-center" style={{ height: 44, width: 44, backgroundColor: COLORS.tileMuted }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>{b.name.trim().charAt(0).toUpperCase() || '?'}</Text>
              </View>
              <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{b.name}</Text>
              <Pressable
                onPress={() => unblock(b.uid, b.name)}
                disabled={busy === b.uid}
                accessibilityRole="button"
                accessibilityLabel={`Unblock ${b.name}`}
                className="rounded-full flex-row items-center"
                style={{ paddingHorizontal: 14, paddingVertical: 9, gap: 6, backgroundColor: COLORS.tileMuted, opacity: busy === b.uid ? 0.5 : 1 }}
              >
                {busy === b.uid ? (
                  <ActivityIndicator size="small" color={COLORS.navy} />
                ) : (
                  <>
                    <ShieldOff size={15} color={COLORS.navy} />
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Unblock</Text>
                  </>
                )}
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

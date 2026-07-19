import { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/store/auth';
import { useToast } from '../src/store/toast';
import {
  subscribeConnections,
  acceptConnection,
  removeConnection,
  type Connection,
} from '../src/lib/connections';
import { COLORS, SHADOW } from '../src/lib/theme';
import { track } from '../src/lib/analytics';

// Which incoming requests we've already prompted for, so a dismissed prompt
// doesn't reappear on every launch (the request still lives in the Circle
// screen for later). Capped so it can't grow without bound.
const SEEN_KEY = 'worldly:circleReqSeen';

/** When someone adds you to their Circle, the connection arrives as a *pending*
 *  request they made — accepting it is how you add them back. Previously that
 *  only showed passively inside the Circle screen, so people never noticed.
 *  This surfaces it app-wide: the moment an incoming request appears, a prompt
 *  asks whether to add them back. Renderless until there's something to ask. */
export function CircleRequestPrompt() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [seen, setSeen] = useState<string[] | null>(null); // null = still loading
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(SEEN_KEY)
      .then((v) => {
        if (!active) return;
        try {
          setSeen(v ? (JSON.parse(v) as string[]) : []);
        } catch {
          setSeen([]);
        }
      })
      .catch(() => active && setSeen([]));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setConnections([]);
      return;
    }
    return subscribeConnections(user.uid, setConnections);
  }, [user?.uid]);

  // The oldest not-yet-seen request where someone else added you. One at a time.
  const pending = useMemo(() => {
    if (!user?.uid || seen == null) return null;
    return (
      connections
        .filter((c) => c.status === 'pending' && c.requestedBy !== user.uid && !seen.includes(c.id))
        .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))[0] ?? null
    );
  }, [connections, user?.uid, seen]);

  const name = pending?.names?.[pending.requestedBy]?.trim() || 'A traveller';
  const initial = name.charAt(0).toUpperCase();

  const markSeen = async (id: string) => {
    const next = [...(seen ?? []).filter((x) => x !== id), id].slice(-100);
    setSeen(next);
    try {
      await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch {
      /* non-critical */
    }
  };

  const onAdd = async () => {
    if (!pending || busy) return;
    setBusy(true);
    const who = name;
    try {
      await acceptConnection(pending.id);
      track('circle_request_accepted', { via: 'prompt' });
      toast.success(`You’re now connected with ${who}`);
      await markSeen(pending.id);
    } catch {
      toast.error('Couldn’t add them just now — try again from Circle.');
    } finally {
      setBusy(false);
    }
  };

  const onDismiss = async () => {
    if (!pending || busy) return;
    track('circle_request_prompt_dismissed');
    await markSeen(pending.id);
  };

  const onDecline = async () => {
    if (!pending || busy) return;
    setBusy(true);
    try {
      await removeConnection(pending.id);
      track('circle_request_declined', { via: 'prompt' });
      await markSeen(pending.id);
    } catch {
      // Leave it in place — they can still manage it from the Circle screen.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={!!pending} transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <Pressable
        onPress={onDismiss}
        style={{ flex: 1, backgroundColor: 'rgba(14,16,24,0.5)', alignItems: 'center', justifyContent: 'center', padding: 30 }}
      >
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 360 }}>
          <View className="bg-white dark:bg-card" style={{ borderRadius: 28, padding: 22, ...SHADOW.float }}>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <View
                className="items-center justify-center rounded-full"
                style={{ height: 46, width: 46, backgroundColor: COLORS.coral }}
              >
                <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: '#fff' }}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.coral }}>
                  NEW IN YOUR CIRCLE
                </Text>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginTop: 1 }} numberOfLines={2}>
                  {name} added you
                </Text>
              </View>
            </View>

            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink2, marginTop: 12, lineHeight: 20 }}>
              Add {name} to your Circle too — compare maps, swap recommendations and follow each other’s travels.
            </Text>

            <View className="flex-row" style={{ gap: 10, marginTop: 22 }}>
              <Pressable
                onPress={onDismiss}
                disabled={busy}
                accessibilityRole="button"
                className="flex-1 items-center justify-center rounded-full"
                style={{ paddingVertical: 13, backgroundColor: 'rgba(20,33,61,0.06)' }}
              >
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2 }}>Not now</Text>
              </Pressable>
              <Pressable
                onPress={onAdd}
                disabled={busy}
                accessibilityRole="button"
                className="flex-1 items-center justify-center rounded-full"
                style={{ paddingVertical: 13, backgroundColor: COLORS.coral, opacity: busy ? 0.7 : 1 }}
              >
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Add to Circle</Text>
              </Pressable>
            </View>

            <Pressable onPress={onDecline} disabled={busy} accessibilityRole="button" style={{ marginTop: 12, alignSelf: 'center', paddingVertical: 4 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '600', color: COLORS.ink3 }}>Decline request</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

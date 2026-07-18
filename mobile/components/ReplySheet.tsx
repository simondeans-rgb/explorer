import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Send, X } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { countryName } from '../src/data/countries';
import { addReply, deleteReply, REPLY_MAX_LEN, type Reply } from '../src/lib/replies';
import { track } from '../src/lib/analytics';

/** Replies on a friend's shared snap — a like says "seen it", a reply says
 *  "tell me everything". One line each, newest at the bottom, yours deletable. */
export function ReplySheet({
  snap,
  replies,
  myUid,
  myName,
  onClose,
}: {
  snap: { id: string; userId: string; friend: string; dataUrl: string; city?: string; countryCode?: string } | null;
  replies: Reply[];
  myUid: string | undefined;
  myName: string;
  onClose: () => void;
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function send() {
    if (!snap || !myUid || sending) return;
    const clean = text.trim();
    if (!clean) return;
    setSending(true);
    try {
      await addReply(snap.id, snap.userId, myUid, myName, clean);
      track('circle_reply_sent');
      setText('');
      setFailed(false);
    } catch {
      // Offline, or rules not rolled out yet — keep the text so nothing is lost.
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  const place = snap?.city ?? (snap?.countryCode ? countryName(snap.countryCode) : '');

  return (
    <SheetShell visible={snap != null} title={`${snap?.friend ?? ''}'s snap`} onClose={onClose}>
      {snap ? (
        <View style={{ paddingHorizontal: 20 }}>
          <View className="flex-row items-center" style={{ gap: 12, marginBottom: 12 }}>
            <Image source={{ uri: snap.dataUrl }} style={{ width: 52, height: 52, borderRadius: 14 }} contentFit="cover" />
            <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3 }}>
              {place ? `From ${place}. ` : ''}Leave {snap.friend} a line — "we loved it there", "take me next time"…
            </Text>
          </View>

          {replies.length > 0 ? (
            <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
              {replies.map((r) => (
                <View key={r.id} className="flex-row bg-white dark:bg-card rounded-2xl" style={{ padding: 12, gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>{r.name}</Text>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink, marginTop: 2, lineHeight: 19 }}>{r.text}</Text>
                  </View>
                  {r.uid === myUid ? (
                    <Pressable accessibilityLabel="Delete your reply" onPress={() => deleteReply(r.id)} hitSlop={8}>
                      <X size={15} color={COLORS.ink3} />
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginBottom: 4 }}>
              No replies yet — be the first.
            </Text>
          )}

          {failed ? (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.coral, marginTop: 8 }}>
              That didn't send — check your connection and try again.
            </Text>
          ) : null}
          <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ marginTop: 10, paddingLeft: 14, paddingRight: 6, paddingVertical: 6, gap: 8 }}>
            <TextInput
              value={text}
              onChangeText={(t) => setText(t.slice(0, REPLY_MAX_LEN))}
              placeholder="Write a reply…"
              placeholderTextColor={COLORS.ink3}
              style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink, paddingVertical: 8 }}
              returnKeyType="send"
              onSubmitEditing={send}
            />
            <Pressable
              accessibilityLabel="Send reply"
              onPress={send}
              disabled={sending || !text.trim()}
              className="items-center justify-center rounded-full"
              style={{ height: 38, width: 38, backgroundColor: COLORS.coral, opacity: sending || !text.trim() ? 0.4 : 1 }}
            >
              {sending ? <ActivityIndicator color="#fff" size="small" /> : <Send size={16} color="#fff" />}
            </Pressable>
          </View>
        </View>
      ) : null}
    </SheetShell>
  );
}

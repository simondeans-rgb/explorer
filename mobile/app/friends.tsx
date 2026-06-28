import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Share, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Copy, Share2, UserPlus, Check, X, Users, MessageSquare, MessageCircle, QrCode } from 'lucide-react-native';
import { PageHero } from '../components/PageHero';
import { goBack } from '../src/lib/nav';
import { AuthSheet } from '../components/AuthSheet';
import { COLORS, GRADIENTS, SHADOW } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { router } from 'expo-router';
import { useAuth } from '../src/store/auth';
import { useFriends } from '../src/hooks/useFriends';
import {
  sendRequest,
  acceptConnection,
  removeConnection,
} from '../src/lib/connections';
import { HAS_CAMERA, HAS_CONTACTS } from '../src/lib/nativeCapabilities';

export default function FriendsScreen() {
  const { user } = useAuth();
  const myName =
    user?.displayName || (user?.email ? user.email.split('@')[0] : 'You');
  const { profile, connections, friends, friendsData } = useFriends(user?.uid, myName);

  const [authOpen, setAuthOpen] = useState(false);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const incoming = useMemo(
    () => connections.filter((c) => c.status === 'pending' && c.requestedBy !== user?.uid),
    [connections, user?.uid],
  );
  const outgoing = useMemo(
    () => connections.filter((c) => c.status === 'pending' && c.requestedBy === user?.uid),
    [connections, user?.uid],
  );

  const countriesByFriend = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const p of friendsData.places) {
      if (!p.relationships.some((r) => r !== 'aspiring')) continue;
      const list = m.get(p.userId) ?? [];
      if (p.countryCode && !list.includes(p.countryCode)) list.push(p.countryCode);
      m.set(p.userId, list);
    }
    return m;
  }, [friendsData.places]);

  async function copyCode() {
    if (!profile) return;
    await Clipboard.setStringAsync(profile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  async function shareCode() {
    if (!profile) return;
    await Share.share({
      message: `Follow my travels on Worldly — add me with code ${profile.code}`,
    });
  }
  const inviteLink = profile ? `https://stickynotes-sand.vercel.app/add/${profile.code}` : '';
  const inviteText = profile
    ? `Join me on Worldly, my travel archive — add me with code ${profile.code}: ${inviteLink}`
    : '';
  function inviteVia(scheme: 'sms' | 'whatsapp') {
    if (!profile) return;
    const url = scheme === 'sms' ? `sms:&body=${encodeURIComponent(inviteText)}` : `https://wa.me/?text=${encodeURIComponent(inviteText)}`;
    Linking.openURL(url).catch(() => {});
  }
  async function submit() {
    if (!user || !code.trim() || sending) return;
    setSending(true);
    setMessage(null);
    const res = await sendRequest({ uid: user.uid, name: myName }, code);
    if (res.ok) {
      setMessage({ ok: true, text: 'Request sent!' });
      setCode('');
    } else {
      setMessage({ ok: false, text: res.error ?? 'Could not send request.' });
    }
    setSending(false);
  }

  // --- Signed out -----------------------------------------------------------
  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 112 }}>
          <PageHero eyebrow="Connect" title="Your Circle" subtitle="See where the people you travel with have been." gradient={GRADIENTS.atlas} imageCode="WW" onBack={goBack} />
          <View style={{ paddingHorizontal: 20, marginTop: 20, alignItems: 'center' }}>
            <View className="rounded-full items-center justify-center" style={{ height: 72, width: 72, backgroundColor: 'rgba(155,124,255,0.14)' }}>
              <Users size={30} color={COLORS.lavender} />
            </View>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, marginTop: 16, textAlign: 'center' }}>Connect with friends</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3, marginTop: 6, textAlign: 'center', maxWidth: 300 }}>
              Sign in to get your share code, follow friends, and see their travels.
            </Text>
            <Pressable onPress={() => setAuthOpen(true)} className="rounded-2xl items-center" style={{ marginTop: 20, paddingVertical: 14, paddingHorizontal: 28, backgroundColor: COLORS.coral }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
        <AuthSheet visible={authOpen} onClose={() => setAuthOpen(false)} />
      </View>
    );
  }

  // --- Signed in ------------------------------------------------------------
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 112 }} keyboardShouldPersistTaps="handled">
      <PageHero eyebrow="Connect" title="Your Circle" subtitle="See where the people you travel with have been." gradient={GRADIENTS.atlas} imageCode="WW" onBack={goBack} />

      {/* Your code */}
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 20 }}>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.85 }}>YOUR SHARE CODE</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 36, marginTop: 4, letterSpacing: 2 }}>
            {profile ? profile.code : '· · · · · ·'}
          </Text>
          <View className="flex-row" style={{ gap: 10, marginTop: 14 }}>
            <Pressable onPress={copyCode} disabled={!profile} className="flex-row items-center justify-center rounded-full bg-white/20" style={{ flex: 1, paddingVertical: 11, gap: 6 }}>
              {copied ? <Check size={16} color="#fff" /> : <Copy size={16} color="#fff" />}
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700' }}>{copied ? 'Copied' : 'Copy'}</Text>
            </Pressable>
            <Pressable onPress={shareCode} disabled={!profile} className="flex-row items-center justify-center rounded-full bg-white" style={{ flex: 1, paddingVertical: 11, gap: 6 }}>
              <Share2 size={16} color={COLORS.coral} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>Share</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      {/* Invite — QR + message / WhatsApp */}
      {profile ? (
        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <View className="bg-white rounded-3xl items-center" style={{ padding: 20, ...SHADOW.card }}>
            <View style={{ padding: 14, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(20,33,61,0.06)' }}>
              <QRCode value={inviteLink} size={148} color={COLORS.navy} backgroundColor="#fff" />
            </View>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 12, textAlign: 'center' }}>Scan to add me on Worldly</Text>
            <View className="flex-row" style={{ gap: 10, marginTop: 14, alignSelf: 'stretch' }}>
              <Pressable onPress={() => inviteVia('sms')} className="flex-1 flex-row items-center justify-center rounded-full" style={{ paddingVertical: 12, gap: 7, backgroundColor: COLORS.coral }}>
                <MessageSquare size={16} color="#fff" />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '700', color: '#fff' }}>Message</Text>
              </Pressable>
              <Pressable onPress={() => inviteVia('whatsapp')} className="flex-1 flex-row items-center justify-center rounded-full" style={{ paddingVertical: 12, gap: 7, backgroundColor: '#25D366' }}>
                <MessageCircle size={16} color="#fff" />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '700', color: '#fff' }}>WhatsApp</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {/* Scan QR / invite from contacts — only on a native build that links the
          camera/contacts modules, so OTA'd JS on older binaries never shows a
          button that would route into a missing-native-module screen. */}
      {profile && (HAS_CAMERA || HAS_CONTACTS) ? (
        <View className="flex-row" style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
          {HAS_CAMERA ? (
            <Pressable onPress={() => router.push('/scan')} className="flex-1 flex-row items-center justify-center bg-white rounded-2xl" style={{ paddingVertical: 13, gap: 7, ...SHADOW.card }}>
              <QrCode size={18} color={COLORS.navy} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy }}>Scan a code</Text>
            </Pressable>
          ) : null}
          {HAS_CONTACTS ? (
            <Pressable onPress={() => router.push('/invite-contacts')} className="flex-1 flex-row items-center justify-center bg-white rounded-2xl" style={{ paddingVertical: 13, gap: 7, ...SHADOW.card }}>
              <Users size={18} color={COLORS.navy} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy }}>From contacts</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Add by code */}
      <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, marginBottom: 8 }}>ADD A FRIEND BY CODE</Text>
        <View className="flex-row" style={{ gap: 10 }}>
          <View className="flex-row items-center bg-white rounded-2xl" style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 11 }}>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="SD-XXXXXX"
              placeholderTextColor={COLORS.ink3}
              autoCapitalize="characters"
              autoCorrect={false}
              style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink, letterSpacing: 1 }}
            />
          </View>
          <Pressable onPress={submit} disabled={!code.trim() || sending} className="rounded-2xl items-center justify-center" style={{ paddingHorizontal: 18, backgroundColor: COLORS.coral, opacity: code.trim() && !sending ? 1 : 0.4 }}>
            {sending ? <ActivityIndicator color="#fff" /> : <UserPlus size={20} color="#fff" />}
          </Pressable>
        </View>
        {message ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: message.ok ? COLORS.aqua : '#E0245E', marginTop: 8 }}>{message.text}</Text>
        ) : null}
      </View>

      {/* Incoming requests */}
      {incoming.length > 0 ? (
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginBottom: 10 }}>Requests</Text>
          <View style={{ gap: 10 }}>
            {incoming.map((c) => {
              const other = c.members.find((m) => m !== user.uid) ?? '';
              const name = c.names[other] || 'Member';
              return (
                <View key={c.id} className="bg-white rounded-3xl flex-row items-center" style={{ padding: 14, gap: 12 }}>
                  <Avatar name={name} />
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{name}</Text>
                  <Pressable onPress={() => removeConnection(c.id)} hitSlop={6} className="rounded-full items-center justify-center" style={{ height: 38, width: 38, backgroundColor: COLORS.warmwhite }}>
                    <X size={18} color={COLORS.ink3} />
                  </Pressable>
                  <Pressable onPress={() => acceptConnection(c.id)} hitSlop={6} className="rounded-full items-center justify-center" style={{ height: 38, width: 38, backgroundColor: COLORS.coral }}>
                    <Check size={18} color="#fff" />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {/* Friends */}
      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginBottom: 10 }}>
          Your circle{friends.length > 0 ? ` (${friends.length})` : ''}
        </Text>
        {friends.length === 0 && outgoing.length === 0 ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3 }}>
            Share your code or add a friend's to start following each other's travels.
          </Text>
        ) : null}
        <View style={{ gap: 10 }}>
          {friends.map((f) => {
            const codes = countriesByFriend.get(f.uid) ?? [];
            return (
              <View key={f.uid} className="bg-white rounded-3xl flex-row items-center" style={{ padding: 14, gap: 12 }}>
                <Avatar name={f.name} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{f.name}</Text>
                  <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 1 }}>
                    {codes.length > 0 ? `${codes.length} ${codes.length === 1 ? 'country' : 'countries'} · ${codes.slice(0, 10).map((c) => flagEmoji(c)).join(' ')}` : 'No countries shared yet'}
                  </Text>
                </View>
                <Pressable onPress={() => removeConnection(f.uid < user.uid ? `${f.uid}__${user.uid}` : `${user.uid}__${f.uid}`)} hitSlop={6} className="rounded-full items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.warmwhite }}>
                  <X size={16} color={COLORS.ink3} />
                </Pressable>
              </View>
            );
          })}
          {outgoing.map((c) => {
            const other = c.members.find((m) => m !== user.uid) ?? '';
            const name = c.names[other] || 'Member';
            return (
              <View key={c.id} className="bg-white rounded-3xl flex-row items-center" style={{ padding: 14, gap: 12, opacity: 0.7 }}>
                <Avatar name={name} />
                <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{name}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>Requested</Text>
                <Pressable onPress={() => removeConnection(c.id)} hitSlop={6} className="rounded-full items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.warmwhite }}>
                  <X size={16} color={COLORS.ink3} />
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <View className="rounded-full items-center justify-center" style={{ height: 44, width: 44, backgroundColor: 'rgba(155,124,255,0.16)' }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.lavender }}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

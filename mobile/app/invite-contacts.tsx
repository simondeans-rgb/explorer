import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator, Linking } from 'react-native';
import * as Contacts from 'expo-contacts';
import { Search, MessageSquare, MessageCircle } from 'lucide-react-native';
import { PageHero } from '../components/PageHero';
import { goBack } from '../src/lib/nav';
import { COLORS, GRADIENTS, SHADOW } from '../src/lib/theme';
import { useAuth } from '../src/store/auth';
import { useFriends } from '../src/hooks/useFriends';

interface ContactRow {
  id: string;
  name: string;
  phone: string;
}

export default function InviteContactsScreen() {
  const { user } = useAuth();
  const myName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Member');
  const { profile } = useFriends(user?.uid, myName);
  const [status, setStatus] = useState<'loading' | 'denied' | 'ready'>('loading');
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { status: perm } = await Contacts.requestPermissionsAsync();
      if (perm !== 'granted') {
        if (active) setStatus('denied');
        return;
      }
      const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name] });
      const list: ContactRow[] = [];
      for (const c of data) {
        const phone = c.phoneNumbers?.[0]?.number;
        if (c.name && phone) list.push({ id: c.id ?? `${c.name}-${phone}`, name: c.name, phone });
      }
      list.sort((a, b) => a.name.localeCompare(b.name));
      if (active) {
        setContacts(list);
        setStatus('ready');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const code = profile?.code ?? '';
  const link = `https://stickynotes-sand.vercel.app/add/${code}`;
  const text = `Join me on Worldly, my travel archive — add me with code ${code}: ${link}`;

  function invite(phone: string, via: 'sms' | 'whatsapp') {
    const url =
      via === 'sms'
        ? `sms:${phone.replace(/\s/g, '')}&body=${encodeURIComponent(text)}`
        : `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => {});
  }

  const shown = contacts.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 300);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <PageHero eyebrow="Grow your circle" title="Invite contacts" subtitle="Send a friend you know an invite to Worldly." gradient={GRADIENTS.atlas} imageCode="WW" onBack={goBack} />

        {status === 'loading' ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator color={COLORS.coral} />
          </View>
        ) : status === 'denied' ? (
          <View style={{ paddingHorizontal: 20, marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, textAlign: 'center' }}>Contacts access is off</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, color: COLORS.ink3, textAlign: 'center', marginTop: 6, lineHeight: 19 }}>
              Enable Contacts for Worldly in Settings to invite people you already know, or share your code instead.
            </Text>
            <Pressable onPress={() => Linking.openSettings()} style={{ marginTop: 16, backgroundColor: COLORS.coral, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 999 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontWeight: '700', color: '#fff' }}>Open Settings</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
            <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 11, gap: 8, ...SHADOW.card }}>
              <Search size={18} color={COLORS.ink3} />
              <TextInput value={q} onChangeText={setQ} placeholder="Search contacts" placeholderTextColor={COLORS.ink3} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink }} />
            </View>
            <View style={{ marginTop: 12, gap: 8 }}>
              {shown.map((c) => (
                <View key={c.id} className="bg-white dark:bg-card rounded-2xl flex-row items-center" style={{ padding: 12, gap: 10, ...SHADOW.card }}>
                  <View className="rounded-full items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(155,124,255,0.16)' }}>
                    <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.lavender }}>{c.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 14.5, fontWeight: '600', color: COLORS.navy }}>{c.name}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{c.phone}</Text>
                  </View>
                  <Pressable onPress={() => invite(c.phone, 'whatsapp')} hitSlop={6} className="rounded-full items-center justify-center" style={{ height: 36, width: 36, backgroundColor: '#25D366' }}>
                    <MessageCircle size={17} color="#fff" />
                  </Pressable>
                  <Pressable onPress={() => invite(c.phone, 'sms')} hitSlop={6} className="rounded-full items-center justify-center" style={{ height: 36, width: 36, backgroundColor: COLORS.coral }}>
                    <MessageSquare size={17} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {shown.length === 0 ? (
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, textAlign: 'center', paddingVertical: 24 }}>No contacts match “{q}”.</Text>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { UserPlus, ArrowRight, MapPin, Star, Plus, Sparkles, Settings2 } from 'lucide-react-native';
import { PageHero } from '../../components/PageHero';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { HERO_CODES } from '../../src/lib/heroImages';
import { useAuth } from '../../src/store/auth';
import { useFriends } from '../../src/hooks/useFriends';

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <View className="rounded-full items-center justify-center" style={{ height: size, width: size, backgroundColor: 'rgba(155,124,255,0.16)' }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: size * 0.4, color: COLORS.lavender }}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

/** A ring of ghost avatars + a coral "add" — the visual invitation. */
function GhostCircle() {
  const ghosts = [0, 1, 2];
  return (
    <View className="flex-row items-center justify-center" style={{ marginBottom: 18 }}>
      {ghosts.map((i) => (
        <View
          key={i}
          className="rounded-full items-center justify-center"
          style={{ height: 58, width: 58, marginLeft: i === 0 ? 0 : -14, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(155,124,255,0.45)', backgroundColor: 'rgba(155,124,255,0.08)' }}
        >
          <UserPlus size={20} color="rgba(155,124,255,0.65)" />
        </View>
      ))}
      <View
        className="rounded-full items-center justify-center"
        style={{ height: 58, width: 58, marginLeft: -14, backgroundColor: COLORS.coral, shadowColor: COLORS.coral, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }}
      >
        <Plus size={24} color="#fff" strokeWidth={2.6} />
      </View>
    </View>
  );
}

/** A dimmed, non-interactive preview of the active screen. */
function CirclePreview() {
  return (
    <View style={{ marginTop: 26 }}>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, textAlign: 'center', marginBottom: 12 }}>A GLIMPSE OF YOUR CIRCLE</Text>
      <View style={{ gap: 12, opacity: 0.96 }}>
        {/* recently visited */}
        <View className="bg-white rounded-3xl" style={{ padding: 14 }}>
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <Avatar name="Simon" size={38} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.navy }}><Text style={{ fontWeight: '700' }}>Simon</Text> recently visited</Text>
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 6, marginTop: 10 }}>
            {['Porto', 'Braga', 'Aveiro'].map((c) => (
              <View key={c} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.10)', paddingHorizontal: 10, paddingVertical: 5, gap: 4 }}>
                <MapPin size={12} color={COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '600', color: COLORS.coral }}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* recommendation */}
        <View className="bg-white rounded-3xl" style={{ padding: 14 }}>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View className="rounded-full items-center justify-center" style={{ height: 28, width: 28, backgroundColor: 'rgba(255,184,77,0.18)' }}>
              <Star size={15} color="#C2871A" />
            </View>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: '#B5731A' }}>Hidden Gem</Text>
          </View>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 8 }}>Sintra, Portugal</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 1 }}>4 people in your circle say it's worth the trip</Text>
        </View>

        {/* wishlist */}
        <View className="bg-white rounded-3xl" style={{ padding: 14 }}>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Sparkles size={15} color={COLORS.lavender} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: COLORS.lavender }}>On their wishlists</Text>
          </View>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, marginTop: 8 }}>Colin wants to visit <Text style={{ fontWeight: '700' }}>Kyoto</Text>, <Text style={{ fontWeight: '700' }}>Buenos Aires</Text> & <Text style={{ fontWeight: '700' }}>Cape Town</Text></Text>
        </View>
      </View>
    </View>
  );
}

export default function CircleScreen() {
  const { user } = useAuth();
  const myName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'You');
  const { friends, friendsData } = useFriends(user?.uid, myName);

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

  const hasCircle = friends.length > 0;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHero
        eyebrow="The world, through people you trust"
        title="Your Circle"
        subtitle="Real recommendations from the people you travel with."
        gradient={GRADIENTS.story}
        imageCodes={HERO_CODES.you}
        motion
      />

      {!hasCircle ? (
        /* ── Exceptional empty state — an invitation, not an absence ── */
        <View style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <View className="items-center">
            <GhostCircle />
            <Text style={{ fontFamily: 'Fraunces', fontSize: 25, color: COLORS.navy, textAlign: 'center', lineHeight: 31 }}>
              See the world through people you trust
            </Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14.5, color: COLORS.ink2, textAlign: 'center', marginTop: 10, lineHeight: 21, maxWidth: 330 }}>
              Your Circle turns your friends' real trips into your next discovery — the places they loved, their hidden gems, and where they're dreaming of going next.
            </Text>
            <Pressable onPress={() => router.push('/friends')} style={{ marginTop: 22, alignSelf: 'stretch' }}>
              <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-row items-center justify-center rounded-2xl" style={{ paddingVertical: 16, gap: 8 }}>
                <UserPlus size={18} color="#fff" />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Invite someone into your circle</Text>
              </LinearGradient>
            </Pressable>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, textAlign: 'center', marginTop: 10 }}>
              Travel memories are better when they're shared.
            </Text>
          </View>

          <CirclePreview />
        </View>
      ) : (
        /* ── Active circle (rich sections land in the next phase) ── */
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Your circle ({friends.length})</Text>
            <Pressable onPress={() => router.push('/friends')} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(155,124,255,0.14)', paddingHorizontal: 12, paddingVertical: 7, gap: 5 }}>
              <Settings2 size={14} color={COLORS.lavender} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.lavender }}>Manage</Text>
            </Pressable>
          </View>

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
                </View>
              );
            })}
          </View>

          <Pressable onPress={() => router.push('/friends')} className="flex-row items-center justify-center rounded-2xl" style={{ marginTop: 14, paddingVertical: 14, gap: 7, backgroundColor: 'rgba(255,107,154,0.10)' }}>
            <UserPlus size={17} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.coral }}>Invite more friends</Text>
            <ArrowRight size={15} color={COLORS.coral} />
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

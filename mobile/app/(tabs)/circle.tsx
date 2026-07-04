import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ComponentType } from 'react';
import { UserPlus, ArrowRight, MapPin, Star, Plus, Sparkles, Settings2, Gem, BookmarkCheck, Check, HeartHandshake, Heart } from 'lucide-react-native';
import { useLikes } from '../../src/hooks/useLikes';
import { PageHero } from '../../components/PageHero';
import { LandmarkDetailSheet } from '../../components/LandmarkDetailSheet';
import { COLORS, GRADIENTS, SHADOW, HERO_HEIGHT } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { aggregateByCountry, computeStats } from '../../src/lib/stats';
import { computeDiscoveryStats } from '../../src/lib/discoveryStats';
import { computeJourneyStats } from '../../src/lib/journeyStats';
import { computeExplorerLevel } from '../../src/lib/explorer';
import { HERO_CODES } from '../../src/lib/heroImages';
import { useAuth } from '../../src/store/auth';
import { useData } from '../../src/store/data';
import { useToast } from '../../src/store/toast';
import { useFriends } from '../../src/hooks/useFriends';
import { recentVisits, wishlists, circleRecommendations, mostVisitedCountry, travelCompatibility, type CircleRec } from '../../src/lib/circle';
import type { RecommendationVerdict } from '../../src/types';

const VERDICT_STYLE: Partial<Record<RecommendationVerdict, { label: string; color: string; tint: string; Icon: ComponentType<{ size?: number; color?: string }> }>> = {
  'hidden-gem': { label: 'Hidden Gem', color: '#B5731A', tint: 'rgba(255,184,77,0.18)', Icon: Gem },
  recommend: { label: 'Recommend', color: COLORS.coral, tint: 'rgba(255,107,154,0.12)', Icon: Star },
  'worth-visiting': { label: 'Worth Visiting', color: COLORS.lavender, tint: 'rgba(155,124,255,0.14)', Icon: Star },
};

const matchColor = (m: number) => (m >= 70 ? '#12A594' : m >= 45 ? '#C2871A' : COLORS.ink3);

/** Friendly relative label for an upcoming trip start date (ISO). */
function whenLabel(iso?: string): string {
  if (!iso) return 'soon';
  const days = Math.round((new Date(`${iso}T00:00:00`).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 7) return 'this week';
  if (days <= 14) return 'next week';
  if (days <= 31) return `in ${days} days`;
  return `in ${new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: 'long' })}`;
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <View className="rounded-full items-center justify-center" style={{ height: size, width: size, backgroundColor: 'rgba(155,124,255,0.16)' }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: size * 0.4, color: COLORS.lavender }}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function SectionTitle({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={{ marginTop: 24, marginBottom: 10 }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 21, color: COLORS.navy }}>{children}</Text>
      {hint ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 1 }}>{hint}</Text> : null}
    </View>
  );
}

function GhostCircle() {
  return (
    <View className="flex-row items-center justify-center" style={{ marginBottom: 18 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} className="rounded-full items-center justify-center" style={{ height: 58, width: 58, marginLeft: i === 0 ? 0 : -14, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(155,124,255,0.45)', backgroundColor: 'rgba(155,124,255,0.08)' }}>
          <UserPlus size={20} color="rgba(155,124,255,0.65)" />
        </View>
      ))}
      <View className="rounded-full items-center justify-center" style={{ height: 58, width: 58, marginLeft: -14, backgroundColor: COLORS.coral, shadowColor: COLORS.coral, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }}>
        <Plus size={24} color="#fff" strokeWidth={2.6} />
      </View>
    </View>
  );
}

function CirclePreview() {
  return (
    <View style={{ marginTop: 14 }}>
      <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, textAlign: 'center', marginBottom: 4, paddingHorizontal: 16 }}>PREVIEW · HOW YOUR CIRCLE WILL LOOK</Text>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 12, fontStyle: 'italic', color: COLORS.ink3, textAlign: 'center', marginBottom: 10, paddingHorizontal: 24 }}>Invite friends to see their real activity.</Text>
      <View style={{ gap: 10, opacity: 0.92 }}>
        <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14 }}>
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <Avatar name="Maya" size={38} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.navy }}><Text style={{ fontWeight: '700' }}>Maya</Text> recently visited</Text>
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
        <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14 }}>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View className="rounded-full items-center justify-center" style={{ height: 28, width: 28, backgroundColor: 'rgba(255,184,77,0.18)' }}>
              <Gem size={15} color="#C2871A" />
            </View>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: '#B5731A' }}>Hidden Gem</Text>
          </View>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 8 }}>Sintra, Portugal</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 1 }}>4 people in your circle say it's worth the trip</Text>
        </View>
        <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14 }}>
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
  const { places: myPlaces, discoveries: myDiscoveries, addPlace } = useData();
  const { toast } = useToast();
  const [rec, setRec] = useState<CircleRec | null>(null);

  const recs = useMemo(() => circleRecommendations(friendsData.discoveries, friends), [friendsData.discoveries, friends]);
  const mostVisited = useMemo(() => mostVisitedCountry(friendsData.places, friends), [friendsData.places, friends]);
  const recents = useMemo(() => recentVisits(friendsData.places, friends), [friendsData.places, friends]);
  const wishes = useMemo(() => wishlists(friendsData.places, friends), [friendsData.places, friends]);
  const compat = useMemo(
    () => travelCompatibility(myDiscoveries, friendsData.discoveries, friends).filter((c) => c.confident),
    [myDiscoveries, friendsData.discoveries, friends],
  );

  // Rank the circle by Explorer XP, computed from each friend's places + discoveries.
  const leaderboard = useMemo(
    () =>
      friends
        .map((f) => {
          const fp = friendsData.places.filter((p) => p.userId === f.uid);
          const fd = friendsData.discoveries.filter((d) => d.userId === f.uid);
          const stats = computeStats(aggregateByCountry(fp));
          const lvl = computeExplorerLevel(stats, computeDiscoveryStats(fd), computeJourneyStats([]));
          return { uid: f.uid, name: f.name, level: lvl.level, title: lvl.title, xp: lvl.xp, countries: stats.countriesDiscovered };
        })
        .sort((a, b) => b.xp - a.xp),
    [friends, friendsData],
  );

  const hasCircle = friends.length > 0;
  // Wishlist overlaps: places you BOTH want to visit → "plan a trip together".
  const myWishCodes = useMemo(
    () => new Set(myPlaces.filter((p) => p.relationships.includes('aspiring') && p.relationships.every((r) => r === 'aspiring')).map((p) => p.countryCode)),
    [myPlaces],
  );
  const wishMatches = useMemo(() => {
    const out: { uid: string; friend: string; place: string; countryCode: string }[] = [];
    const seen = new Set<string>();
    for (const w of wishes) {
      for (const p of w.places) {
        if (!myWishCodes.has(p.countryCode)) continue;
        const key = `${w.uid}:${p.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ uid: w.uid, friend: w.name, place: p.name, countryCode: p.countryCode });
      }
    }
    return out.slice(0, 5);
  }, [wishes, myWishCodes]);

  // Friends currently travelling, or with a trip in the next ~2 months.
  const activity = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const horizon = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
    const items: { uid: string; name: string; kind: 'now' | 'soon'; countryCode: string; place: string; start?: string }[] = [];
    for (const f of friends) {
      const trips = friendsData.expeditions.filter((e) => e.userId === f.uid && e.countryCodes.length > 0);
      const now = trips.find((e) => e.startDate && e.startDate <= today && (e.endDate ?? e.startDate) >= today);
      if (now) {
        items.push({ uid: f.uid, name: f.name, kind: 'now', countryCode: now.countryCodes[0], place: countryName(now.countryCodes[0]) });
        continue;
      }
      const up = trips
        .filter((e) => e.startDate && e.startDate > today && e.startDate <= horizon)
        .sort((a, b) => a.startDate!.localeCompare(b.startDate!))[0];
      if (up) items.push({ uid: f.uid, name: f.name, kind: 'soon', countryCode: up.countryCodes[0], place: countryName(up.countryCodes[0]), start: up.startDate });
    }
    return items.sort((a, b) => (a.kind === b.kind ? (a.start ?? '').localeCompare(b.start ?? '') : a.kind === 'now' ? -1 : 1));
  }, [friends, friendsData.expeditions]);

  // Recent photos shared by your circle, newest first.
  const snaps = useMemo(() => {
    const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
    return [...friendsData.captures]
      .filter((c) => c.dataUrl)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 12)
      .map((c) => ({ ...c, friend: nameByUid.get(c.userId) ?? 'A friend' }));
  }, [friendsData.captures, friends]);
  const { likes, toggle } = useLikes(
    useMemo(() => snaps.map((s) => s.id), [snaps]),
    user?.uid,
  );

  const hasContent = activity.length > 0 || snaps.length > 0 || recs.length > 0 || !!mostVisited || recents.length > 0 || wishes.length > 0 || compat.length > 0;
  const savedMostVisited = mostVisited ? myPlaces.some((p) => p.kind === 'country' && p.countryCode === mostVisited.countryCode) : false;

  function addToWishlist(code: string, name: string) {
    addPlace({ kind: 'country', countryCode: code, relationships: ['aspiring'] });
    toast.success(`${name} added to your wishlist`);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 120 }}>
      <PageHero
        title="Your Circle"
        subtitle="Discover what friends loved"
        gradient={GRADIENTS.story}
        imageCodes={HERO_CODES.you}
        motion
        minHeight={HERO_HEIGHT}
      />

      {!hasCircle ? (
        /* ── Exceptional empty state — an invitation, not an absence ── */
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <View className="items-center">
            <Pressable onPress={() => router.push('/friends')} accessibilityLabel="Add a friend to your circle">
              <GhostCircle />
            </Pressable>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 25, color: COLORS.navy, textAlign: 'center', lineHeight: 31 }}>See the world through people you trust</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14.5, color: COLORS.ink2, textAlign: 'center', marginTop: 8, lineHeight: 21, maxWidth: 330 }}>
              Your Circle turns your friends' real trips into your next discovery — the places they loved, their hidden gems, and where they're dreaming of going next.
            </Text>
            <Pressable onPress={() => router.push('/friends')} className="flex-row items-center justify-center rounded-full" style={{ marginTop: 16, paddingHorizontal: 22, paddingVertical: 13, gap: 8, backgroundColor: COLORS.coral }}>
              <UserPlus size={17} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14.5, fontWeight: '700', color: '#fff' }}>Invite someone</Text>
            </Pressable>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, textAlign: 'center', marginTop: 10 }}>Travel memories are better when they're shared.</Text>
          </View>
          <CirclePreview />
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          {/* circle header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {friends.slice(0, 4).map((f, i) => (
                <View key={f.uid} style={{ marginLeft: i === 0 ? 0 : -10 }}>
                  <View style={{ borderRadius: 999, borderWidth: 2, borderColor: COLORS.warmwhite }}>
                    <Avatar name={f.name} size={34} />
                  </View>
                </View>
              ))}
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.ink2, marginLeft: 10 }}>{friends.length} {friends.length === 1 ? 'friend' : 'friends'}</Text>
            </View>
            <Pressable onPress={() => router.push('/friends')} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(155,124,255,0.14)', paddingHorizontal: 12, paddingVertical: 7, gap: 5 }}>
              <Settings2 size={14} color={COLORS.lavender} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.lavender }}>Manage</Text>
            </Pressable>
          </View>

          {/* Why your circle matters */}
          <View className="rounded-3xl" style={{ marginTop: 16, overflow: 'hidden' }}>
            <LinearGradient colors={['rgba(155,124,255,0.16)', 'rgba(36,209,195,0.13)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 44, width: 44, backgroundColor: COLORS.card }}>
                <HeartHandshake size={22} color={COLORS.lavender} />
              </View>
              <Text style={{ flex: 1, fontFamily: 'Fraunces', fontSize: 15, color: COLORS.navy, lineHeight: 21 }}>
                Planning the trip of a lifetime? One tip from someone you trust beats a thousand reviews from strangers.
              </Text>
            </LinearGradient>
          </View>

          {/* On the move — friends travelling now or soon */}
          {activity.length > 0 ? (
            <>
              <SectionTitle hint="Catch them while they're travelling">On the move</SectionTitle>
              <View style={{ gap: 10 }}>
                {activity.map((a) => (
                  <Pressable key={a.uid} onPress={() => router.push(`/country/${a.countryCode}`)} className="rounded-3xl" style={{ overflow: 'hidden', ...SHADOW.card }}>
                    <LinearGradient colors={a.kind === 'now' ? GRADIENTS.story : GRADIENTS.saved} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View>
                        <Avatar name={a.name} size={44} />
                        {a.kind === 'now' ? <View style={{ position: 'absolute', bottom: -1, right: -1, height: 14, width: 14, borderRadius: 7, backgroundColor: '#34C77B', borderWidth: 2, borderColor: '#fff' }} /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 16, lineHeight: 21 }}>
                          {a.kind === 'now' ? `${a.name} is in ${a.place} right now` : `${a.name} is off to ${a.place} ${whenLabel(a.start)}`}
                        </Text>
                        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, opacity: 0.95, marginTop: 1 }}>
                          {a.kind === 'now' ? 'Watch for their recommendations' : 'Send them a tip before they go'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 22 }}>{flagEmoji(a.countryCode)}</Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {/* Snaps from your circle */}
          {snaps.length > 0 ? (
            <>
              <SectionTitle hint="Tap the heart to cheer them on">From your circle's camera roll</SectionTitle>
              <View style={{ marginHorizontal: -20 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                  {snaps.map((s) => {
                    const st = likes[s.id] ?? { count: 0, likedByMe: false };
                    return (
                      <View key={s.id} style={{ width: 150, borderRadius: 20, overflow: 'hidden', ...SHADOW.card }}>
                        <Pressable onPress={() => (s.countryCode ? router.push(`/country/${s.countryCode}`) : undefined)}>
                          <Image source={{ uri: s.dataUrl }} style={{ width: 150, height: 190 }} contentFit="cover" transition={200} cachePolicy="memory-disk" />
                        </Pressable>
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, paddingTop: 28 }}>
                          <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700' }}>{s.friend}</Text>
                          {s.city || s.countryCode ? (
                            <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, opacity: 0.9 }}>{s.city ?? (s.countryCode ? countryName(s.countryCode) : '')}</Text>
                          ) : null}
                        </LinearGradient>
                        <Pressable onPress={() => toggle(s.id, s.userId)} hitSlop={8} className="absolute flex-row items-center rounded-full" style={{ top: 8, right: 8, gap: 4, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                          <Heart size={14} color={st.likedByMe ? COLORS.coral : '#fff'} fill={st.likedByMe ? COLORS.coral : 'transparent'} />
                          {st.count > 0 ? <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700' }}>{st.count}</Text> : null}
                        </Pressable>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          ) : null}

          {/* Circle leaderboard */}
          <SectionTitle hint="Your circle, ranked by Explorer XP">Circle leaderboard</SectionTitle>
          <View style={{ gap: 8 }}>
            {leaderboard.map((m, i) => (
              <View key={m.uid} className="bg-white dark:bg-card rounded-2xl flex-row items-center" style={{ padding: 12, gap: 12, ...SHADOW.card }}>
                <Text style={{ width: 18, textAlign: 'center', fontFamily: 'Fraunces', fontSize: 16, color: i === 0 ? COLORS.coral : COLORS.ink3 }}>{i + 1}</Text>
                <Avatar name={m.name} size={40} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>{m.name}</Text>
                  <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Lvl {m.level} · {m.title} · {m.countries} {m.countries === 1 ? 'country' : 'countries'}</Text>
                </View>
                <View className="items-end">
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.lavender }}>{m.xp.toLocaleString()}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: COLORS.ink3 }}>XP</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Shared wishlists → plan a trip together */}
          {wishMatches.length > 0 ? (
            <>
              <SectionTitle hint="A wishlist you share — why not go together?">Plan a trip together</SectionTitle>
              <View style={{ gap: 10 }}>
                {wishMatches.map((m) => (
                  <Pressable key={`${m.uid}-${m.countryCode}-${m.place}`} onPress={() => router.push(`/country/${m.countryCode}`)} className="rounded-3xl" style={{ overflow: 'hidden', ...SHADOW.card }}>
                    <LinearGradient colors={GRADIENTS.sunrise} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ fontSize: 26 }}>{flagEmoji(m.countryCode)}</Text>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 17 }}>You both want {m.place}</Text>
                        <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, opacity: 0.95, marginTop: 1 }}>{m.friend} has it on their wishlist too — why not plan a trip together?</Text>
                      </View>
                      <ArrowRight size={18} color="#fff" />
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {!hasContent ? (
            <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 18, marginTop: 18 }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>Your circle is quiet… for now</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, color: COLORS.ink3, marginTop: 6, lineHeight: 19 }}>
                As the people you've connected with log their trips, discoveries and wishlists, their recommendations will appear here.
              </Text>
            </View>
          ) : null}

          {/* ── Recommended by your circle ── */}
          {mostVisited || recs.length > 0 ? <SectionTitle hint="Where your circle keeps pointing you">Recommended by your circle</SectionTitle> : null}

          {mostVisited ? (
            <View style={{ marginBottom: recs.length ? 12 : 0 }}>
              <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="rounded-3xl" style={{ padding: 16 }}>
                <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, opacity: 0.85 }}>MOST VISITED IN YOUR CIRCLE</Text>
                <Pressable onPress={() => router.push(`/country/${mostVisited.countryCode}`)}>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 24, marginTop: 4 }}>{flagEmoji(mostVisited.countryCode)} {mostVisited.name}</Text>
                </Pressable>
                <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.95, marginTop: 1 }}>{mostVisited.count} of your circle have been</Text>
                <View className="flex-row" style={{ gap: 10, marginTop: 14 }}>
                  {savedMostVisited ? (
                    <View className="flex-row items-center justify-center rounded-full bg-white/20" style={{ flex: 1, paddingVertical: 11, gap: 6 }}>
                      <BookmarkCheck size={16} color="#fff" />
                      <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700' }}>On your wishlist</Text>
                    </View>
                  ) : (
                    <Pressable onPress={() => addToWishlist(mostVisited.countryCode, mostVisited.name)} className="flex-row items-center justify-center rounded-full bg-white dark:bg-card" style={{ flex: 1, paddingVertical: 11, gap: 6 }}>
                      <Plus size={16} color={COLORS.coral} strokeWidth={2.6} />
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>Add to wishlist</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => router.push(`/country/${mostVisited.countryCode}`)} className="flex-row items-center justify-center rounded-full bg-white/20" style={{ flex: 1, paddingVertical: 11, gap: 6 }}>
                    <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700' }}>Explore</Text>
                    <ArrowRight size={15} color="#fff" />
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          ) : null}

          {recs.length > 0 ? (
            <View style={{ gap: 10 }}>
              {recs.map((r) => {
                const s = VERDICT_STYLE[r.headline] ?? VERDICT_STYLE.recommend!;
                const Icon = s.Icon;
                const place = [r.city, r.countryCode ? countryName(r.countryCode) : null].filter(Boolean).join(', ');
                return (
                  <Pressable key={r.key} onPress={() => setRec(r)} className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14 }}>
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <View className="rounded-full items-center justify-center" style={{ height: 26, width: 26, backgroundColor: s.tint }}>
                        <Icon size={14} color={s.color} />
                      </View>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '800', color: s.color }}>{s.label}</Text>
                    </View>
                    <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 8 }}>{r.name}</Text>
                    <View className="flex-row items-center" style={{ justifyContent: 'space-between', marginTop: 1 }}>
                      <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3 }}>
                        {r.count} of your circle say {s.label.toLowerCase()}{place ? ` · ${place}` : ''}
                      </Text>
                      <ArrowRight size={16} color={COLORS.ink3} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {/* ── Recently visited ── */}
          {recents.length > 0 ? (
            <>
              <SectionTitle hint="Tap a place for their notes & tips">Recently visited</SectionTitle>
              <View style={{ gap: 10 }}>
                {recents.slice(0, 6).map((f) => (
                  <View key={f.uid} className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14 }}>
                    <View className="flex-row items-center" style={{ gap: 10 }}>
                      <Avatar name={f.name} size={38} />
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.navy }}><Text style={{ fontWeight: '700' }}>{f.name}</Text> recently visited</Text>
                    </View>
                    <View className="flex-row flex-wrap" style={{ gap: 6, marginTop: 10 }}>
                      {f.places.map((p, i) => (
                        <Pressable key={`${p.name}-${i}`} onPress={() => router.push(`/country/${p.countryCode}`)} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.10)', paddingHorizontal: 10, paddingVertical: 5, gap: 4 }}>
                          <MapPin size={12} color={COLORS.coral} />
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '600', color: COLORS.coral }}>{p.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* ── Wishlists ── */}
          {wishes.length > 0 ? (
            <>
              <SectionTitle hint="Places your circle is dreaming of — plan a trip together?">On their wishlists</SectionTitle>
              <View style={{ gap: 10 }}>
                {wishes.slice(0, 6).map((f) => (
                  <View key={f.uid} className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14 }}>
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <Sparkles size={15} color={COLORS.lavender} />
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.navy }}><Text style={{ fontWeight: '700' }}>{f.name}</Text> wants to visit</Text>
                    </View>
                    <View className="flex-row flex-wrap" style={{ gap: 6, marginTop: 10 }}>
                      {f.places.map((p, i) => (
                        <Pressable key={`${p.name}-${i}`} onPress={() => router.push(`/country/${p.countryCode}`)} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(155,124,255,0.12)', paddingHorizontal: 10, paddingVertical: 5, gap: 4 }}>
                          <MapPin size={12} color={COLORS.lavender} />
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '600', color: COLORS.lavender }}>{p.name}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* ── Travel compatibility ── */}
          {compat.length > 0 ? (
            <>
              <SectionTitle hint="Whose taste in travel matches yours">Travel compatibility</SectionTitle>
              <View style={{ gap: 10 }}>
                {compat.map((c) => {
                  const col = matchColor(c.match);
                  const sharedMode = c.shared.length > 0;
                  const tastes = sharedMode ? c.shared : c.diverge;
                  return (
                    <View key={c.uid} className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14 }}>
                      <View className="flex-row items-center" style={{ gap: 12 }}>
                        <Avatar name={c.name} size={40} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>{c.name}</Text>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Travel match</Text>
                        </View>
                        <Text style={{ fontFamily: 'Fraunces', fontSize: 25, color: col }}>{c.match}%</Text>
                      </View>
                      <View style={{ height: 7, borderRadius: 7, backgroundColor: 'rgba(20,33,61,0.07)', marginTop: 12, overflow: 'hidden' }}>
                        <View style={{ height: 7, borderRadius: 7, backgroundColor: col, width: `${Math.max(3, c.match)}%` }} />
                      </View>
                      {tastes.length ? (
                        <>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 12, marginBottom: 7 }}>{sharedMode ? 'You both lean into' : 'They lean into'}</Text>
                          <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                            {tastes.map((t) => (
                              <View key={t} className="flex-row items-center rounded-full" style={{ backgroundColor: sharedMode ? 'rgba(36,209,195,0.12)' : 'rgba(20,33,61,0.05)', paddingHorizontal: 10, paddingVertical: 5, gap: 5 }}>
                                {sharedMode ? <Check size={12} color="#12A594" /> : null}
                                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '600', color: sharedMode ? '#0E8C82' : COLORS.ink2 }}>{t}</Text>
                              </View>
                            ))}
                          </View>
                        </>
                      ) : null}
                    </View>
                  );
                })}
                <View className="flex-row items-start" style={{ gap: 7, marginTop: 2 }}>
                  <HeartHandshake size={14} color={COLORS.ink3} style={{ marginTop: 1 }} />
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, lineHeight: 17 }}>
                    The more you and your circle log, the sharper this gets — so a “{compat[0]?.name} recommended this” means more than stars from strangers.
                  </Text>
                </View>
              </View>
            </>
          ) : null}

          <Pressable onPress={() => router.push('/friends')} className="flex-row items-center justify-center rounded-2xl" style={{ marginTop: 22, paddingVertical: 14, gap: 7, backgroundColor: 'rgba(255,107,154,0.10)' }}>
            <UserPlus size={17} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.coral }}>Invite more friends</Text>
            <ArrowRight size={15} color={COLORS.coral} />
          </Pressable>
        </View>
      )}

      <LandmarkDetailSheet
        visible={!!rec}
        onClose={() => setRec(null)}
        name={rec?.name}
        countryCode={rec?.countryCode}
        placeLabel={[rec?.city, rec?.countryCode ? countryName(rec.countryCode) : null].filter(Boolean).join(' · ')}
        hint={rec?.countryCode ? countryName(rec.countryCode) : undefined}
        friends={rec?.people ?? []}
      />
    </ScrollView>
  );
}

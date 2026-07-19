import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MapPin, Star, Gem, ChevronRight, Users } from 'lucide-react-native';
import { DestinationImage } from '../../components/DestinationImage';
import { ExplorerLevelCard } from '../../components/ExplorerLevelCard';
import { AchievementBadge } from '../../components/AchievementBadge';
import { BackButton } from '../../components/BackButton';
import { COLORS, HERO_HEIGHT } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { aggregateByCountry, computeStats } from '../../src/lib/stats';
import { computeDiscoveryStats } from '../../src/lib/discoveryStats';
import { computeJourneyStats } from '../../src/lib/journeyStats';
import { computeExplorerLevel, computeBadges } from '../../src/lib/explorer';
import { hasDestinationPhoto } from '../../src/lib/destinationImage';
import { useAuth } from '../../src/store/auth';
import { useFriendsData } from '../../src/hooks/useFriendsData';
import { HERO_CODES } from '../../src/lib/heroImages';
import type { ComponentType } from 'react';
import type { RecommendationVerdict } from '../../src/types';

const REC_VERDICTS = new Set<RecommendationVerdict>(['recommend', 'hidden-gem', 'worth-visiting']);
const VERDICT_STYLE: Partial<Record<RecommendationVerdict, { label: string; color: string; tint: string; Icon: ComponentType<{ size?: number; color?: string }> }>> = {
  'hidden-gem': { label: 'Hidden Gem', color: '#B5731A', tint: 'rgba(255,184,77,0.18)', Icon: Gem },
  recommend: { label: 'Recommends', color: COLORS.coral, tint: 'rgba(255,107,154,0.12)', Icon: Star },
  'worth-visiting': { label: 'Worth Visiting', color: COLORS.lavender, tint: 'rgba(155,124,255,0.14)', Icon: Star },
};

/** A friend's public travel profile — a read-only mirror of the Passport tab,
 *  computed from the data their accepted connection lets us read (the Firestore
 *  rules keep this empty for anyone you're not connected to). Countries, stats,
 *  Explorer level, achievements and their latest recommendations. */
export default function FriendProfileScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ uid: string; name?: string }>();
  const uid = (Array.isArray(params.uid) ? params.uid[0] : params.uid) ?? '';
  const name = ((Array.isArray(params.name) ? params.name[0] : params.name) || 'Traveller').trim();
  const initial = name.charAt(0).toUpperCase();

  const data = useFriendsData(uid ? [uid] : []);
  const places = useMemo(() => data.places.filter((p) => p.userId === uid), [data.places, uid]);
  const discoveries = useMemo(() => data.discoveries.filter((d) => d.userId === uid), [data.discoveries, uid]);
  const expeditions = useMemo(() => data.expeditions.filter((e) => e.userId === uid), [data.expeditions, uid]);
  const captureCount = useMemo(() => data.captures.filter((c) => c.userId === uid).length, [data.captures, uid]);

  const aggregates = useMemo(() => aggregateByCountry(places), [places]);
  const stats = useMemo(() => computeStats(aggregates), [aggregates]);
  const discoveryStats = useMemo(() => computeDiscoveryStats(discoveries), [discoveries]);
  const journeyStats = useMemo(() => computeJourneyStats(expeditions), [expeditions]);
  const level = useMemo(() => computeExplorerLevel(stats, discoveryStats, journeyStats), [stats, discoveryStats, journeyStats]);
  const badges = useMemo(
    () => computeBadges({ stats, discovery: discoveryStats, journeys: journeyStats, captures: captureCount, trips: expeditions.map((e) => ({ startDate: e.startDate, countryCodes: e.countryCodes })) }),
    [stats, discoveryStats, journeyStats, captureCount, expeditions],
  );

  // Their visited countries, most recent first — the flag wall + hero backdrop.
  const visited = useMemo(() => aggregates.filter((a) => a.discovered).sort((a, b) => (b.firstYear ?? 0) - (a.firstYear ?? 0)), [aggregates]);
  const heroCodes = useMemo(() => {
    const withPhoto = visited.filter((a) => hasDestinationPhoto(a.code)).map((a) => a.code);
    return withPhoto.length ? withPhoto.slice(0, 6) : HERO_CODES.you;
  }, [visited]);

  const topRecs = useMemo(
    () => discoveries.filter((d) => d.verdict && REC_VERDICTS.has(d.verdict)).sort((a, b) => b.createdAt - a.createdAt).slice(0, 3),
    [discoveries],
  );
  const earned = badges.filter((b) => b.earned).length;
  const earnedFirst = useMemo(() => [...badges].sort((a, b) => Number(b.earned) - Number(a.earned) || b.progress - a.progress), [badges]);

  const isSelf = uid === user?.uid;
  const hasAnything = stats.countriesDiscovered > 0 || discoveries.length > 0 || expeditions.length > 0;

  const statItems: [string, number, string][] = [
    ['Countries', stats.countriesDiscovered, COLORS.coral],
    ['Cities', stats.citiesDiscovered, COLORS.aqua],
    ['Continents', stats.continentsDiscovered, COLORS.lavender],
    ['Trips', expeditions.length, COLORS.sunburst],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Identity hero — their recent destinations behind their name + level. */}
        <DestinationImage code={heroCodes[0]} codes={heroCodes} scrim motion style={{ position: 'relative', paddingTop: 64, paddingBottom: 40, minHeight: HERO_HEIGHT, alignItems: 'center' }}>
          <BackButton onPress={() => router.back()} style={{ position: 'absolute', top: 58, left: 18, zIndex: 20 }} />
          <View className="rounded-full items-center justify-center bg-white/20" style={{ height: 88, width: 88, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' }}>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 38 }}>{initial}</Text>
          </View>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 28, marginTop: 12 }} numberOfLines={1}>{name}</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.92, marginTop: 2 }}>
            {hasAnything ? `Level ${level.level} · ${level.title}` : 'In your Circle'}
          </Text>
        </DestinationImage>

        {!hasAnything ? (
          <View className="items-center" style={{ paddingHorizontal: 32, marginTop: 26 }}>
            <View className="rounded-full items-center justify-center" style={{ height: 64, width: 64, backgroundColor: 'rgba(155,124,255,0.14)' }}>
              <Users size={26} color={COLORS.lavender} />
            </View>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginTop: 14, textAlign: 'center' }}>Nothing shared yet</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              When {name} logs countries, trips and discoveries, they'll appear here.
            </Text>
          </View>
        ) : (
          <>
            {/* Explorer level */}
            <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
              <ExplorerLevelCard level={level} stats={stats} onPress={() => {}} />
            </View>

            {/* Stats */}
            <View className="flex-row" style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
              {statItems.map(([label, value, color]) => (
                <View key={label} className="rounded-2xl items-center" style={{ flex: 1, paddingVertical: 14, backgroundColor: `${color}16` }}>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 24, color }}>{value}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10.5, color: COLORS.ink2, marginTop: 2, fontWeight: '700', letterSpacing: 0.4 }}>{label.toUpperCase()}</Text>
                </View>
              ))}
            </View>

            {/* Countries visited — a flag wall, tap a flag to open the country. */}
            {visited.length > 0 ? (
              <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 21, color: COLORS.navy, marginBottom: 10 }}>
                  Countries visited <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink3, fontWeight: '700' }}>{visited.length}</Text>
                </Text>
                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                  {visited.map((a) => (
                    <Pressable key={a.code} onPress={() => router.push(`/country/${a.code}`)} className="flex-row items-center rounded-full" style={{ backgroundColor: '#fff', paddingLeft: 8, paddingRight: 12, paddingVertical: 6, gap: 6, borderWidth: 1, borderColor: 'rgba(20,33,61,0.06)' }}>
                      <Text style={{ fontSize: 17 }}>{flagEmoji(a.code)}</Text>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '600', color: COLORS.navy }}>{countryName(a.code) || a.code}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Achievements — earned first, read-only. */}
            <View style={{ marginTop: 24 }}>
              <View className="flex-row items-end justify-between" style={{ paddingHorizontal: 20 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 21, color: COLORS.navy }}>Achievements</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>{earned}/{badges.length} earned</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 14, gap: 6 }}>
                {earnedFirst.map((b) => (
                  <AchievementBadge key={b.id} badge={b} tile={62} />
                ))}
              </ScrollView>
            </View>

            {/* Their latest recommendations */}
            {topRecs.length > 0 ? (
              <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 21, color: COLORS.navy, marginBottom: 10 }}>
                  {name.split(' ')[0]}'s recommendations
                </Text>
                <View style={{ gap: 10 }}>
                  {topRecs.map((d) => {
                    const vs = (d.verdict && VERDICT_STYLE[d.verdict]) || VERDICT_STYLE.recommend!;
                    const where = [d.city, d.countryCode ? countryName(d.countryCode) : null].filter(Boolean).join(', ');
                    return (
                      <View key={d.id} className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14 }}>
                        <View className="flex-row items-center" style={{ gap: 8 }}>
                          <View className="rounded-full items-center justify-center" style={{ height: 26, width: 26, backgroundColor: vs.tint }}>
                            <vs.Icon size={14} color={vs.color} />
                          </View>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 0.4, color: vs.color }}>{vs.label.toUpperCase()}</Text>
                        </View>
                        <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 8 }} numberOfLines={1}>{d.name}</Text>
                        {where ? (
                          <View className="flex-row items-center" style={{ gap: 4, marginTop: 2 }}>
                            <MapPin size={12} color={COLORS.ink3} />
                            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3 }} numberOfLines={1}>{where}</Text>
                          </View>
                        ) : null}
                        {d.note ? (
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, marginTop: 6, lineHeight: 18 }} numberOfLines={2}>"{d.note}"</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

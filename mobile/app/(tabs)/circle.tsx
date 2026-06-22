import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ComponentType } from 'react';
import { UserPlus, ArrowRight, MapPin, Star, Plus, Sparkles, Settings2, Gem, BookmarkCheck, Check, HeartHandshake } from 'lucide-react-native';
import { PageHero } from '../../components/PageHero';
import { LandmarkDetailSheet } from '../../components/LandmarkDetailSheet';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
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
    <View style={{ marginTop: 26 }}>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, textAlign: 'center', marginBottom: 12 }}>PREVIEW · HOW YOUR CIRCLE WILL LOOK</Text>
      <View style={{ gap: 12, opacity: 0.92 }}>
        <View className="bg-white rounded-3xl" style={{ padding: 14 }}>
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
        <View className="bg-white rounded-3xl" style={{ padding: 14 }}>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <View className="rounded-full items-center justify-center" style={{ height: 28, width: 28, backgroundColor: 'rgba(255,184,77,0.18)' }}>
              <Gem size={15} color="#C2871A" />
            </View>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: '#B5731A' }}>Hidden Gem</Text>
          </View>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 8 }}>Sintra, Portugal</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 1 }}>4 people in your circle say it's worth the trip</Text>
        </View>
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

  const hasCircle = friends.length > 0;
  const hasContent = recs.length > 0 || !!mostVisited || recents.length > 0 || wishes.length > 0 || compat.length > 0;
  const savedMostVisited = mostVisited ? myPlaces.some((p) => p.kind === 'country' && p.countryCode === mostVisited.countryCode) : false;

  function addToWishlist(code: string, name: string) {
    addPlace({ kind: 'country', countryCode: code, relationships: ['aspiring'] });
    toast.success(`${name} added to your wishlist`);
  }

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
            <Pressable onPress={() => router.push('/friends')} accessibilityLabel="Add a friend to your circle">
              <GhostCircle />
            </Pressable>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 25, color: COLORS.navy, textAlign: 'center', lineHeight: 31 }}>See the world through people you trust</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14.5, color: COLORS.ink2, textAlign: 'center', marginTop: 10, lineHeight: 21, maxWidth: 330 }}>
              Your Circle turns your friends' real trips into your next discovery — the places they loved, their hidden gems, and where they're dreaming of going next.
            </Text>
            <Pressable onPress={() => router.push('/friends')} className="flex-row items-center justify-center rounded-full" style={{ marginTop: 22, paddingHorizontal: 22, paddingVertical: 13, gap: 8, backgroundColor: COLORS.coral }}>
              <UserPlus size={17} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14.5, fontWeight: '700', color: '#fff' }}>Invite someone</Text>
            </Pressable>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, textAlign: 'center', marginTop: 12 }}>Travel memories are better when they're shared.</Text>
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

          {!hasContent ? (
            <View className="bg-white rounded-3xl" style={{ padding: 18, marginTop: 18 }}>
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
                    <Pressable onPress={() => addToWishlist(mostVisited.countryCode, mostVisited.name)} className="flex-row items-center justify-center rounded-full bg-white" style={{ flex: 1, paddingVertical: 11, gap: 6 }}>
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
                  <Pressable key={r.key} onPress={() => setRec(r)} className="bg-white rounded-3xl" style={{ padding: 14 }}>
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
                  <View key={f.uid} className="bg-white rounded-3xl" style={{ padding: 14 }}>
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
                  <View key={f.uid} className="bg-white rounded-3xl" style={{ padding: 14 }}>
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
                    <View key={c.uid} className="bg-white rounded-3xl" style={{ padding: 14 }}>
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

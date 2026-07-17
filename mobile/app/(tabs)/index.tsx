import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Camera, ChevronRight, UserPlus, MapPin, CloudUpload } from 'lucide-react-native';
import { WorldlyLogo } from '../../components/WorldlyLogo';
import { HeroWave } from '../../components/HeroWave';
import { Squiggle } from '../../components/Squiggle';
import { DestinationImage } from '../../components/DestinationImage';
import { LandmarkDetailSheet } from '../../components/LandmarkDetailSheet';
import { AddPlaceSheet } from '../../components/AddPlaceSheet';
import { AddPhotoSheet } from '../../components/AddPhotoSheet';
import { ExplorerLevelCard } from '../../components/ExplorerLevelCard';
import { PassportStamp } from '../../components/PassportStamp';
import { useConfirm } from '../../src/store/confirm';
import { circleStoryItems, type CircleStoryItem } from '../../src/lib/circle';
import { COLORS, HERO_HEIGHT } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { hasDestinationPhoto } from '../../src/lib/destinationImage';
import { useWorldly } from '../../src/hooks/useWorldly';
import { HERO_CODES } from '../../src/lib/heroImages';
import { heroLogoIsWhite } from '../../src/lib/heroLuminance';
import { useData } from '../../src/store/data';
import { useAuth } from '../../src/store/auth';
import { useFriends } from '../../src/hooks/useFriends';

// License-free Pexels stock imagery (no attribution required) for the split CTA tiles.
const MEMORIES_IMG = 'https://images.pexels.com/photos/2874998/pexels-photo-2874998.jpeg?auto=compress&cs=tinysrgb&w=800';
const CIRCLE_IMG = 'https://images.pexels.com/photos/7625042/pexels-photo-7625042.jpeg?auto=compress&cs=tinysrgb&w=800';

// Shared tile height so every Story section card lines up to the same rhythm.
const TILE_H = 150;

export default function StoryScreen() {
  const { aggregates, stats, level } = useWorldly();
  const { captures, removeCapture, trips, places, discoveries } = useData();
  const confirm = useConfirm();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  // No placeholder identity: signed-out users get the question without a name.
  const firstName = user?.displayName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : '');
  const { friends, friendsData } = useFriends(user?.uid, firstName || 'Explorer');
  const discovered = aggregates.filter((a) => a.discovered);
  // Rotate through your own discovered countries first, padded with defaults to 4.
  const heroCodes = useMemo(() => {
    const out = [...new Set(discovered.filter((a) => hasDestinationPhoto(a.code)).map((a) => a.code))].slice(0, 4);
    for (const c of HERO_CODES.story) {
      if (out.length >= 4) break;
      if (!out.includes(c)) out.push(c);
    }
    return out;
  }, [discovered]);
  // The hero rotates through photos; track which is on screen so the wordmark
  // can flip white↔navy for contrast against that image's top strip.
  const [activeHero, setActiveHero] = useState(() => heroCodes[0]);
  const logoWhite = heroLogoIsWhite(activeHero);
  const [addOpen, setAddOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [circleItem, setCircleItem] = useState<CircleStoryItem | null>(null);

  // A few evocative "from your circle" items — recommendations, wishlists, visits.
  const storyItems = useMemo(
    () => circleStoryItems(friendsData.discoveries, friendsData.places, friends),
    [friendsData.discoveries, friendsData.places, friends],
  );

  function openCircleItem(item: CircleStoryItem) {
    if (item.people.length) setCircleItem(item);
    else if (item.countryCode) router.push(`/country/${item.countryCode}`);
  }

  async function confirmRemoveCapture(id: string) {
    if (await confirm({ title: 'Remove memory?', message: 'This photo will be deleted from your archive.', confirmLabel: 'Remove', destructive: true })) {
      removeCapture(id);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* Hero */}
      <DestinationImage code={heroCodes[0]} codes={heroCodes} scrim motion onActiveCode={setActiveHero} style={{ position: 'relative', paddingTop: 64, paddingBottom: 40, minHeight: HERO_HEIGHT }}>
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <WorldlyLogo white={logoWhite} height={50} />
            <View className="flex-row items-center" style={{ marginTop: 8 }}>
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta-Bold', fontSize: 13, letterSpacing: 0.2 }}>Life is better when you </Text>
              <Text style={{ fontFamily: 'PlusJakarta-Bold', fontSize: 13, letterSpacing: 0.2, color: COLORS.coral }}>explore.</Text>
            </View>
            <View style={{ marginTop: 4 }}>
              <Squiggle width={120} height={14} color={COLORS.coral} />
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 25, lineHeight: 30 }}>{firstName ? `${firstName} – where` : 'Where'} will your next story take you?</Text>
          </View>
        </View>

        <HeroWave />
      </DestinationImage>

      {/* Backup nudge — a guest with a real archive is one lost phone from
          losing it all; ask exactly once they have something worth keeping. */}
      {(() => {
        const kept = places.length + discoveries.length;
        if (user || kept < 10) return null;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back up your world — sign in to sync your places"
            onPress={() => router.push('/you')}
            className="flex-row items-center rounded-3xl"
            style={{ marginHorizontal: 20, marginTop: 16, padding: 16, gap: 13, backgroundColor: COLORS.navySolid }}
          >
            <View className="rounded-2xl items-center justify-center" style={{ height: 42, width: 42, backgroundColor: 'rgba(255,255,255,0.14)' }}>
              <CloudUpload size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Back up your world</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                {kept} places live only on this phone. Sign in to keep them safe.
              </Text>
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        );
      })()}

      {/* Counting Down */}
      {(() => {
        const today = new Date().toISOString().slice(0, 10);
        const upcoming = trips
          .filter((t) => (t.startDate || '') >= today)
          .sort((a, b) => a.startDate.localeCompare(b.startDate));
        if (upcoming.length === 0) return null;

        const seasonLabel = (iso?: string) => {
          if (!iso) return '';
          const m = Number(iso.slice(5, 7));
          const season = m <= 2 || m === 12 ? 'Winter' : m <= 5 ? 'Spring' : m <= 8 ? 'Summer' : 'Autumn';
          return `${season} ${iso.slice(0, 4)}`;
        };
        const TripCard = ({ t, cardW, height }: { t: (typeof upcoming)[number]; cardW: number; height: number }) => {
          const days = Math.max(0, Math.ceil((Date.parse(t.startDate) - Date.now()) / 86_400_000));
          const numSize = height > 160 ? 58 : 46; // big, readable countdown number
          const shadow = { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 };
          // Avoid "Iceland · Iceland": if the title is just the country, show the season instead.
          const country = countryName(t.countryCode);
          const secondary = t.title.trim().toLowerCase() === country.toLowerCase() ? seasonLabel(t.startDate) || country : country;
          return (
            <Pressable onPress={() => router.push(`/trip/${t.id}`)} style={{ width: cardW }}>
              <DestinationImage code={t.countryCode} scrim style={{ height, borderRadius: 24, padding: 18, justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 22, position: 'absolute', top: 14, right: 16 }}>{flagEmoji(t.countryCode)}</Text>
                {/* Top: days-to-go countdown (paddingRight clears the flag) */}
                <View className="flex-row items-end" style={{ gap: 8, paddingRight: 36 }}>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: numSize, lineHeight: numSize, ...shadow }}>{days === 0 ? '0' : days}</Text>
                  <View style={{ flex: 1, marginBottom: numSize * 0.16 }}>
                    <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'PlusJakarta-Bold', fontSize: 12, letterSpacing: 1.2, lineHeight: 14, opacity: 0.92, ...shadow }}>
                      {days === 0 ? 'TODAY' : days === 1 ? 'DAY' : 'DAYS'}
                    </Text>
                  </View>
                </View>
                {/* Bottom: destination, season/year, then plan-itinerary affordance */}
                <View>
                  <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 24, ...shadow }}>{t.title}</Text>
                  <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.9, marginTop: 1, ...shadow }}>{secondary}</Text>
                  <View className="flex-row items-center rounded-full" style={{ alignSelf: 'flex-start', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.22)', paddingLeft: 11, paddingRight: 8, paddingVertical: 5, gap: 3 }}>
                    <Text className="text-white" style={{ fontFamily: 'PlusJakarta-Bold', fontSize: 11, letterSpacing: 1 }}>PLAN ITINERARY</Text>
                    <ChevronRight size={13} color="#fff" />
                  </View>
                </View>
              </DestinationImage>
            </Pressable>
          );
        };

        return (
          <View style={{ paddingTop: 18 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, paddingHorizontal: 20 }}>Counting down</Text>
            {upcoming.length === 1 ? (
              // Single planned trip → full-width card.
              <View style={{ paddingHorizontal: 20, paddingVertical: 14 }}>
                <TripCard t={upcoming[0]} cardW={width - 40} height={TILE_H} />
              </View>
            ) : (
              // More than one → horizontal carousel (scrolls when they overflow).
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 12 }}>
                {upcoming.map((t) => (
                  <TripCard key={t.id} t={t} cardW={200} height={TILE_H} />
                ))}
              </ScrollView>
            )}
          </View>
        );
      })()}

      {/* Memories */}
      <View style={{ marginTop: 24 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Memories</Text>
        </View>
        {captures.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
            {captures.slice(0, 24).map((c) => (
              <Pressable key={c.id} onLongPress={() => confirmRemoveCapture(c.id)} style={{ width: 168 }}>
                <View style={{ borderRadius: 22, overflow: 'hidden' }}>
                  <Image source={{ uri: c.dataUrl }} style={{ width: 168, height: TILE_H }} contentFit="cover" transition={200} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, justifyContent: 'flex-end', padding: 12 }}>
                    {c.caption ? (
                      <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600' }}>{c.caption}</Text>
                    ) : null}
                    {c.countryCode ? (
                      <Text style={{ fontSize: 14, marginTop: 2 }}>{flagEmoji(c.countryCode)} <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, opacity: 0.9 }}>{c.city ?? countryName(c.countryCode)}</Text></Text>
                    ) : null}
                  </LinearGradient>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <Pressable onPress={() => setPhotoOpen(true)} className="bg-white dark:bg-card rounded-3xl flex-row" style={{ marginHorizontal: 20, marginTop: 12, overflow: 'hidden', minHeight: TILE_H }}>
            <Image source={{ uri: MEMORIES_IMG }} style={{ width: '42%', height: '100%' }} contentFit="cover" transition={300} cachePolicy="memory-disk" />
            <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 19, color: COLORS.navy }}>Keep your memories</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 3, lineHeight: 17 }}>Save the moments from your travels and relive them anytime.</Text>
              <View className="rounded-full flex-row items-center" style={{ alignSelf: 'flex-start', marginTop: 12, backgroundColor: COLORS.coral, paddingHorizontal: 14, paddingVertical: 8, gap: 5 }}>
                <Camera size={14} color="#fff" />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#fff' }}>Add photo</Text>
              </View>
            </View>
          </Pressable>
        )}
      </View>

      {/* From your circle */}
      {storyItems.length > 0 ? (
        <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
          <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>From your circle</Text>
            <Pressable onPress={() => router.push('/circle')} hitSlop={8}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>See all</Text>
            </Pressable>
          </View>
          <View style={{ gap: 10 }}>
            {storyItems.map((item) => {
              const place = [item.city, item.countryCode ? countryName(item.countryCode) : null].filter(Boolean).join(', ');
              return (
                <Pressable key={item.key} onPress={() => openCircleItem(item)} className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ padding: 12, gap: 12 }}>
                  <View style={{ height: 60, width: 60, borderRadius: 14, overflow: 'hidden' }}>
                    <DestinationImage code={item.countryCode ?? 'WW'} style={{ height: 60, width: 60 }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View className="flex-row items-center" style={{ gap: 4 }}>
                      <MapPin size={13} color={COLORS.coral} />
                      <Text numberOfLines={1} style={{ flex: 1, fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>{item.name}</Text>
                    </View>
                    <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{item.byline}{place ? ` · ${place}` : ''}</Text>
                    {item.note ? <Text numberOfLines={2} style={{ fontFamily: 'Fraunces', fontSize: 13, fontStyle: 'italic', color: COLORS.ink2, marginTop: 4, lineHeight: 18 }}>“{item.note}”</Text> : null}
                  </View>
                  <ChevronRight size={18} color={COLORS.ink3} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, marginBottom: 12 }}>Your circle</Text>
          <Pressable onPress={() => router.push('/circle')} className="bg-white dark:bg-card rounded-3xl flex-row" style={{ overflow: 'hidden', minHeight: TILE_H }}>
            <Image source={{ uri: CIRCLE_IMG }} style={{ width: '42%', height: '100%' }} contentFit="cover" transition={300} cachePolicy="memory-disk" />
            <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>Travel better together</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 3, lineHeight: 17 }}>Connect with friends to see where they've been and swap recommendations.</Text>
              <View className="rounded-full flex-row items-center" style={{ alignSelf: 'flex-start', marginTop: 12, backgroundColor: COLORS.coral, paddingHorizontal: 14, paddingVertical: 8, gap: 5 }}>
                <UserPlus size={14} color="#fff" />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#fff' }}>Connect</Text>
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {/* Milestone → achievements */}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <ExplorerLevelCard level={level} stats={stats} onPress={() => router.push('/achievements')} height={TILE_H} />
      </View>

      {/* Your world rail */}
      <View style={{ marginTop: 24 }}>
        <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Your world</Text>
          {discovered.length > 0 ? (
            <Pressable onPress={() => router.push('/atlas')} hitSlop={8} className="flex-row items-center" style={{ gap: 2 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>See all</Text>
              <ChevronRight size={15} color={COLORS.coral} />
            </Pressable>
          ) : null}
        </View>
        {discovered.length === 0 ? (
          <Pressable onPress={() => setAddOpen(true)} className="bg-white dark:bg-card rounded-3xl items-center" style={{ marginHorizontal: 20, marginTop: 12, paddingVertical: 28, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 40 }}>🌍</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 8 }}>Start your map</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
              Add the first country you've been to and watch your world fill in.
            </Text>
            <View className="rounded-full" style={{ marginTop: 14, backgroundColor: COLORS.coral, paddingHorizontal: 20, paddingVertical: 10 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Add a country</Text>
            </View>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
            {discovered.map((a) => (
              <Pressable key={a.code} onPress={() => router.push(`/country/${a.code}`)} style={{ width: 132 }}>
                <DestinationImage code={a.code} scrim style={{ height: TILE_H, borderRadius: 26, padding: 14, justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: 34, position: 'absolute', top: 12, left: 12 }}>{flagEmoji(a.code)}</Text>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 18 }}>{countryName(a.code)}</Text>
                  {a.cities.length > 0 ? (
                    <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, opacity: 0.9, marginTop: 2 }}>{a.cities.length} cities</Text>
                  ) : null}
                  <PassportStamp aggregate={a} size={76} corner="top-right" />
                </DestinationImage>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

    </ScrollView>

      <AddPlaceSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <AddPhotoSheet visible={photoOpen} onClose={() => setPhotoOpen(false)} />
      <LandmarkDetailSheet
        visible={!!circleItem}
        onClose={() => setCircleItem(null)}
        name={circleItem?.name}
        countryCode={circleItem?.countryCode}
        placeLabel={[circleItem?.city, circleItem?.countryCode ? countryName(circleItem.countryCode) : null].filter(Boolean).join(' · ')}
        hint={circleItem?.countryCode ? countryName(circleItem.countryCode) : undefined}
        friends={circleItem?.people ?? []}
      />
    </View>
  );
}

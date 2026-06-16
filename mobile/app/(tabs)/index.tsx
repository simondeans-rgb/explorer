import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { Search, Camera, ChevronRight } from 'lucide-react-native';
import { WorldlyLogo } from '../../components/WorldlyLogo';
import { Squiggle } from '../../components/Squiggle';
import { DestinationImage } from '../../components/DestinationImage';
import { AddPlaceSheet } from '../../components/AddPlaceSheet';
import { AddPhotoSheet } from '../../components/AddPhotoSheet';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { hasDestinationPhoto } from '../../src/lib/destinationImage';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useData } from '../../src/store/data';
import { useAuth } from '../../src/store/auth';
import { useFriends } from '../../src/hooks/useFriends';

export default function StoryScreen() {
  const { aggregates, stats, level } = useWorldly();
  const { captures, removeCapture, trips } = useData();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Alex');
  const { friends, friendsData } = useFriends(user?.uid, firstName);
  const discovered = aggregates.filter((a) => a.discovered);
  const heroCode = discovered.find((a) => hasDestinationPhoto(a.code))?.code ?? 'WW';
  const [addOpen, setAddOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  // "Fresh from your circle": each friend's discovered countries (deduped).
  const circle = (() => {
    const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
    const seen = new Set<string>();
    const items: { uid: string; name: string; code: string }[] = [];
    for (const p of friendsData.places) {
      if (!p.countryCode || !p.relationships.some((r) => r !== 'aspiring')) continue;
      const key = `${p.userId}:${p.countryCode}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ uid: p.userId, name: nameByUid.get(p.userId) ?? 'Friend', code: p.countryCode });
      if (items.length >= 12) break;
    }
    return items;
  })();

  function confirmRemoveCapture(id: string) {
    Alert.alert('Remove memory?', 'This photo will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeCapture(id) },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* Hero */}
      <DestinationImage code={heroCode} scrim motion style={{ position: 'relative', paddingTop: 64, paddingBottom: 64 }}>
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <WorldlyLogo white height={58} />
            <View className="flex-row items-center" style={{ marginTop: 10 }}>
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta-Bold', fontSize: 13.5, letterSpacing: 0.2 }}>Explore more. </Text>
              <Text style={{ fontFamily: 'PlusJakarta-Bold', fontSize: 13.5, letterSpacing: 0.2, color: COLORS.coral }}>Remember everything.</Text>
            </View>
            <View style={{ marginTop: 5 }}>
              <Squiggle width={130} height={16} color={COLORS.coral} />
            </View>
          </View>

          <View style={{ marginTop: 30 }}>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, opacity: 0.95 }}>Hi {firstName},</Text>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 38, lineHeight: 40, marginTop: 6 }}>Where will your next story take you?</Text>
            <Pressable onPress={() => router.push('/search')} className="flex-row items-center bg-white rounded-full" style={{ marginTop: 20, paddingHorizontal: 18, paddingVertical: 14, gap: 10 }}>
              <Search size={18} color={COLORS.coral} />
              <Text style={{ color: COLORS.ink2, fontFamily: 'PlusJakarta', fontSize: 15 }}>Search places, food & journeys…</Text>
            </Pressable>
            <View style={{ marginTop: 16, alignSelf: 'flex-start' }}>
              <Text className="text-white" style={{ fontFamily: 'Caveat', fontSize: 26, lineHeight: 28 }}>Life is better when you explore.</Text>
            </View>
          </View>
        </View>

        <Svg width="100%" height={48} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
          <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
        </Svg>
      </DestinationImage>

      {/* Counting Down */}
      {(() => {
        const today = new Date().toISOString().slice(0, 10);
        const upcoming = trips
          .filter((t) => (t.startDate || '') >= today)
          .sort((a, b) => a.startDate.localeCompare(b.startDate));
        if (upcoming.length === 0) return null;

        const TripCard = ({ t, cardW, height }: { t: (typeof upcoming)[number]; cardW: number; height: number }) => {
          const days = Math.max(0, Math.ceil((Date.parse(t.startDate) - Date.now()) / 86_400_000));
          const numSize = height > 160 ? 58 : 46; // big, readable countdown number
          const shadow = { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 };
          return (
            <Pressable onPress={() => router.push(`/trip/${t.id}`)} style={{ width: cardW }}>
              <DestinationImage code={t.countryCode} scrim style={{ height, borderRadius: 24, padding: 18, justifyContent: 'flex-end' }}>
                <Text style={{ fontSize: 22, position: 'absolute', top: 14, right: 16 }}>{flagEmoji(t.countryCode)}</Text>
                <View className="flex-row items-end" style={{ gap: 8 }}>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: numSize, lineHeight: numSize, ...shadow }}>{days === 0 ? '0' : days}</Text>
                  <View style={{ flex: 1, marginBottom: numSize * 0.16 }}>
                    <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'PlusJakarta-Bold', fontSize: 12, letterSpacing: 1.5, lineHeight: 14, opacity: 0.92, ...shadow }}>
                      {days === 0 ? 'TODAY' : days === 1 ? 'DAY TO GO' : 'DAYS TO GO'}
                    </Text>
                  </View>
                </View>
                <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 24, marginTop: 10, ...shadow }}>{t.title}</Text>
                <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.9, marginTop: 1, ...shadow }}>{countryName(t.countryCode)}</Text>
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
                <TripCard t={upcoming[0]} cardW={width - 40} height={168} />
              </View>
            ) : (
              // More than one → horizontal carousel (scrolls when they overflow).
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 12 }}>
                {upcoming.map((t) => (
                  <TripCard key={t.id} t={t} cardW={200} height={150} />
                ))}
              </ScrollView>
            )}
          </View>
        );
      })()}

      {/* Milestone → achievements */}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Pressable onPress={() => router.push('/achievements')}>
          <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 26, padding: 20 }}>
            <View className="flex-row items-start justify-between">
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.85 }}>EXPLORER LEVEL {level.level}</Text>
              <ChevronRight size={18} color="rgba(255,255,255,0.85)" />
            </View>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 40, marginTop: 2 }}>{level.title}</Text>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              {stats.countriesDiscovered} countries · {stats.continentsDiscovered} continents · {level.xp.toLocaleString()} XP
            </Text>
          </LinearGradient>
        </Pressable>
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
          <Pressable onPress={() => setAddOpen(true)} className="bg-white rounded-3xl items-center" style={{ marginHorizontal: 20, marginTop: 12, paddingVertical: 28, paddingHorizontal: 20 }}>
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
                <DestinationImage code={a.code} scrim style={{ height: 168, borderRadius: 26, padding: 14, justifyContent: 'flex-end' }}>
                  <Text style={{ fontSize: 34, position: 'absolute', top: 12, left: 12 }}>{flagEmoji(a.code)}</Text>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 18 }}>{countryName(a.code)}</Text>
                  {a.cities.length > 0 ? (
                    <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, opacity: 0.9, marginTop: 2 }}>{a.cities.length} cities</Text>
                  ) : null}
                </DestinationImage>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Memories */}
      <View style={{ marginTop: 24 }}>
        <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Memories</Text>
          <Pressable onPress={() => setPhotoOpen(true)} hitSlop={8} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 12, paddingVertical: 7, gap: 5 }}>
            <Camera size={14} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>Add</Text>
          </Pressable>
        </View>
        {captures.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
            {captures.map((c) => (
              <Pressable key={c.id} onLongPress={() => confirmRemoveCapture(c.id)} style={{ width: 168 }}>
                <View style={{ borderRadius: 22, overflow: 'hidden' }}>
                  <Image source={{ uri: c.dataUrl }} style={{ width: 168, height: 210 }} contentFit="cover" transition={200} />
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
          <Pressable onPress={() => setPhotoOpen(true)} className="items-center justify-center bg-white rounded-3xl" style={{ marginHorizontal: 20, marginTop: 12, paddingVertical: 30, gap: 8 }}>
            <Camera size={26} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3 }}>Add your first photo</Text>
          </Pressable>
        )}
      </View>

      {/* Fresh from your circle */}
      {circle.length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Fresh from your circle</Text>
            <Pressable onPress={() => router.push('/friends')} hitSlop={8}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>See all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 12 }}>
            {circle.map((item) => (
              <Pressable key={`${item.uid}:${item.code}`} onPress={() => router.push(`/country/${item.code}`)} style={{ width: 144 }}>
                <DestinationImage code={item.code} scrim style={{ height: 176, borderRadius: 24, padding: 12, justifyContent: 'flex-end' }}>
                  <View className="flex-row items-center" style={{ gap: 6, position: 'absolute', top: 10, left: 10 }}>
                    <View className="rounded-full items-center justify-center" style={{ height: 26, width: 26, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                      <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 13 }}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', maxWidth: 92 }}>{item.name}</Text>
                  </View>
                  <Text style={{ fontSize: 22 }}>{flagEmoji(item.code)}</Text>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 17, marginTop: 2 }}>{countryName(item.code)}</Text>
                </DestinationImage>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

    </ScrollView>

      <AddPlaceSheet visible={addOpen} onClose={() => setAddOpen(false)} />
      <AddPhotoSheet visible={photoOpen} onClose={() => setPhotoOpen(false)} />
    </View>
  );
}

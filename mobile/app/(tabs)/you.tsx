import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { CloudOff, Cloud, Sparkles, ChevronRight, Camera, ScrollText, Settings } from 'lucide-react-native';
import { COVER_SECTIONS } from '../../src/lib/covers';
import { DestinationImage } from '../../components/DestinationImage';
import { ExplorerLevelCard } from '../../components/ExplorerLevelCard';
import { AchievementBadge } from '../../components/AchievementBadge';
import { HERO_CODES } from '../../src/lib/heroImages';
import { hasDestinationPhoto } from '../../src/lib/destinationImage';
import { COLORS, HERO_HEIGHT } from '../../src/lib/theme';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useAuth } from '../../src/store/auth';
import { XpDetailSheet } from '../../components/XpDetailSheet';
import { HeroWave } from '../../components/HeroWave';
import { pickPhotoDataUrl } from '../../src/lib/photo';
import { ensureProfile, loadProfilePhoto, saveProfilePhoto } from '../../src/lib/profile';

// Badges driven by logging discoveries — the pool for the Discoveries nudge card.
const DISCOVERY_BADGES = new Set(['foodie', 'culture-vulture', 'naturalist', 'local-expert', 'gem-hunter', 'coffee-trail', 'festival-fan', 'night-owl', 'wildlife-watcher', 'attraction-seeker', 'ancient-explorer', 'skyline-chaser', 'beach-bum', 'pilgrim']);

/** The Passport tab is identity only: who you are, how far you've come, what
 *  you've earned. Everything operational lives behind the gear (/settings). */
export default function YouScreen() {
  const { stats, discoveryStats, journeyStats, level, badges, aggregates } = useWorldly();

  // The user's visited countries that have a photo, most recent first — the
  // source for the Wrapped + Almanac card backdrops. When they haven't visited
  // anywhere yet, each card falls back to its curated default rotation.
  const visitedPhotoCodes = useMemo(
    () =>
      [...new Set(
        aggregates
          .filter((a) => a.discovered && hasDestinationPhoto(a.code))
          .sort((a, b) => (b.firstYear ?? 0) - (a.firstYear ?? 0))
          .map((a) => a.code),
      )],
    [aggregates],
  );
  const wrappedCodes = useMemo(
    () => (visitedPhotoCodes.length ? visitedPhotoCodes.slice(0, 6) : ['BR', 'JP', 'IN', 'ZA']),
    [visitedPhotoCodes],
  );
  // Almanac rotates the same visited set in the opposite order so the two cards
  // don't show an identical sequence side by side.
  const almanacCodes = useMemo(
    () => (visitedPhotoCodes.length ? [...visitedPhotoCodes].reverse().slice(0, 6) : ['PE', 'EG', 'GR', 'IT']),
    [visitedPhotoCodes],
  );
  const { configured, user } = useAuth();
  const [xpOpen, setXpOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrimOpacity = scrollY.interpolate({ inputRange: [HERO_HEIGHT - 130, HERO_HEIGHT - 50], outputRange: [0, 1], extrapolate: 'clamp' });

  const earned = badges.filter((b) => b.earned).length;
  // The locked achievement closest to completion — shown as a "next up" hook.
  const nextDiscovery = [...badges].filter((b) => !b.earned && DISCOVERY_BADGES.has(b.id)).sort((a, b) => b.progress - a.progress)[0];
  const gemBadge = badges.find((b) => b.id === 'gem-hunter');
  const showGems = discoveryStats.total > 0 && !!gemBadge;
  // Closest unearned badge — excluding Gem Hunter when its own card is showing.
  const nextBadge = [...badges]
    .filter((b) => !b.earned && !(showGems && b.id === 'gem-hunter') && b.id !== nextDiscovery?.id)
    .sort((a, b) => b.progress - a.progress)[0];

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Explorer');
  const initial = displayName.charAt(0).toUpperCase();

  const LOCAL_AVATAR_KEY = 'worldly:avatar:local';

  // Load the photo: from the synced profile when signed in (ensuring the doc
  // exists first), or from local storage in demo mode.
  useEffect(() => {
    let active = true;
    if (user) {
      ensureProfile(user.uid, displayName)
        .then(() => loadProfilePhoto(user.uid))
        .then((p) => active && setAvatar(p))
        .catch(() => {});
    } else {
      AsyncStorage.getItem(LOCAL_AVATAR_KEY)
        .then((p) => active && setAvatar(p))
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [user, displayName]);

  async function changeAvatar() {
    const data = await pickPhotoDataUrl('library', 512, [1, 1]);
    if (!data) return;
    setAvatar(data);
    if (user) saveProfilePhoto(user.uid, data).catch(() => {});
    else AsyncStorage.setItem(LOCAL_AVATAR_KEY, data).catch(() => {});
  }
  const statItems: [string, number, string][] = [
    ['Countries', stats.countriesDiscovered, COLORS.coral],
    ['Cities', stats.citiesDiscovered, COLORS.aqua],
    ['Journeys', journeyStats.total, COLORS.lavender],
    ['Discoveries', discoveryStats.total, COLORS.sunburst],
  ];

  const syncLabel = !configured
    ? 'Offline demo — saved on this device'
    : user
      ? 'Synced to the cloud'
      : 'Not backed up yet — set up sync';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
    <Animated.ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 170 }}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      scrollEventThrottle={16}
    >
      {/* Identity hero */}
      <DestinationImage code={HERO_CODES.you[0]} codes={HERO_CODES.you} scrim motion style={{ position: 'relative', paddingTop: 64, paddingBottom: 56, minHeight: HERO_HEIGHT, alignItems: 'center' }}>
        {/* Gear, not hamburger: settings live behind the profile, iOS-style. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.push('/settings')}
          hitSlop={10}
          className="h-10 w-10 rounded-full items-center justify-center"
          style={{ position: 'absolute', top: 58, right: 18, zIndex: 20, backgroundColor: 'rgba(20,33,61,0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' }}
        >
          <Settings size={20} color="#fff" />
        </Pressable>
        <Pressable onPress={changeAvatar}>
          <View className="rounded-full items-center justify-center bg-white/20" style={{ height: 92, width: 92, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' }}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={{ height: 92, width: 92 }} contentFit="cover" />
            ) : (
              <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 40 }}>{initial}</Text>
            )}
          </View>
          <View className="absolute rounded-full items-center justify-center" style={{ bottom: 0, right: 0, height: 30, width: 30, backgroundColor: COLORS.coral, borderWidth: 2, borderColor: '#fff' }}>
            <Camera size={14} color="#fff" />
          </View>
        </Pressable>
        <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, marginTop: 12 }}>{displayName}</Text>
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.92, marginTop: 2 }}>
          {level.title}
        </Text>
        <HeroWave />
      </DestinationImage>

      {/* Explorer level — collectible medal card */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <ExplorerLevelCard level={level} stats={stats} onPress={() => setXpOpen(true)} />
      </View>

      {/* Stats strip — tinted per accent so it reads playful, not dashboard-like */}
      <View className="flex-row" style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
        {statItems.map(([label, value, color]) => (
          <View key={label} className="rounded-2xl items-center" style={{ flex: 1, paddingVertical: 14, backgroundColor: `${color}16` }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 24, color }}>{value}</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink2, marginTop: 2, fontWeight: '700', letterSpacing: 0.4 }}>{label.toUpperCase()}</Text>
          </View>
        ))}
      </View>
      {nextDiscovery ? (
        <Pressable onPress={() => router.push('/achievements')} className="bg-white dark:bg-card rounded-2xl flex-row items-center" style={{ marginHorizontal: 20, marginTop: 10, padding: 12, gap: 12 }}>
          <AchievementBadge badge={nextDiscovery} tile={44} labeled={false} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.coral }}>DISCOVERIES</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy, marginTop: 1 }}>
              {discoveryStats.total} discover{discoveryStats.total === 1 ? 'y' : 'ies'} logged
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>
              {nextDiscovery.description} · {Math.min(nextDiscovery.value, nextDiscovery.target)}/{nextDiscovery.target}
            </Text>
          </View>
          <ChevronRight size={16} color={COLORS.ink3} />
        </Pressable>
      ) : null}

      {/* Hidden Gems — the collection mechanic, in the same tile-card format
          as the NEXT UP achievement below so progress reads one way everywhere. */}
      {showGems && gemBadge ? (
        <Pressable onPress={() => router.push('/achievements')} className="bg-white dark:bg-card rounded-2xl flex-row items-center" style={{ marginHorizontal: 20, marginTop: 10, padding: 12, gap: 12 }}>
          <AchievementBadge badge={gemBadge} tile={44} labeled={false} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: '#F5A623' }}>HIDDEN GEMS</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy, marginTop: 1 }}>
              {discoveryStats.hiddenGems} hidden gem{discoveryStats.hiddenGems === 1 ? '' : 's'} found
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>
              {gemBadge.earned ? 'Gem Hunter unlocked ✦' : `${gemBadge.description} · ${Math.min(gemBadge.value, gemBadge.target)}/${gemBadge.target}`}
            </Text>
          </View>
          <ChevronRight size={16} color={COLORS.ink3} />
        </Pressable>
      ) : null}

      {/* Wrapped + Almanac */}
      <View className="flex-row" style={{ paddingHorizontal: 20, marginTop: 14, gap: 12 }}>
        <Pressable onPress={() => router.push('/wrapped')} style={{ flex: 1 }}>
          <View style={{ borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }}>
            <DestinationImage code={wrappedCodes[0]} codes={wrappedCodes} rotateMs={8000} scrim style={{ borderRadius: 24, minHeight: 150, padding: 16, justifyContent: 'space-between' }}>
              <View className="rounded-2xl items-center justify-center bg-white/25" style={{ height: 40, width: 40 }}>
                <Sparkles size={20} color="#fff" />
              </View>
              <View>
                <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 19 }}>Wrapped</Text>
                <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.95, marginTop: 1 }}>Your travels, told</Text>
              </View>
            </DestinationImage>
          </View>
        </Pressable>
        <Pressable onPress={() => router.push('/almanac')} style={{ flex: 1 }}>
          <View style={{ borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } }}>
            <DestinationImage code={almanacCodes[0]} codes={almanacCodes} rotateMs={9500} scrim style={{ borderRadius: 24, minHeight: 150, padding: 16, justifyContent: 'space-between' }}>
              <View className="rounded-2xl items-center justify-center bg-white/25" style={{ height: 40, width: 40 }}>
                <ScrollText size={20} color="#fff" />
              </View>
              <View>
                <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 19 }}>The Almanac</Text>
                <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.95, marginTop: 1 }}>Everywhere you've been</Text>
              </View>
            </DestinationImage>
          </View>
        </Pressable>
      </View>

      {/* Achievements */}
      <View style={{ marginTop: 22 }}>
        <Pressable onPress={() => router.push('/achievements')} className="flex-row items-end justify-between" style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Achievements</Text>
          <View className="flex-row items-center" style={{ gap: 2 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>{earned}/{badges.length} · See all</Text>
            <ChevronRight size={15} color={COLORS.coral} />
          </View>
        </Pressable>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 14, gap: 6 }}>
          {[...badges]
            .sort((a, b) => Number(b.earned) - Number(a.earned) || b.progress - a.progress)
            .map((b) => (
              <Pressable key={b.id} onPress={() => router.push('/achievements')}>
                <AchievementBadge badge={b} tile={62} />
              </Pressable>
            ))}
        </ScrollView>
        {nextBadge ? (
          <Pressable onPress={() => router.push('/achievements')} className="bg-white dark:bg-card rounded-2xl flex-row items-center" style={{ marginHorizontal: 20, marginTop: 2, padding: 12, gap: 12 }}>
            <AchievementBadge badge={nextBadge} tile={44} labeled={false} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3 }}>NEXT UP</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy, marginTop: 1 }}>{nextBadge.title}</Text>
              <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{nextBadge.description} · {Math.min(nextBadge.value, nextBadge.target)}/{nextBadge.target}</Text>
            </View>
            <ChevronRight size={16} color={COLORS.ink3} />
          </Pressable>
        ) : null}
      </View>

      {/* Passport Covers — the collectible storefront, front and centre. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Passport Covers"
        onPress={() => router.push('/covers')}
        className="bg-white dark:bg-card rounded-3xl flex-row items-center"
        style={{ marginHorizontal: 20, marginTop: 16, padding: 14, gap: 12 }}
      >
        <View className="flex-row">
          {[COVER_SECTIONS[0].covers[1], COVER_SECTIONS[2].covers[0], COVER_SECTIONS[1].covers[1]].map((c, i) => (
            <Image
              key={c.title}
              source={c.preview}
              style={{ height: 44, width: 44, borderRadius: 12, marginLeft: i === 0 ? 0 : -14, borderWidth: 2, borderColor: '#fff', transform: [{ rotate: `${(i - 1) * 7}deg` }] }}
              contentFit="cover"
            />
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>Passport Covers</Text>
          <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>
            Collect looks for your app icon — new packs in season.
          </Text>
        </View>
        <ChevronRight size={20} color={COLORS.ink3} />
      </Pressable>

      {/* Sync status — one slim row; everything else lives in Settings. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sync status — open settings"
        onPress={() => router.push('/settings')}
        className="bg-white dark:bg-card rounded-2xl flex-row items-center"
        style={{ marginHorizontal: 20, marginTop: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10 }}
      >
        {configured && user ? <Cloud size={16} color={COLORS.aqua} /> : <CloudOff size={16} color={COLORS.ink3} />}
        <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.ink2 }}>{syncLabel}</Text>
        <ChevronRight size={16} color={COLORS.ink3} />
      </Pressable>

      <XpDetailSheet visible={xpOpen} onClose={() => setXpOpen(false)} level={level} stats={stats} discovery={discoveryStats} journeys={journeyStats} />
    </Animated.ScrollView>

    {/* Status-bar scrim: fades in once the hero scrolls away so card content
        never collides with the clock. pointerEvents none — purely visual. */}
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 6, backgroundColor: COLORS.warmwhite, opacity: scrimOpacity }}
    />
    </View>
  );
}

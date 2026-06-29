import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { CloudOff, Cloud, LogOut, Sparkles, ChevronRight, Camera, Download, ScrollText, RotateCcw, ShieldCheck, FileText, Mail, FileDown, BellRing, Users, MapPinned, Plane, CircleCheck } from 'lucide-react-native';
import { DestinationImage } from '../../components/DestinationImage';
import { ExplorerLevelCard } from '../../components/ExplorerLevelCard';
import { AchievementBadge } from '../../components/AchievementBadge';
import { HERO_CODES } from '../../src/lib/heroImages';
import { hasDestinationPhoto } from '../../src/lib/destinationImage';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useConfirm } from '../../src/store/confirm';
import { useAuth } from '../../src/store/auth';
import { useData } from '../../src/store/data';
import { useToast } from '../../src/store/toast';
import { useOnboarding } from '../../src/store/onboarding';
import { exportMyData } from '../../src/lib/exportData';
import { anniversariesEnabled, setAnniversariesEnabled, requestNotificationPermission, rescheduleAnniversaries, cancelAnniversaries } from '../../src/lib/notifications';
import { friendActivityEnabled, enableFriendActivity, disableFriendActivity, tripActivityEnabled, enableTripActivity, disableTripActivity, refreshPushToken } from '../../src/lib/push';
import { AuthSheet } from '../../components/AuthSheet';
import { DeleteAccountSheet } from '../../components/DeleteAccountSheet';
import { XpDetailSheet } from '../../components/XpDetailSheet';
import { ResolveAirportsSheet } from '../../components/ResolveAirportsSheet';
import { isEndpointResolved } from '../../src/lib/airportSearch';
import { pickPhotoDataUrl } from '../../src/lib/photo';
import { ensureProfile, loadProfilePhoto, saveProfilePhoto } from '../../src/lib/profile';

const PRIVACY_URL = 'https://stickynotes-sand.vercel.app/privacy';
const TERMS_URL = 'https://stickynotes-sand.vercel.app/terms';
const SUPPORT_EMAIL = 'worldly@simondeans.com';

export default function YouScreen() {
  const { stats, discoveryStats, journeyStats, level, badges, aggregates } = useWorldly();

  // Wrapped rotates through your own countries (recent first), padded to 4.
  const wrappedCodes = useMemo(() => {
    const mine = aggregates
      .filter((a) => a.discovered && hasDestinationPhoto(a.code))
      .sort((a, b) => (b.firstYear ?? 0) - (a.firstYear ?? 0))
      .map((a) => a.code);
    const out = [...new Set(mine)].slice(0, 4);
    for (const c of ['BR', 'JP', 'IN', 'ZA']) {
      if (out.length >= 4) break;
      if (!out.includes(c)) out.push(c);
    }
    return out;
  }, [aggregates]);
  const almanacCodes = ['PE', 'EG', 'GR', 'IT'];
  const { configured, user, signOutUser } = useAuth();
  const confirm = useConfirm();
  const { places, discoveries, expeditions, captures, trips, recalculateJourneys, updateExpedition } = useData();
  const { toast } = useToast();
  const [recalcing, setRecalcing] = useState(false);
  async function onRecalcJourneys() {
    if (recalcing) return;
    setRecalcing(true);
    try {
      const homeCodes = aggregates
        .filter((a) => a.relationships.includes('lived') || a.relationships.includes('based'))
        .map((a) => a.code);
      const n = await recalculateJourneys(expeditions, homeCodes);
      toast.success(n > 0 ? `Updated ${n} ${n === 1 ? 'journey' : 'journeys'}` : 'Your journeys are already up to date');
    } catch {
      toast.error("Couldn't recalculate — try again.");
    } finally {
      setRecalcing(false);
    }
  }
  const { replay } = useOnboarding();
  const [authOpen, setAuthOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [xpOpen, setXpOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  // Flight stops across all journeys that don't resolve to a known airport, so
  // the Passport can offer to match them (they don't count in stats until then).
  const unresolvedAirports = useMemo(() => {
    let n = 0;
    for (const e of expeditions) {
      for (const j of e.journeys ?? []) {
        if (j.mode !== 'flight') continue;
        if (j.from?.trim() && !isEndpointResolved(j.from)) n++;
        if (j.to?.trim() && !isEndpointResolved(j.to)) n++;
      }
    }
    return n;
  }, [expeditions]);
  const [exporting, setExporting] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const [circleNotifOn, setCircleNotifOn] = useState(false);
  const [crewNotifOn, setCrewNotifOn] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    anniversariesEnabled().then(setNotifOn);
    friendActivityEnabled().then(setCircleNotifOn);
    tripActivityEnabled().then(setCrewNotifOn);
    refreshPushToken();
  }, []);

  async function onToggleCrewNotif(v: boolean) {
    if (v) {
      if (!user) {
        toast.error('Sign in to get trip crew updates.');
        return;
      }
      if (!(await enableTripActivity())) {
        toast.error('Allow notifications to get trip crew updates.');
        return;
      }
      setCrewNotifOn(true);
      toast.success('Trip crew updates on 🗺️');
    } else {
      await disableTripActivity();
      setCrewNotifOn(false);
    }
  }

  async function onToggleCircleNotif(v: boolean) {
    if (v) {
      if (!user) {
        toast.error('Sign in to hear when your circle travels.');
        return;
      }
      if (!(await enableFriendActivity())) {
        toast.error('Allow notifications to hear from your circle.');
        return;
      }
      setCircleNotifOn(true);
      toast.success('Circle updates on 👋');
    } else {
      await disableFriendActivity();
      setCircleNotifOn(false);
    }
  }

  async function onToggleNotif(v: boolean) {
    if (v) {
      if (!(await requestNotificationPermission())) {
        toast.error('Allow notifications in Settings to get anniversary reminders.');
        return;
      }
      await setAnniversariesEnabled(true);
      setNotifOn(true);
      await rescheduleAnniversaries(expeditions, places);
      toast.success('Anniversary reminders on ✈️');
    } else {
      await setAnniversariesEnabled(false);
      setNotifOn(false);
      await cancelAnniversaries();
    }
  }

  async function onExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const ok = await exportMyData({
        account: { email: user?.email, name: user?.displayName },
        places,
        discoveries,
        expeditions,
        captures,
        trips,
      });
      if (!ok) toast.error('Sharing is unavailable on this device.');
    } catch {
      toast.error("Couldn't export your data — please try again.");
    } finally {
      setExporting(false);
    }
  }
  const earned = badges.filter((b) => b.earned).length;
  // The locked achievement closest to completion — shown as a "next up" hook.
  const nextBadge = [...badges].filter((b) => !b.earned).sort((a, b) => b.progress - a.progress)[0];
  // The closest discovery-driven achievement, for a nudge by the Discoveries stat.
  const DISCOVERY_BADGES = new Set(['foodie', 'culture-vulture', 'naturalist', 'local-expert', 'gem-hunter', 'coffee-trail', 'festival-fan', 'night-owl', 'wildlife-watcher', 'attraction-seeker', 'ancient-explorer', 'skyline-chaser', 'beach-bum', 'pilgrim']);
  const nextDiscovery = [...badges].filter((b) => !b.earned && DISCOVERY_BADGES.has(b.id)).sort((a, b) => b.progress - a.progress)[0];

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Alex');
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 110 }}>
      {/* Identity hero */}
      <DestinationImage code={HERO_CODES.you[0]} codes={HERO_CODES.you} scrim motion style={{ position: 'relative', paddingTop: 64, paddingBottom: 56, alignItems: 'center' }}>
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
        <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
          <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
        </Svg>
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
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, color: COLORS.ink2, marginTop: 2, fontWeight: '700', letterSpacing: 0.4 }}>{label.toUpperCase()}</Text>
          </View>
        ))}
      </View>
      {nextDiscovery ? (
        <Pressable onPress={() => router.push('/achievements')} style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>
            {discoveryStats.total} discoveries · {Math.max(0, nextDiscovery.target - Math.min(nextDiscovery.value, nextDiscovery.target))} more to unlock <Text style={{ fontWeight: '700', color: COLORS.coral }}>{nextDiscovery.title}</Text>
          </Text>
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

      {/* Import */}
      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
        <Pressable onPress={() => router.push('/import')} className="bg-white rounded-3xl flex-row items-center" style={{ padding: 16, gap: 12 }}>
          <View className="rounded-2xl items-center justify-center" style={{ height: 42, width: 42, backgroundColor: 'rgba(36,209,195,0.14)' }}>
            <Download size={20} color={COLORS.aqua} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>Import travels</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Flighty CSV, a country list, or your photos.</Text>
          </View>
          <ChevronRight size={20} color={COLORS.ink3} />
        </Pressable>
      </View>

      {/* Cloud sync */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        {!configured ? (
          <View className="bg-white rounded-3xl flex-row items-center" style={{ padding: 16, gap: 12 }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 42, width: 42, backgroundColor: COLORS.warmwhite }}>
              <CloudOff size={20} color={COLORS.ink3} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>Offline demo</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Your world is saved on this device.</Text>
            </View>
          </View>
        ) : user ? (
          <View className="bg-white rounded-3xl flex-row items-center" style={{ padding: 16, gap: 12 }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 42, width: 42, backgroundColor: 'rgba(36,209,195,0.14)' }}>
              <Cloud size={20} color={COLORS.aqua} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>Synced to the cloud</Text>
              <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{user.email}</Text>
            </View>
            <Pressable
              onPress={async () => {
                if (await confirm({ title: 'Sign out?', message: 'Your world stays safely synced — sign back in anytime to pick up where you left off.', confirmLabel: 'Sign out', destructive: true })) signOutUser();
              }}
              hitSlop={8}
              className="rounded-full flex-row items-center"
              style={{ paddingHorizontal: 14, paddingVertical: 9, gap: 6, backgroundColor: COLORS.warmwhite }}
            >
              <LogOut size={15} color={COLORS.ink2} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.ink2 }}>Sign out</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setAuthOpen(true)}>
            <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="rounded-3xl flex-row items-center" style={{ padding: 16, gap: 12 }}>
              <View className="rounded-2xl items-center justify-center bg-white/20" style={{ height: 42, width: 42 }}>
                <Cloud size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 16 }}>Sync your world</Text>
                <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.9, marginTop: 1 }}>Sign in to keep it on every device.</Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}
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
          <Pressable onPress={() => router.push('/achievements')} className="bg-white rounded-2xl flex-row items-center" style={{ marginHorizontal: 20, marginTop: 2, padding: 12, gap: 12 }}>
            <AchievementBadge badge={nextBadge} tile={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3 }}>NEXT UP</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy, marginTop: 1 }}>{nextBadge.title}</Text>
              <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{nextBadge.description} · {Math.min(nextBadge.value, nextBadge.target)}/{nextBadge.target}</Text>
            </View>
            <ChevronRight size={16} color={COLORS.ink3} />
          </Pressable>
        ) : null}
      </View>

      {/* Notifications */}
      <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, marginBottom: 10 }}>NOTIFICATIONS</Text>
        <View className="bg-white rounded-3xl" style={{ paddingHorizontal: 16 }}>
          <View className="flex-row items-center" style={{ gap: 12, paddingVertical: 14 }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(255,107,154,0.12)' }}>
              <BellRing size={19} color={COLORS.coral} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>Travel anniversaries</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>“On this day” memories of where you've been</Text>
            </View>
            <Switch value={notifOn} onValueChange={onToggleNotif} trackColor={{ false: 'rgba(20,33,61,0.12)', true: COLORS.coral }} thumbColor="#fff" />
          </View>
          <View className="flex-row items-center" style={{ gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(20,33,61,0.06)' }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(155,124,255,0.14)' }}>
              <Users size={19} color={COLORS.lavender} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>From your circle</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>When friends log trips & recommendations</Text>
            </View>
            <Switch value={circleNotifOn} onValueChange={onToggleCircleNotif} trackColor={{ false: 'rgba(20,33,61,0.12)', true: COLORS.lavender }} thumbColor="#fff" />
          </View>
          <View className="flex-row items-center" style={{ gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(20,33,61,0.06)' }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(36,209,195,0.14)' }}>
              <MapPinned size={19} color={COLORS.aqua} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>Trip crew updates</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>When crew edit a shared itinerary</Text>
            </View>
            <Switch value={crewNotifOn} onValueChange={onToggleCrewNotif} trackColor={{ false: 'rgba(20,33,61,0.12)', true: COLORS.aqua }} thumbColor="#fff" />
          </View>
        </View>
      </View>

      {/* Flights — resolve any unrecognised airports so they count in the stats */}
      {expeditions.length > 0 ? (
        <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, marginBottom: 10 }}>FLIGHTS</Text>
          <View className="bg-white rounded-3xl" style={{ overflow: 'hidden' }}>
            <Pressable onPress={() => setResolveOpen(true)} className="flex-row items-center" style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 38, width: 38, backgroundColor: COLORS.warmwhite }}>
                <Plane size={18} color={COLORS.ink2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>Resolve airports</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>
                  {unresolvedAirports > 0 ? `${unresolvedAirports} flight stop${unresolvedAirports === 1 ? '' : 's'} to match for accurate stats` : 'All flight stops are matched'}
                </Text>
              </View>
              {unresolvedAirports > 0 ? (
                <View className="rounded-full items-center justify-center" style={{ minWidth: 22, height: 22, paddingHorizontal: 7, backgroundColor: '#F4B740' }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', color: '#fff' }}>{unresolvedAirports}</Text>
                </View>
              ) : (
                <CircleCheck size={18} color="#12A594" />
              )}
              <ChevronRight size={18} color={COLORS.ink3} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Legal & support */}
      <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, marginBottom: 10 }}>LEGAL & SUPPORT</Text>
        <View className="bg-white rounded-3xl" style={{ overflow: 'hidden' }}>
          {[
            { icon: ShieldCheck, label: 'Privacy Policy', onPress: () => Linking.openURL(PRIVACY_URL) },
            { icon: FileText, label: 'Terms of Service', onPress: () => Linking.openURL(TERMS_URL) },
            { icon: Mail, label: 'Contact support', sub: SUPPORT_EMAIL, onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Worldly%20support`) },
            { icon: RotateCcw, label: recalcing ? 'Recalculating…' : 'Recalculate journeys', sub: 'Rebuild your trips if you’ve updated your home history.', onPress: onRecalcJourneys },
            { icon: FileDown, label: exporting ? 'Preparing your data…' : 'Export my data', onPress: onExport },
          ].map((row, i) => (
            <Pressable key={row.label} onPress={row.onPress} className="flex-row items-center" style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: 'rgba(20,33,61,0.06)' }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 38, width: 38, backgroundColor: COLORS.warmwhite }}>
                <row.icon size={18} color={COLORS.ink2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{row.label}</Text>
                {row.sub ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{row.sub}</Text> : null}
              </View>
              <ChevronRight size={18} color={COLORS.ink3} />
            </Pressable>
          ))}
        </View>
        {user ? (
          <Pressable onPress={() => setDeleteOpen(true)} hitSlop={8} style={{ alignItems: 'center', marginTop: 18, paddingVertical: 4 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: '#E0245E' }}>Delete account</Text>
          </Pressable>
        ) : null}

        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, textAlign: 'center', marginTop: 14 }}>
          Worldly v{Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </View>

      {/* Replay intro */}
      <Pressable onPress={replay} hitSlop={8} style={{ alignItems: 'center', marginTop: 28, paddingVertical: 8 }}>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <RotateCcw size={14} color={COLORS.ink3} />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.ink3 }}>Replay the welcome tour</Text>
        </View>
      </Pressable>

      <AuthSheet visible={authOpen} onClose={() => setAuthOpen(false)} />
      <DeleteAccountSheet visible={deleteOpen} onClose={() => setDeleteOpen(false)} />
      <XpDetailSheet visible={xpOpen} onClose={() => setXpOpen(false)} level={level} stats={stats} discovery={discoveryStats} journeys={journeyStats} />
      <ResolveAirportsSheet visible={resolveOpen} onClose={() => setResolveOpen(false)} expeditions={expeditions} updateExpedition={updateExpedition} />
    </ScrollView>
  );
}

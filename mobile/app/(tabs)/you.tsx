import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { CloudOff, Cloud, LogOut, Sparkles, ChevronRight, Camera, Users, Download, ScrollText, RotateCcw, ShieldCheck, FileText, Mail, FileDown } from 'lucide-react-native';
import { DestinationImage } from '../../components/DestinationImage';
import { AchievementBadge } from '../../components/AchievementBadge';
import { HERO_CODES } from '../../src/lib/heroImages';
import { hasDestinationPhoto } from '../../src/lib/destinationImage';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useAuth } from '../../src/store/auth';
import { useData } from '../../src/store/data';
import { useToast } from '../../src/store/toast';
import { useOnboarding } from '../../src/store/onboarding';
import { exportMyData } from '../../src/lib/exportData';
import { AuthSheet } from '../../components/AuthSheet';
import { DeleteAccountSheet } from '../../components/DeleteAccountSheet';
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
  const { places, discoveries, expeditions, captures, trips } = useData();
  const { toast } = useToast();
  const { replay } = useOnboarding();
  const [authOpen, setAuthOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

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
  const statItems: [string, number][] = [
    ['Countries', stats.countriesDiscovered],
    ['Cities', stats.citiesDiscovered],
    ['Journeys', journeyStats.total],
    ['Discoveries', discoveryStats.total],
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
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.9, marginTop: 2 }}>
          {user ? 'Synced member' : 'Worldly member'}
        </Text>
        <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
          <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
        </Svg>
      </DestinationImage>

      {/* Explorer level */}
      <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 18 }}>
          <View className="flex-row items-center" style={{ gap: 14 }}>
            <View className="rounded-2xl items-center justify-center bg-white/20" style={{ height: 60, width: 60 }}>
              <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 26 }}>{level.level}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.8 }}>Explorer level</Text>
              <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 22 }}>{level.title}</Text>
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                {level.xp.toLocaleString()} XP{!level.maxed ? ` · ${Math.max(0, level.nextLevelXp - level.xp).toLocaleString()} to next` : ''}
              </Text>
            </View>
          </View>
          <View style={{ height: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 14, overflow: 'hidden' }}>
            <View style={{ height: 8, borderRadius: 8, backgroundColor: '#fff', width: `${Math.round((level.maxed ? 1 : level.progress) * 100)}%` }} />
          </View>
        </LinearGradient>
      </View>

      {/* Stats strip */}
      <View className="flex-row" style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
        {statItems.map(([label, value]) => (
          <View key={label} className="bg-white rounded-2xl items-center" style={{ flex: 1, paddingVertical: 14 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 24, color: COLORS.navy }}>{value}</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, color: COLORS.ink3, marginTop: 2 }}>{label.toUpperCase()}</Text>
          </View>
        ))}
      </View>

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
                <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.95, marginTop: 1 }}>Your travels, played</Text>
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

      {/* Friends + Import */}
      <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 10 }}>
        <Pressable onPress={() => router.push('/friends')} className="bg-white rounded-3xl flex-row items-center" style={{ padding: 16, gap: 12 }}>
          <View className="rounded-2xl items-center justify-center" style={{ height: 42, width: 42, backgroundColor: 'rgba(155,124,255,0.14)' }}>
            <Users size={20} color={COLORS.lavender} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>Friends</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Your share code, requests and circle.</Text>
          </View>
          <ChevronRight size={20} color={COLORS.ink3} />
        </Pressable>
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
            <Pressable onPress={() => signOutUser()} hitSlop={8} className="rounded-full items-center justify-center" style={{ height: 38, width: 38, backgroundColor: COLORS.warmwhite }}>
              <LogOut size={18} color={COLORS.ink2} />
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
      </View>

      {/* Legal & support */}
      <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, marginBottom: 10 }}>LEGAL & SUPPORT</Text>
        <View className="bg-white rounded-3xl" style={{ overflow: 'hidden' }}>
          {[
            { icon: ShieldCheck, label: 'Privacy Policy', onPress: () => Linking.openURL(PRIVACY_URL) },
            { icon: FileText, label: 'Terms of Service', onPress: () => Linking.openURL(TERMS_URL) },
            { icon: Mail, label: 'Contact support', sub: SUPPORT_EMAIL, onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Worldly%20support`) },
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
    </ScrollView>
  );
}

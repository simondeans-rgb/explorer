import { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { CloudOff, Cloud, LogOut } from 'lucide-react-native';
import { DestinationImage } from '../../components/DestinationImage';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useAuth } from '../../src/store/auth';
import { AuthSheet } from '../../components/AuthSheet';

export default function YouScreen() {
  const { stats, discoveryStats, journeyStats, level, badges } = useWorldly();
  const { configured, user, signOutUser } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const earned = badges.filter((b) => b.earned).length;

  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Alex');
  const initial = displayName.charAt(0).toUpperCase();
  const statItems: [string, number][] = [
    ['Countries', stats.countriesDiscovered],
    ['Cities', stats.citiesDiscovered],
    ['Journeys', journeyStats.total],
    ['Discoveries', discoveryStats.total],
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Identity hero */}
      <DestinationImage code="WW" scrim style={{ position: 'relative', paddingTop: 64, paddingBottom: 56, alignItems: 'center' }}>
        <View className="rounded-full items-center justify-center bg-white/20" style={{ height: 92, width: 92, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' }}>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 40 }}>{initial}</Text>
        </View>
        <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, marginTop: 12 }}>{displayName}</Text>
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.9, marginTop: 2 }}>
          {user ? 'Synced member' : 'Worldly member'}
        </Text>
        <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
          <Path d="M0,64 C220,118 460,16 720,44 C980,72 1220,120 1440,70 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
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
      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <View className="flex-row items-end justify-between">
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Achievements</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{earned}/{badges.length} earned</Text>
        </View>
        <View className="flex-row flex-wrap" style={{ marginTop: 12, gap: 10 }}>
          {badges.map((b) => (
            <View key={b.id} className="bg-white rounded-2xl items-center" style={{ width: '31%', paddingVertical: 14, opacity: b.earned ? 1 : 0.45 }}>
              <Text style={{ fontSize: 26 }}>{b.emoji}</Text>
              <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.navy, marginTop: 4 }}>{b.title}</Text>
            </View>
          ))}
        </View>
      </View>

      <AuthSheet visible={authOpen} onClose={() => setAuthOpen(false)} />
    </ScrollView>
  );
}

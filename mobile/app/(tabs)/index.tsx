import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Bell, Search } from 'lucide-react-native';
import { WorldlyMark } from '../../components/Brand';
import { COLORS, GRADIENTS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { useWorldly } from '../../src/hooks/useWorldly';

export default function StoryScreen() {
  const { aggregates, stats, level } = useWorldly();
  const discovered = aggregates.filter((a) => a.discovered);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.warmwhite }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero */}
      <LinearGradient colors={GRADIENTS.sunrise} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'relative', paddingTop: 64, paddingBottom: 64, paddingHorizontal: 20 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <WorldlyMark size={28} />
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 22 }}>worldly</Text>
          </View>
          <View className="h-10 w-10 rounded-full items-center justify-center bg-white/20">
            <Bell size={18} color="#fff" />
          </View>
        </View>

        <View style={{ marginTop: 56 }}>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, opacity: 0.9 }}>Hi Alex,</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 38, lineHeight: 40, marginTop: 6 }}>Where will your next story take you?</Text>
          <View className="flex-row items-center bg-white rounded-full" style={{ marginTop: 20, paddingHorizontal: 18, paddingVertical: 14, gap: 10 }}>
            <Search size={18} color={COLORS.coral} />
            <Text style={{ color: COLORS.ink2, fontFamily: 'PlusJakarta', fontSize: 15 }}>Search places, food & journeys…</Text>
          </View>
        </View>

        <Svg width="100%" height={48} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
          <Path d="M0,64 C220,118 460,16 720,44 C980,72 1220,120 1440,70 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
        </Svg>
      </LinearGradient>

      {/* Milestone */}
      <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 26, padding: 20 }}>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.85 }}>EXPLORER LEVEL {level.level}</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 40, marginTop: 2 }}>{level.title}</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.9, marginTop: 4 }}>
            {stats.countriesDiscovered} countries · {stats.continentsDiscovered} continents · {level.xp.toLocaleString()} XP
          </Text>
        </LinearGradient>
      </View>

      {/* Your world rail */}
      <View style={{ paddingTop: 18 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, paddingHorizontal: 20 }}>Your world</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 14 }}>
          {discovered.map((a) => (
            <Pressable key={a.code} style={{ width: 132 }}>
              <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 168, borderRadius: 26, padding: 14, justifyContent: 'flex-end' }}>
                <Text style={{ fontSize: 34, position: 'absolute', top: 12, left: 12 }}>{flagEmoji(a.code)}</Text>
                <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 18 }}>{countryName(a.code)}</Text>
                {a.cities.length > 0 ? (
                  <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 11, opacity: 0.85, marginTop: 2 }}>{a.cities.length} cities</Text>
                ) : null}
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

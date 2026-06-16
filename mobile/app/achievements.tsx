import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { AchievementBadge } from '../components/AchievementBadge';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { goBack } from '../src/lib/nav';
import { useWorldly } from '../src/hooks/useWorldly';
import { ACHIEVEMENT_SECTIONS } from '../src/lib/explorer';

export default function AchievementsScreen() {
  const { badges, level } = useWorldly();
  const earned = badges.filter((b) => b.earned).length;
  const pct = badges.length ? earned / badges.length : 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 60, paddingBottom: 26, paddingHorizontal: 22 }}>
          <Pressable onPress={goBack} hitSlop={12} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 58, left: 18 }}>
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.9, textAlign: 'center' }}>EXPLORER · LEVEL {level.level}</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, textAlign: 'center', marginTop: 2 }}>Achievements</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.95, textAlign: 'center', marginTop: 4 }}>{earned} of {badges.length} earned</Text>
          <View style={{ height: 8, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.28)', marginTop: 12, overflow: 'hidden' }}>
            <View style={{ width: `${Math.max(pct * 100, 3)}%`, height: 8, borderRadius: 5, backgroundColor: '#fff' }} />
          </View>
        </LinearGradient>

        {ACHIEVEMENT_SECTIONS.map((section) => {
          const items = badges.filter((b) => b.category === section.id);
          if (items.length === 0) return null;
          const got = items.filter((b) => b.earned).length;
          return (
            <View key={section.id} style={{ marginTop: 22 }}>
              <View className="flex-row items-end justify-between" style={{ paddingHorizontal: 22 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 21, color: COLORS.navy }}>{section.title}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{got}/{items.length}</Text>
              </View>
              <View className="flex-row flex-wrap" style={{ paddingHorizontal: 16, marginTop: 14, rowGap: 18 }}>
                {items.map((b) => (
                  <Pressable
                    key={b.id}
                    onPress={() => Alert.alert(b.title, `${b.description}\n\n${b.earned ? 'Earned 🎉' : `Progress: ${Math.min(b.value, b.target)} / ${b.target}`}`)}
                    style={{ width: '25%', alignItems: 'center' }}
                  >
                    <AchievementBadge badge={b} tile={62} />
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

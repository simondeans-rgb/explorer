import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles } from 'lucide-react-native';
import { BackButton } from '../components/BackButton';
import { AchievementBadge } from '../components/AchievementBadge';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { goBack } from '../src/lib/nav';
import { useWorldly } from '../src/hooks/useWorldly';
import { useCelebration } from '../src/store/celebration';
import { ACHIEVEMENT_SECTIONS, type Badge } from '../src/lib/explorer';

type Filter = 'all' | 'earned' | 'locked';

export default function AchievementsScreen() {
  const { badges, level } = useWorldly();
  const { celebrate } = useCelebration();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Badge | null>(null);

  const earned = badges.filter((b) => b.earned).length;
  const pct = badges.length ? earned / badges.length : 0;

  // The locked badge closest to completion — a gentle "you're nearly there".
  const nextUp = useMemo(() => {
    const locked = badges.filter((b) => !b.earned);
    if (locked.length === 0) return null;
    return [...locked].sort((a, b) => b.progress - a.progress)[0];
  }, [badges]);

  function open(b: Badge) {
    setSelected(b);
    if (b.earned) celebrate({ emoji: b.emoji, title: b.title, subtitle: 'Earned' });
  }

  const visible = (b: Badge) => filter === 'all' || (filter === 'earned' ? b.earned : !b.earned);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 60, paddingBottom: 26, paddingHorizontal: 22 }}>
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 58, left: 18, zIndex: 20 }} />
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.9, textAlign: 'center' }}>EXPLORER · LEVEL {level.level}</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, textAlign: 'center', marginTop: 2 }}>Achievements</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.95, textAlign: 'center', marginTop: 4 }}>{earned} of {badges.length} earned</Text>
          <View style={{ height: 8, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.28)', marginTop: 12, overflow: 'hidden' }}>
            <View style={{ width: `${Math.max(pct * 100, 3)}%`, height: 8, borderRadius: 5, backgroundColor: COLORS.card }} />
          </View>
        </LinearGradient>

        {/* Next up */}
        {nextUp ? (
          <Pressable onPress={() => open(nextUp)} className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ marginHorizontal: 20, marginTop: 16, padding: 14, gap: 14 }}>
            <AchievementBadge badge={nextUp} tile={52} labeled={false} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.coral }}>NEXT UP</Text>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 1 }}>{nextUp.title}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>
                {nextUp.target - Math.min(nextUp.value, nextUp.target)} to go · {nextUp.description}
              </Text>
            </View>
          </Pressable>
        ) : null}

        {/* Filter */}
        <View className="flex-row bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, marginTop: 14, padding: 5, gap: 5 }}>
          {([['all', 'All'], ['earned', 'Earned'], ['locked', 'Locked']] as [Filter, string][]).map(([id, label]) => {
            const active = filter === id;
            return (
              <Pressable key={id} onPress={() => setFilter(id)} className="items-center justify-center rounded-xl" style={{ flex: 1, paddingVertical: 9, backgroundColor: active ? COLORS.navySolid : 'transparent' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontWeight: '700', fontSize: 13, color: active ? '#fff' : COLORS.ink3 }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {ACHIEVEMENT_SECTIONS.map((section) => {
          const items = badges.filter((b) => b.category === section.id && visible(b));
          if (items.length === 0) return null;
          const got = badges.filter((b) => b.category === section.id && b.earned).length;
          const total = badges.filter((b) => b.category === section.id).length;
          return (
            <View key={section.id} style={{ marginTop: 22 }}>
              <View className="flex-row items-end justify-between" style={{ paddingHorizontal: 22 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 21, color: COLORS.navy }}>{section.title}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{got}/{total}</Text>
              </View>
              <View className="flex-row flex-wrap" style={{ paddingHorizontal: 16, marginTop: 14, rowGap: 18 }}>
                {items.map((b) => (
                  <Pressable key={b.id} onPress={() => open(b)} style={{ width: '25%', alignItems: 'center' }}>
                    <AchievementBadge badge={b} tile={62} />
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Detail overlay */}
      {selected ? (
        <Pressable onPress={() => setSelected(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,16,24,0.5)', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Pressable onPress={() => {}} className="bg-white dark:bg-card rounded-3xl items-center" style={{ width: '100%', maxWidth: 340, paddingVertical: 28, paddingHorizontal: 24 }}>
            <Pressable onPress={() => setSelected(null)} hitSlop={10} style={{ position: 'absolute', top: 14, right: 14 }}>
              <X size={20} color={COLORS.ink3} />
            </Pressable>
            <AchievementBadge badge={selected} tile={92} labeled={false} />
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, marginTop: 14, textAlign: 'center' }}>{selected.title}</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink2, marginTop: 6, textAlign: 'center' }}>{selected.description}</Text>
            {selected.earned ? (
              <View className="flex-row items-center rounded-full" style={{ marginTop: 16, backgroundColor: 'rgba(36,209,195,0.14)', paddingHorizontal: 14, paddingVertical: 7, gap: 6 }}>
                <Sparkles size={15} color={COLORS.aqua} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#159C90' }}>Earned</Text>
              </View>
            ) : (
              <View style={{ width: '100%', marginTop: 18 }}>
                <View className="flex-row justify-between" style={{ marginBottom: 6 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>Progress</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.navy }}>{Math.min(selected.value, selected.target)} / {selected.target}</Text>
                </View>
                <View style={{ height: 8, borderRadius: 5, backgroundColor: 'rgba(20,33,61,0.08)', overflow: 'hidden' }}>
                  <View style={{ width: `${Math.max(selected.progress * 100, 3)}%`, height: 8, borderRadius: 5, backgroundColor: COLORS.coral }} />
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );
}

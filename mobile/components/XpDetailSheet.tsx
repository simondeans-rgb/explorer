import { View, Text, ScrollView } from 'react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { xpBreakdown, type ExplorerLevel } from '../src/lib/explorer';
import type { PassportStats } from '../src/lib/stats';
import type { DiscoveryStats } from '../src/lib/discoveryStats';
import type { JourneyStats } from '../src/lib/journeyStats';

/** Explains the Explorer Level / XP system — what actions earn XP and how much,
 *  plus how far to the next level — so the gamification isn't a black box. */
export function XpDetailSheet({
  visible,
  onClose,
  level,
  stats,
  discovery,
  journeys,
}: {
  visible: boolean;
  onClose: () => void;
  level: ExplorerLevel;
  stats: PassportStats;
  discovery: DiscoveryStats;
  journeys: JourneyStats;
}) {
  const lines = xpBreakdown(stats, discovery, journeys);
  const toNext = Math.max(0, level.nextLevelXp - level.xp);

  return (
    <SheetShell visible={visible} title="Explorer Level" onClose={onClose}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 14 }}>
        {/* hero */}
        <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 18 }}>
          <View className="flex-row items-center" style={{ gap: 14 }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 60, width: 60, backgroundColor: 'rgba(255,107,154,0.12)' }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 27, color: COLORS.coral }}>{level.level}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.6, color: COLORS.ink3 }}>LEVEL {level.level}</Text>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>{level.title}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 2 }}>{level.xp.toLocaleString()} XP total</Text>
            </View>
          </View>
          <View style={{ height: 8, borderRadius: 8, backgroundColor: 'rgba(20,33,61,0.07)', marginTop: 14, overflow: 'hidden' }}>
            <View style={{ height: 8, borderRadius: 8, backgroundColor: COLORS.coral, width: `${Math.round((level.maxed ? 1 : level.progress) * 100)}%` }} />
          </View>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink2, marginTop: 8 }}>
            {level.maxed ? 'Highest level reached — Citizen of the World. 🌍' : `${toNext.toLocaleString()} XP to ${level.nextTitle}`}
          </Text>
        </View>

        {/* how you earn XP */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, marginTop: 18, marginBottom: 8 }}>HOW YOU EARN XP</Text>
        <View className="bg-white dark:bg-card rounded-2xl" style={{ overflow: 'hidden' }}>
          {lines.map((l, i) => (
            <View key={l.label} className="flex-row items-center justify-between" style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: 'rgba(20,33,61,0.06)' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.navy }}>{l.label}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, color: COLORS.ink3, marginTop: 1 }}>{l.count} × {l.per} XP</Text>
              </View>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '800', color: l.points > 0 ? COLORS.coral : COLORS.ink3 }}>{l.points.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 12, lineHeight: 17 }}>
          Every country, city, discovery and journey you add earns XP and moves you toward the next level.
        </Text>
      </ScrollView>
    </SheetShell>
  );
}

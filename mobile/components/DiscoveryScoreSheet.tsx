import { View, Text, ScrollView } from 'react-native';
import { Plus, TrendingUp } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { ScoreRing } from './ScoreRing';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { discoveryScoreBreakdown, type CountryAggregate } from '../src/lib/stats';

/** Explains a country's Discovery Score — what earned it and how to raise it. */
export function DiscoveryScoreSheet({
  visible,
  onClose,
  aggregate,
}: {
  visible: boolean;
  onClose: () => void;
  aggregate: CountryAggregate | null;
}) {
  const bd = aggregate ? discoveryScoreBreakdown(aggregate) : null;

  return (
    <SheetShell visible={visible} title="Discovery Score" onClose={onClose}>
      {aggregate && bd ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 }}>
          {/* hero */}
          <View className="items-center" style={{ marginBottom: 6 }}>
            <ScoreRing score={bd.total} size={104} stroke={9} color={COLORS.coral} trackColor="rgba(20,33,61,0.08)" textColor={COLORS.navy} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 8 }}>out of 100</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginTop: 10 }}>
              {flagEmoji(aggregate.code)} {aggregate.name}
            </Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, textAlign: 'center', marginTop: 2, lineHeight: 18 }}>
              How deeply you've explored this country — depth counts more than breadth.
            </Text>
          </View>

          {/* what earned it */}
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, marginTop: 18, marginBottom: 8 }}>WHAT EARNED IT</Text>
          <View className="bg-white rounded-2xl" style={{ overflow: 'hidden' }}>
            {bd.lines.map((l, i) => (
              <View key={l.label} className="flex-row items-center justify-between" style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: 'rgba(20,33,61,0.06)' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.navy }}>{l.label}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '800', color: COLORS.coral }}>+{l.points}</Text>
              </View>
            ))}
          </View>

          {/* how to raise it */}
          {bd.tips.length > 0 ? (
            <>
              <View className="flex-row items-center" style={{ gap: 6, marginTop: 18, marginBottom: 8 }}>
                <TrendingUp size={14} color={COLORS.aqua} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3 }}>RAISE YOUR SCORE</Text>
              </View>
              <View style={{ gap: 8 }}>
                {bd.tips.map((t) => (
                  <View key={t} className="flex-row items-center bg-white rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 10 }}>
                    <View className="rounded-full items-center justify-center" style={{ height: 22, width: 22, backgroundColor: 'rgba(36,209,195,0.16)' }}>
                      <Plus size={13} color={COLORS.aqua} strokeWidth={2.6} />
                    </View>
                    <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 13.5, color: COLORS.ink2 }}>{t}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="bg-white rounded-2xl" style={{ padding: 14, marginTop: 18 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, color: COLORS.ink2 }}>You've explored this one deeply — nice work. 🎉</Text>
            </View>
          )}
        </ScrollView>
      ) : null}
    </SheetShell>
  );
}

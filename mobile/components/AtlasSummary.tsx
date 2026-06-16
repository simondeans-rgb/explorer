import { memo, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from 'react-native-reanimated';
import { Globe2, Building2, Plane, Share2 } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { CONTINENTS, type Continent } from '../src/types';
import type { PassportStats } from '../src/lib/stats';

const CONTINENT_COLOR: Record<string, string> = {
  Africa: '#FFB84D',
  Asia: '#FF6B9A',
  Europe: '#9B7CFF',
  'North America': '#24D1C3',
  'South America': '#5B6CFF',
  Oceania: '#FF7A66',
  Antarctica: '#8A90A6',
};

/** A circular "% of the world" gauge for a light surface. */
function WorldRing({ pct, size = 116 }: { pct: number; size?: number }) {
  const stroke = 11;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct)) / 100;
  const label = pct < 10 ? pct.toFixed(1) : String(Math.round(pct));
  return (
    <View style={{ width: size, alignItems: 'center' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(20,33,61,0.08)" strokeWidth={stroke} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={COLORS.coral}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - p)}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <Text style={{ fontFamily: 'Fraunces', fontSize: size * 0.27, color: COLORS.navy }}>{label}%</Text>
      </View>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 4 }}>of the world</Text>
    </View>
  );
}

function StatRow({ icon: Icon, color, tint, value, label }: { icon: ComponentType<{ size?: number; color?: string }>; color: string; tint: string; value: number; label: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: 12 }}>
      <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: tint }}>
        <Icon size={20} color={color} />
      </View>
      <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '600', color: COLORS.ink2 }}>{label}</Text>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 28, color: COLORS.navy }}>{value}</Text>
    </View>
  );
}

function ContinentBar({ pct, color, on, index }: { pct: number; color: string; on: boolean; index: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(120 + index * 70, withTiming(on ? Math.max(pct, 0.06) : 0, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [pct, on, index, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ flex: 1, height: 9, borderRadius: 5, backgroundColor: 'rgba(20,33,61,0.06)', overflow: 'hidden' }}>
      <Animated.View style={[{ height: 9, borderRadius: 5, backgroundColor: on ? color : 'transparent' }, style]} />
    </View>
  );
}

/** The "Your world" overview — % ring, icon stats, and colourful animated
 *  per-continent progress, with a gradient Share CTA. */
export const AtlasSummary = memo(function AtlasSummary({
  stats,
  worldPct,
  journeys,
  discByContinent,
  totalByContinent,
  onShare,
  sharing,
}: {
  stats: PassportStats;
  worldPct: number;
  journeys: number;
  discByContinent: Record<string, number>;
  totalByContinent: Record<string, number>;
  onShare: () => void;
  sharing: boolean;
}) {
  const conts = CONTINENTS.filter((c) => totalByContinent[c]);

  return (
    <View className="bg-white rounded-3xl" style={{ marginTop: 14, padding: 18 }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginBottom: 14 }}>Your world</Text>

      {/* hero: % ring + stats */}
      <View className="flex-row items-center" style={{ gap: 20 }}>
        <WorldRing pct={worldPct} />
        <View style={{ flex: 1, gap: 16 }}>
          <StatRow icon={Globe2} color={COLORS.coral} tint="rgba(255,107,154,0.14)" value={stats.countriesDiscovered} label="Countries" />
          <StatRow icon={Building2} color="#12A594" tint="rgba(36,209,195,0.16)" value={stats.citiesDiscovered} label="Cities" />
          <StatRow icon={Plane} color={COLORS.lavender} tint="rgba(155,124,255,0.16)" value={journeys} label="Journeys" />
        </View>
      </View>

      {/* continents */}
      <View className="flex-row items-center justify-between" style={{ marginTop: 20, marginBottom: 12 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3 }}>CONTINENTS</Text>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>{stats.continentsDiscovered} / {conts.length}</Text>
      </View>
      <View style={{ gap: 11 }}>
        {conts.map((c: Continent, i) => {
          const total = totalByContinent[c];
          const got = discByContinent[c] ?? 0;
          const on = got > 0;
          const color = CONTINENT_COLOR[c] ?? COLORS.coral;
          return (
            <View key={c} className="flex-row items-center" style={{ gap: 10 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: on ? '600' : '500', color: on ? COLORS.navy : COLORS.ink3, width: 96 }}>{c}</Text>
              <ContinentBar pct={total ? got / total : 0} color={color} on={on} index={i} />
              <View className="rounded-full items-center justify-center" style={{ minWidth: 44, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: on ? `${color}22` : 'rgba(20,33,61,0.05)' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: on ? color : COLORS.ink3 }}>{got}/{total}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* share */}
      <Pressable onPress={onShare} disabled={sharing} style={{ marginTop: 18, opacity: sharing ? 0.6 : 1 }}>
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="flex-row items-center justify-center rounded-2xl" style={{ paddingVertical: 14, gap: 8 }}>
          <Share2 size={16} color="#fff" />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>{sharing ? 'Preparing…' : 'Share my map'}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
});

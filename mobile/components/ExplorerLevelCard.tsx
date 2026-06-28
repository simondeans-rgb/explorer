import { Pressable, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, Stop, LinearGradient as SvgGrad } from 'react-native-svg';
import { ChevronRight, Globe2, Mountain } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { COLORS, GRADIENTS, SHADOW } from '../src/lib/theme';
import type { ExplorerLevel } from '../src/lib/explorer';
import type { PassportStats } from '../src/lib/stats';

/** A 4-point sparkle path centred at (x, y) with arm length s. */
function sparkle(x: number, y: number, s: number): string {
  const k = 0.16 * s;
  return `M${x} ${y - s} Q${x + k} ${y - k} ${x + s} ${y} Q${x + k} ${y + k} ${x} ${y + s} Q${x - k} ${y + k} ${x - s} ${y} Q${x - k} ${y - k} ${x} ${y - s} Z`;
}

/** The hexagonal achievement medal — navy badge with coral ribbon/detail, the
 *  level number, gloss and sparkles. */
function Medal({ level }: { level: number }) {
  const cx = 50;
  const cy = 52;
  const R = 42;
  const hex =
    [0, 1, 2, 3, 4, 5]
      .map((k) => {
        const a = (k * 60 * Math.PI) / 180;
        const px = cx + R * Math.sin(a);
        const py = cy - R * Math.cos(a);
        return `${k ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`;
      })
      .join(' ') + ' Z';

  return (
    <View style={{ width: 92, height: 108 }}>
      <Svg width={92} height={108} viewBox="0 0 100 118">
        <Defs>
          <SvgGrad id="medal" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#22335A" />
            <Stop offset="1" stopColor="#14213D" />
          </SvgGrad>
          <SvgGrad id="ribbon" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FF6B9A" />
            <Stop offset="1" stopColor="#E2497F" />
          </SvgGrad>
        </Defs>
        {/* coral ribbon tails behind the hexagon */}
        <Path d="M36 78 L26 112 L36 106 L45 111 L48 84 Z" fill="url(#ribbon)" />
        <Path d="M64 78 L74 112 L64 106 L55 111 L52 84 Z" fill="url(#ribbon)" />
        {/* navy hexagon medal with a coral rim */}
        <Path d={hex} fill="url(#medal)" stroke={COLORS.coral} strokeWidth={3} strokeLinejoin="round" />
        {/* top gloss highlight */}
        <Path d="M22 28 Q50 16 78 28 Q70 42 50 44 Q30 42 22 28 Z" fill="#fff" opacity={0.14} />
        {/* sparkles */}
        <Path d={sparkle(20, 22, 7)} fill={COLORS.coral} opacity={0.95} />
        <Path d={sparkle(80, 30, 5)} fill="#fff" opacity={0.85} />
        <Path d={sparkle(74, 64, 4.5)} fill={COLORS.coral} opacity={0.8} />
        <Path d={sparkle(26, 66, 3.5)} fill="#fff" opacity={0.75} />
      </Svg>
      {/* level number, overlaid so it renders in Fraunces */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 95, alignItems: 'center', justifyContent: 'center' }}>
        <Text
          style={{
            fontFamily: 'Fraunces',
            fontSize: 32,
            color: '#fff',
            textShadowColor: 'rgba(0,0,0,0.35)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
        >
          {level}
        </Text>
      </View>
    </View>
  );
}

/** A compact stat chip: a coloured icon disc + value. */
function Chip({ Icon, color, value }: { Icon: LucideIcon; color: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={11} color="#fff" strokeWidth={2.4} />
      </View>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, fontWeight: '700', color: COLORS.ink2, marginLeft: 4 }}>{value}</Text>
    </View>
  );
}

/** Story-home Explorer Level tile — an achievement medal on a clean white card. */
export function ExplorerLevelCard({
  level,
  stats,
  onPress,
  height = 150,
}: {
  level: ExplorerLevel;
  stats: PassportStats;
  onPress: () => void;
  height?: number;
}) {
  const pct = Math.round((level.maxed ? 1 : level.progress) * 100);
  return (
    <Pressable
      onPress={onPress}
      style={{
        height,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        ...SHADOW.card,
      }}
    >
      {/* content */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 }}>
        <Medal level={level.level} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10.5, fontWeight: '800', letterSpacing: 1, color: COLORS.coral }}>EXPLORER LEVEL</Text>
          <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginTop: 1 }}>{level.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7 }}>
            <Chip Icon={Globe2} color={COLORS.aqua} value={`${stats.countriesDiscovered} countries`} />
            <Chip Icon={Mountain} color={COLORS.coral} value={`${stats.continentsDiscovered} continents`} />
          </View>
          <View style={{ height: 7, borderRadius: 7, backgroundColor: 'rgba(20,33,61,0.08)', overflow: 'hidden', marginTop: 8 }}>
            <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 7, borderRadius: 7, width: `${pct}%` }} />
          </View>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink2, marginTop: 5 }}>
            {`${level.xp.toLocaleString()} XP · ${level.maxed ? 'Max level reached' : `${(level.nextLevelXp - level.xp).toLocaleString()} XP to go`}`}
          </Text>
        </View>
        <ChevronRight size={18} color={COLORS.ink3} style={{ marginLeft: 4 }} />
      </View>
    </Pressable>
  );
}

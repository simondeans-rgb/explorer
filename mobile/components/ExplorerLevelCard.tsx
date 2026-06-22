import { Pressable, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, Stop, LinearGradient as SvgGrad, G } from 'react-native-svg';
import { ChevronRight, Globe2, Mountain, Star } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import type { ExplorerLevel } from '../src/lib/explorer';
import type { PassportStats } from '../src/lib/stats';

const ABS_FILL = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

/** A 4-point sparkle path centred at (x, y) with arm length s. */
function sparkle(x: number, y: number, s: number): string {
  const k = 0.16 * s;
  return `M${x} ${y - s} Q${x + k} ${y - k} ${x + s} ${y} Q${x + k} ${y + k} ${x} ${y + s} Q${x - k} ${y + k} ${x - s} ${y} Q${x - k} ${y - k} ${x} ${y - s} Z`;
}

/** A small hot-air balloon used to decorate the pastel scene. */
function Balloon({ cx, cy, r, color, opacity }: { cx: number; cy: number; r: number; color: string; opacity: number }) {
  const eb = cy + 0.95 * r; // envelope bottom
  return (
    <G opacity={opacity}>
      <Path
        d={`M${cx} ${cy - r} C${cx - r} ${cy - r} ${cx - r} ${cy + 0.5 * r} ${cx} ${eb} C${cx + r} ${cy + 0.5 * r} ${cx + r} ${cy - r} ${cx} ${cy - r} Z`}
        fill={color}
      />
      <Path
        d={`M${cx} ${cy - r} C${cx - 0.42 * r} ${cy - r} ${cx - 0.42 * r} ${cy + 0.5 * r} ${cx} ${eb}`}
        stroke="rgba(255,255,255,0.55)"
        strokeWidth={1}
        fill="none"
      />
      <Path
        d={`M${cx - 0.32 * r} ${eb - 1} L${cx - 1.5} ${eb + r * 0.45} M${cx + 0.32 * r} ${eb - 1} L${cx + 1.5} ${eb + r * 0.45}`}
        stroke={color}
        strokeWidth={0.8}
        opacity={0.7}
      />
      <Path d={`M${cx - 2.4} ${eb + r * 0.45} h4.8 v3 h-4.8 Z`} fill="#9A6B4F" />
    </G>
  );
}

/** The hexagonal achievement medal with the level number, gloss, sparkles and ribbon tails. */
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
            <Stop offset="0" stopColor="#FF8A5B" />
            <Stop offset="0.5" stopColor="#FF5C9D" />
            <Stop offset="1" stopColor="#A24BE0" />
          </SvgGrad>
          <SvgGrad id="ribbon" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#8B5CF6" />
            <Stop offset="1" stopColor="#6D28D9" />
          </SvgGrad>
        </Defs>
        {/* ribbon tails behind the hexagon */}
        <Path d="M36 78 L26 112 L36 106 L45 111 L48 84 Z" fill="url(#ribbon)" />
        <Path d="M64 78 L74 112 L64 106 L55 111 L52 84 Z" fill="url(#ribbon)" />
        {/* hexagon medal */}
        <Path d={hex} fill="url(#medal)" stroke="#fff" strokeWidth={3} strokeOpacity={0.5} strokeLinejoin="round" />
        {/* top gloss highlight */}
        <Path d="M22 28 Q50 16 78 28 Q70 42 50 44 Q30 42 22 28 Z" fill="#fff" opacity={0.22} />
        {/* sparkles */}
        <Path d={sparkle(20, 22, 7)} fill="#fff" opacity={0.95} />
        <Path d={sparkle(80, 30, 5)} fill="#fff" opacity={0.9} />
        <Path d={sparkle(74, 64, 4.5)} fill="#fff" opacity={0.85} />
        <Path d={sparkle(26, 66, 3.5)} fill="#fff" opacity={0.8} />
      </Svg>
      {/* level number, overlaid so it renders in Fraunces */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 95, alignItems: 'center', justifyContent: 'center' }}>
        <Text
          style={{
            fontFamily: 'Fraunces',
            fontSize: 32,
            color: '#fff',
            textShadowColor: 'rgba(120,30,80,0.35)',
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
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={12} color="#fff" strokeWidth={2.4} />
      </View>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.ink2, marginLeft: 5 }}>{value}</Text>
    </View>
  );
}

/** Story-home Explorer Level tile — an achievement-medal card on a soft pastel scene. */
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
        backgroundColor: '#F7DEE6',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      {/* pastel wash */}
      <LinearGradient colors={['#F9D7E0', '#F4E1E6', '#FCEEE1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={ABS_FILL} />
      {/* illustrated scene: mountains, balloons, sparkle dots */}
      <Svg width="100%" height="100%" viewBox="0 0 350 150" preserveAspectRatio="xMidYMid slice" style={ABS_FILL}>
        <Path d="M0 118 L55 92 L110 114 L175 84 L245 116 L300 94 L350 116 L350 150 L0 150 Z" fill="#E6B6C4" opacity={0.45} />
        <Path d="M0 134 L80 112 L150 132 L225 108 L295 130 L350 116 L350 150 L0 150 Z" fill="#ECC3AC" opacity={0.5} />
        <Balloon cx={302} cy={40} r={17} color="#FF8FA3" opacity={0.9} />
        <Balloon cx={332} cy={95} r={10} color="#F4A98A" opacity={0.45} />
        <Circle cx={150} cy={26} r={1.6} fill="#fff" opacity={0.8} />
        <Circle cx={212} cy={20} r={1.2} fill="#fff" opacity={0.7} />
        <Circle cx={122} cy={42} r={1.1} fill="#fff" opacity={0.6} />
      </Svg>
      {/* content */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 }}>
        <Medal level={level.level} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10.5, fontWeight: '800', letterSpacing: 1, color: COLORS.coral }}>EXPLORER LEVEL</Text>
          <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginTop: 1 }}>{level.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 7 }}>
            <Chip Icon={Globe2} color={COLORS.aqua} value={`${stats.countriesDiscovered}`} />
            <Chip Icon={Mountain} color={COLORS.coral} value={`${stats.continentsDiscovered}`} />
            <Chip Icon={Star} color={COLORS.lavender} value={`${level.xp.toLocaleString()} XP`} />
          </View>
          <View style={{ height: 7, borderRadius: 7, backgroundColor: 'rgba(20,33,61,0.08)', overflow: 'hidden', marginTop: 8 }}>
            <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 7, borderRadius: 7, width: `${pct}%` }} />
          </View>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, marginTop: 5 }}>
            {level.maxed ? 'Max level reached' : `Next level · ${(level.nextLevelXp - level.xp).toLocaleString()} XP to go`}
          </Text>
        </View>
        <ChevronRight size={18} color={COLORS.ink3} style={{ marginLeft: 4 }} />
      </View>
    </Pressable>
  );
}

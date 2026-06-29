import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { COLORS, BRAND_GRADIENT } from '../src/lib/theme';

export interface CelebrationItem {
  emoji: string;
  title: string;
  subtitle?: string;
}

const CONFETTI_COLORS = ['#FF6B9A', '#9B7CFF', '#24D1C3', '#FFB84D', '#FF7A66', '#4DA6FF', '#FFD23F'];

// When the card reveals, in ms — the confetti gets a head start so it fills the
// screen first and the achievement is revealed behind it (iMessage-style).
const CARD_REVEAL_MS = 360;

/** A single confetti piece. It launches from a central origin, bursting
 *  outward in every direction, then gravity drags it down and off-screen —
 *  a confetti-cannon explosion that resolves into a falling shower. */
function Piece({ index, width, height, originY }: { index: number; width: number; height: number; originY: number }) {
  const p = useSharedValue(0);
  const cx = width / 2;
  // Radial launch: a random direction + magnitude so pieces fan out evenly.
  const angle = useMemo(() => Math.random() * Math.PI * 2, []);
  const mag = useMemo(() => 0.2 + Math.random() * 1.0, []); // 0.2–1.2 of the spread
  const reach = useMemo(() => Math.cos(angle) * mag * width * 0.62, [angle, mag, width]);
  const rise = useMemo(() => Math.sin(angle) * mag * height * 0.42, [angle, mag, height]); // up or down impulse
  const fall = useMemo(() => height * (1.15 + Math.random() * 0.7), [height]); // gravity pulls past the bottom
  const delay = useMemo(() => Math.random() * 170, []); // tight stagger keeps the burst punchy
  const duration = useMemo(() => 1700 + Math.random() * 1300, []);
  const spin = useMemo(() => Math.random() * 1100 - 550, []);
  const sway = useMemo(() => 8 + Math.random() * 20, []);
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const w = useMemo(() => 6 + Math.random() * 6, []);
  const h = useMemo(() => w * (1.3 + Math.random() * 1.2), [w]);
  const round = useMemo(() => Math.random() < 0.25, []); // a few circles in the mix

  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration, easing: Easing.linear }));
  }, [p, delay, duration]);

  const style = useAnimatedStyle(() => {
    const t = p.value;
    // Burst expands fast then settles (easeOut); gravity accelerates (t²) so the
    // outward explosion hands off to a downward fall.
    const eo = 1 - (1 - t) * (1 - t);
    const swayX = Math.sin(t * Math.PI * 3) * sway;
    return {
      transform: [
        { translateX: cx + reach * eo + swayX },
        { translateY: originY + rise * eo + fall * t * t },
        { rotate: `${spin * t}deg` },
      ],
      opacity: interpolate(t, [0, 0.04, 0.86, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', top: 0, left: 0, width: w, height: round ? w : h, borderRadius: round ? w : 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

/** A full-screen celebratory overlay: a dense confetti shower fills the screen,
 *  then the achievement card reveals behind it. Tap (or auto-dismiss) closes. */
export function Celebration({ item, onDismiss }: { item: CelebrationItem; onDismiss: () => void }) {
  const { width, height } = useWindowDimensions();
  // Scale piece count to the screen so it reads as full regardless of device.
  const pieces = useMemo(() => Math.min(260, Math.max(170, Math.round((width * height) / 1700))), [width, height]);
  // Burst origin — the centre of the card, so the explosion erupts from behind
  // the achievement as it reveals.
  const originY = height / 2;

  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const scrim = useSharedValue(0);

  useEffect(() => {
    // Scrim fades in immediately; the card is held back so confetti leads.
    scrim.value = withTiming(1, { duration: 220 });
    scale.value = withDelay(CARD_REVEAL_MS, withSpring(1, { damping: 13, stiffness: 150 }));
    opacity.value = withDelay(CARD_REVEAL_MS, withTiming(1, { duration: 240 }));
  }, [scale, opacity, scrim]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  return (
    <Pressable onPress={onDismiss} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,16,24,0.55)' }, scrimStyle]} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {Array.from({ length: pieces }).map((_, i) => (
          <Piece key={i} index={i} width={width} height={height} originY={originY} />
        ))}
        <Animated.View style={cardStyle}>
          <LinearGradient
            colors={BRAND_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 280, borderRadius: 30, paddingVertical: 34, paddingHorizontal: 26, alignItems: 'center' }}
          >
            <View className="rounded-full items-center justify-center bg-white/25" style={{ height: 96, width: 96 }}>
              <Text style={{ fontSize: 52 }}>{item.emoji}</Text>
            </View>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 28, marginTop: 18, textAlign: 'center' }}>{item.title}</Text>
            {item.subtitle ? (
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, opacity: 0.95, marginTop: 6, textAlign: 'center' }}>{item.subtitle}</Text>
            ) : null}
            <View className="rounded-full bg-white" style={{ marginTop: 22, paddingHorizontal: 26, paddingVertical: 11 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.coral }}>Nice!</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Pressable>
  );
}

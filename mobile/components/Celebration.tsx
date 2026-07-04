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
  // Magnitude is biased large so plenty of pieces reach the screen edges — the
  // explosion fills the whole screen at its peak before gravity takes over.
  const angle = useMemo(() => Math.random() * Math.PI * 2, []);
  const mag = useMemo(() => 0.45 + Math.random() * 0.85, []); // 0.45–1.3 of the spread
  // Reach far enough to clear the edges from the centre: >0.5·width / >0.5·height.
  const reach = useMemo(() => Math.cos(angle) * mag * width * 0.7, [angle, mag, width]);
  const rise = useMemo(() => Math.sin(angle) * mag * height * 0.68, [angle, mag, height]); // up or down impulse
  const fall = useMemo(() => height * (1.5 + Math.random() * 0.7), [height]); // gravity pulls past the bottom
  const delay = useMemo(() => Math.random() * 110, []); // tight stagger keeps the burst a single punch
  const duration = useMemo(() => 2300 + Math.random() * 500, []);
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
    // Two decoupled phases. The radial burst expands fast and SATURATES by
    // t≈0.32 (easeOutCubic on a clamped clock), so at its peak the explosion
    // covers the whole screen. Gravity is held back until ~t0.24 then accelerates
    // (squared), so the held-open explosion then drops into a falling shower.
    const b = Math.min(t / 0.32, 1);
    const burst = 1 - (1 - b) * (1 - b) * (1 - b);
    const g = t < 0.24 ? 0 : (t - 0.24) / 0.76;
    const gravity = g * g;
    const swayX = Math.sin(t * Math.PI * 3) * sway;
    return {
      transform: [
        { translateX: cx + reach * burst + swayX },
        { translateY: originY + rise * burst + fall * gravity },
        { rotate: `${spin * t}deg` },
      ],
      opacity: interpolate(t, [0, 0.03, 0.9, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
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
  const pieces = useMemo(() => Math.min(300, Math.max(210, Math.round((width * height) / 1350))), [width, height]);
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
            <View className="rounded-full bg-white dark:bg-card" style={{ marginTop: 22, paddingHorizontal: 26, paddingVertical: 11 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.coral }}>Nice!</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Pressable>
  );
}

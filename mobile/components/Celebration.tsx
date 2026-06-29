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

/** A single confetti piece. It rains the full height of the screen from a
 *  random column, drifting and tumbling, so a screenful of them reads as a
 *  dense celebratory shower rather than a thin stream. */
function Piece({ index, width, height }: { index: number; width: number; height: number }) {
  const p = useSharedValue(0);
  // Spread start columns across the full width, and stagger vertical entry so
  // pieces are already strewn down the screen rather than all at the top edge.
  const startX = useMemo(() => Math.random() * width, [width]);
  // Spread initial Y from well above the screen to a little below the top, so a
  // burst populates the whole height at once rather than only streaming in.
  const startY = useMemo(() => height * (Math.random() * 1.0 - 0.8), [height]);
  const drift = useMemo(() => (Math.random() - 0.5) * width * 0.5, [width]);
  const delay = useMemo(() => Math.random() * 520, []);
  const duration = useMemo(() => 1700 + Math.random() * 1300, []);
  const spin = useMemo(() => Math.random() * 1000 - 500, []);
  const sway = useMemo(() => 16 + Math.random() * 26, []);
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const w = useMemo(() => 7 + Math.random() * 6, []);
  const h = useMemo(() => w * (1.3 + Math.random() * 1.2), [w]);
  const round = useMemo(() => Math.random() < 0.25, []); // a few circles in the mix

  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration, easing: Easing.in(Easing.quad) }));
  }, [p, delay, duration]);

  const style = useAnimatedStyle(() => {
    // Fall the whole screen height, with a gentle horizontal sway on top of the
    // overall drift so the tumble feels organic.
    const travel = height - startY + 120;
    const swayX = Math.sin(p.value * Math.PI * 3) * sway;
    return {
      transform: [
        { translateX: startX + drift * p.value + swayX },
        { translateY: startY + travel * p.value },
        { rotate: `${spin * p.value}deg` },
      ],
      opacity: interpolate(p.value, [0, 0.05, 0.85, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
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
  const pieces = useMemo(() => Math.min(140, Math.max(80, Math.round((width * height) / 3600))), [width, height]);

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
          <Piece key={i} index={i} width={width} height={height} />
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

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
} from 'react-native-reanimated';
import { COLORS, BRAND_GRADIENT } from '../src/lib/theme';

export interface CelebrationItem {
  emoji: string;
  title: string;
  subtitle?: string;
}

const CONFETTI_COLORS = ['#FF6B9A', '#9B7CFF', '#24D1C3', '#FFB84D', '#FF7A66'];
const PIECES = 28;

function Piece({ index, width, height }: { index: number; width: number; height: number }) {
  const p = useSharedValue(0);
  const startX = useMemo(() => Math.random() * width, [width]);
  const drift = useMemo(() => (Math.random() - 0.5) * 140, []);
  const delay = useMemo(() => Math.random() * 450, []);
  const spin = useMemo(() => Math.random() * 720 - 360, []);
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = useMemo(() => 7 + Math.random() * 6, []);

  useEffect(() => {
    p.value = withDelay(
      delay,
      withTiming(1, { duration: 1900 + Math.random() * 1100, easing: Easing.in(Easing.quad) }),
    );
  }, [p, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + drift * p.value },
      { translateY: -24 + (height + 80) * p.value },
      { rotate: `${spin * p.value}deg` },
    ],
    opacity: p.value < 0.82 ? 1 : 1 - (p.value - 0.82) / 0.18,
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: size, height: size * 1.6, borderRadius: 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

/** A full-screen celebratory overlay: a confetti burst behind a centred
 *  gradient card. Tap (or the auto-dismiss timer) closes it. */
export function Celebration({ item, onDismiss }: { item: CelebrationItem; onDismiss: () => void }) {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 140 });
    opacity.value = withTiming(1, { duration: 220 });
  }, [scale, opacity]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable
      onPress={onDismiss}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(14,16,24,0.55)' }}
    >
      {Array.from({ length: PIECES }).map((_, i) => (
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
    </Pressable>
  );
}

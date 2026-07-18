import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ParticleProfile } from '../src/lib/coverThemes.gen';

/** Ambient particle layer for Passport Covers — falling snow, twinkling
 *  stars, drifting petals… Elegant, subtle, and cheap:
 *
 *  - every animation runs on the native driver (transform/opacity only)
 *  - loops are seamless (particles travel fully off-screen before reset)
 *  - Reduce Motion renders a static, faint first frame instead of motion
 *  - particle counts are capped per profile; no timers besides the loops
 */

interface Particle {
  x: number; // 0..1 of width
  size: number;
  duration: number;
  delay: number;
  drift: number; // horizontal wander in px
  spin: boolean;
  color: string;
  opacity: number;
}

const COUNTS: Record<ParticleProfile, number> = {
  none: 0,
  snow: 18,
  stars: 14,
  petals: 12,
  bubbles: 14,
  embers: 10,
  aurora: 3,
  confetti: 22,
  rain: 26,
  steam: 8,
  fireflies: 9,
  sparkle: 8,
};

function makeParticles(profile: ParticleProfile, colors: string[], n: number): Particle[] {
  const fallback = ['#FFFFFF'];
  const palette = colors.length ? colors : fallback;
  return Array.from({ length: n }, (_, i) => {
    const r = () => Math.random();
    const base: Particle = {
      x: r(),
      size: 3 + r() * 5,
      duration: 6000 + r() * 6000,
      delay: r() * 8000,
      drift: (r() - 0.5) * 40,
      spin: false,
      color: palette[i % palette.length],
      opacity: 0.5 + r() * 0.5,
    };
    switch (profile) {
      case 'snow':
        return { ...base, size: 2.5 + r() * 4.5, duration: 9000 + r() * 7000, drift: (r() - 0.5) * 60 };
      case 'stars':
      case 'sparkle':
        return { ...base, size: profile === 'sparkle' ? 5 + r() * 6 : 2 + r() * 3.5, duration: 2400 + r() * 3200, drift: 0 };
      case 'petals':
        return { ...base, size: 7 + r() * 6, duration: 8000 + r() * 6000, drift: (r() - 0.5) * 120, spin: true };
      case 'bubbles':
        return { ...base, size: 4 + r() * 8, duration: 7000 + r() * 6000, drift: (r() - 0.5) * 40 };
      case 'embers':
      case 'fireflies':
        return { ...base, size: 3 + r() * 4, duration: 9000 + r() * 8000, drift: (r() - 0.5) * 90, opacity: 0.35 + r() * 0.45 };
      case 'confetti':
        return { ...base, size: 5 + r() * 5, duration: 5000 + r() * 4000, drift: (r() - 0.5) * 90, spin: true };
      case 'rain':
        return { ...base, size: 1.8 + r() * 1.4, duration: 1200 + r() * 900, drift: -24, opacity: 0.3 + r() * 0.3 };
      case 'steam':
        return { ...base, size: 16 + r() * 18, duration: 7000 + r() * 5000, drift: (r() - 0.5) * 50, opacity: 0.18 + r() * 0.16 };
      default:
        return base;
    }
  });
}

const FALLING: ParticleProfile[] = ['snow', 'petals', 'confetti', 'rain'];
const RISING: ParticleProfile[] = ['bubbles', 'embers', 'fireflies', 'steam'];

function Mote({ p, profile, width, height, animate }: { p: Particle; profile: ParticleProfile; width: number; height: number; animate: boolean }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(t, { toValue: 1, duration: p.duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, p.delay, p.duration, t]);

  const falling = FALLING.includes(profile);
  const rising = RISING.includes(profile);
  const twinkle = !falling && !rising;

  const translateY = twinkle
    ? 0
    : t.interpolate({
        inputRange: [0, 1],
        outputRange: falling ? [-30, height + 30] : [height + 30, -30],
      });
  const translateX = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, p.drift, p.drift * (profile === 'rain' ? 2 : 0.4)],
  });
  const opacity = twinkle
    ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.12, p.opacity, 0.12] })
    : t.interpolate({ inputRange: [0, 0.08, 0.85, 1], outputRange: [0, p.opacity, p.opacity, 0] });
  const rotate = p.spin
    ? t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
    : '0deg';
  const scale = profile === 'steam' ? t.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] }) : profile === 'sparkle' ? t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1, 0.4] }) : 1;

  const y0 = twinkle ? Math.random() * height : 0;
  const shape: ViewStyle =
    profile === 'rain'
      ? { width: p.size, height: p.size * 9, borderRadius: p.size, backgroundColor: p.color }
      : profile === 'confetti'
        ? { width: p.size, height: p.size * 0.6, borderRadius: 1.5, backgroundColor: p.color }
        : profile === 'petals'
          ? { width: p.size, height: p.size * 0.8, borderTopLeftRadius: p.size, borderBottomRightRadius: p.size, backgroundColor: p.color }
          : { width: p.size, height: p.size, borderRadius: p.size / 2, backgroundColor: p.color };

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: p.x * width,
        top: twinkle ? y0 : -30,
        opacity: animate ? opacity : 0.25,
        transform: animate ? [{ translateY }, { translateX }, { rotate }, { scale }] : [],
        ...shape,
      }}
    />
  );
}

/** Slow-breathing aurora bands (its own renderer — bands, not motes). */
function AuroraBands({ colors, width, height, animate }: { colors: string[]; width: number; height: number; animate: boolean }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animate, t]);
  const shift = t.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.12, width * 0.12] });
  const op = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.35, 0.6, 0.35] });
  const c0 = colors[0] ?? '#4BE3B2';
  const c1 = colors[1] ?? '#9B7CFF';
  return (
    <>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: height * 0.08, left: -width * 0.2, width: width * 1.4, height: height * 0.3, opacity: animate ? op : 0.3, transform: animate ? [{ translateX: shift }, { rotate: '-6deg' }] : [{ rotate: '-6deg' }] }}>
        <LinearGradient colors={[`${c0}00`, c0, `${c0}00`]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1, borderRadius: 60 }} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: height * 0.3, left: -width * 0.2, width: width * 1.4, height: height * 0.24, opacity: animate ? op : 0.25, transform: animate ? [{ translateX: Animated.multiply(shift, -1) }, { rotate: '5deg' }] : [{ rotate: '5deg' }] }}>
        <LinearGradient colors={[`${c1}00`, c1, `${c1}00`]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1, borderRadius: 60 }} />
      </Animated.View>
    </>
  );
}

export function CoverParticles({
  profile,
  colors,
  width,
  height,
  count,
}: {
  profile: ParticleProfile;
  colors: string[];
  width: number;
  height: number;
  /** Override the profile's default particle count. */
  count?: number;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const particles = useMemo(
    () => makeParticles(profile, colors, count ?? COUNTS[profile]),
    [profile, colors, count],
  );

  if (profile === 'none' || width <= 0 || height <= 0) return null;
  const animate = !reduceMotion;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width, height, overflow: 'hidden' }}>
      {profile === 'aurora' ? (
        <AuroraBands colors={colors} width={width} height={height} animate={animate} />
      ) : (
        particles.map((p, i) => <Mote key={i} p={p} profile={profile} width={width} height={height} animate={animate} />)
      )}
    </View>
  );
}

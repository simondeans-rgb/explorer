import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Compass, ArrowRight } from 'lucide-react-native';
import Svg, { Path, Circle, Rect, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { geoPath, geoInterpolate } from 'd3-geo';
import { WORLD_FEATURES } from '../src/lib/worldGeo';
import { framedEqualEarth } from '../src/lib/mapFraming';
import type { Segment } from '../src/lib/journeyGeo';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const VIEW_W = 360;
const VIEW_H = 276;

// Same dark, luminous theme as the places map.
const OCEAN_GLOW = '#243869';
const OCEAN_DEEP = '#0B1226';
const LAND_UNVISITED = '#2C3B63';
const LAND_STROKE = '#18233F';
const ROUTE = '#FF6A8E';
const ROUTE_EDGE = '#FFC2D2';

/** One flight route that draws itself on, in turn. */
function RouteLine({
  d,
  length,
  order,
  count,
  progress,
}: {
  d: string;
  length: number;
  order: number;
  count: number;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const start = count > 1 ? (order / count) * 0.82 : 0;
    const local = interpolate(progress.value, [start, start + 0.2], [0, 1], Extrapolation.CLAMP);
    return { strokeDashoffset: length * (1 - local) };
  });
  return (
    <AnimatedPath
      d={d}
      fill="none"
      stroke={ROUTE}
      strokeWidth={1.4}
      strokeOpacity={0.95}
      strokeLinecap="round"
      strokeDasharray={length}
      animatedProps={animatedProps}
    />
  );
}

/** An Equal-Earth world map with great-circle flight routes that draw on one
 *  by one in date order, over the dark luminous hero theme. */
export function RouteMap({ segments }: { segments: Segment[] }) {
  const { countryPaths, routes, dots } = useMemo(() => {
    // Frame the map to the flight network (reframes per year as scope changes).
    const pts: [number, number][] = [];
    segments.forEach((s) => {
      pts.push(s.from);
      pts.push(s.to);
    });
    const target = pts.length ? { type: 'MultiPoint' as const, coordinates: pts } : null;
    const projection = framedEqualEarth(VIEW_W, VIEW_H, target);
    const path = geoPath(projection);
    const countryPaths = WORLD_FEATURES.map((wf, i) => ({ key: `c-${i}`, d: path(wf.feature) ?? '' }));

    const routes: { key: string; d: string; length: number }[] = [];
    const dotSet = new Map<string, [number, number]>();
    segments.forEach((s, idx) => {
      const interp = geoInterpolate(s.from, s.to);
      let d = '';
      let prevX: number | null = null;
      let prevPt: [number, number] | null = null;
      let len = 0;
      for (let i = 0; i <= 48; i++) {
        const p = projection(interp(i / 48) as [number, number]);
        if (!p) continue;
        if (prevX !== null && Math.abs(p[0] - prevX) > VIEW_W * 0.5) {
          d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)} `;
          prevPt = null;
        } else {
          d += `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)} `;
          if (prevPt) len += Math.hypot(p[0] - prevPt[0], p[1] - prevPt[1]);
        }
        prevX = p[0];
        prevPt = p as [number, number];
      }
      if (d) routes.push({ key: `r-${idx}`, d, length: Math.max(len, 1) });
      const pf = projection(s.from);
      const pt = projection(s.to);
      if (pf) dotSet.set(pf.join(','), pf);
      if (pt) dotSet.set(pt.join(','), pt);
    });
    return { countryPaths, routes, dots: [...dotSet.values()] };
  }, [segments]);

  const duration = Math.min(1400 + routes.length * 420, 6000);
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(260, withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }));
  }, [progress, routes, duration]);

  // Airports fade in early so routes draw onto visible dots.
  const dotsProps = useAnimatedProps(() => ({ opacity: interpolate(progress.value, [0, 0.12], [0, 1], Extrapolation.CLAMP) }));

  const [w, setW] = useState(0);
  const renderH = w > 0 ? Math.round((w * VIEW_H) / VIEW_W) : VIEW_H;

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ overflow: 'hidden', backgroundColor: OCEAN_DEEP, height: renderH }}
    >
      {w > 0 ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ width: w, height: renderH }}
          maximumZoomScale={6}
          minimumZoomScale={1}
          bouncesZoom
          pinchGestureEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <Svg width={w} height={renderH} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
            <Defs>
              <RadialGradient id="ocean-r" cx="50%" cy="44%" r="80%">
                <Stop offset="0" stopColor={OCEAN_GLOW} />
                <Stop offset="1" stopColor={OCEAN_DEEP} />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#ocean-r)" />
            {countryPaths.map((p) =>
              p.d ? <Path key={p.key} d={p.d} fill={LAND_UNVISITED} stroke={LAND_STROKE} strokeWidth={0.3} /> : null,
            )}
            {routes.map((r, i) => (
              <RouteLine key={r.key} d={r.d} length={r.length} order={i} count={routes.length} progress={progress} />
            ))}
            <AnimatedG animatedProps={dotsProps}>
              {dots.map((p, i) => (
                <Circle key={`d-${i}`} cx={p[0]} cy={p[1]} r={1.8} fill={ROUTE} stroke={ROUTE_EDGE} strokeWidth={0.6} />
              ))}
            </AnimatedG>
          </Svg>
        </ScrollView>
      ) : null}
      {segments.length === 0 ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
          <View className="rounded-2xl items-center justify-center" style={{ height: 48, width: 48, backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <Compass size={24} color="#fff" />
          </View>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 19, color: '#fff', marginTop: 12 }}>Where to next?</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: 'rgba(255,255,255,0.72)', textAlign: 'center', marginTop: 4, lineHeight: 18 }}>
            No journeys mapped here yet. Find your next destination and start planning the adventure.
          </Text>
          <Pressable
            onPress={() => router.push('/explore')}
            className="flex-row items-center rounded-full"
            style={{ marginTop: 16, backgroundColor: ROUTE, paddingHorizontal: 16, paddingVertical: 10, gap: 6 }}
          >
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '700', color: '#fff' }}>Find inspiration</Text>
            <ArrowRight size={15} color="#fff" />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

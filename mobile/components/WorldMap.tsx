import { useEffect, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import Svg, { Path, Rect, Defs, RadialGradient, Stop, G } from 'react-native-svg';
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
import { geoEqualEarth, geoPath } from 'd3-geo';
import { WORLD_FEATURES } from '../src/lib/worldGeo';

const AnimatedG = Animated.createAnimatedComponent(G);

const VIEW_W = 360;
const VIEW_H = 276;
const ZOOM = 1.16;

// Dark, luminous theme — discovered countries glow coral against a deep navy
// ocean so the map reads as the hero of the screen, not background texture.
const OCEAN_GLOW = '#243869';
const OCEAN_DEEP = '#0B1226';
const LAND_UNVISITED = '#2C3B63';
const LAND_STROKE = '#18233F';
const VISITED = '#FF6A8E';
const VISITED_EDGE = '#FFC2D2';
const WISHLIST = '#A48BFF';

/** One discovered country that lights up in sequence on open. */
function GlowCountry({
  d,
  code,
  order,
  count,
  progress,
  onPress,
}: {
  d: string;
  code?: string;
  order: number;
  count: number;
  progress: SharedValue<number>;
  onPress?: (code: string) => void;
}) {
  const animatedProps = useAnimatedProps(() => {
    // Each country fades+pops in over a window staggered across the timeline.
    const start = count > 1 ? (order / count) * 0.65 : 0;
    return { opacity: interpolate(progress.value, [start, start + 0.3], [0, 1], Extrapolation.CLAMP) };
  });
  return (
    <AnimatedG animatedProps={animatedProps}>
      <Path d={d} fill="none" stroke={VISITED} strokeWidth={2} strokeOpacity={0.35} strokeLinejoin="round" />
      <Path d={d} fill={VISITED} stroke={VISITED_EDGE} strokeWidth={0.4} onPress={code && onPress ? () => onPress(code) : undefined} />
    </AnimatedG>
  );
}

/** An Equal-Earth world map drawn with react-native-svg. Discovered countries
 *  glow coral on a deep navy ocean and light up west→east on open; wish-list
 *  countries lavender, the rest a muted navy land. Tap a country to open it. */
export function WorldMap({
  visited,
  wishlist,
  onPressCountry,
}: {
  visited: Set<string>;
  wishlist?: Set<string>;
  onPressCountry?: (code: string) => void;
}) {
  const { land, glow } = useMemo(() => {
    const projection = geoEqualEarth().fitSize([VIEW_W, VIEW_H], { type: 'Sphere' });
    projection.scale(projection.scale() * ZOOM).translate([VIEW_W / 2, VIEW_H * 0.49]);
    const path = geoPath(projection);
    const land: { key: string; d: string; fill: string; code?: string }[] = [];
    const glow: { key: string; d: string; code?: string; cx: number }[] = [];
    WORLD_FEATURES.forEach((wf, i) => {
      const d = path(wf.feature) ?? '';
      if (!d) return;
      const code = wf.alpha2;
      if (code && visited.has(code)) {
        glow.push({ key: `${code}-${i}`, d, code, cx: path.centroid(wf.feature)[0] || 0 });
      } else {
        land.push({ key: `${code ?? 'x'}-${i}`, d, fill: code && wishlist?.has(code) ? WISHLIST : LAND_UNVISITED, code });
      }
    });
    glow.sort((a, b) => a.cx - b.cx); // west → east reveal order
    return { land, glow };
  }, [visited, wishlist]);

  // Light-up ceremony on mount.
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(260, withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.ease) }));
  }, [progress, glow.length]);

  // Measure our width so the map fills it edge-to-edge at the right aspect.
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
              <RadialGradient id="ocean" cx="50%" cy="44%" r="80%">
                <Stop offset="0" stopColor={OCEAN_GLOW} />
                <Stop offset="1" stopColor={OCEAN_DEEP} />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#ocean)" />

            {/* land — unvisited + wish-list */}
            {land.map((p) => (
              <Path
                key={p.key}
                d={p.d}
                fill={p.fill}
                stroke={LAND_STROKE}
                strokeWidth={0.3}
                onPress={p.code && onPressCountry ? () => onPressCountry(p.code as string) : undefined}
              />
            ))}

            {/* discovered — glow in sequence */}
            {glow.map((p, i) => (
              <GlowCountry key={p.key} d={p.d} code={p.code} order={i} count={glow.length} progress={progress} onPress={onPressCountry} />
            ))}
          </Svg>
        </ScrollView>
      ) : null}
    </View>
  );
}

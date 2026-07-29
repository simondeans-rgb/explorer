import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { geoEqualEarth, geoPath, geoInterpolate } from 'd3-geo';
import { LAND_GEOMETRY } from '../src/lib/worldGeo';

const OCEAN = '#0E1630';
const LAND = '#26315A';
const ROUTE_DONE = '#FF6A55';
const ROUTE_TODO = 'rgba(255,255,255,0.35)';

/** A compact map of a single flight: the great-circle route with the flown
 *  portion highlighted, endpoints, and the aircraft at its current position
 *  (live when available, else estimated along the arc). Pure SVG + d3-geo, so
 *  it ships over the air. */
export function FlightRouteMap({
  from,
  to,
  position,
  progress,
  width,
  height,
  radius = 16,
}: {
  from: [number, number];
  to: [number, number];
  position?: [number, number];
  progress: number; // 0→1
  width: number;
  height: number;
  radius?: number;
}) {
  const { landPath, donePath, todoPath, fromXY, toXY, planeXY, planeAngle } = useMemo(() => {
    const interp = geoInterpolate(from, to);
    const N = 64;
    const arc: [number, number][] = Array.from({ length: N + 1 }, (_, i) => interp(i / N) as [number, number]);
    // Frame the projection on the route (plus a little padding) so it fills the tile.
    const line = { type: 'LineString' as const, coordinates: arc };
    const pad = 18;
    const projection = geoEqualEarth().fitExtent([[pad, pad], [width - pad, height - pad]], line);
    const path = geoPath(projection);

    const t = Math.max(0, Math.min(1, progress));
    const splitIdx = Math.round(t * N);
    const done = { type: 'LineString' as const, coordinates: arc.slice(0, Math.max(2, splitIdx + 1)) };
    const todo = { type: 'LineString' as const, coordinates: arc.slice(Math.max(0, splitIdx)) };

    const proj = (p: [number, number]) => projection(p) ?? [0, 0];
    const planePt = position ?? (interp(t) as [number, number]);
    const [px, py] = proj(planePt);
    // Heading: from a point just behind to just ahead along the arc.
    const ahead = proj(interp(Math.min(1, t + 0.02)) as [number, number]);
    const behind = proj(interp(Math.max(0, t - 0.02)) as [number, number]);
    const angle = (Math.atan2(ahead[1] - behind[1], ahead[0] - behind[0]) * 180) / Math.PI;

    return {
      landPath: path(LAND_GEOMETRY) ?? '',
      donePath: path(done) ?? '',
      todoPath: path(todo) ?? '',
      fromXY: proj(from),
      toXY: proj(to),
      planeXY: [px, py] as [number, number],
      planeAngle: angle,
    };
  }, [from, to, position, progress, width, height]);

  return (
    <View style={{ width, height, borderRadius: radius, overflow: 'hidden' }}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgGradient id="fr-ocean" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#16203E" />
            <Stop offset="1" stopColor={OCEAN} />
          </SvgGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#fr-ocean)" />
        {landPath ? <Path d={landPath} fill={LAND} /> : null}
        {todoPath ? <Path d={todoPath} fill="none" stroke={ROUTE_TODO} strokeWidth={2} strokeDasharray="4 5" strokeLinecap="round" /> : null}
        {donePath ? <Path d={donePath} fill="none" stroke={ROUTE_DONE} strokeWidth={2.5} strokeLinecap="round" /> : null}
        {/* endpoints */}
        <Circle cx={fromXY[0]} cy={fromXY[1]} r={4} fill="#fff" />
        <Circle cx={toXY[0]} cy={toXY[1]} r={4} fill="#fff" stroke={ROUTE_DONE} strokeWidth={2} />
        {/* aircraft */}
        <G x={planeXY[0]} y={planeXY[1]}>
          <G rotation={planeAngle}>
            <Circle cx={0} cy={0} r={9} fill="rgba(255,106,85,0.25)" />
            {/* simple plane glyph pointing +x (east); rotated to heading */}
            <Path d="M 8 0 L -5 -4 L -2 0 L -5 4 Z" fill="#fff" />
          </G>
        </G>
      </Svg>
    </View>
  );
}

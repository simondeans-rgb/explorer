import { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { geoEqualEarth, geoPath, geoInterpolate } from 'd3-geo';
import { WORLD_FEATURES, MAP_FILL_UNVISITED, MAP_STROKE } from '../src/lib/worldGeo';
import { COLORS } from '../src/lib/theme';
import type { Segment } from '../src/lib/journeyGeo';

const VIEW_W = 360;
const VIEW_H = 200;

/** An Equal-Earth world map with great-circle flight routes drawn over it,
 *  airline-route-map style. */
export function RouteMap({ segments }: { segments: Segment[] }) {
  const { countryPaths, routePaths, dots } = useMemo(() => {
    const projection = geoEqualEarth().fitSize([VIEW_W, VIEW_H], { type: 'Sphere' });
    const path = geoPath(projection);
    const countryPaths = WORLD_FEATURES.map((wf, i) => ({ key: `c-${i}`, d: path(wf.feature) ?? '' }));

    const routePaths: string[] = [];
    const dotSet = new Map<string, [number, number]>();
    for (const s of segments) {
      const interp = geoInterpolate(s.from, s.to);
      let d = '';
      let prevX: number | null = null;
      for (let i = 0; i <= 48; i++) {
        const p = projection(interp(i / 48) as [number, number]);
        if (!p) continue;
        // Break the line where it wraps across the map edge (antimeridian).
        if (prevX !== null && Math.abs(p[0] - prevX) > VIEW_W * 0.5) {
          d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)} `;
        } else {
          d += `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)} `;
        }
        prevX = p[0];
      }
      if (d) routePaths.push(d);
      const pf = projection(s.from);
      const pt = projection(s.to);
      if (pf) dotSet.set(pf.join(','), pf);
      if (pt) dotSet.set(pt.join(','), pt);
    }
    return { countryPaths, routePaths, dots: [...dotSet.values()] };
  }, [segments]);

  return (
    <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: '#F4F5FA' }}>
      <Svg width="100%" height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#F4F5FA" />
        {countryPaths.map((p) =>
          p.d ? <Path key={p.key} d={p.d} fill={MAP_FILL_UNVISITED} stroke={MAP_STROKE} strokeWidth={0.3} /> : null,
        )}
        {routePaths.map((d, i) => (
          <Path key={`r-${i}`} d={d} fill="none" stroke={COLORS.coral} strokeWidth={1.3} strokeOpacity={0.85} strokeLinecap="round" />
        ))}
        {dots.map((p, i) => (
          <Circle key={`d-${i}`} cx={p[0]} cy={p[1]} r={1.9} fill={COLORS.coral} stroke="#fff" strokeWidth={0.6} />
        ))}
      </Svg>
      {segments.length === 0 ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3 }}>No flights to map yet</Text>
        </View>
      ) : null}
    </View>
  );
}

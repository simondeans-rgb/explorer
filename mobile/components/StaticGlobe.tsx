import { memo, useMemo } from 'react';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { geoOrthographic, geoPath } from 'd3-geo';
import { LAND_GEOMETRY, BORDERS_GEOMETRY, WORLD_FEATURES } from '../src/lib/worldGeo';

// The Atlas globe's palette, so a still of the globe is unmistakably the same
// object people spin in the app.
const OCEAN_GLOW = '#1B3A6B';
const OCEAN_DEEP = '#0D1B2E';
const LAND = '#37836B';
const LAND_STROKE = '#5FC0A2';
const VISITED = '#FF6B9A';
const VISITED_EDGE = '#FFC2D2';

/** A still of the Worldly globe facing `centre` ([lng, lat]) with the visited
 *  countries lit — no gestures or animation, for posters and share cards. */
function StaticGlobeInner({ size, visited, centre, id = 'sg' }: { size: number; visited: Set<string>; centre: [number, number]; id?: string }) {
  const { land, borders, fills, r } = useMemo(() => {
    const r = size / 2 - Math.max(3, size * 0.03);
    const projection = geoOrthographic().translate([size / 2, size / 2]).scale(r).rotate([-centre[0], -centre[1], 0]).clipAngle(90);
    const path = geoPath(projection);
    const fills: string[] = [];
    for (const wf of WORLD_FEATURES) {
      if (!wf.alpha2 || !visited.has(wf.alpha2)) continue;
      const d = path(wf.feature as unknown as GeoJSON.Feature);
      if (d) fills.push(d);
    }
    return { land: path(LAND_GEOMETRY) ?? '', borders: path(BORDERS_GEOMETRY) ?? '', fills, r };
  }, [size, visited, centre]);
  const c = size / 2;
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id={`${id}-ocean`} cx="42%" cy="36%" r="72%">
          <Stop offset="0" stopColor={OCEAN_GLOW} />
          <Stop offset="1" stopColor={OCEAN_DEEP} />
        </RadialGradient>
        <RadialGradient id={`${id}-atmo`} cx="50%" cy="50%" r="50%">
          <Stop offset="0.84" stopColor="#6E8BFF" stopOpacity="0" />
          <Stop offset="1" stopColor="#6E8BFF" stopOpacity="0.55" />
        </RadialGradient>
        <RadialGradient id={`${id}-shade`} cx="36%" cy="30%" r="78%">
          <Stop offset="0.5" stopColor="#000010" stopOpacity="0" />
          <Stop offset="1" stopColor="#000010" stopOpacity="0.5" />
        </RadialGradient>
      </Defs>
      <Circle cx={c} cy={c} r={c} fill={`url(#${id}-atmo)`} />
      <Circle cx={c} cy={c} r={r} fill={`url(#${id}-ocean)`} />
      {land ? <Path d={land} fill={LAND} stroke={LAND_STROKE} strokeWidth={0.5} /> : null}
      {fills.map((d, i) => (
        <Path key={i} d={d} fill={VISITED} stroke={VISITED_EDGE} strokeWidth={0.4} strokeOpacity={0.6} />
      ))}
      {borders ? <Path d={borders} fill="none" stroke="rgba(190,230,215,0.28)" strokeWidth={0.4} /> : null}
      <Circle cx={c} cy={c} r={r} fill={`url(#${id}-shade)`} />
    </Svg>
  );
}

export const StaticGlobe = memo(StaticGlobeInner);

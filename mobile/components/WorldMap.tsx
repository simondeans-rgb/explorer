import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { geoEqualEarth, geoPath } from 'd3-geo';
import {
  WORLD_FEATURES,
  MAP_FILL_UNVISITED,
  MAP_FILL_VISITED,
  MAP_FILL_WISHLIST,
  MAP_STROKE,
} from '../src/lib/worldGeo';

const VIEW_W = 360;
const VIEW_H = 200;

/** An Equal-Earth world map drawn with react-native-svg. Discovered countries
 *  glow coral, wish-list countries lavender, the rest a soft grey. Tap a
 *  country to open it. */
export function WorldMap({
  visited,
  wishlist,
  onPressCountry,
}: {
  visited: Set<string>;
  wishlist?: Set<string>;
  onPressCountry?: (code: string) => void;
}) {
  const paths = useMemo(() => {
    // Fit the whole world into our viewBox, then render each country to a path.
    const projection = geoEqualEarth().fitSize(
      [VIEW_W, VIEW_H],
      { type: 'Sphere' },
    );
    const path = geoPath(projection);
    return WORLD_FEATURES.map((wf, i) => {
      const d = path(wf.feature) ?? '';
      const code = wf.alpha2;
      const fill =
        code && visited.has(code)
          ? MAP_FILL_VISITED
          : code && wishlist?.has(code)
            ? MAP_FILL_WISHLIST
            : MAP_FILL_UNVISITED;
      return { key: `${code ?? 'x'}-${i}`, d, fill, code };
    });
  }, [visited, wishlist]);

  return (
    <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: '#F4F5FA' }}>
      <Svg width="100%" height={VIEW_H} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
        <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#F4F5FA" />
        {paths.map((p) =>
          p.d ? (
            <Path
              key={p.key}
              d={p.d}
              fill={p.fill}
              stroke={MAP_STROKE}
              strokeWidth={0.3}
              onPress={p.code && onPressCountry ? () => onPressCountry(p.code as string) : undefined}
            />
          ) : null,
        )}
      </Svg>
    </View>
  );
}

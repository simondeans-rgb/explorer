// Native world geometry: the same `world-atlas` topology the web app uses,
// turned into SVG path strings via d3-geo so react-native-svg can draw it.
import { feature, merge } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import worldRaw from 'world-atlas/countries-110m.json';
import { COUNTRIES } from '../data/countries';

// world-atlas topology (numeric ISO ids + country names). Typed loosely — the
// package ships no types and topojson consumes the raw object.
const worldTopology = worldRaw as unknown as Parameters<typeof feature>[0];

const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[.’']/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const byName: Record<string, string> = {};
for (const c of COUNTRIES) byName[norm(c.name)] = c.code;

// A handful of 110m names use abbreviations that don't match our country list.
const NAME_OVERRIDES: Record<string, string> = {
  'United States of America': 'US',
  'Dem. Rep. Congo': 'CD',
  'Dominican Rep.': 'DO',
  'Falkland Is.': 'FK',
  "Côte d'Ivoire": 'CI',
  'Central African Rep.': 'CF',
  'Eq. Guinea': 'GQ',
  'Solomon Is.': 'SB',
  'Bosnia and Herz.': 'BA',
  Macedonia: 'MK',
  'S. Sudan': 'SS',
  'W. Sahara': 'EH',
};

export function geoAlpha2(name: string | undefined): string | undefined {
  if (!name) return undefined;
  return NAME_OVERRIDES[name] ?? byName[norm(name)];
}

export interface WorldFeature {
  feature: Feature<Geometry>;
  alpha2?: string;
}

/** Every country polygon in the simplified world set, paired with our alpha-2
 *  code where we recognise it. */
export const WORLD_FEATURES: WorldFeature[] = (() => {
  const collection = feature(
    worldTopology,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (worldTopology as any).objects.countries,
  ) as unknown as { features: Feature<Geometry>[] };
  return collection.features.map((f) => ({
    feature: f,
    alpha2: geoAlpha2((f.properties as { name?: string } | null)?.name),
  }));
})();

/** All land merged into a single geometry — one path per frame, cheap enough
 *  to re-project every frame while the journey globe spins. */
export const LAND_GEOMETRY: Geometry = (() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = (worldTopology as any).objects.countries;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return merge(worldTopology as any, obj.geometries) as Geometry;
})();

// Map palette. High contrast so discovered countries pop against the rest:
// a deep, saturated coral on a near-white world.
export const MAP_FILL_UNVISITED = '#E9EBF2';
export const MAP_FILL_VISITED = '#FB3E6E';
export const MAP_FILL_WISHLIST = '#9B7CFF';
export const MAP_STROKE = '#FFFFFF';
export const MAP_OCEAN = '#F6F7FB';

import { geoCentroid } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import worldRaw from 'world-atlas/countries-110m.json';
import { COUNTRIES } from '../data/countries';

// world-atlas topology (numeric ISO ids + country names). Typed loosely — the
// package ships no types and react-simple-maps consumes the raw object.
export const worldTopology = worldRaw as unknown as Parameters<
  typeof feature
>[0];

// Map a topojson country name to our ISO 3166-1 alpha-2 code. Most match by
// name; a handful in the 110m set use abbreviated names and need overrides.
const norm = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[.’']/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const byName: Record<string, string> = {};
for (const c of COUNTRIES) byName[norm(c.name)] = c.code;

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

// Precompute a representative point (centroid) per country, for drawing routes.
export const centroidByAlpha2: Record<string, [number, number]> = {};
{
  const collection = feature(
    worldTopology,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (worldTopology as any).objects.countries,
  ) as unknown as { features: Feature<Geometry>[] };
  for (const f of collection.features) {
    const name = (f.properties as { name?: string } | null)?.name;
    const code = geoAlpha2(name);
    if (code && !centroidByAlpha2[code]) {
      centroidByAlpha2[code] = geoCentroid(f) as [number, number];
    }
  }
  // City-states / territories absent from the simplified country set, so their
  // route lines still draw. [lng, lat].
  const FALLBACK: Record<string, [number, number]> = {
    HK: [114.1, 22.35],
    MO: [113.55, 22.2],
    SG: [103.82, 1.35],
    BH: [50.55, 26.05],
    MT: [14.42, 35.9],
    LU: [6.13, 49.78],
    GI: [-5.35, 36.14],
    MC: [7.42, 43.74],
  };
  for (const [k, v] of Object.entries(FALLBACK)) {
    if (!centroidByAlpha2[k]) centroidByAlpha2[k] = v;
  }
}

/** Brand palette for the maps. */
export const MAP_FILL_VISITED = '#E8C97A'; // Pale Gold
export const MAP_FILL_UNVISITED_LIGHT = '#EDE6D4'; // Cartridge, slightly toned
export const MAP_FILL_UNVISITED_DARK = '#16233a';
export const MAP_STROKE_LIGHT = '#D8CEB4';
export const MAP_STROKE_DARK = '#24344f';

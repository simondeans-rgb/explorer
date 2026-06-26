// Offline reverse geocoding: lat/lng -> ISO country code, using the bundled
// world-atlas country polygons (no network, no OS geocoder, no rate limits).
//
// Uses the 50m resolution (not the 110m set the map renders): at 110m, small
// islands such as Cozumel fall outside the simplified coastline entirely, so a
// genuine Mexico photo there would resolve to nothing. 50m includes those
// islands while staying light enough to parse once at scan time.
import { geoContains, geoCentroid, geoBounds, geoDistance } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import world50 from 'world-atlas/countries-50m.json';
import { geoAlpha2 } from './worldGeo';

interface Feat {
  code: string;
  feature: GeoJSON.Feature;
  bounds: [[number, number], [number, number]];
  centroid: [number, number];
}

const FEATS: Feat[] = (() => {
  const collection = feature(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    world50 as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (world50 as any).objects.countries,
  ) as unknown as { features: Feature<Geometry>[] };
  const out: Feat[] = [];
  for (const f of collection.features) {
    const code = geoAlpha2((f.properties as { name?: string } | null)?.name);
    if (!code) continue;
    out.push({
      code,
      feature: f as unknown as GeoJSON.Feature,
      bounds: geoBounds(f) as [[number, number], [number, number]],
      centroid: geoCentroid(f) as [number, number],
    });
  }
  return out;
})();

function inBounds(b: [[number, number], [number, number]], lng: number, lat: number): boolean {
  const [[w, s], [e, n]] = b;
  if (lat < s - 0.5 || lat > n + 0.5) return false;
  if (w <= e) return lng >= w - 0.5 && lng <= e + 0.5;
  // bounding box crosses the antimeridian
  return lng >= w - 0.5 || lng <= e + 0.5;
}

/** Country code containing the point, or the nearest one within ~190 km
 *  (so coastal/island photos just offshore still resolve). */
export function countryAt(lng: number, lat: number): string | undefined {
  const pt: [number, number] = [lng, lat];
  for (const f of FEATS) {
    if (inBounds(f.bounds, lng, lat) && geoContains(f.feature, pt)) return f.code;
  }
  let best: { code: string; d: number } | undefined;
  for (const f of FEATS) {
    const d = geoDistance(f.centroid, pt);
    if (!best || d < best.d) best = { code: f.code, d };
  }
  return best && best.d < 0.03 ? best.code : undefined;
}

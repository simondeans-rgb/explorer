// Offline reverse geocoding: lat/lng -> ISO country code, using the bundled
// world-atlas country polygons (no network, no OS geocoder, no rate limits).
import { geoContains, geoCentroid, geoBounds, geoDistance } from 'd3-geo';
import { WORLD_FEATURES } from './worldGeo';

interface Feat {
  code: string;
  feature: GeoJSON.Feature;
  bounds: [[number, number], [number, number]];
  centroid: [number, number];
}

const FEATS: Feat[] = WORLD_FEATURES.filter((f) => f.alpha2).map((f) => ({
  code: f.alpha2!,
  feature: f.feature as unknown as GeoJSON.Feature,
  bounds: geoBounds(f.feature) as [[number, number], [number, number]],
  centroid: geoCentroid(f.feature) as [number, number],
}));

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

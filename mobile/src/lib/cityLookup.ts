// Offline GPS → city matching for the photo scan. Nearest-city lookup over the
// bundled GeoNames-derived dataset (data/cities.ts), so a geotagged photo can
// say "Barcelona", not just "Spain" — no network, no OS geocoder rate limits.
//
// Matching rule: nearest city whose distance is within that city's own radius
// (bigger cities cast a wider net, so suburbs and airports still count).
// Parsed lazily and bucketed into a 1° grid; the first call pays ~a few ms.
import { CITIES_TSV } from '../data/cities';

interface City {
  name: string;
  lat: number;
  lng: number;
  country: string;
  radiusKm: number;
}

let grid: Map<string, City[]> | null = null;

function cellKey(lat: number, lng: number): string {
  return `${Math.floor(lat)},${Math.floor(lng)}`;
}

function load(): Map<string, City[]> {
  if (grid) return grid;
  grid = new Map();
  for (const line of CITIES_TSV.split('\n')) {
    const [name, latS, lngS, country, rS] = line.split('\t');
    if (!name || !country) continue;
    const lat = Number(latS);
    const lng = Number(lngS);
    const radiusKm = Number(rS);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const c: City = { name, lat, lng, country, radiusKm };
    const k = cellKey(lat, lng);
    const bucket = grid.get(k) ?? [];
    bucket.push(c);
    grid.set(k, bucket);
  }
  return grid;
}

/** Fast approximate distance in km — fine at city scales. */
function distKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * 111.32;
  const dLng = (lng2 - lng1) * 111.32 * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

export interface CityMatch {
  name: string;
  countryCode: string;
}

/** The city this coordinate falls in, or null when it isn't near one. Pass
 *  `countryCode` (from the polygon lookup) to keep border-town photos from
 *  matching a city across the frontier. */
export function cityAt(lng: number, lat: number, countryCode?: string): CityMatch | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const g = load();
  let best: City | null = null;
  let bestScore = Infinity;
  const la = Math.floor(lat);
  const lo = Math.floor(lng);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const bucket = g.get(`${la + dy},${lo + dx}`);
      if (!bucket) continue;
      for (const c of bucket) {
        if (countryCode && c.country !== countryCode) continue;
        const d = distKm(lat, lng, c.lat, c.lng);
        if (d > c.radiusKm) continue;
        // Rank by absolute depth inside the radius (km past the edge): a photo
        // at Heathrow is "London", not the small town next door — while a
        // distinct satellite city (Versailles vs Paris) still wins at its own
        // centre because the metropolis is shallow there.
        const score = d - c.radiusKm;
        if (score < bestScore) {
          bestScore = score;
          best = c;
        }
      }
    }
  }
  return best ? { name: best.name, countryCode: best.country } : null;
}

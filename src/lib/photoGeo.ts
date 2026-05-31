// Import countries & cities from the GPS metadata baked into phone photos.
//
// Everything here runs on-device: we read only the EXIF header of each chosen
// image (never upload it), pull the GPS coordinates, and reverse-geocode them
// against data the app already ships — the world-atlas country polygons (via
// d3-geo point-in-polygon) for the country, and the airport/city coordinate
// table for the nearest city. No network calls, no third-party services.

import { geoBounds, geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import { countryName } from '../data/countries';
import { ALL_AIRPORTS } from '../data/airports';
import { AIRPORT_COORDS } from '../data/airportCoords';
import { DISCOVERY_RELATIONSHIPS, type Place, type Relationship } from '../types';
import { createPlace, updatePlace, type PlaceInput } from './places';
import { geoAlpha2, worldTopology } from './worldGeo';

// ── EXIF GPS reader ─────────────────────────────────────────────────────────
export interface PhotoLocation {
  lat: number;
  lng: number;
  year?: number;
}

const TYPE_SIZE: Record<number, number> = {
  1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8,
};

interface Entry {
  type: number;
  count: number;
  valueOffset: number; // absolute offset into the DataView of the value bytes
}

function readIfd(
  view: DataView,
  ifdAbs: number,
  tiff: number,
  le: boolean,
): Record<number, Entry> {
  const out: Record<number, Entry> = {};
  if (ifdAbs < 0 || ifdAbs + 2 > view.byteLength) return out;
  const n = view.getUint16(ifdAbs, le);
  let p = ifdAbs + 2;
  for (let i = 0; i < n; i++) {
    if (p + 12 > view.byteLength) break;
    const tag = view.getUint16(p, le);
    const type = view.getUint16(p + 2, le);
    const count = view.getUint32(p + 4, le);
    const size = (TYPE_SIZE[type] ?? 1) * count;
    const valueOffset =
      size <= 4 ? p + 8 : tiff + view.getUint32(p + 8, le);
    out[tag] = { type, count, valueOffset };
    p += 12;
  }
  return out;
}

function rationals(view: DataView, e: Entry, le: boolean): number[] {
  const r: number[] = [];
  for (let i = 0; i < e.count; i++) {
    const off = e.valueOffset + i * 8;
    if (off + 8 > view.byteLength) break;
    const num = view.getUint32(off, le);
    const den = view.getUint32(off + 4, le);
    r.push(den ? num / den : 0);
  }
  return r;
}

function ascii(view: DataView, e: Entry): string {
  let s = '';
  for (let i = 0; i < e.count; i++) {
    const off = e.valueOffset + i;
    if (off >= view.byteLength) break;
    const c = view.getUint8(off);
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s;
}

function ptr(view: DataView, e: Entry | undefined, tiff: number, le: boolean): number {
  if (!e || e.valueOffset + 4 > view.byteLength) return -1;
  return tiff + view.getUint32(e.valueOffset, le);
}

function parseTiff(view: DataView, tiff: number): PhotoLocation | null {
  if (tiff + 8 > view.byteLength) return null;
  const order = view.getUint16(tiff, false);
  const le = order === 0x4949; // 'II' little-endian, 'MM' big-endian
  if (!le && order !== 0x4d4d) return null;
  if (view.getUint16(tiff + 2, le) !== 0x002a) return null;

  const ifd0 = tiff + view.getUint32(tiff + 4, le);
  const root = readIfd(view, ifd0, tiff, le);

  const gps = readIfd(view, ptr(view, root[0x8825], tiff, le), tiff, le);
  const latE = gps[0x0002];
  const lngE = gps[0x0004];
  if (!latE || !lngE) return null;
  const lat = rationals(view, latE, le);
  const lng = rationals(view, lngE, le);
  if (lat.length < 3 || lng.length < 3) return null;
  let latDeg = lat[0] + lat[1] / 60 + lat[2] / 3600;
  let lngDeg = lng[0] + lng[1] / 60 + lng[2] / 3600;
  if (ascii(view, gps[0x0001] ?? latE).toUpperCase().startsWith('S')) latDeg = -latDeg;
  if (ascii(view, gps[0x0003] ?? lngE).toUpperCase().startsWith('W')) lngDeg = -lngDeg;
  if (!Number.isFinite(latDeg) || !Number.isFinite(lngDeg)) return null;
  if (latDeg === 0 && lngDeg === 0) return null; // null-island = no real fix
  if (Math.abs(latDeg) > 90 || Math.abs(lngDeg) > 180) return null;

  // Year, from DateTimeOriginal (EXIF sub-IFD) or DateTime (IFD0).
  let year: number | undefined;
  const exif = readIfd(view, ptr(view, root[0x8769], tiff, le), tiff, le);
  const dt = exif[0x9003] ?? root[0x0132];
  if (dt) {
    const y = Number(ascii(view, dt).slice(0, 4));
    if (y >= 1900 && y <= 2200) year = y;
  }
  return { lat: latDeg, lng: lngDeg, year };
}

/** Read GPS from a JPEG's EXIF header. Returns null when the image carries no
 *  location (or isn't a JPEG). Only the file's head is read, never the pixels. */
export async function readPhotoLocation(file: File): Promise<PhotoLocation | null> {
  try {
    const head = await file.slice(0, 1024 * 1024).arrayBuffer();
    const view = new DataView(head);
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return null;
    let offset = 2;
    while (offset + 4 <= view.byteLength) {
      const marker = view.getUint16(offset, false);
      if ((marker & 0xff00) !== 0xff00) break;
      if (marker === 0xffda) break; // start of scan — pixel data, stop
      const size = view.getUint16(offset + 2, false);
      if (marker === 0xffe1) {
        const start = offset + 4;
        if (
          start + 6 <= view.byteLength &&
          view.getUint32(start, false) === 0x45786966 && // 'Exif'
          view.getUint16(start + 4, false) === 0x0000
        ) {
          const loc = parseTiff(view, start + 6);
          if (loc) return loc;
        }
      }
      offset += 2 + size;
    }
  } catch {
    /* unreadable / truncated — treat as no location */
  }
  return null;
}

// ── Offline reverse geocoding ────────────────────────────────────────────────
interface CountryShape {
  code: string;
  feature: Feature<Geometry>;
  bounds: [[number, number], [number, number]];
  crosses: boolean; // bbox straddles the antimeridian
}

let shapes: CountryShape[] | null = null;
function countryShapes(): CountryShape[] {
  if (shapes) return shapes;
  const collection = feature(
    worldTopology,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (worldTopology as any).objects.countries,
  ) as unknown as { features: Feature<Geometry>[] };
  shapes = [];
  for (const f of collection.features) {
    const code = geoAlpha2((f.properties as { name?: string } | null)?.name);
    if (!code) continue;
    const b = geoBounds(f) as [[number, number], [number, number]];
    shapes.push({ code, feature: f, bounds: b, crosses: b[0][0] > b[1][0] });
  }
  return shapes;
}

/** ISO 3166-1 alpha-2 of the country containing a point, or undefined. */
export function countryAt(lng: number, lat: number): string | undefined {
  for (const s of countryShapes()) {
    const [[w, south], [e, north]] = s.bounds;
    if (lat < south || lat > north) continue;
    if (!s.crosses && (lng < w || lng > e)) continue;
    if (geoContains(s.feature, [lng, lat])) return s.code;
  }
  return undefined;
}

interface CitySite {
  country: string;
  city: string;
  lng: number;
  lat: number;
}

let cities: CitySite[] | null = null;
function citySites(): CitySite[] {
  if (cities) return cities;
  const seen = new Set<string>();
  cities = [];
  for (const a of ALL_AIRPORTS) {
    const co = AIRPORT_COORDS[a.iata];
    if (!co) continue;
    const key = `${a.country}|${a.city.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cities.push({ country: a.country, city: a.city, lng: co[0], lat: co[1] });
  }
  return cities;
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Nearest known city to a point, within `maxKm`, else undefined. */
export function nearestCity(
  lng: number,
  lat: number,
  maxKm = 65,
): CitySite | undefined {
  const margin = maxKm / 111 + 0.5; // ~deg of latitude to pre-filter on
  let best: CitySite | undefined;
  let bestD = Infinity;
  for (const c of citySites()) {
    if (Math.abs(c.lat - lat) > margin) continue;
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return bestD <= maxKm ? best : undefined;
}

export interface ResolvedPhoto {
  country?: string;
  city?: string;
  year?: number;
}

/** Turn raw coordinates into a country (polygon) and, when close enough, a
 *  city. The polygon wins for the country; a city in a different country than
 *  the polygon is dropped to avoid border mismatches. */
export function resolveLocation(loc: PhotoLocation): ResolvedPhoto {
  const polygon = countryAt(loc.lng, loc.lat);
  const near = nearestCity(loc.lng, loc.lat);
  const country = polygon ?? near?.country;
  const city = near && (!polygon || near.country === polygon) ? near.city : undefined;
  return { country, city, year: loc.year };
}

// ── Plan ─────────────────────────────────────────────────────────────────────
export interface PhotoCountry {
  code: string;
  name: string;
  year?: number;
  cities: string[];
}

export interface PhotoPlan {
  placeCreates: PlaceInput[];
  placeUpdates: { id: string; input: PlaceInput }[];
  countries: PhotoCountry[];
  stats: {
    photos: number;
    located: number;
    noLocation: number;
    countries: number;
    cities: number;
    newCountries: number;
    newCities: number;
  };
}

function mergeRelationships(rels: Relationship[]): Relationship[] {
  const kept = rels.filter((r) => r !== 'aspiring');
  if (!kept.some((r) => DISCOVERY_RELATIONSHIPS.includes(r))) kept.push('visited');
  return kept;
}

const earlier = (a: number | undefined, b: number | undefined): number | undefined =>
  a == null ? b : b == null ? a : Math.min(a, b);

export function buildPhotoPlan(
  resolved: ResolvedPhoto[],
  existingPlaces: Place[],
  photoCount: number,
): PhotoPlan {
  const located = resolved.filter((r) => r.country);

  const countryYear = new Map<string, number | undefined>();
  const cityInfo = new Map<
    string,
    { country: string; city: string; year?: number }
  >();
  for (const r of located) {
    const code = r.country!;
    countryYear.set(code, earlier(countryYear.get(code), r.year));
    if (r.city) {
      const key = `${code}|${r.city.toLowerCase()}`;
      const prev = cityInfo.get(key);
      cityInfo.set(key, {
        country: code,
        city: r.city,
        year: earlier(prev?.year, r.year),
      });
    }
  }

  const placeCreates: PlaceInput[] = [];
  const placeUpdates: { id: string; input: PlaceInput }[] = [];

  for (const [code, year] of countryYear) {
    const existing = existingPlaces.find(
      (p) => p.kind === 'country' && p.countryCode === code,
    );
    if (!existing) {
      placeCreates.push({
        kind: 'country',
        countryCode: code,
        name: countryName(code),
        relationships: ['visited'],
        firstYear: year,
      });
      continue;
    }
    const rels = mergeRelationships(existing.relationships);
    const firstYear = earlier(existing.firstYear, year);
    if (
      rels.length !== existing.relationships.length ||
      firstYear !== existing.firstYear
    ) {
      placeUpdates.push({
        id: existing.id,
        input: {
          kind: 'country',
          countryCode: code,
          name: existing.name,
          relationships: rels,
          firstYear,
          note: existing.note,
        },
      });
    }
  }

  for (const { country, city, year } of cityInfo.values()) {
    const existing = existingPlaces.find(
      (p) =>
        p.kind === 'city' &&
        p.countryCode === country &&
        p.name.trim().toLowerCase() === city.toLowerCase(),
    );
    if (!existing) {
      placeCreates.push({
        kind: 'city',
        countryCode: country,
        name: city,
        relationships: ['visited'],
        firstYear: year,
      });
      continue;
    }
    const rels = mergeRelationships(existing.relationships);
    const firstYear = earlier(existing.firstYear, year);
    if (
      rels.length !== existing.relationships.length ||
      firstYear !== existing.firstYear
    ) {
      placeUpdates.push({
        id: existing.id,
        input: {
          kind: 'city',
          countryCode: country,
          name: existing.name,
          relationships: rels,
          firstYear,
          note: existing.note,
        },
      });
    }
  }

  // Preview list — every detected country with its cities and earliest year.
  const citiesByCountry = new Map<string, string[]>();
  for (const { country, city } of cityInfo.values()) {
    citiesByCountry.set(country, [...(citiesByCountry.get(country) ?? []), city]);
  }
  const countries: PhotoCountry[] = [...countryYear.entries()]
    .map(([code, year]) => ({
      code,
      name: countryName(code),
      year,
      cities: (citiesByCountry.get(code) ?? []).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    placeCreates,
    placeUpdates,
    countries,
    stats: {
      photos: photoCount,
      located: located.length,
      noLocation: photoCount - located.length,
      countries: countryYear.size,
      cities: cityInfo.size,
      newCountries: placeCreates.filter((p) => p.kind === 'country').length,
      newCities: placeCreates.filter((p) => p.kind === 'city').length,
    },
  };
}

export interface PhotoImportResult {
  total: number;
  failed: number;
}

/** Write the plan's place creates/updates, with bounded concurrency so one bad
 *  write can't stall the rest. Mirrors flightyImport.applyImportPlan. */
export async function applyPhotoPlan(
  userId: string,
  plan: PhotoPlan,
  onProgress?: (done: number, total: number) => void,
): Promise<PhotoImportResult> {
  const tasks: Array<() => Promise<unknown>> = [
    ...plan.placeCreates.map((input) => () => createPlace(userId, input)),
    ...plan.placeUpdates.map(({ id, input }) => () => updatePlace(id, input)),
  ];
  const total = tasks.length;
  let done = 0;
  let failed = 0;
  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        await task();
      } catch {
        failed++;
      }
      onProgress?.(++done, total);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(8, tasks.length) }, worker),
  );
  return { total, failed };
}

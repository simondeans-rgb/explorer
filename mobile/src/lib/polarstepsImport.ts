// Polarsteps → Worldly trips + places.
//
// Polarsteps' data export (Account → Download your data) is a ZIP; the useful
// file per trip is `trip.json`. Each trip has a name, start/end dates (unix
// seconds) and an `all_steps` array of stops, each with a `location`
// (country_code, detail, name) and a `start_time`. We can't unzip on-device
// without a heavy dependency, so the user picks the extracted `trip.json`
// (or an array / { trips: [] } of them). We map steps to visited countries +
// cities and each Polarsteps trip to a Worldly trip. Client-side only.
import { countryName } from '../data/countries';
import { COUNTRY_BY_CODE } from '../data/countries';
import { matchCountry, scanCountries } from './listImport';
import type { PlaceRow, ExpeditionRow } from './flightyImport';

export interface PolarstepsResult {
  places: PlaceRow[];
  expeditions: ExpeditionRow[];
  stepCount: number;
}

const STR = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
const NUM = (v: unknown): number | undefined => (typeof v === 'number' && isFinite(v) ? v : undefined);

/** Unix seconds (Polarsteps) or ms → YYYY-MM-DD. */
function isoDate(unix?: number): string | undefined {
  if (!unix) return undefined;
  const ms = unix > 1e12 ? unix : unix * 1000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function tripsOf(data: unknown): Record<string, unknown>[] {
  const asTrip = (o: unknown): Record<string, unknown> | null => {
    const t = o as Record<string, unknown>;
    return t && (Array.isArray(t.all_steps) || Array.isArray(t.steps)) ? t : null;
  };
  if (Array.isArray(data)) return data.map(asTrip).filter(Boolean) as Record<string, unknown>[];
  const d = data as Record<string, unknown>;
  const single = asTrip(d);
  if (single) return [single];
  const list = (Array.isArray(d.trips) ? d.trips : Array.isArray(d.alltrips) ? d.alltrips : []) as unknown[];
  return list.map(asTrip).filter(Boolean) as Record<string, unknown>[];
}

export function parsePolarsteps(text: string): PolarstepsResult {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return { places: [], expeditions: [], stepCount: 0 };
  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch {
    return { places: [], expeditions: [], stepCount: 0 };
  }

  const places: PlaceRow[] = [];
  const countryRow = new Map<string, PlaceRow>();
  const seenCity = new Set<string>();
  const expeditions: ExpeditionRow[] = [];
  let stepCount = 0;

  // Record a visited country, keeping the *earliest* year seen across all trips
  // (a country can appear in several) so it lands on the map in the right year.
  const addCountry = (code: string, year?: number) => {
    const existing = countryRow.get(code);
    if (!existing) {
      const row: PlaceRow = { kind: 'country', countryCode: code, firstYear: year };
      countryRow.set(code, row);
      places.push(row);
    } else if (year !== undefined && (existing.firstYear === undefined || year < existing.firstYear)) {
      existing.firstYear = year;
    }
  };

  for (const trip of tripsOf(data)) {
    const steps = (Array.isArray(trip.all_steps) ? trip.all_steps : trip.steps) as unknown[];
    const tripCodes = new Set<string>();
    let earliest: number | undefined;
    let latest: number | undefined;

    for (const st of steps ?? []) {
      const step = st as Record<string, unknown>;
      const loc = (step.location ?? {}) as Record<string, unknown>;
      const cc = STR(loc.country_code) ?? STR(loc.countryCode);
      // country_code when present, else read it out of the "City, Country" detail
      const detail = STR(loc.detail) ?? STR(loc.full_detail);
      const code =
        cc && cc.length === 2 && COUNTRY_BY_CODE[cc.toUpperCase()]
          ? cc.toUpperCase()
          : detail
            ? matchCountry(detail.split(',').pop()!.trim())
            : undefined;
      const when = NUM(step.start_time) ?? NUM(step.startTime);
      if (when) {
        earliest = earliest === undefined ? when : Math.min(earliest, when);
        latest = latest === undefined ? when : Math.max(latest, when);
      }
      if (!code) continue;
      stepCount += 1;
      const year = isoDate(when)?.slice(0, 4);
      addCountry(code, year ? Number(year) : undefined);
      tripCodes.add(code);
      const city = STR(loc.name);
      if (city && !/^[\d.,\s-]+$/.test(city)) {
        const key = `${code}|${city.toLowerCase()}`;
        if (!seenCity.has(key)) {
          seenCity.add(key);
          places.push({ kind: 'city', countryCode: code, name: city, firstYear: year ? Number(year) : undefined });
        }
      }
    }

    // Fallback for trips with no geocoded steps (a common case in exports): read
    // the country from the trip name / summary so an empty "Spain" trip still
    // lands Spain — and a compound "USA & Mexico" lands both.
    if (!tripCodes.size) {
      const name = STR(trip.name) ?? '';
      for (const part of name.split(/[,&/+]|\band\b/i).map((s) => s.trim()).filter(Boolean)) {
        const c = matchCountry(part);
        if (c) tripCodes.add(c);
      }
      if (!tripCodes.size) for (const c of scanCountries(`${name} ${STR(trip.summary) ?? ''}`)) tripCodes.add(c);
    }

    if (tripCodes.size) {
      const startDate = isoDate(NUM(trip.start_date) ?? earliest);
      const endDate = isoDate(NUM(trip.end_date) ?? latest);
      const year = startDate ? Number(startDate.slice(0, 4)) : undefined;
      const codes = [...tripCodes];
      for (const c of codes) addCountry(c, year);
      const title = STR(trip.name) ?? (codes[0] ? countryName(codes[0]) : undefined) ?? 'Polarsteps trip';
      expeditions.push({ title, startDate, endDate, countryCodes: codes, journeys: [] });
    }
  }

  return { places, expeditions, stepCount };
}

/** Parse a Polarsteps data-export ZIP directly (base64) — pulls every
 *  trip.json out of the archive's trip folders and runs them through
 *  parsePolarsteps, so the user can just pick the .zip Polarsteps gave them. */
export async function parsePolarstepsZip(base64: string): Promise<PolarstepsResult> {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(base64, { base64: true });
  const trips: unknown[] = [];
  for (const name of Object.keys(zip.files)) {
    if (!/(^|\/)trip\.json$/i.test(name) || zip.files[name].dir) continue;
    try {
      trips.push(JSON.parse(await zip.files[name].async('string')));
    } catch {
      /* skip an unreadable trip file */
    }
  }
  return parsePolarsteps(JSON.stringify(trips));
}

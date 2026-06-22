// Flighty CSV import (native). A pragmatic port of the web importer: parse the
// CSV, turn each flight's airports into visited countries + cities, and group
// consecutive flights into trips (expeditions) with flight journeys so they
// appear on the journeys route map.
import { airportInfo } from '../data/airports';
import { countryName } from '../data/countries';
import { isHome, type HomeRange } from './residence';
import type { Journey, PlaceKind, Expedition } from '../types';

export interface PlaceRow {
  kind: PlaceKind;
  countryCode: string;
  name?: string;
  firstYear?: number;
}
export interface ExpeditionRow {
  title: string;
  startDate?: string;
  endDate?: string;
  countryCodes: string[];
  journeys: Journey[];
  note?: string;
}
export interface ImportPlan {
  places: PlaceRow[];
  expeditions: ExpeditionRow[];
  flightCount: number;
}

export interface Flight {
  date: string; // YYYY-MM-DD
  from: string; // IATA
  to: string; // IATA
  flightNo: string;
  canceled: boolean;
}

/** Minimal RFC-4180-ish CSV parser (handles quoted fields + commas/newlines). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

let idCounter = 0;
const newId = () => `imp_${Date.now().toString(36)}_${idCounter++}`;

function parseFlights(text: string): Flight[] {
  const rows = parseCsv(text).filter((r) => r.some((c) => c.trim() !== ''));
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);
  const iDate = col('Date');
  const iFrom = col('From');
  const iTo = col('To');
  const iFlight = col('Flight');
  const iCanceled = col('Canceled');
  const iDiverted = col('Diverted To');
  if (iDate < 0 || iFrom < 0 || iTo < 0) return [];

  const flights: Flight[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const date = (cells[iDate] ?? '').trim().slice(0, 10);
    const from = (cells[iFrom] ?? '').trim().toUpperCase();
    const diverted = iDiverted >= 0 ? (cells[iDiverted] ?? '').trim().toUpperCase() : '';
    const to = (diverted || (cells[iTo] ?? '').trim()).toUpperCase();
    const flightNo = iFlight >= 0 ? (cells[iFlight] ?? '').trim() : '';
    const canceled = iCanceled >= 0 ? /^(yes|true|1)$/i.test((cells[iCanceled] ?? '').trim()) : false;
    if (!date || !from || !to) continue;
    flights.push({ date, from, to, flightNo, canceled });
  }
  flights.sort((a, b) => a.date.localeCompare(b.date));
  return flights;
}

const DAY = 86_400_000;

/** The country most often touched by these flights — the hub you keep returning
 *  to. Used to exclude "home" from trip names when residence isn't configured. */
function inferHome(flights: Flight[]): string | undefined {
  const freq = new Map<string, number>();
  for (const f of flights) {
    for (const c of [airportInfo(f.from)?.country, airportInfo(f.to)?.country]) {
      if (c) freq.set(c, (freq.get(c) ?? 0) + 1);
    }
  }
  let best: string | undefined;
  let bestN = 0;
  for (const [c, n] of freq) if (n > bestN) { best = c; bestN = n; }
  return best;
}

/** Country codes for a set of legs, destinations (non-home) first in encounter
 *  order, home countries last — so the trip leads with where you actually went. */
function orderCodes(pairs: [string | undefined, string | undefined][], homeSet: Set<string>): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();
  for (const [a, b] of pairs) for (const c of [a, b]) if (c && !seen.has(c) && !homeSet.has(c)) { seen.add(c); ordered.push(c); }
  for (const [a, b] of pairs) for (const c of [a, b]) if (c && !seen.has(c)) { seen.add(c); ordered.push(c); }
  return ordered;
}

export function planFromFlights(
  flights: Flight[],
  homeCodes: Set<string> = new Set(),
  home: HomeRange[] = [],
): ImportPlan {
  // Title trips after the destination, excluding home. When residence isn't
  // configured (homeCodes empty), infer home from the flights themselves.
  const homeSet = homeCodes.size ? homeCodes : new Set(inferHome(flights) ? [inferHome(flights)!] : []);
  const places = new Map<string, PlaceRow>();
  const addAirport = (iata: string, year?: number) => {
    const info = airportInfo(iata);
    if (!info) return;
    const cKey = `country:${info.country}`;
    const prevC = places.get(cKey);
    if (!prevC) places.set(cKey, { kind: 'country', countryCode: info.country, firstYear: year });
    else if (year && (!prevC.firstYear || year < prevC.firstYear)) prevC.firstYear = year;
    const tKey = `city:${info.country}:${info.city.toLowerCase()}`;
    const prevT = places.get(tKey);
    if (!prevT) places.set(tKey, { kind: 'city', countryCode: info.country, name: info.city, firstYear: year });
    else if (year && (!prevT.firstYear || year < prevT.firstYear)) prevT.firstYear = year;
  };

  // Segment flights into trips: a gap > 2 days starts a new trip.
  const expeditions: ExpeditionRow[] = [];
  let seg: Flight[] = [];
  const flush = () => {
    if (seg.length === 0) return;
    const journeys: Journey[] = [];
    for (const f of seg) {
      const fi = airportInfo(f.from);
      const ti = airportInfo(f.to);
      journeys.push({
        id: newId(),
        mode: 'flight',
        from: fi ? `${fi.city} (${f.from})` : f.from,
        to: ti ? `${ti.city} (${f.to})` : f.to,
        reference: f.flightNo || undefined,
        date: f.date,
      });
    }
    const start = seg[0].date;
    const end = seg[seg.length - 1].date;
    // Order countries destination-first (home excluded → home last) so the trip
    // name and its card image/flags lead with where you actually went — not the
    // home country you flew from or back to.
    const codes = orderCodes(seg.map((f) => [airportInfo(f.from)?.country, airportInfo(f.to)?.country]), homeSet);
    const destCode = codes.find((c) => !homeSet.has(c)) ?? codes[0];
    const title = destCode ? `${countryName(destCode)} · ${start.slice(0, 4)}` : `Trip · ${start.slice(0, 4)}`;
    expeditions.push({ title, startDate: start, endDate: end, countryCodes: codes, journeys, note: 'Imported from Flighty.' });
    seg = [];
  };

  for (const f of flights) {
    const year = Number(f.date.slice(0, 4)) || undefined;
    const ts = Date.parse(f.date);
    const fc = airportInfo(f.from)?.country;
    const tc = airportInfo(f.to)?.country;
    const fromHome = fc ? isHome(home, fc, ts) : false;
    const toHome = tc ? isHome(home, tc, ts) : false;

    // A flight entirely within your home country while you lived there is
    // commuting, not a trip — skip it and close any open trip.
    if (fromHome && toHome) {
      if (seg.length) flush();
      continue;
    }

    addAirport(f.from, year);
    addAirport(f.to, year);
    if (seg.length > 0) {
      const gap = ts - Date.parse(seg[seg.length - 1].date);
      if (gap > 2 * DAY) flush();
    }
    seg.push(f);
    // Landing back home completes the trip.
    if (toHome) flush();
  }
  flush();

  return { places: [...places.values()], expeditions, flightCount: flights.length };
}

/** Parse a Flighty CSV and build the import plan. */
export function buildImportPlan(
  text: string,
  homeCodes: Set<string> = new Set(),
  home: HomeRange[] = [],
): ImportPlan {
  return planFromFlights(parseFlights(text).filter((f) => !f.canceled), homeCodes, home);
}

/** Pull the 3-letter IATA code out of a "City (XXX)" label. */
function iataFromLabel(label?: string): string {
  if (!label) return '';
  const m = label.match(/\(([A-Z]{3})\)/);
  return (m ? m[1] : label.trim()).toUpperCase();
}

/** Reconstruct the imported flights (and which expeditions hold them) from
 *  existing expeditions, so they can be re-segmented against current residence
 *  history. Only journeys this importer created (id starts with `imp_`) count. */
export function flightsFromExpeditions(expeditions: Expedition[]): {
  flights: Flight[];
  expeditionIds: string[];
} {
  const flights: Flight[] = [];
  const expeditionIds: string[] = [];
  for (const e of expeditions) {
    const imported = e.journeys.filter((j) => j.mode === 'flight' && j.id?.startsWith('imp_'));
    if (imported.length === 0) continue;
    expeditionIds.push(e.id);
    for (const j of imported) {
      const from = iataFromLabel(j.from);
      const to = iataFromLabel(j.to);
      const date = (j.date || e.startDate || '').slice(0, 10);
      if (from.length !== 3 || to.length !== 3 || !date) continue;
      flights.push({ date, from, to, flightNo: (j.reference ?? '').trim(), canceled: false });
    }
  }
  flights.sort((a, b) => a.date.localeCompare(b.date));
  return { flights, expeditionIds };
}

/** Recompute destination-first titles + country order for already-imported
 *  expeditions (whose names may have been built before home inference). Returns
 *  only the expeditions whose title or countryCodes actually change. */
export function repairImportedExpeditions(expeditions: Expedition[]): { id: string; title: string; countryCodes: string[] }[] {
  const home = inferHome(flightsFromExpeditions(expeditions).flights);
  const homeSet = new Set(home ? [home] : []);
  const patches: { id: string; title: string; countryCodes: string[] }[] = [];
  for (const e of expeditions) {
    const imported = e.journeys.filter((j) => j.mode === 'flight' && j.id?.startsWith('imp_'));
    if (imported.length === 0) continue;
    const codes = orderCodes(
      imported.map((j) => [airportInfo(iataFromLabel(j.from))?.country, airportInfo(iataFromLabel(j.to))?.country]),
      homeSet,
    );
    if (codes.length === 0) continue;
    const destCode = codes.find((c) => !homeSet.has(c)) ?? codes[0];
    const year = (e.startDate || imported[0]?.date || '').slice(0, 4);
    const title = destCode ? `${countryName(destCode)} · ${year}` : e.title;
    if (title !== e.title || codes.join(',') !== e.countryCodes.join(',')) {
      patches.push({ id: e.id, title, countryCodes: codes });
    }
  }
  return patches;
}

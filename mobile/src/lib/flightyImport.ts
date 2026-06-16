// Flighty CSV import (native). A pragmatic port of the web importer: parse the
// CSV, turn each flight's airports into visited countries + cities, and group
// consecutive flights into trips (expeditions) with flight journeys so they
// appear on the journeys route map.
import { airportInfo } from '../data/airports';
import { countryName } from '../data/countries';
import { isHome, type HomeRange } from './residence';
import type { Journey, PlaceKind } from '../types';

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

interface Flight {
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

export function buildImportPlan(
  text: string,
  homeCodes: Set<string> = new Set(),
  home: HomeRange[] = [],
): ImportPlan {
  const flights = parseFlights(text).filter((f) => !f.canceled);
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
    const codes = new Set<string>();
    const journeys: Journey[] = [];
    for (const f of seg) {
      const fi = airportInfo(f.from);
      const ti = airportInfo(f.to);
      if (fi) codes.add(fi.country);
      if (ti) codes.add(ti.country);
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
    // Title the trip after the destination — not the home country you flew from
    // or back to (so living in London doesn't read as "a trip to the UK").
    let destCode: string | undefined;
    for (let k = seg.length - 1; k >= 0; k--) {
      const ti = airportInfo(seg[k].to);
      if (ti && !homeCodes.has(ti.country)) {
        destCode = ti.country;
        break;
      }
    }
    if (!destCode) destCode = airportInfo(seg[seg.length - 1].to)?.country;
    const title = destCode ? `${countryName(destCode)} · ${start.slice(0, 4)}` : `Trip · ${start.slice(0, 4)}`;
    expeditions.push({ title, startDate: start, endDate: end, countryCodes: [...codes], journeys, note: 'Imported from Flighty.' });
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

import { airportInfo } from '../data/airports';
import { countryName } from '../data/countries';
import { DISCOVERY_RELATIONSHIPS, type Journey, type Relationship } from '../types';
import type { Expedition, Place } from '../types';
import {
  createExpedition,
  deleteExpedition,
  type ExpeditionInput,
} from './expeditions';
import { createPlace, updatePlace, type PlaceInput } from './places';
import { homeOn, residenceTimeline } from './residences';

// ── Airlines (ICAO code → name; falls back to the raw code) ────────────────
const AIRLINES: Record<string, string> = {
  BAW: 'British Airways', CFE: 'BA CityFlyer', EZY: 'easyJet', VIR: 'Virgin Atlantic',
  KLM: 'KLM', DAL: 'Delta Air Lines', AAL: 'American Airlines', UAL: 'United Airlines',
  ASA: 'Alaska Airlines', SKW: 'SkyWest', RPA: 'Republic Airways', CPA: 'Cathay Pacific',
  BEL: 'Brussels Airlines', FIN: 'Finnair', THY: 'Turkish Airlines', SWR: 'Swiss',
  EWG: 'Eurowings', BEE: 'Flybe', LOG: 'Loganair', AFR: 'Air France', DLH: 'Lufthansa',
  IBE: 'Iberia', RYR: 'Ryanair', UAE: 'Emirates', QTR: 'Qatar Airways', ETD: 'Etihad',
  SIA: 'Singapore Airlines', QFA: 'Qantas', ANA: 'ANA', JAL: 'Japan Airlines',
  ACA: 'Air Canada', AAR: 'Asiana', KAL: 'Korean Air', TAP: 'TAP Air Portugal',
  SAS: 'SAS', AUA: 'Austrian', NAX: 'Norwegian', WZZ: 'Wizz Air', JBU: 'JetBlue',
  SWA: 'Southwest', WMT: 'World2Fly',
};

function airlineName(code: string): string {
  return AIRLINES[code?.toUpperCase()] ?? code;
}

// ── Parsed flight ──────────────────────────────────────────────────────────
export interface FlightyFlight {
  id: string;
  date: string; // YYYY-MM-DD
  depAt: string; // sortable datetime
  arrAt: string;
  airline: string;
  flightNo: string;
  from: string; // IATA
  to: string; // IATA (post-diversion)
  cabin?: string;
  seat?: string;
  canceled: boolean;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') {
      cur.push(field);
      field = '';
    } else if (c === '\n') {
      cur.push(field);
      rows.push(cur);
      cur = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field.length || cur.length) {
    cur.push(field);
    rows.push(cur);
  }
  return rows;
}

export interface ParseResult {
  flights: FlightyFlight[];
  error?: string;
}

export function parseFlightyCsv(text: string): ParseResult {
  const rows = parseCsv(text);
  if (rows.length < 2) return { flights: [], error: 'The file looks empty.' };
  const header = rows[0].map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);
  const iDate = col('Date');
  const iFrom = col('From');
  const iTo = col('To');
  if (iDate < 0 || iFrom < 0 || iTo < 0) {
    return {
      flights: [],
      error:
        'This doesn’t look like a Flighty export (missing Date/From/To columns).',
    };
  }
  const iAirline = col('Airline');
  const iFlight = col('Flight');
  const iCanceled = col('Canceled');
  const iDiverted = col('Diverted To');
  const iDepS = col('Gate Departure (Scheduled)');
  const iDepA = col('Gate Departure (Actual)');
  const iArrS = col('Gate Arrival (Scheduled)');
  const iArrA = col('Gate Arrival (Actual)');
  const iCabin = col('Cabin Class');
  const iSeat = col('Seat');
  const iId = col('Flight Flighty ID');

  const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');

  const flights: FlightyFlight[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 3) continue;
    const date = get(row, iDate);
    const from = get(row, iFrom).toUpperCase();
    const diverted = get(row, iDiverted).toUpperCase();
    const to = (diverted || get(row, iTo)).toUpperCase();
    if (!date || !from || !to) continue;
    const dep = get(row, iDepS) || get(row, iDepA) || `${date}T00:00`;
    const arr = get(row, iArrS) || get(row, iArrA) || dep;
    const flightNo = get(row, iFlight);
    flights.push({
      id: get(row, iId) || `${date}-${from}-${to}-${flightNo}`,
      date,
      depAt: dep,
      arrAt: arr,
      airline: get(row, iAirline),
      flightNo,
      from,
      to,
      cabin: get(row, iCabin) || undefined,
      seat: get(row, iSeat) || undefined,
      canceled: get(row, iCanceled).toLowerCase() === 'true',
    });
  }
  return { flights };
}

// ── Plan ───────────────────────────────────────────────────────────────────
export interface ImportPlan {
  expeditions: ExpeditionInput[];
  placeCreates: PlaceInput[];
  placeUpdates: { id: string; input: PlaceInput }[];
  unknownAirports: string[];
  homeCountry: string;
  homeCountryName: string;
  stats: {
    flights: number;
    newFlights: number;
    canceled: number;
    trips: number;
    countries: number;
    cities: number;
  };
}

function ms(d: string): number {
  const t = Date.parse(d);
  return Number.isNaN(t) ? 0 : t;
}
function gapHours(a: string, b: string): number {
  return (ms(b) - ms(a)) / 3_600_000;
}
function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}
function airportLabel(iata: string): string {
  const info = airportInfo(iata);
  return info ? `${info.city} (${iata})` : iata;
}
function toJourney(f: FlightyFlight): Journey {
  const seat = [f.cabin, f.seat].filter(Boolean).join(' · ');
  const operator = airlineName(f.airline);
  const reference = `${f.airline} ${f.flightNo}`.trim();
  // Only assign defined fields — Firestore rejects `undefined` in arrays.
  const j: Journey = {
    id: `fl_${f.id}`,
    mode: 'flight',
    from: airportLabel(f.from),
    to: airportLabel(f.to),
  };
  if (operator) j.operator = operator;
  if (reference) j.reference = reference;
  if (seat) j.seat = seat;
  if (f.date) j.date = f.date;
  return j;
}

function destinationTitle(cities: string[]): string {
  const uniq = [...new Set(cities)];
  if (uniq.length === 0) return 'Trip';
  if (uniq.length === 1) return uniq[0];
  if (uniq.length === 2) return `${uniq[0]} & ${uniq[1]}`;
  return `${uniq[0]}, ${uniq[1]} & ${uniq.length - 2} more`;
}

export function buildImportPlan(
  allFlights: FlightyFlight[],
  existingPlaces: Place[],
  existingExpeditions: Expedition[],
): ImportPlan {
  const valid = allFlights.filter((f) => !f.canceled);
  const canceled = allFlights.length - valid.length;

  // Airports we don't recognise (reported so the user can add them manually).
  const unknown = new Set<string>();
  for (const f of valid) {
    if (!airportInfo(f.from)) unknown.add(f.from);
    if (!airportInfo(f.to)) unknown.add(f.to);
  }

  // Home country = the country that appears most across all airports.
  const countryCount = new Map<string, number>();
  for (const f of valid) {
    for (const code of [airportInfo(f.from)?.country, airportInfo(f.to)?.country]) {
      if (code) countryCount.set(code, (countryCount.get(code) ?? 0) + 1);
    }
  }
  let homeCountry = '';
  let best = -1;
  for (const [code, n] of countryCount) {
    if (n > best) {
      best = n;
      homeCountry = code;
    }
  }

  // Time-aware home, from the Member's residence history. When we know the home
  // *city* on a date, trips are anchored to that city (returning to it ends a
  // trip, so a domestic hop elsewhere becomes a trip). Otherwise we fall back to
  // the home country — which keeps behaviour identical when no residence dates
  // are set.
  const timeline = residenceTimeline(existingPlaces);
  const homeCountryAt = (date: string): string =>
    homeOn(timeline, date)?.countryCode ?? homeCountry;
  const homeCityAt = (date: string): string | undefined =>
    homeOn(timeline, date)?.city;
  const isAway = (iata: string, date: string): boolean => {
    const info = airportInfo(iata);
    if (!info) return false;
    const city = homeCityAt(date);
    return city ? info.city !== city : info.country !== homeCountryAt(date);
  };
  const atHome = (f: FlightyFlight): boolean =>
    !!airportInfo(f.to) && !isAway(f.to, f.date);

  // Already-imported flights (idempotent re-import) — journeys we wrote carry
  // an `fl_<flightId>` id.
  const imported = new Set<string>();
  for (const e of existingExpeditions) {
    for (const j of e.journeys) if (j.id?.startsWith('fl_')) imported.add(j.id);
  }

  const sorted = [...valid].sort((a, b) => ms(a.depAt) - ms(b.depAt));

  // Segment into trips. A trip ends after flight `f` when any of:
  //  • home dwell — you landed back at home (your home city on that date, or
  //    home country if the city is unknown) and didn't immediately fly on. The
  //    threshold is short (6h) once a home city is known, so landing home ends
  //    the trip even if you fly onward the same week;
  //  • discontinuity — the next flight departs a different country than the one
  //    you just landed in, with a multi-day gap (a return leg wasn't logged);
  //  • a very long gap regardless, as a safety net for missing legs.
  const segments: FlightyFlight[][] = [];
  let cur: FlightyFlight[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const f = sorted[i];
    cur.push(f);
    const next = sorted[i + 1];
    if (!next) {
      segments.push(cur);
      cur = [];
      continue;
    }
    const arrCountry = airportInfo(f.to)?.country;
    const nextDepCountry = airportInfo(next.from)?.country;
    const gap = gapHours(f.arrAt, next.depAt);
    const homeThreshold = homeCityAt(f.date) ? 6 : 24;
    const homeDwell = atHome(f) && gap > homeThreshold;
    const discontinuity =
      !!arrCountry &&
      !!nextDepCountry &&
      arrCountry !== nextDepCountry &&
      gap > 24 * 5;
    const longGap = gap > 24 * 30;
    if (homeDwell || discontinuity || longGap) {
      segments.push(cur);
      cur = [];
    }
  }
  if (cur.length) segments.push(cur);

  const expeditions: ExpeditionInput[] = [];
  const domesticByYear = new Map<number, FlightyFlight[]>();
  let tripCount = 0;

  for (const seg of segments) {
    const fresh = seg.filter((f) => !imported.has(`fl_${f.id}`));
    if (fresh.length === 0) continue;

    // Airports that were away from home (city-aware), with their cities and
    // countries, in order — these define the destinations and the title.
    const awayCities: string[] = [];
    const awayCountries: string[] = [];
    for (const f of fresh) {
      for (const iata of [f.from, f.to]) {
        if (!isAway(iata, f.date)) continue;
        const info = airportInfo(iata);
        if (!info) continue;
        awayCities.push(info.city);
        awayCountries.push(info.country);
      }
    }

    if (awayCities.length === 0) {
      // Never left home — bucket by year.
      const y = yearOf(fresh[0].date);
      domesticByYear.set(y, [...(domesticByYear.get(y) ?? []), ...fresh]);
      continue;
    }

    expeditions.push({
      title: destinationTitle(awayCities),
      startDate: fresh[0].date,
      endDate: fresh[fresh.length - 1].date,
      countryCodes: [...new Set(awayCountries)],
      journeys: fresh.map(toJourney),
      note: 'Imported from Flighty.',
    });
    tripCount++;
  }

  const homeCountryName = homeCountry ? countryName(homeCountry) : 'Home';
  for (const [year, flights] of [...domesticByYear.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    expeditions.push({
      title: `${homeCountryName} · domestic flights ${year}`,
      startDate: flights[0].date,
      endDate: flights[flights.length - 1].date,
      countryCodes: homeCountry ? [homeCountry] : [],
      journeys: flights.map(toJourney),
      note: 'Imported from Flighty.',
    });
  }

  // Places visited — from every airport, with the earliest year seen.
  const countryYear = new Map<string, number>();
  const cityYear = new Map<string, { country: string; city: string; year: number }>();
  for (const f of valid) {
    for (const iata of [f.from, f.to]) {
      const info = airportInfo(iata);
      if (!info) continue;
      const y = yearOf(f.date);
      countryYear.set(
        info.country,
        Math.min(countryYear.get(info.country) ?? y, y),
      );
      const key = `${info.country}|${info.city.toLowerCase()}`;
      const prev = cityYear.get(key);
      cityYear.set(key, {
        country: info.country,
        city: info.city,
        year: Math.min(prev?.year ?? y, y),
      });
    }
  }

  const placeCreates: PlaceInput[] = [];
  const placeUpdates: { id: string; input: PlaceInput }[] = [];

  const mergeRelationships = (rels: Relationship[]): Relationship[] => {
    const kept = rels.filter((r) => r !== 'aspiring');
    if (!kept.some((r) => DISCOVERY_RELATIONSHIPS.includes(r))) kept.push('visited');
    return kept;
  };

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
    const firstYear =
      existing.firstYear && existing.firstYear <= year ? existing.firstYear : year;
    const changed =
      rels.length !== existing.relationships.length ||
      firstYear !== existing.firstYear;
    if (changed) {
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

  for (const { country, city, year } of cityYear.values()) {
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
    const firstYear =
      existing.firstYear && existing.firstYear <= year ? existing.firstYear : year;
    const changed =
      rels.length !== existing.relationships.length ||
      firstYear !== existing.firstYear;
    if (changed) {
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

  const newFlights = segments
    .flat()
    .filter((f) => !imported.has(`fl_${f.id}`)).length;

  return {
    expeditions,
    placeCreates,
    placeUpdates,
    unknownAirports: [...unknown].sort(),
    homeCountry,
    homeCountryName,
    stats: {
      flights: valid.length,
      newFlights,
      canceled,
      trips: tripCount,
      countries: countryYear.size,
      cities: cityYear.size,
    },
  };
}

export interface ImportResult {
  total: number;
  failed: number;
}

// ── Re-evaluation ────────────────────────────────────────────────────────
// Reconstruct flights from previously-imported expeditions so trips can be
// re-segmented when residence history changes.
function iataFromLabel(label?: string): string {
  if (!label) return '';
  const m = label.match(/\(([A-Z]{3})\)/);
  return (m ? m[1] : label.trim()).toUpperCase();
}

export interface Reconstructed {
  flights: FlightyFlight[];
  expeditionIds: string[];
}

export function flightsFromExpeditions(
  expeditions: Expedition[],
): Reconstructed {
  const flights: FlightyFlight[] = [];
  const expeditionIds: string[] = [];
  for (const e of expeditions) {
    const flightJourneys = e.journeys.filter(
      (j) => j.mode === 'flight' && j.id?.startsWith('fl_'),
    );
    if (flightJourneys.length === 0) continue;
    expeditionIds.push(e.id);
    for (const j of flightJourneys) {
      const from = iataFromLabel(j.from);
      const to = iataFromLabel(j.to);
      const date = j.date || e.startDate || '';
      if (from.length !== 3 || to.length !== 3 || !date) continue;
      const ref = (j.reference ?? '').trim();
      const sp = ref.indexOf(' ');
      flights.push({
        id: j.id.slice(3),
        date,
        depAt: `${date}T00:00`,
        arrAt: `${date}T00:00`,
        airline: sp > 0 ? ref.slice(0, sp) : ref,
        flightNo: sp > 0 ? ref.slice(sp + 1) : '',
        from,
        to,
        cabin: j.seat,
        canceled: false,
      });
    }
  }
  return { flights, expeditionIds };
}

export async function deleteExpeditions(ids: string[]): Promise<void> {
  for (const id of ids) {
    try {
      await deleteExpedition(id);
    } catch {
      /* keep going */
    }
  }
}

export async function applyImportPlan(
  userId: string,
  plan: ImportPlan,
  onProgress?: (done: number, total: number) => void,
): Promise<ImportResult> {
  const tasks: Array<() => Promise<unknown>> = [
    ...plan.placeCreates.map((input) => () => createPlace(userId, input)),
    ...plan.placeUpdates.map(({ id, input }) => () => updatePlace(id, input)),
    ...plan.expeditions.map((exp) => () => createExpedition(userId, exp)),
  ];
  const total = tasks.length;
  let done = 0;
  let failed = 0;

  // Run with bounded concurrency so a large import doesn't fire hundreds of
  // simultaneous writes, but still completes quickly. A single failed write
  // must never stall the whole import, so each task is caught individually.
  const CONCURRENCY = 8;
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
    Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, worker),
  );
  return { total, failed };
}

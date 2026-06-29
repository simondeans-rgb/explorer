// Airport type-ahead for flight From/To entry. Backed by the worldwide airport
// dataset, so it recognises virtually every commercial airport. Matches on IATA
// (LHR), ICAO (EGLL), city, airport name, and aliases, tolerates accents and
// common misspellings, and can rank nearby airports first when a reference
// location is known.
import { ALL_AIRPORTS, type Airport } from '../data/airports';
import { resolveEndpoint } from './journeyGeo';
import { countryName } from '../data/countries';

export interface AirportMatch {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string; // ISO alpha-2
  /** Canonical value stored on the journey, e.g. "London (LHR)". */
  label: string;
}

/** The canonical, always-resolvable form we store for a picked airport. */
export function canonicalAirportLabel(city: string, iata: string): string {
  return `${city} (${iata.toUpperCase()})`;
}

/** Strip accents + lowercase, without relying on unicode property escapes. */
function fold(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

interface Indexed {
  a: Airport;
  iata: string;
  icao: string;
  city: string; // folded
  name: string; // folded
  hay: string; // folded city + name + aliases (for substring + fuzzy)
  match: AirportMatch;
}

const INDEX: Indexed[] = ALL_AIRPORTS.map((a) => ({
  a,
  iata: a.iata,
  icao: a.icao,
  city: fold(a.city),
  name: fold(a.name),
  hay: fold([a.city, a.name, ...a.aliases].join(' ')),
  match: { iata: a.iata, icao: a.icao, name: a.name, city: a.city, country: a.country, label: canonicalAirportLabel(a.city, a.iata) },
}));

function bigrams(s: string): Set<string> {
  const b = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) b.add(s.slice(i, i + 2));
  return b;
}
/** Sørensen–Dice similarity (0–1) for a cheap, fast misspelling tolerance. */
function dice(qBigrams: Set<string>, target: string): number {
  if (target.length < 2 || qBigrams.size === 0) return 0;
  const t = bigrams(target);
  let inter = 0;
  for (const x of qBigrams) if (t.has(x)) inter++;
  return (2 * inter) / (qBigrams.size + t.size);
}

function dist2(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

/** Ranked airport suggestions for a free-text query (IATA/ICAO code, city,
 *  airport name or alias). `near` (lng,lat) breaks ties toward closer airports. */
export function searchAirports(query: string, limit = 6, near?: [number, number]): AirportMatch[] {
  const raw = query.trim();
  if (raw.length < 2) return [];
  const q = fold(raw);
  const code = raw.toUpperCase();
  const scored: { m: AirportMatch; score: number; co: [number, number] }[] = [];

  for (const e of INDEX) {
    let score = 0;
    if (e.iata === code) score = 130;
    else if (e.icao && e.icao === code) score = 125;
    else if (e.city === q) score = 110;
    else if (e.iata.startsWith(code) && code.length <= 3) score = 90;
    else if (e.city.startsWith(q)) score = 80;
    else if (e.name.startsWith(q)) score = 65;
    else if (e.city.includes(q)) score = 45;
    else if (e.hay.includes(q)) score = 30;
    if (score > 0) scored.push({ m: e.match, score, co: [e.a.lng, e.a.lat] });
  }

  // Misspelling fallback: only when we didn't find much and the query is long
  // enough to be meaningful — keeps the common path fast.
  if (scored.length < limit && q.length >= 4) {
    const seen = new Set(scored.map((s) => s.m.iata));
    const qb = bigrams(q);
    for (const e of INDEX) {
      if (seen.has(e.iata)) continue;
      const sim = dice(qb, e.city);
      if (sim >= 0.55) scored.push({ m: e.match, score: 10 + sim * 10, co: [e.a.lng, e.a.lat] });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (near) return dist2(a.co, near) - dist2(b.co, near);
    return a.m.city.localeCompare(b.m.city);
  });
  return scored.slice(0, limit).map((s) => s.m);
}

/** Whether a typed endpoint resolves to a known airport/city (and so counts
 *  toward distance + domestic/international stats). */
export function isEndpointResolved(label?: string): boolean {
  return !!label && !!label.trim() && !!resolveEndpoint(label);
}

/** Best single suggested match for an unresolved endpoint (for the resolve flow). */
export function bestAirportMatch(label?: string): AirportMatch | undefined {
  if (!label) return undefined;
  return searchAirports(label, 1)[0];
}

/** A short, human label for an airport's country (for suggestion rows). */
export function airportCountryName(country: string): string {
  return countryName(country) || country;
}

// Airport type-ahead for flight From/To entry. Backed by the same baked-in
// airport table the route map + stats resolve against, so anything a Member
// picks here is guaranteed to place on the globe and count in the stats.
import { ALL_AIRPORTS } from '../data/airports';
import { resolveEndpoint } from './journeyGeo';
import { countryName } from '../data/countries';

export interface AirportMatch {
  iata: string;
  city: string;
  country: string; // ISO alpha-2
  /** Canonical value stored on the journey, e.g. "London (LHR)". */
  label: string;
}

/** The canonical, always-resolvable form we store for a picked airport. */
export function canonicalAirportLabel(city: string, iata: string): string {
  return `${city} (${iata.toUpperCase()})`;
}

const MATCHES: AirportMatch[] = ALL_AIRPORTS.map((a) => ({
  iata: a.iata,
  city: a.city,
  country: a.country,
  label: canonicalAirportLabel(a.city, a.iata),
}));

/** Ranked airport suggestions for a free-text query (IATA code or city name). */
export function searchAirports(query: string, limit = 6): AirportMatch[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const scored: { m: AirportMatch; score: number }[] = [];
  for (const m of MATCHES) {
    const iata = m.iata.toLowerCase();
    const city = m.city.toLowerCase();
    let score = 0;
    if (iata === q) score = 100;
    else if (city === q) score = 90;
    else if (iata.startsWith(q)) score = 70;
    else if (city.startsWith(q)) score = 60;
    else if (city.includes(q)) score = 35;
    if (score > 0) scored.push({ m, score });
  }
  scored.sort((a, b) => b.score - a.score || a.m.city.localeCompare(b.m.city));
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

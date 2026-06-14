// Parse a pasted list of countries / cities into importable place rows.
// One entry per line. A line with a comma is read as "City, Country";
// otherwise the whole line is a country name (or ISO code).
import { COUNTRIES, COUNTRY_BY_CODE } from '../data/countries';
import type { PlaceRow } from './flightyImport';

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

// name -> alpha2, including a few common aliases.
const NAME_TO_CODE: Record<string, string> = {};
for (const c of COUNTRIES) NAME_TO_CODE[norm(c.name)] = c.code;
Object.assign(NAME_TO_CODE, {
  usa: 'US',
  'united states': 'US',
  america: 'US',
  uk: 'GB',
  'united kingdom': 'GB',
  britain: 'GB',
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  uae: 'AE',
  'south korea': 'KR',
  'north korea': 'KP',
  russia: 'RU',
  'czech republic': 'CZ',
  vietnam: 'VN',
});

function matchCountry(token: string): string | undefined {
  const n = norm(token);
  if (!n) return undefined;
  if (NAME_TO_CODE[n]) return NAME_TO_CODE[n];
  // ISO code?
  const upper = token.trim().toUpperCase();
  if (upper.length === 2 && COUNTRY_BY_CODE[upper]) return upper;
  // loose contains (e.g. "Republic of Korea")
  const hit = COUNTRIES.find((c) => norm(c.name).includes(n) || n.includes(norm(c.name)));
  return hit?.code;
}

export interface ListParseResult {
  rows: PlaceRow[];
  unmatched: string[];
}

export function parseCountryList(text: string): ListParseResult {
  const rows: PlaceRow[] = [];
  const unmatched: string[] = [];
  const lines = text.split(/[\n;]+/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const comma = line.indexOf(',');
    if (comma > -1) {
      const city = line.slice(0, comma).trim();
      const countryToken = line.slice(comma + 1).trim();
      const code = matchCountry(countryToken);
      if (code) {
        rows.push({ kind: 'country', countryCode: code });
        if (city) rows.push({ kind: 'city', countryCode: code, name: city });
      } else unmatched.push(line);
    } else {
      const code = matchCountry(line);
      if (code) rows.push({ kind: 'country', countryCode: code });
      else unmatched.push(line);
    }
  }
  return { rows, unmatched };
}

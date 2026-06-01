// Import visited countries from a pasted list — Been's "export as text", or any
// tracker's country list, or a hand-typed one. Resolves free-text names/codes to
// our ISO country data and builds a plan of places to add (as `visited`),
// deduped against the Passport. Mirrors the Flighty importer's plan/apply shape.

import { COUNTRIES, countryName } from '../data/countries';
import {
  DISCOVERY_RELATIONSHIPS,
  type Place,
  type Relationship,
} from '../types';
import { createPlace, type PlaceInput } from './places';

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[.'’`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/\s+/g, ' ')
    .replace(/^the\s+/, '')
    .trim();

// name/alpha2/alpha3 → ISO alpha-2, built once.
const lookup: Record<string, string> = {};
for (const c of COUNTRIES) {
  lookup[norm(c.name)] = c.code;
  lookup[c.code.toLowerCase()] = c.code;
  lookup[c.alpha3.toLowerCase()] = c.code;
}

// Common alternative names / short forms exporters use.
const ALIASES: Record<string, string> = {
  usa: 'US', 'united states of america': 'US', america: 'US', 'the united states': 'US',
  uk: 'GB', 'united kingdom of great britain and northern ireland': 'GB', 'great britain': 'GB', britain: 'GB', england: 'GB', scotland: 'GB', wales: 'GB', 'northern ireland': 'GB',
  uae: 'AE', 'united arab emirates': 'AE',
  'south korea': 'KR', 'republic of korea': 'KR', korea: 'KR',
  'north korea': 'KP',
  russia: 'RU', 'russian federation': 'RU',
  'czech republic': 'CZ', czechia: 'CZ',
  'ivory coast': 'CI', "cote divoire": 'CI',
  'cape verde': 'CV',
  'democratic republic of the congo': 'CD', 'dr congo': 'CD', 'congo kinshasa': 'CD', 'congo drc': 'CD',
  'republic of the congo': 'CG', 'congo brazzaville': 'CG',
  'east timor': 'TL', 'timor leste': 'TL',
  swaziland: 'SZ', eswatini: 'SZ',
  burma: 'MM', myanmar: 'MM',
  'cabo verde': 'CV',
  laos: 'LA', "lao peoples democratic republic": 'LA',
  syria: 'SY', vietnam: 'VN', brunei: 'BN', moldova: 'MD',
  'vatican city': 'VA', 'vatican': 'VA', 'holy see': 'VA',
  macedonia: 'MK', 'north macedonia': 'MK',
  'bosnia': 'BA', 'bosnia and herzegovina': 'BA',
  palestine: 'PS', 'palestinian territories': 'PS',
  tanzania: 'TZ', 'united republic of tanzania': 'TZ',
  bolivia: 'BO', venezuela: 'VE', iran: 'IR',
  'hong kong': 'HK', macau: 'MO', macao: 'MO', taiwan: 'TW',
  'south sudan': 'SS',
  'st kitts and nevis': 'KN', 'saint kitts and nevis': 'KN',
  'st lucia': 'LC', 'saint lucia': 'LC',
  'st vincent and the grenadines': 'VC', 'saint vincent and the grenadines': 'VC',
  'trinidad': 'TT', 'trinidad and tobago': 'TT',
  'antigua': 'AG', 'antigua and barbuda': 'AG',
  'gambia': 'GM', 'the gambia': 'GM',
  'bahamas': 'BS', 'the bahamas': 'BS',
};
for (const [k, v] of Object.entries(ALIASES)) lookup[norm(k)] = v;

/** Resolve one free-text token to an ISO alpha-2 code, or undefined. */
export function resolveCountry(token: string): string | undefined {
  const t = token.trim();
  if (!t) return undefined;
  // Strip a leading flag emoji / leading list markers and trailing year/date.
  const cleaned = t
    .replace(/^[\s\-*•·\u{1F1E6}-\u{1F1FF}]+/u, '')
    .replace(/[,;:].*$/, '') // drop anything after a separator (notes/dates)
    .trim();
  const n = norm(cleaned);
  if (lookup[n]) return lookup[n];
  // Last resort: an uppercase 2/3-letter code anywhere in the token.
  const code = t.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(code) && lookup[code.toLowerCase()]) return code;
  if (/^[A-Z]{3}$/.test(code) && lookup[code.toLowerCase()]) return lookup[code.toLowerCase()];
  return undefined;
}

/** Pull a 4-digit year (1900–2099) from a token, if present. */
function yearIn(token: string): number | undefined {
  const m = token.match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : undefined;
}

export interface CountryImportPlan {
  placeCreates: PlaceInput[];
  /** Resolved countries to show in the preview. */
  matched: { code: string; name: string; year?: number; existing: boolean }[];
  /** Tokens we couldn't resolve to a country. */
  unmatched: string[];
  stats: { found: number; toAdd: number; already: number; unmatched: number };
}

function hasDiscovery(rels: Relationship[]): boolean {
  return rels.some((r) => DISCOVERY_RELATIONSHIPS.includes(r));
}

/** Parse pasted text into tokens (one country per line or comma-separated). */
export function parseCountryList(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildCountryImportPlan(
  text: string,
  existingPlaces: Place[],
): CountryImportPlan {
  const tokens = parseCountryList(text);

  // code -> earliest year seen across tokens
  const found = new Map<string, number | undefined>();
  const unmatched: string[] = [];
  for (const token of tokens) {
    const code = resolveCountry(token);
    if (!code) {
      unmatched.push(token);
      continue;
    }
    const year = yearIn(token);
    const prev = found.get(code);
    found.set(
      code,
      year == null ? prev : prev == null ? year : Math.min(prev, year),
    );
  }

  const placeCreates: PlaceInput[] = [];
  const matched: CountryImportPlan['matched'] = [];
  for (const [code, year] of found) {
    const existing = existingPlaces.find(
      (p) => p.kind === 'country' && p.countryCode === code,
    );
    const alreadyVisited = existing
      ? hasDiscovery(existing.relationships)
      : false;
    matched.push({ code, name: countryName(code), year, existing: alreadyVisited });
    if (!alreadyVisited) {
      placeCreates.push({
        kind: 'country',
        countryCode: code,
        name: countryName(code),
        relationships: ['visited'],
        firstYear: year,
      });
    }
  }
  matched.sort((a, b) => a.name.localeCompare(b.name));

  return {
    placeCreates,
    matched,
    unmatched,
    stats: {
      found: found.size,
      toAdd: placeCreates.length,
      already: found.size - placeCreates.length,
      unmatched: unmatched.length,
    },
  };
}

export interface CountryImportResult {
  total: number;
  failed: number;
}

export async function applyCountryImportPlan(
  userId: string,
  plan: CountryImportPlan,
  onProgress?: (done: number, total: number) => void,
): Promise<CountryImportResult> {
  const tasks = plan.placeCreates.map((input) => () => createPlace(userId, input));
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
  await Promise.all(Array.from({ length: Math.min(8, tasks.length) }, worker));
  return { total, failed };
}

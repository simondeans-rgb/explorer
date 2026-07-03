// Foursquare / Swarm check-ins → Worldly discoveries.
//
// Foursquare (and its check-in app Swarm) let you download your data; the
// check-in history is JSON. Shapes vary by export vintage — a bare array, or
// wrapped in { items }, { checkins }, or the API-style
// { response: { checkins: { items: [...] } } } — and each item either *is* a
// venue or carries a nested `venue`. This parser is tolerant of all of them:
// it pulls the venue name, country, city, a category, and any check-in comment.
// Client-side only.
import type { DiscoveryCategory } from '../types';
import { inferCategory, type DiscoveryRow } from './takeoutImport';

const STR = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

// Foursquare category names (or their words) → Worldly category.
const CAT_MAP: [DiscoveryCategory, string[]][] = [
  ['food', ['restaurant', 'coffee', 'café', 'cafe', 'bar', 'pub', 'food', 'bakery', 'pizza', 'diner', 'brewery', 'winery', 'bistro', 'steakhouse', 'gastropub', 'tea', 'dessert', 'ice cream', 'noodle', 'ramen', 'sushi', 'taco', 'burger', 'breakfast', 'brunch']],
  ['accommodation', ['hotel', 'hostel', 'resort', 'motel', 'bed & breakfast', 'inn', 'lodge', 'guesthouse']],
  ['culture', ['museum', 'gallery', 'theater', 'theatre', 'church', 'temple', 'shrine', 'mosque', 'monument', 'castle', 'palace', 'historic', 'memorial', 'landmark', 'opera', 'concert', 'library']],
  ['nature', ['park', 'beach', 'garden', 'trail', 'mountain', 'lake', 'scenic', 'national park', 'nature', 'forest', 'harbor', 'harbour', 'island', 'waterfall', 'hot spring']],
];

function categoryFromFoursquare(catNames: string[], venueName: string): DiscoveryCategory {
  const hay = catNames.join(' ').toLowerCase();
  for (const [cat, words] of CAT_MAP) if (words.some((w) => hay.includes(w))) return cat;
  // fall back to inferring from the venue name
  return inferCategory(venueName);
}

/** Extract the category names from a Foursquare venue's `categories` array. */
function catNames(venue: Record<string, unknown>): string[] {
  const cats = venue.categories;
  if (!Array.isArray(cats)) return [];
  const out: string[] = [];
  for (const c of cats) {
    const cc = c as Record<string, unknown>;
    const n = STR(cc.pluralName) ?? STR(cc.name) ?? STR(cc.shortName);
    if (n) out.push(n);
  }
  return out;
}

function rowFromVenue(venue: Record<string, unknown>, note?: string): DiscoveryRow | null {
  const name = STR(venue.name);
  if (!name) return null;
  const loc = (venue.location ?? {}) as Record<string, unknown>;
  const country = STR(loc.cc) ?? STR(loc.countryCode) ?? STR(loc.country_code);
  const city = STR(loc.city) ?? STR(loc.town) ?? STR(loc.state);
  return {
    name,
    category: categoryFromFoursquare(catNames(venue), name),
    countryCode: country && country.length === 2 ? country.toUpperCase() : undefined,
    city,
    note,
  };
}

/** Dig the check-in item array out of the various export wrappers. */
function itemsOf(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const d = data as Record<string, unknown>;
  const candidates: unknown[] = [
    d.items,
    d.checkins,
    (d.response as Record<string, unknown>)?.checkins &&
      ((d.response as Record<string, unknown>).checkins as Record<string, unknown>).items,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
}

/** Parse a Foursquare/Swarm check-in JSON export into discovery rows,
 *  de-duplicated by venue name (you check in to favourites repeatedly). */
export function parseCheckins(text: string): DiscoveryRow[] {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return [];
  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch {
    return [];
  }
  const out: DiscoveryRow[] = [];
  for (const it of itemsOf(data)) {
    const item = it as Record<string, unknown>;
    const venue = (item.venue ?? item) as Record<string, unknown>;
    const note = STR(item.shout) ?? STR(item.comment);
    const row = rowFromVenue(venue, note);
    if (row) out.push(row);
  }
  const seen = new Set<string>();
  return out.filter((r) => {
    const k = r.name.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

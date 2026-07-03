// Google Takeout → Worldly discoveries import.
//
// Google Maps exports (Takeout → "Maps (your places)") give your Reviews and
// Saved lists. Reviews are a GeoJSON FeatureCollection with a star rating per
// place; saved lists are GeoJSON (no rating) or a simple CSV. This parser is
// deliberately tolerant of those shapes: it pulls the place name, country and
// any rating, maps the rating to a Worldly verdict, and infers a category from
// the name. Client-side only — nothing leaves the device.
import type { DiscoveryCategory, RecommendationVerdict } from '../types';

export interface DiscoveryRow {
  name: string;
  category: DiscoveryCategory;
  verdict?: RecommendationVerdict;
  countryCode?: string;
  city?: string;
  note?: string;
}

/** Google 1–5 stars → Worldly verdict. */
function verdictForStars(stars?: number): RecommendationVerdict | undefined {
  if (!stars || stars < 1) return undefined;
  if (stars >= 5) return 'recommend';
  if (stars >= 4) return 'worth-visiting';
  if (stars >= 3) return 'worth-visiting';
  if (stars >= 2) return 'overrated';
  return 'avoid';
}

const CATEGORY_HINTS: [DiscoveryCategory, string[]][] = [
  ['food', ['restaurant', 'café', 'cafe', 'coffee', 'bar', 'bistro', 'brasserie', 'pizz', 'ramen', 'sushi', 'bakery', 'grill', 'kitchen', 'eatery', 'tavern', 'pub', 'diner', 'steak', 'trattoria', 'izakaya', 'noodle', 'burger', 'wine', 'brewery']],
  ['accommodation', ['hotel', 'hostel', 'resort', ' inn', 'guesthouse', 'guest house', 'b&b', 'lodge', 'motel', 'apartments', 'ryokan']],
  ['culture', ['museum', 'gallery', 'cathedral', 'church', 'temple', 'shrine', 'mosque', 'palace', 'castle', 'monument', 'theatre', 'theater', 'memorial', 'historic', 'ruins', 'basilica', 'library', 'opera']],
  ['nature', ['park', 'beach', 'garden', 'falls', 'waterfall', 'mountain', 'lake', 'trail', 'viewpoint', 'national park', 'reserve', 'forest', 'cliff', 'bay', 'island', 'volcano', 'hot spring']],
];

export function inferCategory(name: string): DiscoveryCategory {
  const n = name.toLowerCase();
  for (const [cat, hints] of CATEGORY_HINTS) if (hints.some((h) => n.includes(h))) return cat;
  return 'experience';
}

const NUM = (v: unknown): number | undefined => (typeof v === 'number' && isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && isFinite(Number(v)) ? Number(v) : undefined);
const STR = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/** Pull a discovery row out of one GeoJSON feature's properties (tolerant to the
 *  differing Reviews / Saved-place shapes). */
function rowFromProps(props: Record<string, unknown>): DiscoveryRow | null {
  const loc = (props.location ?? props.Location ?? {}) as Record<string, unknown>;
  const name = STR(loc.name) ?? STR(props.name) ?? STR(props.Title) ?? STR(props.title);
  if (!name) return null;
  const country = STR(loc.country_code) ?? STR(loc.countryCode) ?? STR(props.country_code);
  const stars = NUM(props.five_star_rating_published) ?? NUM(props.star_rating) ?? NUM(props.rating) ?? NUM(props.Rating);
  const note = STR(props.review_text_published) ?? STR(props.review_text) ?? STR(props.Comment) ?? STR(props.Note);
  return {
    name,
    category: inferCategory(name),
    verdict: verdictForStars(stars),
    countryCode: country ? country.toUpperCase() : undefined,
    note,
  };
}

/** Minimal CSV parse for the "Saved list" CSV export (Title,Note,URL,…). */
function parseCsvRows(text: string): DiscoveryRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
  const ti = header.indexOf('title');
  const ni = header.indexOf('note');
  if (ti < 0) return [];
  const out: DiscoveryRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    // naive split is fine for these exports (titles rarely contain commas + quotes here)
    const cells = lines[i].match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)?.map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim()) ?? [];
    const name = cells[ti];
    if (!name) continue;
    out.push({ name, category: inferCategory(name), note: ni >= 0 ? cells[ni] || undefined : undefined });
  }
  return out;
}

/** Parse a Google Takeout Maps export (Reviews or Saved list) into discovery
 *  rows. Accepts GeoJSON (FeatureCollection or feature array) or CSV. */
export function parseTakeout(text: string): DiscoveryRow[] {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    let data: unknown;
    try { data = JSON.parse(trimmed); } catch { return []; }
    const features: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray((data as Record<string, unknown>).features)
        ? ((data as Record<string, unknown>).features as unknown[])
        : [];
    const out: DiscoveryRow[] = [];
    for (const f of features) {
      const feat = f as Record<string, unknown>;
      const props = (feat.properties ?? feat) as Record<string, unknown>;
      const row = rowFromProps(props);
      if (row) out.push(row);
    }
    // Dedupe by name (Takeout can list a place in several saved lists).
    const seen = new Set<string>();
    return out.filter((r) => { const k = r.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  }
  return parseCsvRows(trimmed);
}

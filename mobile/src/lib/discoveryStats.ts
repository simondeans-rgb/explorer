import {
  DISCOVERY_CATEGORIES,
  type Discovery,
  type DiscoveryCategory,
} from '../types';

export interface DiscoveryStats {
  total: number;
  restaurants: number; // food category — feeds Culinary Explorer
  recommended: number; // positively recommended
  hiddenGems: number; // verdict === 'hidden-gem'
  withNote: number; // has a written note
  byCategory: Record<DiscoveryCategory, number>;
  /** Count per finer sub-category id (cafe, beach, nightlife, …). */
  bySubcategory: Record<string, number>;
}

const POSITIVE = new Set(['recommend', 'hidden-gem', 'worth-visiting']);

export function computeDiscoveryStats(items: Discovery[]): DiscoveryStats {
  const byCategory = Object.fromEntries(
    DISCOVERY_CATEGORIES.map((c) => [c, 0]),
  ) as Record<DiscoveryCategory, number>;
  const bySubcategory: Record<string, number> = {};

  let restaurants = 0;
  let recommended = 0;
  let hiddenGems = 0;
  let withNote = 0;
  for (const d of items) {
    byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;
    if (d.subcategory) bySubcategory[d.subcategory] = (bySubcategory[d.subcategory] ?? 0) + 1;
    if (d.category === 'food') restaurants += 1;
    if (d.verdict && POSITIVE.has(d.verdict)) recommended += 1;
    if (d.verdict === 'hidden-gem') hiddenGems += 1;
    if (d.note && d.note.trim()) withNote += 1;
  }

  return { total: items.length, restaurants, recommended, hiddenGems, withNote, byCategory, bySubcategory };
}

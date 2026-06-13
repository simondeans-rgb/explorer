import {
  DISCOVERY_CATEGORIES,
  type Discovery,
  type DiscoveryCategory,
} from '../types';

export interface DiscoveryStats {
  total: number;
  restaurants: number; // food category — feeds Culinary Explorer
  recommended: number; // positively recommended
  byCategory: Record<DiscoveryCategory, number>;
}

const POSITIVE = new Set(['recommend', 'hidden-gem', 'worth-visiting']);

export function computeDiscoveryStats(items: Discovery[]): DiscoveryStats {
  const byCategory = Object.fromEntries(
    DISCOVERY_CATEGORIES.map((c) => [c, 0]),
  ) as Record<DiscoveryCategory, number>;

  let restaurants = 0;
  let recommended = 0;
  for (const d of items) {
    byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;
    if (d.category === 'food') restaurants += 1;
    if (d.verdict && POSITIVE.has(d.verdict)) recommended += 1;
  }

  return { total: items.length, restaurants, recommended, byCategory };
}

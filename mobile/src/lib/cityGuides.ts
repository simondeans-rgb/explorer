// Trusted City Guides — the review's #1 idea. Compile your own and your
// circle's verdicts into a per-city guide ("Your circle's Lisbon"): every
// place someone you trust rated, best first. Pure aggregation over data the
// app already holds; nothing is fetched.
import { countryName } from '../data/countries';
import type { Discovery, RecommendationVerdict } from '../types';
import type { CircleFriend } from './circle';

export interface GuideEntry {
  discovery: Discovery;
  /** Who left it: 'You' or the friend's first name. */
  by: string;
  mine: boolean;
}

export interface CityGuide {
  /** Stable route key: `${countryCode}|${city lowercased}` (encode for URLs). */
  key: string;
  city: string;
  countryCode: string;
  countryName: string;
  entries: GuideEntry[];
  contributors: string[];
  gems: number;
  recommends: number;
}

const VERDICT_RANK: Record<RecommendationVerdict, number> = {
  'hidden-gem': 5,
  recommend: 4,
  'worth-visiting': 3,
  overrated: 1,
  avoid: 0,
};
const rank = (d: Discovery) => (d.verdict ? VERDICT_RANK[d.verdict] : 2);

const norm = (s: string) => s.trim().toLowerCase();

export function guideKey(countryCode: string, city: string): string {
  return `${countryCode}|${norm(city)}`;
}

/** Build every city guide available from your + your circle's discoveries.
 *  Sorted by richness (entry count, then gems) — the best guides first. */
export function buildCityGuides(
  mine: Discovery[],
  circle: Discovery[],
  friends: CircleFriend[],
): CityGuide[] {
  const nameByUid = new Map(friends.map((f) => [f.uid, f.name.split(' ')[0]]));
  const guides = new Map<string, CityGuide>();

  const add = (d: Discovery, by: string, isMine: boolean) => {
    if (!d.city || !d.countryCode) return;
    const key = guideKey(d.countryCode, d.city);
    let g = guides.get(key);
    if (!g) {
      g = {
        key,
        city: d.city.trim(),
        countryCode: d.countryCode,
        countryName: countryName(d.countryCode),
        entries: [],
        contributors: [],
        gems: 0,
        recommends: 0,
      };
      guides.set(key, g);
    }
    // The same venue may be rated by several people — keep each voice, but
    // drop exact duplicates from the same person.
    if (g.entries.some((e) => e.by === by && norm(e.discovery.name) === norm(d.name))) return;
    g.entries.push({ discovery: d, by, mine: isMine });
    if (d.verdict === 'hidden-gem') g.gems += 1;
    if (d.verdict === 'recommend') g.recommends += 1;
  };

  for (const d of mine) add(d, 'You', true);
  for (const d of circle) add(d, nameByUid.get(d.userId) ?? 'A friend', false);

  const out = [...guides.values()];
  for (const g of out) {
    g.entries.sort((a, b) => rank(b.discovery) - rank(a.discovery) || b.discovery.createdAt - a.discovery.createdAt);
    g.contributors = [...new Set(g.entries.map((e) => e.by))];
  }
  return out.sort((a, b) => b.entries.length - a.entries.length || b.gems - a.gems || a.city.localeCompare(b.city));
}

/** The guides relevant to one country (for the country page section). */
export function guidesForCountry(guides: CityGuide[], countryCode: string): CityGuide[] {
  return guides.filter((g) => g.countryCode === countryCode);
}

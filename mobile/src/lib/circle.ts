// Aggregations that turn your circle's raw places + discoveries into the social
// surfaces on the Your Circle screen: recent visits, wishlists, and the places
// the most friends recommend.
import { countryName } from '../data/countries';
import { DISCOVERY_CATEGORY_META, subcategoryLabel } from '../types';
import type { Place, Discovery, RecommendationVerdict } from '../types';

export interface CircleFriend {
  uid: string;
  name: string;
}

const norm = (s: string) => s.trim().toLowerCase();
const recencyOf = (p: Place): number =>
  Math.max(
    p.createdAt || 0,
    p.firstDate ? Date.parse(p.firstDate) || 0 : 0,
    p.firstYear ? Date.UTC(p.firstYear, 0, 1) : 0,
  );

// ── Recently visited, per friend ───────────────────────────────────────────
export interface FriendRecent {
  uid: string;
  name: string;
  recency: number;
  places: { name: string; countryCode: string }[];
}

export function recentVisits(places: Place[], friends: CircleFriend[], perFriend = 4): FriendRecent[] {
  const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
  const byFriend = new Map<string, { name: string; countryCode: string; r: number }[]>();
  for (const p of places) {
    if (p.kind !== 'city' || !p.name) continue;
    if (!p.relationships.some((r) => r !== 'aspiring')) continue; // visited, not wishlist
    if (!nameByUid.has(p.userId)) continue;
    const list = byFriend.get(p.userId) ?? [];
    list.push({ name: p.name, countryCode: p.countryCode, r: recencyOf(p) });
    byFriend.set(p.userId, list);
  }
  const out: FriendRecent[] = [];
  for (const [uid, list] of byFriend) {
    list.sort((a, b) => b.r - a.r);
    const top = list.slice(0, perFriend);
    out.push({ uid, name: nameByUid.get(uid)!, recency: top[0]?.r ?? 0, places: top.map(({ name, countryCode }) => ({ name, countryCode })) });
  }
  return out.sort((a, b) => b.recency - a.recency);
}

// ── Wishlists, per friend (aspiring places) ────────────────────────────────
export interface FriendWishlist {
  uid: string;
  name: string;
  places: { name: string; countryCode: string }[];
}

export function wishlists(places: Place[], friends: CircleFriend[], perFriend = 6): FriendWishlist[] {
  const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
  const byFriend = new Map<string, { name: string; countryCode: string }[]>();
  for (const p of places) {
    if (!p.relationships.includes('aspiring')) continue;
    if (p.relationships.some((r) => r !== 'aspiring')) continue; // pure wishlist
    if (!nameByUid.has(p.userId)) continue;
    const name = p.kind === 'country' ? countryName(p.countryCode) || p.name : p.name;
    if (!name) continue;
    const list = byFriend.get(p.userId) ?? [];
    if (!list.some((x) => x.name === name)) list.push({ name, countryCode: p.countryCode });
    byFriend.set(p.userId, list);
  }
  const out: FriendWishlist[] = [];
  for (const [uid, list] of byFriend) {
    if (list.length) out.push({ uid, name: nameByUid.get(uid)!, places: list.slice(0, perFriend) });
  }
  return out.sort((a, b) => b.places.length - a.places.length);
}

// ── Aggregated recommendations ─────────────────────────────────────────────
const POSITIVE: RecommendationVerdict[] = ['hidden-gem', 'recommend', 'worth-visiting'];
const PRIORITY: Record<string, number> = { 'hidden-gem': 0, recommend: 1, 'worth-visiting': 2 };

export interface CirclePerson {
  name: string;
  verdict?: RecommendationVerdict;
  note?: string;
}
export interface CircleRec {
  key: string;
  name: string;
  countryCode?: string;
  city?: string;
  headline: RecommendationVerdict;
  count: number; // friends giving the headline verdict
  total: number; // friends endorsing (any positive)
  people: CirclePerson[];
}

export function circleRecommendations(discoveries: Discovery[], friends: CircleFriend[], limit = 6): CircleRec[] {
  const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
  interface Agg {
    name: string;
    countryCode?: string;
    city?: string;
    byUid: Map<string, { verdict: RecommendationVerdict; note?: string }>;
  }
  const map = new Map<string, Agg>();
  for (const d of discoveries) {
    if (!d.verdict || !POSITIVE.includes(d.verdict) || !nameByUid.has(d.userId)) continue;
    const key = `${norm(d.name)}|${d.countryCode ?? ''}`;
    const a = map.get(key) ?? { name: d.name, countryCode: d.countryCode, city: d.city, byUid: new Map() };
    const existing = a.byUid.get(d.userId);
    if (!existing || PRIORITY[d.verdict] < PRIORITY[existing.verdict]) a.byUid.set(d.userId, { verdict: d.verdict, note: d.note });
    if (!a.city && d.city) a.city = d.city;
    map.set(key, a);
  }
  const recs: CircleRec[] = [];
  for (const [key, a] of map) {
    const total = a.byUid.size;
    if (total < 2) continue;
    const tally: Record<string, number> = {};
    for (const v of a.byUid.values()) tally[v.verdict] = (tally[v.verdict] ?? 0) + 1;
    let headline: RecommendationVerdict = 'recommend';
    let best = -1;
    for (const v of POSITIVE) {
      const c = tally[v] ?? 0;
      if (c > best || (c === best && PRIORITY[v] < PRIORITY[headline])) {
        best = c;
        headline = v;
      }
    }
    const people = [...a.byUid.entries()].map(([uid, v]) => ({ name: nameByUid.get(uid)!, verdict: v.verdict, note: v.note }));
    recs.push({ key, name: a.name, countryCode: a.countryCode, city: a.city, headline, count: tally[headline] ?? 0, total, people });
  }
  return recs.sort((a, b) => b.total - a.total || b.count - a.count).slice(0, limit);
}

// ── Most-visited country across the circle ─────────────────────────────────
export interface MostVisited {
  countryCode: string;
  name: string;
  count: number;
}

export function mostVisitedCountry(places: Place[], friends: CircleFriend[]): MostVisited | null {
  const friendUids = new Set(friends.map((f) => f.uid));
  const byCountry = new Map<string, Set<string>>();
  for (const p of places) {
    if (!friendUids.has(p.userId) || !p.countryCode) continue;
    if (!p.relationships.some((r) => r !== 'aspiring')) continue;
    const s = byCountry.get(p.countryCode) ?? new Set<string>();
    s.add(p.userId);
    byCountry.set(p.countryCode, s);
  }
  let best: MostVisited | null = null;
  for (const [code, uids] of byCountry) {
    if (uids.size < 2) continue;
    if (!best || uids.size > best.count) best = { countryCode: code, name: countryName(code) || code, count: uids.size };
  }
  return best;
}

// ── Travel compatibility (taste overlap) ───────────────────────────────────
function tasteTokens(discoveries: Discovery[]): { counts: Map<string, number>; labels: Map<string, string> } {
  const counts = new Map<string, number>();
  const labels = new Map<string, string>();
  for (const d of discoveries) {
    const weight = d.verdict && POSITIVE.includes(d.verdict) ? 2 : 1;
    const key = d.subcategory || `cat:${d.category}`;
    const label = d.subcategory ? subcategoryLabel(d.category, d.subcategory) ?? d.subcategory : DISCOVERY_CATEGORY_META[d.category].label;
    counts.set(key, (counts.get(key) ?? 0) + weight);
    labels.set(key, label);
  }
  return { counts, labels };
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  for (const [k, x] of a) dot += x * (b.get(k) ?? 0);
  let na = 0;
  for (const v of a.values()) na += v * v;
  let nb = 0;
  for (const v of b.values()) nb += v * v;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

export interface Compatibility {
  uid: string;
  name: string;
  match: number; // 0–100
  confident: boolean; // enough data on both sides
  shared: string[]; // tastes you both lean into
  diverge: string[]; // tastes they lean into that you don't
}

export function travelCompatibility(mine: Discovery[], friendDiscoveries: Discovery[], friends: CircleFriend[]): Compatibility[] {
  const me = tasteTokens(mine);
  const byFriend = new Map<string, Discovery[]>();
  for (const d of friendDiscoveries) {
    const l = byFriend.get(d.userId) ?? [];
    l.push(d);
    byFriend.set(d.userId, l);
  }
  const out: Compatibility[] = [];
  for (const f of friends) {
    const fd = byFriend.get(f.uid) ?? [];
    const theirs = tasteTokens(fd);
    const match = Math.round(cosine(me.counts, theirs.counts) * 100);
    const shared = [...theirs.counts.keys()]
      .filter((k) => (me.counts.get(k) ?? 0) > 0)
      .sort((a, b) => Math.min(theirs.counts.get(b)!, me.counts.get(b) ?? 0) - Math.min(theirs.counts.get(a)!, me.counts.get(a) ?? 0))
      .slice(0, 4)
      .map((k) => theirs.labels.get(k) || me.labels.get(k) || k);
    const diverge = [...theirs.counts.entries()]
      .filter(([k]) => (me.counts.get(k) ?? 0) === 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => theirs.labels.get(k) || k);
    out.push({ uid: f.uid, name: f.name, match, confident: mine.length >= 3 && fd.length >= 3, shared, diverge });
  }
  return out.sort((a, b) => b.match - a.match);
}

// ── Story feed: a few engaging "From your Circle" items ────────────────────
export interface CircleStoryItem {
  key: string;
  kind: 'recommended' | 'wishlisted' | 'visited';
  name: string;
  countryCode?: string;
  city?: string;
  byline: string;
  note?: string;
  people: CirclePerson[];
}

export function circleStoryItems(discoveries: Discovery[], places: Place[], friends: CircleFriend[], limit = 5): CircleStoryItem[] {
  const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
  const items: CircleStoryItem[] = [];
  const seen = new Set<string>();

  // 1) Recommendations that carry a note — the most evocative.
  const recd = discoveries
    .filter((d) => d.verdict && POSITIVE.includes(d.verdict) && d.note && nameByUid.has(d.userId))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  for (const d of recd) {
    const key = `${norm(d.name)}|${d.countryCode ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ key, kind: 'recommended', name: d.name, countryCode: d.countryCode, city: d.city, byline: `Recommended by ${nameByUid.get(d.userId)}`, note: d.note, people: [{ name: nameByUid.get(d.userId)!, verdict: d.verdict, note: d.note }] });
    if (items.length >= 3) break;
  }

  // 2) A place several friends are wishlisting.
  const wish = new Map<string, { name: string; countryCode: string; uids: Set<string> }>();
  for (const p of places) {
    if (!p.relationships.includes('aspiring') || p.relationships.some((r) => r !== 'aspiring') || !nameByUid.has(p.userId)) continue;
    const name = p.kind === 'country' ? countryName(p.countryCode) || p.name : p.name;
    if (!name) continue;
    const key = `${norm(name)}|${p.countryCode}`;
    const e = wish.get(key) ?? { name, countryCode: p.countryCode, uids: new Set<string>() };
    e.uids.add(p.userId);
    wish.set(key, e);
  }
  for (const [key, e] of [...wish.entries()].sort((a, b) => b[1].uids.size - a[1].uids.size)) {
    if (e.uids.size < 2 || seen.has(key)) break;
    seen.add(key);
    items.push({ key, kind: 'wishlisted', name: e.name, countryCode: e.countryCode, byline: `Wishlisted by ${e.uids.size} of your circle`, people: [] });
    break;
  }

  // 3) A friend's recent visit.
  for (const f of recentVisits(places, friends, 1)) {
    const p = f.places[0];
    if (!p) continue;
    const key = `${norm(p.name)}|${p.countryCode}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ key, kind: 'visited', name: p.name, countryCode: p.countryCode, byline: `${f.name} recently visited`, people: [] });
    if (items.length >= limit) break;
  }

  return items.slice(0, limit);
}

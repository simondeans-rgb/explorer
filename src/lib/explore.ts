// Aggregations powering the Explore browser: who (you and your friends) has
// been to each country, which cities, and what each friend recommended there —
// drilling down to the city level so a friend's picks in a place can be opened.

import {
  DISCOVERY_RELATIONSHIPS,
  type Discovery,
  type Place,
  type RecommendationVerdict,
  type Relationship,
} from '../types';
import type { AcceptedFriend } from './friends';

function isDiscovery(rels: Iterable<Relationship>): boolean {
  for (const r of rels) if (DISCOVERY_RELATIONSHIPS.includes(r)) return true;
  return false;
}

export interface FriendRec {
  name: string;
  city?: string;
  verdict?: RecommendationVerdict;
}

export interface FriendInCountry {
  uid: string;
  name: string;
  relationships: Relationship[];
  cities: string[];
  recommendations: FriendRec[];
}

export interface CountryPresence {
  /** Your own relationships with the country (empty if you've not been). */
  mine: Relationship[];
  myCities: string[];
  friends: FriendInCountry[];
}

/** Build per-country presence for you + friends, with city lists and the
 *  friends' recommendations (discoveries) in that country. */
export function buildCountryPresence(
  myUid: string,
  friends: AcceptedFriend[],
  myPlaces: Place[],
  myDiscoveries: Discovery[],
  friendPlaces: Place[],
  friendDiscoveries: Discovery[],
): Map<string, CountryPresence> {
  const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
  const result = new Map<string, CountryPresence>();

  const ensure = (code: string): CountryPresence => {
    let p = result.get(code);
    if (!p) {
      p = { mine: [], myCities: [], friends: [] };
      result.set(code, p);
    }
    return p;
  };

  // ── You ──────────────────────────────────────────────────────────────────
  const myRels = new Map<string, Set<Relationship>>();
  const myCitySet = new Map<string, Set<string>>();
  for (const pl of myPlaces) {
    if (!pl.countryCode || pl.userId !== myUid) continue;
    const set = myRels.get(pl.countryCode) ?? new Set<Relationship>();
    for (const r of pl.relationships) if (r !== 'aspiring') set.add(r);
    myRels.set(pl.countryCode, set);
    if (pl.kind === 'city' && isDiscovery(pl.relationships)) {
      const cs = myCitySet.get(pl.countryCode) ?? new Set<string>();
      cs.add(pl.name);
      myCitySet.set(pl.countryCode, cs);
    }
  }
  for (const [code, set] of myRels) {
    if (!isDiscovery(set)) continue;
    const p = ensure(code);
    p.mine = [...set];
    p.myCities = [...(myCitySet.get(code) ?? [])].sort((a, b) =>
      a.localeCompare(b),
    );
  }

  // ── Friends ──────────────────────────────────────────────────────────────
  // code -> uid -> { rels, cities }
  const fRels = new Map<string, Map<string, Set<Relationship>>>();
  const fCities = new Map<string, Map<string, Set<string>>>();
  for (const pl of friendPlaces) {
    if (!pl.countryCode || !nameByUid.has(pl.userId)) continue;
    const byUid = fRels.get(pl.countryCode) ?? new Map();
    const set = byUid.get(pl.userId) ?? new Set<Relationship>();
    for (const r of pl.relationships) if (r !== 'aspiring') set.add(r);
    byUid.set(pl.userId, set);
    fRels.set(pl.countryCode, byUid);
    if (pl.kind === 'city' && isDiscovery(pl.relationships)) {
      const cByUid = fCities.get(pl.countryCode) ?? new Map();
      const cs = cByUid.get(pl.userId) ?? new Set<string>();
      cs.add(pl.name);
      cByUid.set(pl.userId, cs);
      fCities.set(pl.countryCode, cByUid);
    }
  }

  // code -> uid -> recommendations
  const fRecs = new Map<string, Map<string, FriendRec[]>>();
  for (const d of friendDiscoveries) {
    if (!d.countryCode || !nameByUid.has(d.userId)) continue;
    const byUid = fRecs.get(d.countryCode) ?? new Map();
    const list = byUid.get(d.userId) ?? [];
    list.push({ name: nameByUid.get(d.userId) ?? 'Member', city: d.city, verdict: d.verdict });
    byUid.set(d.userId, list);
    fRecs.set(d.countryCode, byUid);
  }

  const codes = new Set<string>([...fRels.keys(), ...fRecs.keys()]);
  for (const code of codes) {
    const relByUid = fRels.get(code);
    const recByUid = fRecs.get(code);
    const cityByUid = fCities.get(code);
    const uids = new Set<string>([
      ...(relByUid ? relByUid.keys() : []),
      ...(recByUid ? recByUid.keys() : []),
    ]);
    const list: FriendInCountry[] = [];
    for (const uid of uids) {
      const relationships = [...(relByUid?.get(uid) ?? [])];
      const recommendations = recByUid?.get(uid) ?? [];
      if (!isDiscovery(relationships) && recommendations.length === 0) continue;
      list.push({
        uid,
        name: nameByUid.get(uid) ?? 'Member',
        relationships,
        cities: [...(cityByUid?.get(uid) ?? [])].sort((a, b) => a.localeCompare(b)),
        recommendations,
      });
    }
    if (list.length) {
      list.sort((a, b) => a.name.localeCompare(b.name));
      ensure(code).friends = list;
    }
  }

  return result;
}

export interface DiscoveryRec {
  name: string;
  city?: string;
  category: string;
  verdict?: RecommendationVerdict;
  note?: string;
}

/** A single friend's recommendations in one country, grouped by city — for the
 *  "open their profile in this city" drill-down. */
export function friendRecommendationsInCountry(
  friendUid: string,
  countryCode: string,
  friendDiscoveries: Discovery[],
): Map<string, DiscoveryRec[]> {
  const byCity = new Map<string, DiscoveryRec[]>();
  for (const d of friendDiscoveries) {
    if (d.userId !== friendUid || d.countryCode !== countryCode) continue;
    const city = d.city?.trim() || 'Elsewhere';
    const list = byCity.get(city) ?? [];
    list.push({
      name: d.name,
      city: d.city,
      category: d.category,
      verdict: d.verdict,
      note: d.note,
    });
    byCity.set(city, list);
  }
  return byCity;
}

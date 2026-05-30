import {
  DISCOVERY_RELATIONSHIPS,
  type Discovery,
  type Place,
  type RecommendationVerdict,
  type Relationship,
} from '../types';
import type { Connection } from './connections';

export interface AcceptedFriend {
  uid: string;
  name: string;
}

/** The accepted friends of `me`, with their display names. */
export function acceptedFriends(
  connections: Connection[],
  myUid: string,
): AcceptedFriend[] {
  return connections
    .filter((c) => c.status === 'accepted')
    .map((c) => {
      const other = c.members.find((m) => m !== myUid) ?? '';
      return { uid: other, name: c.names[other] || 'Member' };
    })
    .filter((f) => f.uid);
}

export interface FriendPresence {
  uid: string;
  name: string;
  relationships: Relationship[];
  discoveries: { name: string; verdict?: RecommendationVerdict }[];
}

function isDiscovery(rels: Relationship[]): boolean {
  return rels.some((r) => DISCOVERY_RELATIONSHIPS.includes(r));
}

/** Build a map of country code → friends present there, with their effective
 *  relationships and the discoveries they recorded in that country. Powers the
 *  "friends who've been here" panel. */
export function friendsByCountry(
  friends: AcceptedFriend[],
  places: Place[],
  discoveries: Discovery[],
): Map<string, FriendPresence[]> {
  const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
  const result = new Map<string, FriendPresence[]>();

  // country code -> uid -> relationships
  const rels = new Map<string, Map<string, Set<Relationship>>>();
  for (const p of places) {
    if (!p.countryCode || !nameByUid.has(p.userId)) continue;
    const byUid = rels.get(p.countryCode) ?? new Map();
    const set = byUid.get(p.userId) ?? new Set<Relationship>();
    for (const r of p.relationships) if (r !== 'aspiring') set.add(r);
    byUid.set(p.userId, set);
    rels.set(p.countryCode, byUid);
  }

  // country code -> uid -> discoveries
  const discs = new Map<
    string,
    Map<string, { name: string; verdict?: RecommendationVerdict }[]>
  >();
  for (const d of discoveries) {
    if (!d.countryCode || !nameByUid.has(d.userId)) continue;
    const byUid = discs.get(d.countryCode) ?? new Map();
    const list = byUid.get(d.userId) ?? [];
    list.push({ name: d.name, verdict: d.verdict });
    byUid.set(d.userId, list);
    discs.set(d.countryCode, byUid);
  }

  const codes = new Set([...rels.keys(), ...discs.keys()]);
  for (const code of codes) {
    const relByUid = rels.get(code);
    const discByUid = discs.get(code);
    const uids = new Set<string>([
      ...(relByUid ? relByUid.keys() : []),
      ...(discByUid ? discByUid.keys() : []),
    ]);
    const presences: FriendPresence[] = [];
    for (const uid of uids) {
      const relationships = [...(relByUid?.get(uid) ?? [])];
      const friendDiscoveries = discByUid?.get(uid) ?? [];
      // Only surface a friend if they actually discovered the country or left
      // a discovery there.
      if (!isDiscovery(relationships) && friendDiscoveries.length === 0)
        continue;
      presences.push({
        uid,
        name: nameByUid.get(uid) ?? 'Member',
        relationships,
        discoveries: friendDiscoveries,
      });
    }
    if (presences.length) {
      presences.sort((a, b) => a.name.localeCompare(b.name));
      result.set(code, presences);
    }
  }

  return result;
}

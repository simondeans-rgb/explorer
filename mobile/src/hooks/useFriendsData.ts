import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  Discovery,
  DiscoveryCategory,
  Place,
  PlaceKind,
  RecommendationVerdict,
  Relationship,
} from '../types';

interface FriendsData {
  places: Place[];
  discoveries: Discovery[];
}

function mapPlace(d: { id: string; data: () => Record<string, unknown> }): Place {
  const data = d.data();
  return {
    id: d.id,
    userId: data.userId as string,
    kind: (data.kind ?? 'country') as PlaceKind,
    countryCode: (data.countryCode ?? '') as string,
    name: (data.name ?? '') as string,
    relationships: (data.relationships ?? []) as Relationship[],
    firstYear: typeof data.firstYear === 'number' ? data.firstYear : undefined,
    note: (data.note as string) || undefined,
    createdAt: 0,
    updatedAt: 0,
  };
}

function mapDiscovery(d: {
  id: string;
  data: () => Record<string, unknown>;
}): Discovery {
  const data = d.data();
  return {
    id: d.id,
    userId: data.userId as string,
    name: (data.name ?? '') as string,
    category: (data.category ?? 'food') as DiscoveryCategory,
    countryCode: (data.countryCode as string) || undefined,
    city: (data.city as string) || undefined,
    landmark: (data.landmark as string) || undefined,
    verdict: (data.verdict as RecommendationVerdict) || undefined,
    note: (data.note as string) || undefined,
    createdAt: 0,
    updatedAt: 0,
  };
}

/** Subscribes to accepted friends' places & discoveries (read-only, gated by
 *  the Firestore rules). Firestore `in` supports up to 30 ids. */
export function useFriendsData(friendUids: string[]): FriendsData {
  const [data, setData] = useState<FriendsData>({
    places: [],
    discoveries: [],
  });
  const key = [...friendUids].sort().join(',');

  useEffect(() => {
    const uids = key ? key.split(',') : [];
    if (!db || uids.length === 0) {
      setData({ places: [], discoveries: [] });
      return;
    }
    const batch = uids.slice(0, 30);
    const unsubs: Array<() => void> = [];
    unsubs.push(
      onSnapshot(
        query(collection(db, 'places'), where('userId', 'in', batch)),
        (snap: QuerySnapshot) =>
          setData((d) => ({ ...d, places: snap.docs.map(mapPlace) })),
        () => setData((d) => ({ ...d, places: [] })),
      ),
    );
    unsubs.push(
      onSnapshot(
        query(collection(db, 'discoveries'), where('userId', 'in', batch)),
        (snap: QuerySnapshot) =>
          setData((d) => ({ ...d, discoveries: snap.docs.map(mapDiscovery) })),
        () => setData((d) => ({ ...d, discoveries: [] })),
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, [key]);

  return data;
}

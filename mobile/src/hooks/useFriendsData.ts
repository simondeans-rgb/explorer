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
  Expedition,
  Journey,
  Place,
  PlaceKind,
  RecommendationVerdict,
  Relationship,
} from '../types';

interface FriendsData {
  places: Place[];
  discoveries: Discovery[];
  expeditions: Expedition[];
}

/** Firestore Timestamp / number → millis. */
function millis(v: unknown): number {
  if (v && typeof v === 'object') {
    const t = v as { toMillis?: () => number; seconds?: number };
    if (typeof t.toMillis === 'function') return t.toMillis();
    if (typeof t.seconds === 'number') return t.seconds * 1000;
  }
  return typeof v === 'number' ? v : 0;
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
    firstDate: (data.firstDate as string) || undefined,
    note: (data.note as string) || undefined,
    createdAt: millis(data.createdAt),
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
    subcategory: (data.subcategory as string) || undefined,
    countryCode: (data.countryCode as string) || undefined,
    city: (data.city as string) || undefined,
    landmark: (data.landmark as string) || undefined,
    verdict: (data.verdict as RecommendationVerdict) || undefined,
    note: (data.note as string) || undefined,
    createdAt: millis(data.createdAt),
    updatedAt: 0,
  };
}

function mapExpedition(d: { id: string; data: () => Record<string, unknown> }): Expedition {
  const data = d.data();
  return {
    id: d.id,
    userId: data.userId as string,
    title: (data.title ?? '') as string,
    startDate: (data.startDate as string) || undefined,
    endDate: (data.endDate as string) || undefined,
    countryCodes: (data.countryCodes ?? []) as string[],
    journeys: (data.journeys ?? []) as Journey[],
    note: (data.note as string) || undefined,
    createdAt: millis(data.createdAt),
    updatedAt: 0,
  };
}

/** Subscribes to accepted friends' places, discoveries & trips (read-only, gated
 *  by the Firestore rules — if trip reads aren't permitted the trips list simply
 *  stays empty). Firestore `in` supports up to 30 ids. */
export function useFriendsData(friendUids: string[]): FriendsData {
  const [data, setData] = useState<FriendsData>({
    places: [],
    discoveries: [],
    expeditions: [],
  });
  const key = [...friendUids].sort().join(',');

  useEffect(() => {
    const uids = key ? key.split(',') : [];
    if (!db || uids.length === 0) {
      setData({ places: [], discoveries: [], expeditions: [] });
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
    unsubs.push(
      onSnapshot(
        query(collection(db, 'expeditions'), where('userId', 'in', batch)),
        (snap: QuerySnapshot) =>
          setData((d) => ({ ...d, expeditions: snap.docs.map(mapExpedition) })),
        () => setData((d) => ({ ...d, expeditions: [] })),
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, [key]);

  return data;
}

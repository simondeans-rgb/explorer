import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import * as local from './localTrips';
import type { ItineraryItem, RecommendationVerdict, Trip } from '../types';

const COLLECTION = 'trips';

function millis(ts: { toMillis?: () => number } | undefined): number {
  return ts?.toMillis?.() ?? Date.now();
}

function readItinerary(raw: unknown): ItineraryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    const o = r as Record<string, unknown>;
    return {
      id: String(o.id ?? Math.random().toString(36).slice(2)),
      name: String(o.name ?? ''),
      city: (o.city as string) || undefined,
      fromFriend: (o.fromFriend as string) || undefined,
      verdict: (o.verdict as RecommendationVerdict) || undefined,
    } satisfies ItineraryItem;
  });
}

/** Firestore rejects `undefined` — build clean itinerary maps. */
function itineraryToDoc(items: ItineraryItem[]) {
  return items.map((i) => ({
    id: i.id,
    name: i.name.trim(),
    city: i.city?.trim() || null,
    fromFriend: i.fromFriend || null,
    verdict: i.verdict || null,
  }));
}

export function subscribeTrips(
  userId: string,
  onChange: (items: Trip[]) => void,
): () => void {
  if (!db) return local.subscribeTrips(userId, onChange);
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snap: QuerySnapshot) => {
    const items: Trip[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        title: data.title ?? '',
        countryCode: data.countryCode ?? '',
        startDate: data.startDate ?? '',
        endDate: data.endDate || undefined,
        itinerary: readItinerary(data.itinerary),
        note: data.note || undefined,
        createdAt: millis(data.createdAt),
        updatedAt: millis(data.updatedAt),
      } satisfies Trip;
    });
    onChange(items);
  });
}

export interface TripInput {
  title: string;
  countryCode: string;
  startDate: string;
  endDate?: string;
  itinerary?: ItineraryItem[];
  note?: string;
}

function toDoc(input: TripInput) {
  return {
    title: input.title.trim(),
    countryCode: input.countryCode,
    startDate: input.startDate,
    endDate: input.endDate || null,
    itinerary: itineraryToDoc(input.itinerary ?? []),
    note: input.note?.trim() || null,
  };
}

export async function createTrip(
  userId: string,
  input: TripInput,
): Promise<string | null> {
  if (!db) return local.createTrip(userId, input);
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    ...toDoc(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTrip(
  id: string,
  input: TripInput,
): Promise<void> {
  if (!db) return local.updateTrip(id, input);
  await updateDoc(doc(db, COLLECTION, id), {
    ...toDoc(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTrip(id: string): Promise<void> {
  if (!db) return local.deleteTrip(id);
  await deleteDoc(doc(db, COLLECTION, id));
}

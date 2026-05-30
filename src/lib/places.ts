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
import * as local from './localPlaces';
import type { Place, PlaceKind, Relationship } from '../types';

const COLLECTION = 'places';

function millis(ts: { toMillis?: () => number } | undefined): number {
  return ts?.toMillis?.() ?? Date.now();
}

export function subscribePlaces(
  userId: string,
  onChange: (places: Place[]) => void,
): () => void {
  if (!db) return local.subscribePlaces(userId, onChange);
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snap: QuerySnapshot) => {
    const places: Place[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        kind: (data.kind ?? 'country') as PlaceKind,
        countryCode: data.countryCode ?? '',
        name: data.name ?? '',
        relationships: (data.relationships ?? []) as Relationship[],
        firstYear:
          typeof data.firstYear === 'number' ? data.firstYear : undefined,
        livedFrom: data.livedFrom || undefined,
        livedTo: data.livedTo || undefined,
        note: data.note || undefined,
        createdAt: millis(data.createdAt),
        updatedAt: millis(data.updatedAt),
      } satisfies Place;
    });
    onChange(places);
  });
}

export interface PlaceInput {
  kind: PlaceKind;
  countryCode: string;
  name: string;
  relationships: Relationship[];
  firstYear?: number;
  livedFrom?: string;
  livedTo?: string;
  note?: string;
}

// Firestore rejects `undefined`; strip optional fields when they're empty.
function toDoc(input: PlaceInput) {
  const out: Record<string, unknown> = {
    kind: input.kind,
    countryCode: input.countryCode,
    name: input.name.trim(),
    relationships: input.relationships,
  };
  if (typeof input.firstYear === 'number' && !Number.isNaN(input.firstYear)) {
    out.firstYear = input.firstYear;
  } else {
    out.firstYear = null;
  }
  out.livedFrom = input.livedFrom || null;
  out.livedTo = input.livedTo || null;
  out.note = input.note?.trim() ? input.note.trim() : null;
  return out;
}

export async function createPlace(
  userId: string,
  input: PlaceInput,
): Promise<string | null> {
  if (!db) return local.createPlace(userId, input);
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    ...toDoc(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePlace(
  id: string,
  input: PlaceInput,
): Promise<void> {
  if (!db) return local.updatePlace(id, input);
  await updateDoc(doc(db, COLLECTION, id), {
    ...toDoc(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePlace(id: string): Promise<void> {
  if (!db) return local.deletePlace(id);
  await deleteDoc(doc(db, COLLECTION, id));
}

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import * as local from './localSaved';

export type SavedKind = 'recommendation' | 'memory' | 'place' | 'discovery';

/** A bookmarked thing the Member wants to keep or return to — a friend's
 *  recommendation, a memory, a place on the wishlist. Stored lean (display
 *  fields only, imagery resolved from the country code at render). */
export interface SavedItem {
  id: string;
  userId: string;
  /** Stable de-dupe key so a thing can be toggled saved/unsaved. */
  key: string;
  kind: SavedKind;
  name: string;
  countryCode?: string;
  city?: string;
  createdAt: number;
}

export interface SavedInput {
  key: string;
  kind: SavedKind;
  name: string;
  countryCode?: string;
  city?: string;
}

const COLLECTION = 'saved';

function millis(ts: { toMillis?: () => number } | undefined): number {
  return ts?.toMillis?.() ?? Date.now();
}

export function subscribeSaved(
  userId: string,
  onChange: (items: SavedItem[]) => void,
): () => void {
  if (!db) return local.subscribeSaved(userId, onChange);
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snap: QuerySnapshot) => {
    const items: SavedItem[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        key: data.key ?? '',
        kind: (data.kind ?? 'place') as SavedKind,
        name: data.name ?? '',
        countryCode: data.countryCode || undefined,
        city: data.city || undefined,
        createdAt: millis(data.createdAt),
      } satisfies SavedItem;
    });
    onChange(items);
  });
}

function toDoc(input: SavedInput) {
  return {
    key: input.key,
    kind: input.kind,
    name: input.name.trim(),
    countryCode: input.countryCode || null,
    city: input.city?.trim() || null,
  };
}

export async function createSaved(
  userId: string,
  input: SavedInput,
): Promise<string | null> {
  if (!db) return local.createSaved(userId, input);
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    ...toDoc(input),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteSaved(id: string): Promise<void> {
  if (!db) return local.deleteSaved(id);
  await deleteDoc(doc(db, COLLECTION, id));
}

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
import * as local from './localCaptures';
import type { Capture } from '../types';

const COLLECTION = 'captures';

function millis(ts: { toMillis?: () => number } | undefined): number {
  return ts?.toMillis?.() ?? Date.now();
}

export function subscribeCaptures(
  userId: string,
  onChange: (items: Capture[]) => void,
): () => void {
  if (!db) return local.subscribeCaptures(userId, onChange);
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snap: QuerySnapshot) => {
    const items: Capture[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        dataUrl: data.dataUrl ?? '',
        countryCode: data.countryCode || undefined,
        city: data.city || undefined,
        expeditionId: data.expeditionId || undefined,
        discoveryId: data.discoveryId || undefined,
        caption: data.caption || undefined,
        createdAt: millis(data.createdAt),
      } satisfies Capture;
    });
    onChange(items);
  });
}

export interface CaptureInput {
  dataUrl: string;
  countryCode?: string;
  city?: string;
  expeditionId?: string;
  discoveryId?: string;
  caption?: string;
}

// Firestore rejects `undefined`; empty optionals become `null`.
function toDoc(input: CaptureInput) {
  return {
    dataUrl: input.dataUrl,
    countryCode: input.countryCode || null,
    city: input.city?.trim() || null,
    expeditionId: input.expeditionId || null,
    discoveryId: input.discoveryId || null,
    caption: input.caption?.trim() || null,
  };
}

export async function createCapture(
  userId: string,
  input: CaptureInput,
): Promise<string | null> {
  if (!db) return local.createCapture(userId, input);
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    ...toDoc(input),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteCapture(id: string): Promise<void> {
  if (!db) return local.deleteCapture(id);
  await deleteDoc(doc(db, COLLECTION, id));
}

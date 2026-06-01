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
import * as local from './localDiscoveries';
import type {
  Discovery,
  DiscoveryCategory,
  RecommendationVerdict,
} from '../types';

const COLLECTION = 'discoveries';

function millis(ts: { toMillis?: () => number } | undefined): number {
  return ts?.toMillis?.() ?? Date.now();
}

export function subscribeDiscoveries(
  userId: string,
  onChange: (items: Discovery[]) => void,
): () => void {
  if (!db) return local.subscribeDiscoveries(userId, onChange);
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snap: QuerySnapshot) => {
    const items: Discovery[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        name: data.name ?? '',
        category: (data.category ?? 'food') as DiscoveryCategory,
        countryCode: data.countryCode || undefined,
        city: data.city || undefined,
        landmark: data.landmark || undefined,
        expeditionId: data.expeditionId || undefined,
        verdict: (data.verdict || undefined) as
          | RecommendationVerdict
          | undefined,
        note: data.note || undefined,
        createdAt: millis(data.createdAt),
        updatedAt: millis(data.updatedAt),
      } satisfies Discovery;
    });
    onChange(items);
  });
}

export interface DiscoveryInput {
  name: string;
  category: DiscoveryCategory;
  countryCode?: string;
  city?: string;
  landmark?: string;
  expeditionId?: string;
  verdict?: RecommendationVerdict;
  note?: string;
}

// Firestore rejects `undefined`; empty optionals become `null`.
function toDoc(input: DiscoveryInput) {
  return {
    name: input.name.trim(),
    category: input.category,
    countryCode: input.countryCode || null,
    city: input.city?.trim() || null,
    landmark: input.landmark?.trim() || null,
    expeditionId: input.expeditionId || null,
    verdict: input.verdict || null,
    note: input.note?.trim() || null,
  };
}

export async function createDiscovery(
  userId: string,
  input: DiscoveryInput,
): Promise<string | null> {
  if (!db) return local.createDiscovery(userId, input);
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    ...toDoc(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDiscovery(
  id: string,
  input: DiscoveryInput,
): Promise<void> {
  if (!db) return local.updateDiscovery(id, input);
  await updateDoc(doc(db, COLLECTION, id), {
    ...toDoc(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDiscovery(id: string): Promise<void> {
  if (!db) return local.deleteDiscovery(id);
  await deleteDoc(doc(db, COLLECTION, id));
}

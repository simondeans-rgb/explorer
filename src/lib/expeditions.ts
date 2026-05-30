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
import * as local from './localExpeditions';
import type { Expedition, Journey } from '../types';

const COLLECTION = 'expeditions';

function millis(ts: { toMillis?: () => number } | undefined): number {
  return ts?.toMillis?.() ?? Date.now();
}

export function subscribeExpeditions(
  userId: string,
  onChange: (items: Expedition[]) => void,
): () => void {
  if (!db) return local.subscribeExpeditions(userId, onChange);
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snap: QuerySnapshot) => {
    const items: Expedition[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        title: data.title ?? '',
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        countryCodes: (data.countryCodes ?? []) as string[],
        journeys: (data.journeys ?? []) as Journey[],
        note: data.note || undefined,
        createdAt: millis(data.createdAt),
        updatedAt: millis(data.updatedAt),
      } satisfies Expedition;
    });
    onChange(items);
  });
}

export interface ExpeditionInput {
  title: string;
  startDate?: string;
  endDate?: string;
  countryCodes: string[];
  journeys: Journey[];
  note?: string;
}

function toDoc(input: ExpeditionInput) {
  return {
    title: input.title.trim(),
    startDate: input.startDate || null,
    endDate: input.endDate || null,
    countryCodes: input.countryCodes ?? [],
    journeys: input.journeys ?? [],
    note: input.note?.trim() || null,
  };
}

export async function createExpedition(
  userId: string,
  input: ExpeditionInput,
): Promise<string | null> {
  if (!db) return local.createExpedition(userId, input);
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    ...toDoc(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateExpedition(
  id: string,
  input: ExpeditionInput,
): Promise<void> {
  if (!db) return local.updateExpedition(id, input);
  await updateDoc(doc(db, COLLECTION, id), {
    ...toDoc(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExpedition(id: string): Promise<void> {
  if (!db) return local.deleteExpedition(id);
  await deleteDoc(doc(db, COLLECTION, id));
}

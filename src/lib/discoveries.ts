import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadImage, deleteImage } from './storage';
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
        subcategory: data.subcategory || undefined,
        countryCode: data.countryCode || undefined,
        city: data.city || undefined,
        landmark: data.landmark || undefined,
        expeditionId: data.expeditionId || undefined,
        verdict: (data.verdict || undefined) as
          | RecommendationVerdict
          | undefined,
        note: data.note || undefined,
        photo: data.photo || undefined,
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
  subcategory?: string;
  countryCode?: string;
  city?: string;
  landmark?: string;
  expeditionId?: string;
  verdict?: RecommendationVerdict;
  note?: string;
  photo?: string;
}

// Firestore rejects `undefined`; empty optionals become `null`.
function toDoc(input: DiscoveryInput) {
  return {
    name: input.name.trim(),
    category: input.category,
    subcategory: input.subcategory || null,
    countryCode: input.countryCode || null,
    city: input.city?.trim() || null,
    landmark: input.landmark?.trim() || null,
    expeditionId: input.expeditionId || null,
    verdict: input.verdict || null,
    note: input.note?.trim() || null,
    photo: input.photo || null,
  };
}

/** Build the document fields, uploading any new data-URL photo to Storage. */
async function toDocWithPhoto(userId: string, input: DiscoveryInput) {
  const img = input.photo
    ? await uploadImage(userId, 'discoveries', input.photo)
    : { url: undefined as string | undefined, path: '' };
  return { ...toDoc({ ...input, photo: img.url }), photoPath: img.path || null };
}

export async function createDiscovery(
  userId: string,
  input: DiscoveryInput,
): Promise<string | null> {
  if (!db) return local.createDiscovery(userId, input);
  const ref = await addDoc(collection(db, COLLECTION), {
    userId,
    ...(await toDocWithPhoto(userId, input)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDiscovery(
  userId: string,
  id: string,
  input: DiscoveryInput,
): Promise<void> {
  if (!db) return local.updateDiscovery(id, input);
  const refd = doc(db, COLLECTION, id);
  const fields = await toDocWithPhoto(userId, input);
  // If the photo changed or was removed, clean up the previous Storage object.
  if (fields.photoPath || !input.photo) {
    try {
      const prev = await getDoc(refd);
      const oldPath = prev.data()?.photoPath as string | undefined;
      if (oldPath && oldPath !== fields.photoPath) await deleteImage(oldPath);
    } catch {
      /* best-effort */
    }
  }
  await updateDoc(refd, { ...fields, updatedAt: serverTimestamp() });
}

export async function deleteDiscovery(id: string): Promise<void> {
  if (!db) return local.deleteDiscovery(id);
  try {
    const snap = await getDoc(doc(db, COLLECTION, id));
    await deleteImage(snap.data()?.photoPath as string | undefined);
  } catch {
    /* best-effort image cleanup */
  }
  await deleteDoc(doc(db, COLLECTION, id));
}

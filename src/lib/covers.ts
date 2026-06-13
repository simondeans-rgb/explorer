import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadImage, deleteImage } from './storage';
import * as local from './localCovers';

/** A user's custom cover photo for a country — overrides the bundled image
 *  everywhere that country is shown. Compact JPEG data URL. */
export interface Cover {
  countryCode: string;
  dataUrl: string;
}

const COLLECTION = 'covers';
// Deterministic per (user, country) doc id so setting is an idempotent upsert.
const docId = (userId: string, code: string) => `${userId}__${code}`;

export function subscribeCovers(
  userId: string,
  onChange: (map: Map<string, string>) => void,
): () => void {
  if (!db) return local.subscribeCovers(userId, onChange);
  const q = query(collection(db, COLLECTION), where('userId', '==', userId));
  return onSnapshot(q, (snap: QuerySnapshot) => {
    const map = new Map<string, string>();
    for (const d of snap.docs) {
      const data = d.data();
      if (data.countryCode && data.dataUrl) map.set(data.countryCode, data.dataUrl);
    }
    onChange(map);
  });
}

export async function setCover(
  userId: string,
  countryCode: string,
  dataUrl: string,
): Promise<void> {
  if (!db) return local.setCover(userId, countryCode, dataUrl);
  const ref = doc(db, COLLECTION, docId(userId, countryCode));
  // Clean up the previously stored image (covers overwrite in place).
  try {
    const prev = await getDoc(ref);
    await deleteImage(prev.data()?.storagePath as string | undefined);
  } catch {
    /* best-effort */
  }
  const img = await uploadImage(userId, 'covers', dataUrl);
  await setDoc(ref, {
    userId,
    countryCode,
    dataUrl: img.url,
    storagePath: img.path || null,
    updatedAt: serverTimestamp(),
  });
}

export async function removeCover(
  userId: string,
  countryCode: string,
): Promise<void> {
  if (!db) return local.removeCover(userId, countryCode);
  const ref = doc(db, COLLECTION, docId(userId, countryCode));
  try {
    const snap = await getDoc(ref);
    await deleteImage(snap.data()?.storagePath as string | undefined);
  } catch {
    /* best-effort */
  }
  await deleteDoc(ref);
}

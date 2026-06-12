import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
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
  await setDoc(doc(db, COLLECTION, docId(userId, countryCode)), {
    userId,
    countryCode,
    dataUrl,
    updatedAt: serverTimestamp(),
  });
}

export async function removeCover(
  userId: string,
  countryCode: string,
): Promise<void> {
  if (!db) return local.removeCover(userId, countryCode);
  await deleteDoc(doc(db, COLLECTION, docId(userId, countryCode)));
}

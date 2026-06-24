import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export interface LikeState {
  count: number;
  likedByMe: boolean;
}

/** One like per (capture, member) — deterministic id keeps it idempotent. */
export function likeDocId(captureId: string, uid: string): string {
  return `${captureId}__${uid}`;
}

/** Subscribe to likes for up to 30 captures → map of captureId → {count, likedByMe}.
 *  Read access is gated by the Firestore rules; on error the map is empty. */
export function subscribeLikes(
  captureIds: string[],
  myUid: string,
  onChange: (m: Record<string, LikeState>) => void,
): () => void {
  if (!db || captureIds.length === 0) {
    onChange({});
    return () => {};
  }
  const batch = captureIds.slice(0, 30);
  return onSnapshot(
    query(collection(db, 'likes'), where('captureId', 'in', batch)),
    (snap) => {
      const m: Record<string, LikeState> = {};
      for (const id of batch) m[id] = { count: 0, likedByMe: false };
      snap.forEach((d) => {
        const data = d.data() as { captureId?: string; uid?: string };
        const cid = data.captureId;
        if (!cid || !m[cid]) return;
        m[cid].count += 1;
        if (data.uid === myUid) m[cid].likedByMe = true;
      });
      onChange(m);
    },
    () => onChange({}),
  );
}

/** Toggle the current member's like on a capture. */
export async function toggleLike(captureId: string, ownerUid: string, myUid: string, currentlyLiked: boolean): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'likes', likeDocId(captureId, myUid));
  if (currentlyLiked) await deleteDoc(ref);
  else await setDoc(ref, { captureId, ownerUid, uid: myUid, createdAt: serverTimestamp() });
}

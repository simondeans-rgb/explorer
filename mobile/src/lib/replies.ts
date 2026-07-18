// One-line replies on a friend's shared capture — "we're going in May!" —
// closing the loop that likes open. Modeled on likes.ts: a flat `replies`
// collection, subscribed per visible batch of captures. The author's display
// name is stored on the doc so every reader can render it, even when the
// replier isn't in the reader's own circle.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export const REPLY_MAX_LEN = 280;

export interface Reply {
  id: string;
  captureId: string;
  uid: string;
  name: string;
  text: string;
  /** ms epoch — 0 until the server timestamp resolves. */
  createdAt: number;
}

/** Subscribe to replies for up to 30 captures → map of captureId → replies
 *  (oldest first). On permission/network errors the map is empty. */
export function subscribeReplies(
  captureIds: string[],
  onChange: (m: Record<string, Reply[]>) => void,
): () => void {
  if (!db || captureIds.length === 0) {
    onChange({});
    return () => {};
  }
  const batch = captureIds.slice(0, 30);
  return onSnapshot(
    query(collection(db, 'replies'), where('captureId', 'in', batch)),
    (snap) => {
      const m: Record<string, Reply[]> = {};
      for (const id of batch) m[id] = [];
      snap.forEach((d) => {
        const data = d.data() as Partial<Reply> & { createdAt?: { toMillis?: () => number } };
        const cid = data.captureId;
        if (!cid || !m[cid] || typeof data.text !== 'string') return;
        m[cid].push({
          id: d.id,
          captureId: cid,
          uid: data.uid ?? '',
          name: data.name || 'A member',
          text: data.text,
          createdAt: data.createdAt?.toMillis?.() ?? 0,
        });
      });
      for (const id of batch) m[id].sort((a, b) => a.createdAt - b.createdAt);
      onChange(m);
    },
    () => onChange({}),
  );
}

/** Post a reply on a capture. Trimmed and length-capped to match the rules. */
export async function addReply(captureId: string, ownerUid: string, myUid: string, myName: string, text: string): Promise<void> {
  if (!db) return;
  const clean = text.trim().slice(0, REPLY_MAX_LEN);
  if (!clean) return;
  await addDoc(collection(db, 'replies'), {
    captureId,
    ownerUid,
    uid: myUid,
    name: myName || 'A member',
    text: clean,
    createdAt: serverTimestamp(),
  });
}

/** Remove one of your own replies. */
export async function deleteReply(replyId: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'replies', replyId));
}

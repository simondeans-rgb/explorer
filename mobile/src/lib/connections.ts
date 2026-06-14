import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QuerySnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { getProfileName, resolveCode } from './profile';

export type ConnectionStatus = 'pending' | 'accepted';

export interface Connection {
  id: string;
  members: string[];
  status: ConnectionStatus;
  requestedBy: string;
  names: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

function pairId(a: string, b: string): string {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

export function subscribeConnections(
  uid: string,
  onChange: (connections: Connection[]) => void,
): () => void {
  if (!db) {
    onChange([]);
    return () => undefined;
  }
  const q = query(
    collection(db, 'connections'),
    where('members', 'array-contains', uid),
  );
  return onSnapshot(
    q,
    (snap: QuerySnapshot) => {
      onChange(
        snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            members: (x.members ?? []) as string[],
            status: (x.status ?? 'pending') as ConnectionStatus,
            requestedBy: x.requestedBy ?? '',
            names: (x.names ?? {}) as Record<string, string>,
            createdAt: x.createdAt?.toMillis?.() ?? Date.now(),
            updatedAt: x.updatedAt?.toMillis?.() ?? Date.now(),
          } satisfies Connection;
        }),
      );
    },
    () => onChange([]),
  );
}

export interface RequestResult {
  ok: boolean;
  error?: string;
}

export async function sendRequest(
  me: { uid: string; name: string },
  code: string,
): Promise<RequestResult> {
  if (!db) return { ok: false, error: 'Connecting requires signing in.' };
  try {
    const otherUid = await resolveCode(code);
    if (!otherUid) return { ok: false, error: 'No member found for that code.' };
    if (otherUid === me.uid) {
      return { ok: false, error: 'That’s your own code.' };
    }

    const id = pairId(me.uid, otherUid);
    const ref = doc(db, 'connections', id);

    // Check for an existing connection. Reading a not-yet-existing doc can be
    // rejected by stricter rules, so a failure here is treated as "none yet".
    try {
      const existing = await getDoc(ref);
      if (existing.exists()) {
        return {
          ok: false,
          error:
            existing.data().status === 'accepted'
              ? 'You’re already connected.'
              : 'A request is already pending with this member.',
        };
      }
    } catch {
      /* fall through and attempt to create the request */
    }

    let otherName = 'Member';
    try {
      otherName = await getProfileName(otherUid);
    } catch {
      /* name is best-effort */
    }

    await setDoc(ref, {
      members: [me.uid, otherUid],
      status: 'pending',
      requestedBy: me.uid,
      names: { [me.uid]: me.name, [otherUid]: otherName },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (e) {
    const errCode =
      typeof e === 'object' && e && 'code' in e ? String(e.code) : '';
    if (errCode.includes('permission-denied')) {
      return {
        ok: false,
        error:
          'Couldn’t send the request — the database rules may need updating.',
      };
    }
    return { ok: false, error: 'Couldn’t send the request. Please try again.' };
  }
}

export async function acceptConnection(id: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, 'connections', id), {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  });
}

export async function removeConnection(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, 'connections', id));
}

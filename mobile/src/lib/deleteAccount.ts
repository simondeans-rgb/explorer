// Permanently delete the signed-in user's account and their data. Required for
// the App Store (Guideline 5.1.1(v)). The caller re-authenticates first (via the
// auth store's provider-aware `reauthenticate`, since Apple/Google users have no
// password); this best-effort wipes the user's Firestore documents + Storage
// folder, then removes the auth account.
import { deleteUser } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './firebase';

// Collections whose documents carry a `userId` owner field.
const OWNED_COLLECTIONS = ['places', 'discoveries', 'expeditions', 'captures', 'saved', 'covers', 'trips'];

async function deleteFirestoreData(uid: string): Promise<void> {
  if (!db) return;
  for (const name of OWNED_COLLECTIONS) {
    try {
      const snap = await getDocs(query(collection(db, name), where('userId', '==', uid)));
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref).catch(() => {})));
    } catch {
      /* keep going — best effort */
    }
  }
  // Profile (read its share code first), the code→uid resolver, and any
  // friend connections this user is part of.
  try {
    const profRef = doc(db, 'profiles', uid);
    const prof = await getDoc(profRef);
    const code = prof.exists() ? (prof.data().code as string | undefined) : undefined;
    if (code) await deleteDoc(doc(db, 'codes', code)).catch(() => {});
    await deleteDoc(profRef).catch(() => {});
  } catch {
    /* ignore */
  }
  try {
    const conns = await getDocs(query(collection(db, 'connections'), where('members', 'array-contains', uid)));
    await Promise.all(conns.docs.map((d) => deleteDoc(d.ref).catch(() => {})));
  } catch {
    /* ignore */
  }
}

async function deleteStorageFolder(uid: string): Promise<void> {
  if (!storage) return;
  try {
    const root = ref(storage, `users/${uid}`);
    const res = await listAll(root);
    await Promise.all(res.items.map((i) => deleteObject(i).catch(() => {})));
    for (const sub of res.prefixes) {
      const subRes = await listAll(sub);
      await Promise.all(subRes.items.map((i) => deleteObject(i).catch(() => {})));
    }
  } catch {
    /* ignore */
  }
}

/** Wipe the signed-in user's data and delete their auth account. The caller
 *  MUST have just re-authenticated (Firebase requires a recent login). */
export async function deleteAccountAndData(): Promise<void> {
  const user = auth?.currentUser;
  if (!auth || !user) throw new Error('Not signed in.');
  const uid = user.uid;
  // Best-effort remove the user's data, then the auth account (signs them out).
  await deleteFirestoreData(uid);
  await deleteStorageFolder(uid);
  await deleteUser(user);
}

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Member share codes. Format SD-XXXXXX using an unambiguous alphabet.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(): string {
  let s = '';
  for (let i = 0; i < 6; i++)
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return `SD-${s}`;
}

/** Stable code for offline/demo mode, where there's no codes registry. */
function deterministicCode(uid: string): string {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h * 31 + uid.charCodeAt(i)) | 0;
  let n = Math.abs(h);
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += ALPHABET[n % ALPHABET.length];
    n = Math.floor(n / ALPHABET.length);
  }
  return `SD-${s}`;
}

export interface MemberProfile {
  uid: string;
  code: string;
  name: string;
}

const photoKey = (uid: string) => `explorer:photo:${uid}`;

/** Read the Member's passport photo (a small data URL), if any. Stored on the
 *  profile doc when signed in, or in localStorage for the offline/demo mode. */
export async function loadProfilePhoto(uid: string): Promise<string | null> {
  if (!db) {
    try {
      return localStorage.getItem(photoKey(uid));
    } catch {
      return null;
    }
  }
  try {
    const snap = await getDoc(doc(db, 'profiles', uid));
    return snap.exists() ? ((snap.data().photo as string | undefined) ?? null) : null;
  } catch {
    return null;
  }
}

/** Save (or clear, with null) the Member's passport photo. */
export async function saveProfilePhoto(
  uid: string,
  photo: string | null,
): Promise<void> {
  if (!db) {
    try {
      if (photo) localStorage.setItem(photoKey(uid), photo);
      else localStorage.removeItem(photoKey(uid));
    } catch {
      /* ignore quota / private-mode failures */
    }
    return;
  }
  await setDoc(doc(db, 'profiles', uid), { photo }, { merge: true });
}

/** Ensure the Member has a profile + a unique code registered, returning it. */
export async function ensureProfile(
  uid: string,
  name: string,
): Promise<MemberProfile> {
  if (!db) return { uid, code: deterministicCode(uid), name };

  const pref = doc(db, 'profiles', uid);
  const snap = await getDoc(pref);
  if (snap.exists() && snap.data().code) {
    const data = snap.data();
    if (data.name !== name) await setDoc(pref, { name }, { merge: true });
    return { uid, code: data.code as string, name };
  }

  let code = randomCode();
  for (let attempt = 0; attempt < 6; attempt++) {
    const cref = doc(db, 'codes', code);
    const taken = await getDoc(cref);
    if (taken.exists()) {
      code = randomCode();
      continue;
    }
    await setDoc(cref, { uid, createdAt: serverTimestamp() });
    break;
  }
  await setDoc(pref, { uid, code, name, createdAt: serverTimestamp() });
  return { uid, code, name };
}

export async function resolveCode(code: string): Promise<string | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'codes', code.trim().toUpperCase()));
  return snap.exists() ? (snap.data().uid as string) : null;
}

export async function getProfileName(uid: string): Promise<string> {
  if (!db) return 'Member';
  const snap = await getDoc(doc(db, 'profiles', uid));
  return snap.exists() ? (snap.data().name as string) : 'Member';
}

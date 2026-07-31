// Content-safety precautions for user-generated content (App Store Guideline
// 1.2): a submission filter, a report/flag mechanism, and user blocking.
//
//  • Filtering  — objectionable text is rejected client-side before it can be
//    shared with anyone (isObjectionable / assertClean).
//  • Reporting  — any member can flag a snap, reply, recommendation or member;
//    the report is written to `reports` for the moderation team to action.
//  • Blocking   — a member can block another: it severs the friendship (so the
//    blocked member's content is instantly inaccessible via the security
//    rules), records the block server-side (the developer's signal), and hides
//    them locally at once.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// The pure content filter lives in ./textFilter so it stays dependency-free and
// unit-testable; re-exported here as the moderation entry point.
export { isObjectionable, assertClean } from './textFilter';

// ── Blocking ──────────────────────────────────────────────────────────────
const BLOCKS_KEY = 'worldly.blockedUids';
const BLOCK_NAMES_KEY = 'worldly.blockedNames';
let blockedCache: Set<string> | null = null;

/** Remembered display name per blocked uid, so Settings → Blocked accounts can
 *  show who's blocked (the uid set alone isn't human-readable). Best-effort. */
async function loadBlockedNames(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(BLOCK_NAMES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** Deterministic connection id for a member pair (matches the security rules). */
function connId(a: string, b: string): string {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

/** Load (and cache) the set of uids this member has blocked. */
export async function loadBlockedUids(): Promise<Set<string>> {
  if (blockedCache) return blockedCache;
  try {
    const raw = await AsyncStorage.getItem(BLOCKS_KEY);
    blockedCache = new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    blockedCache = new Set<string>();
  }
  return blockedCache;
}

/** The blocked-uid set as last loaded — for synchronous filtering of feeds. */
export function blockedUidsSync(): Set<string> {
  return blockedCache ?? new Set<string>();
}

/** The blocked members as {uid, name} for the management screen. */
export async function loadBlockedList(): Promise<{ uid: string; name: string }[]> {
  const [set, names] = await Promise.all([loadBlockedUids(), loadBlockedNames()]);
  return [...set].map((uid) => ({ uid, name: names[uid] || 'Blocked member' }));
}

/** Block a member: record it, sever the friendship so their shared content is
 *  immediately inaccessible, and hide them locally at once. */
export async function blockUser(myUid: string, targetUid: string, name?: string): Promise<void> {
  const set = await loadBlockedUids();
  set.add(targetUid);
  await AsyncStorage.setItem(BLOCKS_KEY, JSON.stringify([...set])).catch(() => {});
  if (name) {
    const names = await loadBlockedNames();
    names[targetUid] = name;
    await AsyncStorage.setItem(BLOCK_NAMES_KEY, JSON.stringify(names)).catch(() => {});
  }
  if (db) {
    // Record the block (developer signal + prevents silent re-connection).
    await setDoc(doc(db, 'blocks', `${myUid}__${targetUid}`), {
      blocker: myUid,
      blocked: targetUid,
      createdAt: serverTimestamp(),
    }).catch(() => {});
    // Sever the connection — after this the security rules deny all reads of the
    // blocked member's places/captures/etc, removing them from the feed.
    await deleteDoc(doc(db, 'connections', connId(myUid, targetUid))).catch(() => {});
  }
}

/** Reverse a block (used from Settings → Blocked accounts). */
export async function unblockUser(myUid: string, targetUid: string): Promise<void> {
  const set = await loadBlockedUids();
  set.delete(targetUid);
  await AsyncStorage.setItem(BLOCKS_KEY, JSON.stringify([...set])).catch(() => {});
  const names = await loadBlockedNames();
  if (names[targetUid]) {
    delete names[targetUid];
    await AsyncStorage.setItem(BLOCK_NAMES_KEY, JSON.stringify(names)).catch(() => {});
  }
  if (db) await deleteDoc(doc(db, 'blocks', `${myUid}__${targetUid}`)).catch(() => {});
}

// ── Reporting ─────────────────────────────────────────────────────────────
export type ReportType = 'capture' | 'reply' | 'discovery' | 'user';

/** Flag content or a member for moderation review. Written to `reports`, which
 *  only the moderation team can read (see the security rules). */
export async function reportContent(input: {
  reporterUid: string;
  type: ReportType;
  targetId: string;
  ownerUid: string;
  reason?: string;
}): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, 'reports'), {
    reporterUid: input.reporterUid,
    type: input.type,
    targetId: input.targetId,
    ownerUid: input.ownerUid,
    reason: (input.reason || 'objectionable').slice(0, 500),
    createdAt: serverTimestamp(),
  });
}

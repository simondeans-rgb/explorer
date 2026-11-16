// Worldly Cloud Functions — push a heads-up to your circle when you log new
// travel, to your trip crew when a shared itinerary changes, and — most
// importantly — to YOU when a friend responds to you (a reply, a like, a
// circle request, an accepted request). Triggered on
// Firestore writes; sent via the Expo push service. Per-key cooldowns keep
// bursts (imports, drag-reorders) from flooding everyone.
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Expo, type ExpoPushMessage } from 'expo-server-sdk';

initializeApp();
setGlobalOptions({ maxInstances: 10 });
const db = getFirestore();
const expo = new Expo();

type Pref = 'friendActivity' | 'tripActivity';

/** Push tokens for the given users who opted into `pref`. */
async function tokensFor(uids: string[], pref: Pref): Promise<string[]> {
  if (!uids.length) return [];
  const out: string[] = [];
  await Promise.all(
    uids.map(async (uid) => {
      const t = (await db.collection('pushTokens').doc(uid).get()).data();
      if (t?.[pref] && typeof t.token === 'string' && Expo.isExpoPushToken(t.token)) out.push(t.token);
    }),
  );
  return out;
}

async function acceptedFriendUids(authorUid: string): Promise<string[]> {
  const snap = await db.collection('connections').where('members', 'array-contains', authorUid).get();
  const uids: string[] = [];
  snap.forEach((doc) => {
    const d = doc.data();
    if (d.status !== 'accepted') return;
    const other = (d.members as string[]).find((m) => m !== authorUid);
    if (other) uids.push(other);
  });
  return uids;
}

async function nameOf(uid: string): Promise<string> {
  const p = (await db.collection('profiles').doc(uid).get()).data();
  return (p?.name as string) || 'A friend';
}

/** True while `key` is still within `ms` of its last send (so we skip); otherwise stamps now. */
async function onCooldown(key: string, ms: number): Promise<boolean> {
  const ref = db.collection('activityThrottle').doc(key);
  const last = ((await ref.get()).data()?.last as number) || 0;
  if (Date.now() - last < ms) return true;
  await ref.set({ last: Date.now() }, { merge: true });
  return false;
}

async function sendPush(tokens: string[], title: string, body: string): Promise<void> {
  if (!tokens.length) return;
  const messages: ExpoPushMessage[] = tokens.map((to) => ({ to, sound: 'default', title, body }));
  for (const chunk of expo.chunkPushNotifications(messages)) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (e) {
      console.error('Expo push failed', e);
    }
  }
}

/** Notify the author's accepted friends (friend-activity), with a per-author cooldown. */
async function notifyFriends(authorUid: string, title: string, body: string): Promise<void> {
  const tokens = await tokensFor(await acceptedFriendUids(authorUid), 'friendActivity');
  if (!tokens.length) return;
  if (await onCooldown(`author_${authorUid}`, 30 * 60 * 1000)) return;
  await sendPush(tokens, title, body);
}

export const onPlaceCreated = onDocumentCreated('places/{id}', async (event) => {
  const d = event.data?.data();
  if (!d || d.kind !== 'country') return;
  const rels = (d.relationships as string[]) || [];
  if (!rels.some((r) => r !== 'aspiring')) return;
  const name = (d.name as string) || 'a new country';
  await notifyFriends(d.userId as string, '🌍 New on the map', `${await nameOf(d.userId as string)} just added ${name} to their map.`);
});

export const onDiscoveryCreated = onDocumentCreated('discoveries/{id}', async (event) => {
  const d = event.data?.data();
  if (!d) return;
  const verdict = d.verdict as string | undefined;
  if (verdict !== 'recommend' && verdict !== 'hidden-gem') return;
  const where = d.city ? ` in ${d.city}` : '';
  const tail = verdict === 'hidden-gem' ? '— a hidden gem' : '';
  await notifyFriends(d.userId as string, '⭐ A fresh recommendation', `${await nameOf(d.userId as string)} recommends ${d.name}${where} ${tail}`.trim());
});

export const onExpeditionCreated = onDocumentCreated('expeditions/{id}', async (event) => {
  const d = event.data?.data();
  if (!d) return;
  const title = (d.title as string) || 'a new trip';
  await notifyFriends(d.userId as string, '✈️ New journey', `${await nameOf(d.userId as string)} just logged ${title}.`);
});

/** A shared trip's itinerary or day-notes changed — tell the rest of the crew. */
export const onTripUpdated = onDocumentUpdated('trips/{id}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;
  const itinChanged = JSON.stringify(before.itinerary || []) !== JSON.stringify(after.itinerary || []);
  const notesChanged = JSON.stringify(before.dayNotes || {}) !== JSON.stringify(after.dayNotes || {});
  if (!itinChanged && !notesChanged) return;

  const members = (after.memberIds as string[]) || [];
  if (members.length < 2) return; // not a shared trip
  const actor = after.lastEditedBy as string | undefined;
  const recipients = members.filter((m) => m !== actor);
  const tokens = await tokensFor(recipients, 'tripActivity');
  if (!tokens.length) return;
  if (await onCooldown(`trip_${event.params.id}`, 15 * 60 * 1000)) return;

  const names = (after.memberNames as Record<string, string>) || {};
  const actorName = (actor && names[actor]) || (actor ? await nameOf(actor) : 'A crew member');
  const title = (after.title as string) || 'your trip';
  await sendPush(tokens, '🗺️ Trip updated', `${actorName} updated the “${title}” itinerary.`);
});

// ── Direct social signals ────────────────────────────────────────────────────
// These are the notifications that build a circle: someone responded to *you*.
// They go to one person, so they skip the broadcast cooldown and use a short
// per-pair throttle instead (so a flurry of likes is one buzz, not ten).

/** Push to a single member (respecting their friend-activity preference). */
async function notifyUser(uid: string, title: string, body: string): Promise<void> {
  await sendPush(await tokensFor([uid], 'friendActivity'), title, body);
}

/** The owner + caption of a capture (photo memory), or null if it's gone. */
async function captureOwner(captureId: string): Promise<{ uid: string; caption?: string } | null> {
  const c = (await db.collection('captures').doc(captureId).get()).data();
  return c?.userId ? { uid: c.userId as string, caption: (c.caption as string) || undefined } : null;
}

const clip = (text: string, n: number) => (text.length > n ? `${text.slice(0, n - 1).trimEnd()}…` : text);

/** A friend replied to one of your memories. */
export const onReplyCreated = onDocumentCreated('replies/{id}', async (event) => {
  const d = event.data?.data();
  if (!d || typeof d.captureId !== 'string' || typeof d.uid !== 'string') return;
  const owner = await captureOwner(d.captureId);
  if (!owner || owner.uid === d.uid) return; // gone, or replying to yourself
  if (await onCooldown(`reply_${owner.uid}_${d.uid}`, 60 * 1000)) return;
  const text = typeof d.text === 'string' ? clip(d.text.trim(), 90) : '';
  await notifyUser(owner.uid, `💬 ${await nameOf(d.uid)} replied`, text ? `“${text}”` : 'Tap to see what they said.');
});

/** A friend liked one of your memories. */
export const onLikeCreated = onDocumentCreated('likes/{id}', async (event) => {
  const d = event.data?.data();
  if (!d || typeof d.captureId !== 'string' || typeof d.uid !== 'string') return;
  const owner = await captureOwner(d.captureId);
  if (!owner || owner.uid === d.uid) return;
  if (await onCooldown(`like_${owner.uid}_${d.uid}`, 10 * 60 * 1000)) return;
  const about = owner.caption ? `“${clip(owner.caption, 60)}”` : 'your memory';
  await notifyUser(owner.uid, '❤️ New love for your memory', `${await nameOf(d.uid)} loved ${about}.`);
});

/** Someone asked to join your circle. */
export const onConnectionCreated = onDocumentCreated('connections/{id}', async (event) => {
  const d = event.data?.data();
  if (!d || d.status !== 'pending' || typeof d.requestedBy !== 'string') return;
  const recipient = ((d.members as string[]) || []).find((m) => m !== d.requestedBy);
  if (!recipient) return;
  await notifyUser(recipient, '👋 New circle request', `${await nameOf(d.requestedBy)} wants to share travels with you.`);
});

/** Your circle request was accepted. */
export const onConnectionAccepted = onDocumentUpdated('connections/{id}', async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();
  if (!before || !after) return;
  if (before.status === 'accepted' || after.status !== 'accepted' || typeof after.requestedBy !== 'string') return;
  const accepter = ((after.members as string[]) || []).find((m) => m !== after.requestedBy);
  if (!accepter) return;
  await notifyUser(after.requestedBy, '🎉 You’re connected', `${await nameOf(accepter)} accepted — see where they’ve been.`);
});

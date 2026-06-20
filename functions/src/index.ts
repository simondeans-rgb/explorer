// Worldly Cloud Functions — push a heads-up to your circle when you log new
// travel, and to your trip crew when a shared itinerary changes. Triggered on
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

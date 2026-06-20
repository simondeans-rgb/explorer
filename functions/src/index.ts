// Worldly Cloud Functions — when you log new travel, push a heads-up to the
// friends in your circle ("Sarah just added Morocco to her map"). Triggered on
// Firestore writes; sends via the Expo push service. A per-author cooldown
// keeps bulk imports from flooding everyone.
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Expo, type ExpoPushMessage } from 'expo-server-sdk';

initializeApp();
setGlobalOptions({ maxInstances: 10 });
const db = getFirestore();
const expo = new Expo();

const COOLDOWN_MS = 30 * 60 * 1000; // one friend-activity push per author / 30 min

interface Recipient { uid: string; token: string }

/** Accepted friends of `authorUid` who have friend-activity push enabled. */
async function recipientsFor(authorUid: string): Promise<Recipient[]> {
  const snap = await db.collection('connections').where('members', 'array-contains', authorUid).get();
  const friendUids: string[] = [];
  snap.forEach((doc) => {
    const d = doc.data();
    if (d.status !== 'accepted') return;
    const other = (d.members as string[]).find((m) => m !== authorUid);
    if (other) friendUids.push(other);
  });
  if (!friendUids.length) return [];
  const out: Recipient[] = [];
  await Promise.all(
    friendUids.map(async (uid) => {
      const t = (await db.collection('pushTokens').doc(uid).get()).data();
      if (t?.friendActivity && typeof t.token === 'string' && Expo.isExpoPushToken(t.token)) {
        out.push({ uid, token: t.token });
      }
    }),
  );
  return out;
}

async function authorName(uid: string): Promise<string> {
  const p = (await db.collection('profiles').doc(uid).get()).data();
  return (p?.name as string) || 'A friend';
}

/** True when the author is still within their cooldown (so we skip); otherwise
 *  stamps now and returns false. */
async function onCooldown(authorUid: string): Promise<boolean> {
  const ref = db.collection('activityThrottle').doc(authorUid);
  const last = ((await ref.get()).data()?.last as number) || 0;
  if (Date.now() - last < COOLDOWN_MS) return true;
  await ref.set({ last: Date.now() }, { merge: true });
  return false;
}

async function notify(authorUid: string, title: string, body: string): Promise<void> {
  const recipients = await recipientsFor(authorUid);
  if (!recipients.length) return;
  if (await onCooldown(authorUid)) return;
  const messages: ExpoPushMessage[] = recipients.map((r) => ({ to: r.token, sound: 'default', title, body }));
  for (const chunk of expo.chunkPushNotifications(messages)) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (e) {
      console.error('Expo push failed', e);
    }
  }
}

export const onPlaceCreated = onDocumentCreated('places/{id}', async (event) => {
  const d = event.data?.data();
  if (!d || d.kind !== 'country') return;
  const rels = (d.relationships as string[]) || [];
  if (!rels.some((r) => r !== 'aspiring')) return; // a place they've actually been
  const name = (d.name as string) || 'a new country';
  await notify(d.userId as string, '🌍 New on the map', `${await authorName(d.userId as string)} just added ${name} to their map.`);
});

export const onDiscoveryCreated = onDocumentCreated('discoveries/{id}', async (event) => {
  const d = event.data?.data();
  if (!d) return;
  const verdict = d.verdict as string | undefined;
  if (verdict !== 'recommend' && verdict !== 'hidden-gem') return;
  const where = d.city ? ` in ${d.city}` : '';
  const tail = verdict === 'hidden-gem' ? '— a hidden gem' : '';
  await notify(d.userId as string, '⭐ A fresh recommendation', `${await authorName(d.userId as string)} recommends ${d.name}${where} ${tail}`.trim());
});

export const onExpeditionCreated = onDocumentCreated('expeditions/{id}', async (event) => {
  const d = event.data?.data();
  if (!d) return;
  const title = (d.title as string) || 'a new trip';
  await notify(d.userId as string, '✈️ New journey', `${await authorName(d.userId as string)} just logged ${title}.`);
});

// Travel-anniversary local notifications — "On this day, N years ago you were
// in Lisbon." Fully on-device (no server): we compute the user's upcoming
// anniversaries from their trips + dated places and schedule one-shot local
// notifications, rescheduling on each app open so they stay fresh.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { countryName } from '../data/countries';
import type { Place, Expedition, Trip } from '../types';

const PREF_KEY = 'worldly.notif.anniversaries';
const POSTTRIP_KEY = 'worldly.notif.posttrip';

// Present notifications (banner + sound) even while the app is in the
// foreground. Without a handler, iOS silently drops foreground notifications —
// so a push that arrives while you're in the app would never be seen. Set at
// module load (this file is imported at startup via NotificationScheduler).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function anniversariesEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(PREF_KEY)) === '1';
  } catch {
    return false;
  }
}
export async function setAnniversariesEnabled(on: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(PREF_KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export async function postTripRemindersEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(POSTTRIP_KEY)) === '1';
  } catch {
    return false;
  }
}
export async function setPostTripRemindersEnabled(on: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(POSTTRIP_KEY, on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

interface Anniversary {
  next: number; // ms timestamp of next 9am occurrence
  title: string;
  body: string;
}

function parseDate(iso?: string): { y: number; m: number; d: number } | null {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}

function nextOccurrence(month: number, day: number): number {
  const now = new Date();
  let date = new Date(now.getFullYear(), month - 1, day, 9, 0, 0, 0);
  if (date.getTime() <= now.getTime()) date = new Date(now.getFullYear() + 1, month - 1, day, 9, 0, 0, 0);
  return date.getTime();
}

interface Ev { y: number; m: number; d: number; label: string; kind: 'trip' | 'place' }

export function computeAnniversaries(expeditions: Expedition[], places: Place[], limit = 24): Anniversary[] {
  const events: Ev[] = [];
  for (const e of expeditions) {
    const pd = parseDate(e.startDate);
    if (!pd) continue;
    const label = e.title || (e.countryCodes[0] ? countryName(e.countryCodes[0]) : '') || 'a trip';
    events.push({ ...pd, label, kind: 'trip' });
  }
  for (const p of places) {
    const pd = parseDate(p.firstDate);
    if (!pd) continue;
    const label = p.kind === 'country' ? countryName(p.countryCode) || p.name : p.name;
    if (!label) continue;
    events.push({ ...pd, label, kind: 'place' });
  }

  const byDate = new Map<string, Ev[]>();
  for (const ev of events) {
    const k = `${ev.m}-${ev.d}`;
    const l = byDate.get(k) ?? [];
    l.push(ev);
    byDate.set(k, l);
  }

  const out: Anniversary[] = [];
  for (const [k, evs] of byDate) {
    const [month, day] = k.split('-').map(Number);
    const next = nextOccurrence(month, day);
    const nextYear = new Date(next).getFullYear();
    // Lead with the oldest memory, trips before places.
    evs.sort((a, b) => (a.kind === b.kind ? a.y - b.y : a.kind === 'trip' ? -1 : 1));
    const lead = evs[0];
    const yearsAgo = nextYear - lead.y;
    if (yearsAgo <= 0) continue;
    const yrs = yearsAgo === 1 ? 'A year ago' : `${yearsAgo} years ago`;
    const verb = lead.kind === 'trip' ? 'you set off to' : 'you were in';
    const more = evs.length - 1;
    let body = `${yrs} today, ${verb} ${lead.label}.`;
    if (more > 0) body += ` (+${more} more memor${more === 1 ? 'y' : 'ies'})`;
    out.push({ next, title: 'On this day ✈️', body });
  }
  return out.sort((a, b) => a.next - b.next).slice(0, limit);
}

interface PostTripPrompt { at: number; title: string; body: string }

/** A one-shot "you just got back — log your discoveries" nudge ~36h after each
 *  planned trip ends, while the holiday glow is still fresh. Only future times. */
export function computePostTripPrompts(trips: Trip[], limit = 24): PostTripPrompt[] {
  const now = Date.now();
  const horizon = now + 400 * 24 * 3600 * 1000; // don't schedule absurdly far out
  const out: PostTripPrompt[] = [];
  for (const t of trips) {
    const end = parseDate(t.endDate || t.startDate);
    if (!end) continue;
    const at = new Date(end.y, end.m - 1, end.d, 10, 0, 0, 0).getTime() + 36 * 3600 * 1000;
    if (at <= now || at > horizon) continue;
    const country = t.countryCode ? countryName(t.countryCode) : '';
    out.push({
      at,
      title: country ? `How was ${country}? ✨` : 'How was your trip? ✨',
      body: `Add what you discovered — restaurants, museums, experiences — before the memories fade.`,
    });
  }
  return out.sort((a, b) => a.at - b.at).slice(0, limit);
}

/** Cancel and reschedule every on-device reminder we own (anniversaries +
 *  post-trip discovery nudges), honouring each toggle. Called on launch, on
 *  foreground, and whenever a toggle changes. */
export async function rescheduleNotifications(expeditions: Expedition[], places: Place[], trips: Trip[] = []): Promise<void> {
  try {
    if (!(await Notifications.getPermissionsAsync()).granted) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (await anniversariesEnabled()) {
      for (const a of computeAnniversaries(expeditions, places)) {
        await Notifications.scheduleNotificationAsync({
          content: { title: a.title, body: a.body },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: a.next },
        });
      }
    }
    if (await postTripRemindersEnabled()) {
      for (const p of computePostTripPrompts(trips)) {
        await Notifications.scheduleNotificationAsync({
          content: { title: p.title, body: p.body },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.at },
        });
      }
    }
  } catch {
    /* never let scheduling crash the app */
  }
}

/** @deprecated use rescheduleNotifications — kept for callers not yet migrated. */
export async function rescheduleAnniversaries(expeditions: Expedition[], places: Place[]): Promise<void> {
  return rescheduleNotifications(expeditions, places, []);
}

export async function cancelAnniversaries(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    /* ignore */
  }
}

// Lightweight product analytics (PostHog-compatible, zero dependencies).
//
// Deliberately dormant until EXPO_PUBLIC_POSTHOG_KEY is set — then events are
// batched and posted to PostHog's /batch endpoint over plain fetch. No SDK, no
// native module, so it's OTA-safe and adds nothing to the bundle. Never throws;
// failures are silently dropped (analytics must never break the app).
//
// What we send: event name, a random install id (or the signed-in uid after
// identify()), coarse platform info and the properties passed in. No email, no
// contacts, no location, no photos — ever.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
const ID_KEY = 'worldly.analytics.id';

const enabled = Boolean(KEY);

let distinctId: string | null = null;
let idReady: Promise<void> | null = null;

function randomId(): string {
  let s = '';
  for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
  return `anon-${s}`;
}

function ensureId(): Promise<void> {
  if (!idReady) {
    idReady = (async () => {
      try {
        const stored = await AsyncStorage.getItem(ID_KEY);
        if (stored) {
          distinctId = stored;
        } else {
          distinctId = randomId();
          await AsyncStorage.setItem(ID_KEY, distinctId);
        }
      } catch {
        distinctId = distinctId ?? randomId();
      }
    })();
  }
  return idReady;
}

interface QueuedEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flush(): Promise<void> {
  if (!enabled || queue.length === 0) return;
  const batch = queue;
  queue = [];
  try {
    await ensureId();
    await fetch(`${HOST}/batch/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: KEY,
        batch: batch.map((e) => ({
          event: e.event,
          distinct_id: distinctId,
          timestamp: e.timestamp,
          properties: { ...e.properties, $os: Platform.OS },
        })),
      }),
    });
  } catch {
    /* drop silently — analytics must never surface errors */
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, 3000);
}

/** Record a product event. No-op until EXPO_PUBLIC_POSTHOG_KEY is configured. */
export function track(event: string, properties: Record<string, unknown> = {}): void {
  if (!enabled) return;
  queue.push({ event, properties, timestamp: new Date().toISOString() });
  if (queue.length >= 20) void flush();
  else scheduleFlush();
}

/** Tie this install's events to the signed-in user (uid only — never email). */
export function identify(uid: string): void {
  if (!enabled || !uid) return;
  void (async () => {
    await ensureId();
    const anonId = distinctId;
    distinctId = uid;
    try {
      await AsyncStorage.setItem(ID_KEY, uid);
    } catch {
      /* ignore */
    }
    if (anonId && anonId !== uid) {
      track('$create_alias', { alias: anonId, distinct_id: uid });
    }
  })();
}

/** Whether analytics is live in this build (used to show a settings note). */
export function analyticsEnabled(): boolean {
  return enabled;
}

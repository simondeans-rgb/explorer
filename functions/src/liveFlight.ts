// Live-flight push: keeps the Lock Screen / Dynamic Island Live Activity
// current while the app is closed.
//
// The app registers `liveFlights/{uid}` (flight number, date and the
// activity's APNs push token) when it starts a Live Activity. Every couple of
// minutes this function looks up each tracked flight's status and, when
// something the activity shows has changed (gate, terminal, delay, revised
// times, boarding, take-off, landing), pushes the new state straight to that
// activity via APNs. Landing ends the activity and removes the document.
//
// Requires four secrets (see functions/README or the deploy notes):
//   APNS_KEY_P8   — contents of the Apple .p8 auth key (APNs enabled)
//   APNS_KEY_ID   — that key's 10-character Key ID
//   APNS_TEAM_ID  — the Apple Developer Team ID
//   AERODATABOX_KEY — RapidAPI key for AeroDataBox flight status
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import { createSign } from 'node:crypto';
import { connect, constants as h2 } from 'node:http2';

const APNS_KEY_P8 = defineSecret('APNS_KEY_P8');
const APNS_KEY_ID = defineSecret('APNS_KEY_ID');
const APNS_TEAM_ID = defineSecret('APNS_TEAM_ID');
const AERODATABOX_KEY = defineSecret('AERODATABOX_KEY');

const BUNDLE_ID = 'com.simmyd23.worldly';
const APNS_HOST = 'https://api.push.apple.com'; // TestFlight + App Store builds
const ADB_HOST = 'aerodatabox.p.rapidapi.com';

// ── Flight status ────────────────────────────────────────────────────────────

export type Phase = 'scheduled' | 'boarding' | 'enroute' | 'landed';

/** Exactly the Live Activity's ContentState (targets/widget/LiveActivity.swift). */
export interface ContentState {
  phase: Phase;
  departAt: number; // epoch seconds
  arriveAt: number;
  departLabel: string; // airport-local "HH:MM"
  arriveLabel: string;
  gate?: string;
  terminal?: string;
  delayMin?: number;
}

function utcMs(s: unknown): number | undefined {
  if (typeof s !== 'string' || !s) return undefined;
  const ms = Date.parse(s.replace(' ', 'T'));
  return Number.isFinite(ms) ? ms : undefined;
}
/** "2026-07-28 08:05+01:00" → "08:05". */
function localHHMM(s: unknown): string {
  return typeof s === 'string' && s.length >= 16 ? s.slice(11, 16) : '';
}
const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/** Mirrors the app's derivePhase (mobile/src/lib/liveFlight.ts), collapsed to
 *  the four states the activity draws. */
export function derivePhase(statusText: string | undefined, departMs: number, arriveMs: number, nowMs: number): Phase {
  const s = (statusText || '').toLowerCase();
  if (/arriv|land/.test(s)) return 'landed';
  if (/en ?route|airborne|in ?air|departed/.test(s)) return nowMs >= arriveMs ? 'landed' : 'enroute';
  if (/board/.test(s)) return 'boarding';
  if (nowMs >= arriveMs) return 'landed';
  if (nowMs >= departMs) return 'enroute';
  return 'scheduled';
}

/** Turn one AeroDataBox flight record into the activity's state. Null when the
 *  record lacks the times needed to draw anything. Pure — unit-testable. */
export function stateFromRecord(f: Record<string, any>, nowMs: number): ContentState | null {
  const dep = f?.departure ?? {};
  const arr = f?.arrival ?? {};
  const depSched = utcMs(dep.scheduledTime?.utc);
  const depBest = utcMs(dep.revisedTime?.utc ?? dep.actualTime?.utc ?? dep.predictedTime?.utc) ?? depSched;
  const arrSched = utcMs(arr.scheduledTime?.utc);
  const arrBest = utcMs(arr.revisedTime?.utc ?? arr.predictedTime?.utc) ?? arrSched;
  if (!depBest || !arrBest) return null;
  const delay = depSched ? Math.round((depBest - depSched) / 60000) : undefined;
  const state: ContentState = {
    phase: derivePhase(str(f.status), depBest, arrBest, nowMs),
    departAt: Math.round(depBest / 1000),
    arriveAt: Math.round(arrBest / 1000),
    departLabel: localHHMM(dep.revisedTime?.local ?? dep.actualTime?.local ?? dep.predictedTime?.local ?? dep.scheduledTime?.local),
    arriveLabel: localHHMM(arr.revisedTime?.local ?? arr.predictedTime?.local ?? arr.scheduledTime?.local),
  };
  const gate = str(dep.gate);
  const terminal = str(dep.terminal);
  if (gate) state.gate = gate;
  if (terminal) state.terminal = terminal;
  if (typeof delay === 'number') state.delayMin = delay;
  return state;
}

/** What the activity visibly shows, to the minute — pushes only go out when
 *  this changes. */
export function signature(s: ContentState): string {
  return [s.phase, Math.round(s.departAt / 60), Math.round(s.arriveAt / 60), s.gate ?? '', s.terminal ?? '', s.delayMin ?? ''].join('|');
}

/** A banner for changes worth interrupting someone for; null = silent update. */
export function alertFor(prev: Partial<ContentState> | undefined, next: ContentState, flightNumber: string): { title: string; body: string } | null {
  if (!prev) return null; // first sync: the app just showed them everything
  if (next.gate && prev.gate && next.gate !== prev.gate) return { title: `${flightNumber} gate change`, body: `Now departing from gate ${next.gate}.` };
  if (next.gate && !prev.gate && next.phase === 'scheduled') return { title: `${flightNumber} gate announced`, body: `Gate ${next.gate}${next.terminal ? ` · Terminal ${next.terminal}` : ''}.` };
  if (next.phase === 'boarding' && prev.phase !== 'boarding') return { title: `${flightNumber} is boarding`, body: next.gate ? `Head to gate ${next.gate}.` : 'Time to head to the gate.' };
  const before = prev.delayMin ?? 0;
  const after = next.delayMin ?? 0;
  if (next.phase === 'scheduled' && Math.abs(after - before) >= 10) {
    return after > before
      ? { title: `${flightNumber} delayed`, body: `Now departing at ${next.departLabel} (${after} min late).` }
      : { title: `${flightNumber} update`, body: `Departure moved up to ${next.departLabel}.` };
  }
  // Landing is silent here: the app schedules its own "Welcome to …"
  // notification for touchdown, so a banner from the server would double up.
  return null;
}

async function fetchRecord(flightNumber: string, date: string, key: string): Promise<Record<string, any> | null> {
  try {
    const url = `https://${ADB_HOST}/flights/number/${encodeURIComponent(flightNumber)}/${date}?withAircraftImage=false&withLocation=false`;
    const res = await fetch(url, { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': ADB_HOST } });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const legs = Array.isArray(data) ? data : data?.departures ?? [];
    return legs[0] ?? null;
  } catch {
    return null;
  }
}

// ── APNs ─────────────────────────────────────────────────────────────────────

const b64url = (b: Buffer | string) => Buffer.from(b).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

/** A provider token (ES256 JWT) for APNs; valid up to an hour, so one per run. */
function apnsJwt(p8: string, keyId: string, teamId: string): string {
  const header = b64url(JSON.stringify({ alg: 'ES256', kid: keyId }));
  const claims = b64url(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) }));
  const signer = createSign('SHA256');
  signer.update(`${header}.${claims}`);
  // A .p8 pasted into a secret often has its newlines flattened to "\n".
  const pem = p8.includes('\\n') ? p8.replace(/\\n/g, '\n') : p8;
  const sig = signer.sign({ key: pem, dsaEncoding: 'ieee-p1363' });
  return `${header}.${claims}.${b64url(sig)}`;
}

interface ApnsResult {
  status: number;
  reason?: string;
}

/** Send one Live Activity push over an open HTTP/2 session. */
function sendActivityPush(session: ReturnType<typeof connect>, jwt: string, token: string, payload: object, priority: 5 | 10): Promise<ApnsResult> {
  return new Promise((resolve) => {
    const req = session.request({
      [h2.HTTP2_HEADER_METHOD]: 'POST',
      [h2.HTTP2_HEADER_PATH]: `/3/device/${token}`,
      authorization: `bearer ${jwt}`,
      'apns-topic': `${BUNDLE_ID}.push-type.liveactivity`,
      'apns-push-type': 'liveactivity',
      'apns-priority': String(priority),
      'content-type': 'application/json',
    });
    let status = 0;
    let body = '';
    req.setEncoding('utf8');
    req.on('response', (headers) => {
      status = Number(headers[h2.HTTP2_HEADER_STATUS]) || 0;
    });
    req.on('data', (c) => {
      body += c;
    });
    req.on('end', () => {
      let reason: string | undefined;
      try {
        reason = body ? (JSON.parse(body).reason as string) : undefined;
      } catch {
        reason = body || undefined;
      }
      resolve({ status, reason });
    });
    req.on('error', (e) => resolve({ status: 0, reason: String(e) }));
    req.setTimeout(10_000, () => {
      req.close();
      resolve({ status: 0, reason: 'timeout' });
    });
    req.end(JSON.stringify(payload));
  });
}

// ── The poller ───────────────────────────────────────────────────────────────

/** How long until this flight is worth checking again. The activity's own
 *  countdown and progress bar run on the phone's clock, so in the air we only
 *  need to catch a revised arrival; close to departure, gates move fast. */
function nextPollMs(s: ContentState, nowMs: number): number {
  if (s.phase === 'boarding') return 2 * 60_000;
  if (s.phase === 'enroute') return 6 * 60_000;
  const untilDep = s.departAt * 1000 - nowMs;
  if (untilDep < 2 * 3600_000) return 2 * 60_000;
  return 8 * 60_000;
}

export const pollLiveFlights = onSchedule(
  {
    schedule: 'every 2 minutes',
    secrets: [APNS_KEY_P8, APNS_KEY_ID, APNS_TEAM_ID, AERODATABOX_KEY],
    timeoutSeconds: 100,
    memory: '256MiB',
  },
  async () => {
    const db = getFirestore();
    const now = Date.now();
    const snap = await db.collection('liveFlights').where('expiresAt', '>', now).limit(300).get();
    const due = snap.docs.filter((d) => ((d.data().nextPollAt as number) || 0) <= now);
    // Tidy anything long expired (a flight the app never saw land).
    const stale = await db.collection('liveFlights').where('expiresAt', '<=', now).limit(100).get();
    await Promise.all(stale.docs.map((d) => d.ref.delete().catch(() => undefined)));
    if (!due.length) return;

    const adbKey = AERODATABOX_KEY.value();
    // One lookup per distinct flight, however many members are on it.
    const records = new Map<string, Record<string, any> | null>();
    for (const d of due) {
      const { flightNumber, date } = d.data() as { flightNumber: string; date: string };
      const k = `${flightNumber}:${date}`;
      if (!records.has(k)) records.set(k, await fetchRecord(flightNumber, date, adbKey));
    }

    const jwt = apnsJwt(APNS_KEY_P8.value(), APNS_KEY_ID.value(), APNS_TEAM_ID.value());
    const session = connect(APNS_HOST);
    session.on('error', (e) => console.error('APNs session error', e));
    try {
      for (const d of due) {
        const data = d.data() as {
          flightNumber: string;
          date: string;
          pushToken: string;
          toCity?: string;
          lastSig?: string;
          lastState?: Partial<ContentState>;
        };
        const record = records.get(`${data.flightNumber}:${data.date}`);
        const state = record ? stateFromRecord(record, now) : null;
        if (!state) {
          // No data right now — look again in a while rather than every run.
          await d.ref.update({ nextPollAt: now + 10 * 60_000 });
          continue;
        }
        const sig = signature(state);
        if (sig === data.lastSig) {
          await d.ref.update({ nextPollAt: now + nextPollMs(state, now) });
          continue;
        }

        const landed = state.phase === 'landed';
        const alert = alertFor(data.lastSig ? data.lastState : undefined, state, data.flightNumber);
        const aps: Record<string, unknown> = {
          timestamp: Math.floor(now / 1000),
          event: landed ? 'end' : 'update',
          'content-state': state,
          'stale-date': state.arriveAt + 3 * 3600,
        };
        // After landing, leave "Welcome to …" up for 20 minutes, then clear.
        if (landed) aps['dismissal-date'] = Math.floor(now / 1000) + 20 * 60;
        if (alert) {
          aps.alert = alert;
          aps.sound = 'default';
        }
        const res = await sendActivityPush(session, jwt, data.pushToken, { aps }, alert ? 10 : 5);

        if (res.status === 410 || res.reason === 'BadDeviceToken' || res.reason === 'Unregistered' || res.reason === 'ExpiredToken') {
          await d.ref.delete(); // the activity is gone — stop tracking
          continue;
        }
        if (res.status !== 200) {
          console.error('APNs live-activity push failed', data.flightNumber, res.status, res.reason);
          await d.ref.update({ nextPollAt: now + 3 * 60_000 }); // retry soon, state unchanged
          continue;
        }
        if (landed) await d.ref.delete();
        else await d.ref.update({ lastSig: sig, lastState: state, nextPollAt: now + nextPollMs(state, now), updatedAt: now });
      }
    } finally {
      session.close();
    }
  },
);

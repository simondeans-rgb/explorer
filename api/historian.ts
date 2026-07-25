// Runs on Vercel's Edge runtime so it can stream the narrative back to the
// browser. GEMINI_API_KEY is a server-side secret — it must NOT be a
// VITE_-prefixed variable, so it never reaches the client bundle.
//
// Abuse protection (this endpoint spends money on every call):
//   1. Auth — the caller must present a valid Firebase ID token; anonymous
//      requests are rejected, so usage is always tied to a real, bannable account.
//   2. Per-user daily quota — enforced via a tamper-resistant Firestore counter
//      (see the `aiUsage` rules) so a single account can't run up the bill.
//   3. Input cap + upstream timeout — bound the work each call can trigger.
import { jwtVerify, createRemoteJWKSet } from 'jose';

export const config = { runtime: 'edge' };

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'stickynotes-c13ac';

const MAX_CONTEXT = 20000; // characters of record accepted per call
const DAILY_LIMIT = 30; // Historian passages per user per day
const UPSTREAM_TIMEOUT_MS = 25000;

// Firebase ID tokens are RS256, signed with Google's rotating secure-token keys.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

const SYSTEM = `You are the Historian of the Society of Discovery, composing a passage for a Member's Explorer's Passport.

Voice — follow exactly:
- Prestigious, warm, literate, and human — like a distinguished geographical society that has never forgotten that discovery is a joyful, personal thing.
- Measured and specific, never breathless. Celebrate quietly. No hype, no superlatives stacked on superlatives.
- Never use emoji, hashtags, or exclamation marks. Do not use the words "amazing", "incredible", or "epic".
- Do not describe this as an app, a tracker, or a log. It is a Passport and an archive.

Craft:
- Write flowing prose — no headings, no bullet lists, no markdown. Two to four short paragraphs, roughly 200–400 words.
- Address the Member by their name, in the second person ("you").
- Ground the writing in the specific places, cities, journeys, and discoveries provided. Name them. Prefer concrete detail over generality.
- Notice patterns and relationships across the record (a continent returned to, a city lived in, a meal recommended) rather than merely listing facts.
- Where the data is sparse, write briefly and with anticipation of the discoveries still to come; never invent places, dates, or facts that are not given.
- End with a single quiet line that looks toward what is still unmapped.`;

const USER_PREFIX = `Compose the Member's passage from the following record. Use only what is given.\n\n`;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

/** Verify the caller's Firebase ID token and return their uid, or null. */
async function verifyCaller(req: Request): Promise<string | null> {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  try {
    const { payload } = await jwtVerify(match[1], JWKS, {
      issuer: ISSUER,
      audience: PROJECT_ID,
    });
    // Firebase ID tokens carry the uid in `sub`; require a present, unexpired sub.
    return typeof payload.sub === 'string' && payload.sub.length > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}

const fsBase = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/** Enforce the per-user daily quota via a tamper-resistant Firestore counter.
 *  Returns true if the call is allowed (and records it). Fails open on
 *  infrastructure errors so a Firestore hiccup never breaks the feature —
 *  auth alone still bounds abuse. */
async function withinDailyQuota(uid: string, idToken: string): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const docId = `${uid}_${day}`;
  const authHeader = { authorization: `Bearer ${idToken}` };
  try {
    const getRes = await fetch(`${fsBase}/aiUsage/${docId}`, { headers: authHeader });
    if (getRes.status === 404) {
      // First call today — create the counter at 1.
      await fetch(`${fsBase}/aiUsage?documentId=${docId}`, {
        method: 'POST',
        headers: { ...authHeader, 'content-type': 'application/json' },
        body: JSON.stringify({
          fields: {
            uid: { stringValue: uid },
            day: { stringValue: day },
            count: { integerValue: '1' },
          },
        }),
      });
      return true;
    }
    if (!getRes.ok) return true; // fail open on unexpected errors
    const doc = (await getRes.json()) as { fields?: { count?: { integerValue?: string } } };
    const count = Number(doc.fields?.count?.integerValue ?? '0');
    if (count >= DAILY_LIMIT) return false;
    await fetch(`${fsBase}/aiUsage/${docId}?updateMask.fieldPaths=count`, {
      method: 'PATCH',
      headers: { ...authHeader, 'content-type': 'application/json' },
      body: JSON.stringify({ fields: { count: { integerValue: String(count + 1) } } }),
    });
    return true;
  } catch {
    return true; // never let quota infrastructure break the feature
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  // 1. Authentication — reject anonymous callers.
  const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const uid = await verifyCaller(req);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  // 2. Validate input.
  let body: { context?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const context =
    typeof body.context === 'string' ? body.context.slice(0, MAX_CONTEXT) : '';
  if (!context.trim()) return json({ error: 'empty' }, 400);

  // 3. Per-user daily quota.
  if (!(await withinDailyQuota(uid, bearer))) {
    return json({ error: 'rate_limited' }, 429);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: USER_PREFIX + context }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.9 },
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch {
    return json({ error: 'upstream_timeout' }, 504);
  }

  if (!upstream.ok || !upstream.body) {
    return json({ error: 'upstream', status: upstream.status }, 502);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let nl: number;
          while ((nl = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, nl).trim();
            buffer = buffer.slice(nl + 1);
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const obj = JSON.parse(payload);
              const parts = obj?.candidates?.[0]?.content?.parts;
              if (Array.isArray(parts)) {
                for (const p of parts) {
                  if (typeof p?.text === 'string') {
                    controller.enqueue(encoder.encode(p.text));
                  }
                }
              }
            } catch {
              /* partial or non-JSON keep-alive line — ignore */
            }
          }
        }
      } catch {
        controller.enqueue(
          encoder.encode('\n\n[The Historian was unable to finish this passage.]'),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      void reader.cancel();
    },
  });

  return new Response(readable, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

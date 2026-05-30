// Runs on Vercel's Edge runtime so it can stream the narrative back to the
// browser. GEMINI_API_KEY is a server-side secret — it must NOT be a
// VITE_-prefixed variable, so it never reaches the client bundle.
export const config = { runtime: 'edge' };

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

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
    headers: { 'content-type': 'application/json' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  let body: { context?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const context =
    typeof body.context === 'string' ? body.context.slice(0, 20000) : '';
  if (!context.trim()) return json({ error: 'empty' }, 400);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: 'user', parts: [{ text: USER_PREFIX + context }] }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.9 },
    }),
  });

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

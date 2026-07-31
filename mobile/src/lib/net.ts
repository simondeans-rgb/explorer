// Networking helpers shared across the data libs.

/** `fetch` with a hard timeout so a stalled or captive-portal connection can't
 *  leave a request hanging forever (which would strand a loading spinner). On
 *  timeout the returned promise rejects with an AbortError — callers already
 *  treat any fetch rejection as their normal "couldn't load" path. */
export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

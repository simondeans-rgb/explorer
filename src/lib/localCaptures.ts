// localStorage-backed Captures store for demo mode. Mirrors the function
// signatures in `captures.ts`. Single-Member by design.
import type { Capture } from '../types';
import type { CaptureInput } from './captures';

const STORAGE_KEY = 'explorer:demo-captures';
const EVENT = 'explorer:demo-captures-changed';

function read(): Capture[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Capture[]) : [];
  } catch {
    return [];
  }
}

function write(items: Capture[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore (quota) */
  }
  window.dispatchEvent(new Event(EVENT));
}

function newId(): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `c_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function normalize(input: CaptureInput) {
  return {
    dataUrl: input.dataUrl,
    countryCode: input.countryCode || undefined,
    city: input.city?.trim() || undefined,
    expeditionId: input.expeditionId || undefined,
    discoveryId: input.discoveryId || undefined,
    caption: input.caption?.trim() || undefined,
  };
}

export function subscribeCaptures(
  _userId: string,
  onChange: (items: Capture[]) => void,
): () => void {
  onChange(read());
  const handler = () => onChange(read());
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange(read());
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

export async function createCapture(
  userId: string,
  input: CaptureInput,
): Promise<string> {
  const items = read();
  const item: Capture = {
    id: newId(),
    userId,
    ...normalize(input),
    createdAt: Date.now(),
  };
  items.push(item);
  write(items);
  return item.id;
}

export async function deleteCapture(id: string): Promise<void> {
  write(read().filter((c) => c.id !== id));
}

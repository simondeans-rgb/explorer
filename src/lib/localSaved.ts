// localStorage-backed Saved store for demo mode. Mirrors the function
// signatures in `saved.ts`. Single-Member by design.
import type { SavedItem, SavedInput } from './saved';

const STORAGE_KEY = 'explorer:demo-saved';
const EVENT = 'explorer:demo-saved-changed';

function read(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

function newId(): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function normalize(input: SavedInput) {
  return {
    key: input.key,
    kind: input.kind,
    name: input.name.trim(),
    countryCode: input.countryCode || undefined,
    city: input.city?.trim() || undefined,
  };
}

export function subscribeSaved(
  _userId: string,
  onChange: (items: SavedItem[]) => void,
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

export async function createSaved(
  userId: string,
  input: SavedInput,
): Promise<string> {
  const items = read();
  const item: SavedItem = {
    id: newId(),
    userId,
    ...normalize(input),
    createdAt: Date.now(),
  };
  items.push(item);
  write(items);
  return item.id;
}

export async function deleteSaved(id: string): Promise<void> {
  write(read().filter((s) => s.id !== id));
}

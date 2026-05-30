// localStorage-backed Discoveries store for demo mode. Mirrors the function
// signatures in `discoveries.ts`. Single-Member by design.
import type { Discovery } from '../types';
import type { DiscoveryInput } from './discoveries';

const STORAGE_KEY = 'explorer:demo-discoveries';
const EVENT = 'explorer:demo-discoveries-changed';

function read(): Discovery[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Discovery[]) : [];
  } catch {
    return [];
  }
}

function write(items: Discovery[]): void {
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
  return `d_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function normalize(input: DiscoveryInput) {
  return {
    name: input.name.trim(),
    category: input.category,
    countryCode: input.countryCode || undefined,
    city: input.city?.trim() || undefined,
    expeditionId: input.expeditionId || undefined,
    verdict: input.verdict || undefined,
    note: input.note?.trim() || undefined,
  };
}

export function subscribeDiscoveries(
  _userId: string,
  onChange: (items: Discovery[]) => void,
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

export async function createDiscovery(
  userId: string,
  input: DiscoveryInput,
): Promise<string> {
  const items = read();
  const now = Date.now();
  const item: Discovery = {
    id: newId(),
    userId,
    ...normalize(input),
    createdAt: now,
    updatedAt: now,
  };
  items.push(item);
  write(items);
  return item.id;
}

export async function updateDiscovery(
  id: string,
  input: DiscoveryInput,
): Promise<void> {
  write(
    read().map((d) =>
      d.id === id ? { ...d, ...normalize(input), updatedAt: Date.now() } : d,
    ),
  );
}

export async function deleteDiscovery(id: string): Promise<void> {
  write(read().filter((d) => d.id !== id));
}

/** Seed a handful of Discoveries tied to the demo Passport's cities. */
export function seedDemoDiscoveriesIfEmpty(userId: string): void {
  if (read().length > 0) return;
  const now = Date.now();
  const mk = (
    d: Omit<Discovery, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Discovery => ({ id: newId(), userId, createdAt: now, updatedAt: now, ...d });
  write([
    mk({ name: 'Sukiyabashi Jiro', category: 'food', countryCode: 'JP', city: 'Tokyo', verdict: 'recommend', note: 'A meal measured in minutes, remembered for years.' }),
    mk({ name: 'teamLab Planets', category: 'culture', countryCode: 'JP', city: 'Tokyo', verdict: 'worth-visiting' }),
    mk({ name: 'Roscioli', category: 'food', countryCode: 'IT', city: 'Rome', verdict: 'hidden-gem', note: 'Ask for the burrata.' }),
    mk({ name: 'Septime', category: 'food', countryCode: 'FR', city: 'Paris', verdict: 'recommend' }),
    mk({ name: 'Musée d’Orsay', category: 'culture', countryCode: 'FR', city: 'Paris', verdict: 'recommend' }),
    mk({ name: 'The Standard, High Line', category: 'accommodation', countryCode: 'US', city: 'New York', verdict: 'worth-visiting' }),
  ]);
}

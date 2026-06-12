// localStorage-backed Trips store for demo mode. Mirrors trips.ts.
import type { Trip } from '../types';
import type { TripInput } from './trips';

const STORAGE_KEY = 'explorer:demo-trips';
const EVENT = 'explorer:demo-trips-changed';

function read(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Trip[]) : [];
  } catch {
    return [];
  }
}

function write(items: Trip[]): void {
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
  return `t_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function normalize(input: TripInput) {
  return {
    title: input.title.trim(),
    countryCode: input.countryCode,
    startDate: input.startDate,
    endDate: input.endDate || undefined,
    itinerary: (input.itinerary ?? []).map((i) => ({
      id: i.id,
      name: i.name.trim(),
      city: i.city?.trim() || undefined,
      fromFriend: i.fromFriend || undefined,
      verdict: i.verdict || undefined,
    })),
    note: input.note?.trim() || undefined,
  };
}

export function subscribeTrips(
  _userId: string,
  onChange: (items: Trip[]) => void,
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

export async function createTrip(
  userId: string,
  input: TripInput,
): Promise<string> {
  const items = read();
  const now = Date.now();
  const item: Trip = {
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

export async function updateTrip(id: string, input: TripInput): Promise<void> {
  write(
    read().map((t) =>
      t.id === id ? { ...t, ...normalize(input), updatedAt: Date.now() } : t,
    ),
  );
}

export async function deleteTrip(id: string): Promise<void> {
  write(read().filter((t) => t.id !== id));
}

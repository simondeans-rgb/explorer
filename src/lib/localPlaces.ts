// localStorage-backed store used when Firebase isn't configured, so the app
// (and Vercel preview deploys without env vars) is fully clickable with no
// backend. Mirrors the function signatures in `places.ts` exactly, so callers
// never know which backend is live. Single-Member by design — keyed globally.
import type { Place } from '../types';
import type { PlaceInput } from './places';
import { deriveLivedRange, normalizePeriods } from './residencePeriods';

const STORAGE_KEY = 'explorer:demo-places';
const EVENT = 'explorer:demo-places-changed';

function read(): Place[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Place[]) : [];
  } catch {
    return [];
  }
}

function write(places: Place[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
  } catch {
    /* ignore quota / private-mode failures */
  }
  // Notify same-tab subscribers immediately (storage events only fire cross-tab).
  window.dispatchEvent(new Event(EVENT));
}

function newId(): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `p_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function normalize(input: PlaceInput) {
  const year =
    typeof input.firstYear === 'number' && !Number.isNaN(input.firstYear)
      ? input.firstYear
      : undefined;
  const periods = normalizePeriods(input.residencePeriods);
  const derived = periods.length > 0 ? deriveLivedRange(periods) : null;
  return {
    kind: input.kind,
    countryCode: input.countryCode,
    name: input.name.trim(),
    relationships: input.relationships,
    firstYear: year,
    livedFrom: derived ? derived.livedFrom : input.livedFrom || undefined,
    livedTo: derived ? derived.livedTo : input.livedTo || undefined,
    residencePeriods: periods.length > 0 ? periods : undefined,
    note: input.note?.trim() ? input.note.trim() : undefined,
  };
}

export function subscribePlaces(
  _userId: string,
  onChange: (places: Place[]) => void,
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

export async function createPlace(
  userId: string,
  input: PlaceInput,
): Promise<string> {
  const places = read();
  const now = Date.now();
  const place: Place = {
    id: newId(),
    userId,
    ...normalize(input),
    createdAt: now,
    updatedAt: now,
  };
  places.push(place);
  write(places);
  return place.id;
}

export async function updatePlace(
  id: string,
  input: PlaceInput,
): Promise<void> {
  write(
    read().map((p) =>
      p.id === id ? { ...p, ...normalize(input), updatedAt: Date.now() } : p,
    ),
  );
}

export async function deletePlace(id: string): Promise<void> {
  write(read().filter((p) => p.id !== id));
}

/** Seed a lived-in sample archive the first time the demo is opened, so the
 *  Passport, flags, stamps, statistics, Recognitions and Almanac all have
 *  something to show. */
export function seedDemoIfEmpty(userId: string): void {
  if (read().length > 0) return;
  const now = Date.now();
  const mk = (p: Omit<Place, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Place => ({
    id: newId(),
    userId,
    createdAt: now,
    updatedAt: now,
    ...p,
  });
  write([
    mk({
      kind: 'country',
      countryCode: 'FR',
      name: 'France',
      relationships: ['visited', 'lived'],
      firstYear: 2012,
      note: 'A spring in Paris I keep returning to in memory.',
    }),
    mk({ kind: 'city', countryCode: 'FR', name: 'Paris', relationships: ['visited', 'lived'], firstYear: 2012 }),
    mk({ kind: 'city', countryCode: 'FR', name: 'Lyon', relationships: ['visited'], firstYear: 2014 }),
    mk({ kind: 'country', countryCode: 'JP', name: 'Japan', relationships: ['visited'], firstYear: 2018, note: 'Lost happily in the backstreets of Shimokitazawa.' }),
    mk({ kind: 'city', countryCode: 'JP', name: 'Tokyo', relationships: ['visited'], firstYear: 2018 }),
    mk({ kind: 'city', countryCode: 'JP', name: 'Kyoto', relationships: ['visited'], firstYear: 2018 }),
    mk({ kind: 'country', countryCode: 'US', name: 'United States', relationships: ['visited', 'worked'], firstYear: 2016 }),
    mk({ kind: 'city', countryCode: 'US', name: 'New York', relationships: ['visited', 'worked'], firstYear: 2016 }),
    mk({ kind: 'country', countryCode: 'IT', name: 'Italy', relationships: ['visited'], firstYear: 2019, note: 'Gelato in Rome at midnight.' }),
    mk({ kind: 'city', countryCode: 'IT', name: 'Rome', relationships: ['visited'], firstYear: 2019 }),
    mk({ kind: 'country', countryCode: 'BR', name: 'Brazil', relationships: ['aspiring'] }),
    mk({ kind: 'country', countryCode: 'NZ', name: 'New Zealand', relationships: ['aspiring'] }),
  ]);
}

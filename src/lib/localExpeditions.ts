// localStorage-backed Expeditions store for demo mode. Mirrors `expeditions.ts`.
import type { Expedition, Journey } from '../types';
import type { ExpeditionInput } from './expeditions';

const STORAGE_KEY = 'explorer:demo-expeditions';
const EVENT = 'explorer:demo-expeditions-changed';

function read(): Expedition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Expedition[]) : [];
  } catch {
    return [];
  }
}

function write(items: Expedition[]): void {
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
  return `e_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function normalize(input: ExpeditionInput) {
  return {
    title: input.title.trim(),
    startDate: input.startDate || undefined,
    endDate: input.endDate || undefined,
    countryCodes: input.countryCodes ?? [],
    journeys: input.journeys ?? [],
    note: input.note?.trim() || undefined,
  };
}

export function subscribeExpeditions(
  _userId: string,
  onChange: (items: Expedition[]) => void,
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

export async function createExpedition(
  userId: string,
  input: ExpeditionInput,
): Promise<string> {
  const items = read();
  const now = Date.now();
  const item: Expedition = {
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

export async function updateExpedition(
  id: string,
  input: ExpeditionInput,
): Promise<void> {
  write(
    read().map((e) =>
      e.id === id ? { ...e, ...normalize(input), updatedAt: Date.now() } : e,
    ),
  );
}

export async function deleteExpedition(id: string): Promise<void> {
  write(read().filter((e) => e.id !== id));
}

export function seedDemoExpeditionsIfEmpty(userId: string): void {
  if (read().length > 0) return;
  const now = Date.now();
  const journey = (j: Omit<Journey, 'id'>): Journey => ({ id: newId(), ...j });
  write([
    {
      id: newId(),
      userId,
      title: 'Japan, Spring',
      startDate: '2018-03-24',
      endDate: '2018-04-02',
      countryCodes: ['JP'],
      journeys: [
        journey({ mode: 'flight', operator: 'ANA', from: 'LHR', to: 'HND', date: '2018-03-24' }),
        journey({ mode: 'rail', operator: 'JR', from: 'Tokyo', to: 'Kyoto', date: '2018-03-28' }),
      ],
      note: 'Cherry blossom and back-alley ramen.',
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

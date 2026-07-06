// Persisted photo choices for the Almanac book, so a rebuilt book keeps the
// user's swaps. Stock-slot replacements (cover / pictures cards / continent
// covers) are stored locally under stable slot keys; trip-photo swaps become
// real Captures on the trip instead (handled by the Almanac screen), so the
// whole app benefits — not just the book.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BookPageSpec } from '../../components/AlmanacBookPages';

const KEY = 'worldly:bookPhotos';
const MAX_ENTRIES = 24;

export type BookPhotoOverrides = Record<string, string>;

export async function getBookPhotoOverrides(): Promise<BookPhotoOverrides> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BookPhotoOverrides) : {};
  } catch {
    return {};
  }
}

export async function saveBookPhotoOverrides(map: BookPhotoOverrides): Promise<void> {
  try {
    const entries = Object.entries(map).slice(-MAX_ENTRIES);
    await AsyncStorage.setItem(KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* best-effort: the in-session swaps still print */
  }
}

/** Merge saved swaps into freshly built pages (stock slots only). */
export function applyBookPhotoOverrides(pages: BookPageSpec[], map: BookPhotoOverrides): BookPageSpec[] {
  if (!Object.keys(map).length) return pages;
  return pages.map((p) => {
    if (p.kind === 'cover' && map.cover) return { ...p, heroUrl: map.cover };
    if (p.kind === 'continent' && map[`continent:${p.name}`]) return { ...p, heroUrl: map[`continent:${p.name}`] };
    if (p.kind === 'pictures') {
      const cards = p.cards.map((c) => (map[`pictures:${c.code}`] ? { ...c, url: map[`pictures:${c.code}`]! } : c));
      return { ...p, cards };
    }
    return p;
  });
}

/** Collect the user's data-URL swaps in stock slots for persistence. */
export function collectBookPhotoOverrides(pages: BookPageSpec[], previous: BookPhotoOverrides): BookPhotoOverrides {
  const next: BookPhotoOverrides = { ...previous };
  for (const p of pages) {
    if (p.kind === 'cover' && p.heroUrl?.startsWith('data:')) next.cover = p.heroUrl;
    else if (p.kind === 'continent' && p.heroUrl?.startsWith('data:')) next[`continent:${p.name}`] = p.heroUrl;
    else if (p.kind === 'pictures') {
      for (const c of p.cards) if (c.url.startsWith('data:')) next[`pictures:${c.code}`] = c.url;
    }
  }
  return next;
}

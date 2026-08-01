// Photo prioritisation for Lifetime Wrapped. The user's own photographs are what
// make this emotionally valuable, so they always win over stock imagery. The
// hierarchy (task spec): attached memory → same city → same country → any user
// travel photo → exact-destination stock → branded gradient fallback.

import type { Capture, Discovery } from '../types';
import { hasDestinationPhoto } from './destinationImage';

export type PhotoRef =
  | { kind: 'user'; uri: string }
  | { kind: 'stock'; code: string }
  | { kind: 'gradient'; code: string };

/** Reject obviously-broken / non-image data so a scene never shows a blank. */
function usable(dataUrl?: string | null): dataUrl is string {
  return !!dataUrl && dataUrl.startsWith('data:image') && dataUrl.length > 800;
}

function dedupe(uris: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of uris) {
    // Compact JPEGs differ byte-for-byte; a prefix key catches exact reprises cheaply.
    const key = u.slice(0, 128);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(u);
    }
  }
  return out;
}

const newest = (a: { takenAt?: number; createdAt: number }, b: { takenAt?: number; createdAt: number }) =>
  (b.takenAt ?? b.createdAt) - (a.takenAt ?? a.createdAt);

/** Every usable user photo (captures + discovery photos) for a country. */
export function userPhotosForCountry(code: string, captures: Capture[], discoveries: Discovery[]): string[] {
  const caps = captures
    .filter((c) => c.countryCode === code && usable(c.dataUrl))
    .sort(newest)
    .map((c) => c.dataUrl);
  const discs = discoveries.filter((d) => d.countryCode === code && usable(d.photo)).map((d) => d.photo as string);
  return dedupe([...caps, ...discs]);
}

/** User photos taken in a specific city (highest-signal for a featured place). */
export function userPhotosForCity(city: string, code: string, captures: Capture[]): string[] {
  const key = city.trim().toLowerCase();
  return dedupe(
    captures
      .filter((c) => c.countryCode === code && (c.city ?? '').trim().toLowerCase() === key && usable(c.dataUrl))
      .sort(newest)
      .map((c) => c.dataUrl),
  );
}

/** Best single image for a country: city user photo → country user photo →
 *  exact-destination stock → branded gradient. */
export function bestCountryPhoto(
  code: string,
  captures: Capture[],
  discoveries: Discovery[],
  city?: string,
): PhotoRef {
  if (city) {
    const c = userPhotosForCity(city, code, captures);
    if (c.length) return { kind: 'user', uri: c[0] };
  }
  const u = userPhotosForCountry(code, captures, discoveries);
  if (u.length) return { kind: 'user', uri: u[0] };
  if (hasDestinationPhoto(code)) return { kind: 'stock', code };
  return { kind: 'gradient', code };
}

/** A set of images for a collage / portrait: newest user photos across the whole
 *  travel life first, then exact-destination stock for the most-explored
 *  countries, de-duplicated — never repeating one photo unless deliberately. */
export function lifetimeCollage(
  captures: Capture[],
  discoveries: Discovery[],
  topCountryCodes: string[],
  count: number,
): PhotoRef[] {
  const userUris = dedupe([
    ...captures.filter((c) => usable(c.dataUrl)).sort(newest).map((c) => c.dataUrl),
    ...discoveries.filter((d) => usable(d.photo)).map((d) => d.photo as string),
  ]);
  const refs: PhotoRef[] = userUris.slice(0, count).map((uri) => ({ kind: 'user', uri }));
  // Top up with stock of the most-explored countries (skipping ones with no photo).
  for (const code of topCountryCodes) {
    if (refs.length >= count) break;
    if (hasDestinationPhoto(code)) refs.push({ kind: 'stock', code });
  }
  // Last resort: brand gradients keyed to top countries, so a collage is never empty.
  for (const code of topCountryCodes) {
    if (refs.length >= count) break;
    refs.push({ kind: 'gradient', code });
  }
  return refs.slice(0, count);
}

/** Total count of usable user photographs — used to decide photo-led vs stat-led
 *  pacing for low/high photo users. */
export function userPhotoCount(captures: Capture[], discoveries: Discovery[]): number {
  return (
    captures.filter((c) => usable(c.dataUrl)).length + discoveries.filter((d) => usable(d.photo)).length
  );
}

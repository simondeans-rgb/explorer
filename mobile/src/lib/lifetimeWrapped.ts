// Lifetime Wrapped — the adaptive scene-selection engine.
//
// The 53.8s soundtrack is fixed, so the nine narrative *beats* have fixed
// musical boundaries (snapped to the analysed onsets in lifetimeAudio.ts). What
// adapts is the CONTENT of each beat: buildLifetimeStory() picks the strongest,
// non-zero, reliably-computable material for each beat from the user's whole
// travel history, so a beat is never empty and low-data users still get a
// complete, photo-led emotional story.

import type { Capture, Discovery, Expedition, JourneyMode } from '../types';
import type { CountryAggregate, PassportStats } from './stats';
import type { DiscoveryStats } from './discoveryStats';
import type { JourneyStats } from './journeyStats';
import type { ExplorerLevel, Badge } from './explorer';
import { DISCOVERY_CATEGORY_META, type DiscoveryCategory } from '../types';
import { countryName } from '../data/countries';
import { bestCountryPhoto, userPhotosForCountry, lifetimeCollage, userPhotoCount, type PhotoRef } from './lifetimePhotos';
import { ONSETS_MS, TRACK_MS } from './lifetimeAudio';

export type BeatKind =
  | 'opening' | 'beginning' | 'scale' | 'explored' | 'places' | 'discoveries' | 'peak' | 'portrait' | 'continues';

export interface Beat { kind: BeatKind; startMs: number; endMs: number }

/** Fixed beat timeline, cuts landing on musical phrases/onsets. */
export const BEATS: Beat[] = [
  { kind: 'opening', startMs: 0, endMs: ONSETS_MS.introEnd },
  { kind: 'beginning', startMs: ONSETS_MS.introEnd, endMs: ONSETS_MS.phrase1 },
  { kind: 'scale', startMs: ONSETS_MS.phrase1, endMs: ONSETS_MS.phrase2 },
  { kind: 'explored', startMs: ONSETS_MS.phrase2, endMs: ONSETS_MS.phrase3 },
  { kind: 'places', startMs: ONSETS_MS.phrase3, endMs: ONSETS_MS.build },
  { kind: 'discoveries', startMs: ONSETS_MS.build, endMs: 37_500 },
  { kind: 'peak', startMs: 37_500, endMs: 46_000 },
  { kind: 'portrait', startMs: 46_000, endMs: ONSETS_MS.resolution },
  { kind: 'continues', startMs: ONSETS_MS.resolution, endMs: TRACK_MS },
];

export interface Metric { value: number; label: string; sub?: string }
export interface PlaceCard { code: string; name: string; caption: string; photo: PhotoRef }
export interface Line { headline: string; sub?: string }
export interface BadgeChip { emoji: string; title: string; gradient: [string, string] }

export interface LifetimeStory {
  firstName: string;
  hasRichData: boolean;
  photoLed: boolean; // few stats but some photos → lean on imagery
  heroPhoto: PhotoRef;
  backdropCodes: string[]; // country codes with a stock photo, for ambient backdrops
  origin: { label: string; sub: string };
  scale: Metric[]; // up to 3, strongest first
  flagCodes: string[];
  explored: Line[]; // up to 2, adaptive to how they travel
  places: PlaceCard[]; // up to 3
  discoveries: Line[]; // up to 2, never zero-valued
  level: { level: number; title: string; xp: number };
  badges: BadgeChip[]; // up to 6 earned, headline-first
  coversUnlocked: number;
  portrait: { title: string; stats: Metric[]; photos: PhotoRef[] };
}

export interface LifetimeInput {
  firstName: string;
  places: { kind: string; countryCode: string; name: string; firstYear?: number; firstDate?: string; relationships: string[] }[];
  captures: Capture[];
  discoveries: Discovery[];
  expeditions: Expedition[];
  aggregates: CountryAggregate[];
  stats: PassportStats;
  discoveryStats: DiscoveryStats;
  journeyStats: JourneyStats;
  level: ExplorerLevel;
  badges: Badge[];
  coversUnlocked: number;
}

const EARTH_CIRCUMFERENCE_KM = 40_075;
const MODE_LABEL: Record<JourneyMode, { verb: string; noun: string }> = {
  flight: { verb: 'flew', noun: 'flights' },
  rail: { verb: 'rode the rails', noun: 'rail journeys' },
  road: { verb: 'hit the road', noun: 'road trips' },
  cruise: { verb: 'set sail', noun: 'cruises' },
  ferry: { verb: 'crossed by sea', noun: 'ferry crossings' },
};

function earliestYear(input: LifetimeInput): number | undefined {
  const years: number[] = [];
  for (const p of input.places) {
    if (p.firstYear) years.push(p.firstYear);
    else if (p.firstDate) {
      const y = Number(p.firstDate.slice(0, 4));
      if (y > 1900) years.push(y);
    }
  }
  for (const e of input.expeditions) {
    if (e.startDate) {
      const y = Number(e.startDate.slice(0, 4));
      if (y > 1900) years.push(y);
    }
  }
  for (const c of input.captures) if (c.takenAt) years.push(new Date(c.takenAt).getFullYear());
  return years.length ? Math.min(...years) : undefined;
}

/** Total distance across all recorded journey legs (km), 0 if none. */
function totalDistanceKm(expeditions: Expedition[]): number {
  let km = 0;
  for (const e of expeditions) for (const j of e.journeys) km += j.distanceKm ?? 0;
  return Math.round(km);
}

/** Photos-per-country, for ranking "most photographed" places. */
function photoCountByCountry(captures: Capture[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of captures) if (c.countryCode) m.set(c.countryCode, (m.get(c.countryCode) ?? 0) + 1);
  return m;
}

export function buildLifetimeStory(input: LifetimeInput): LifetimeStory {
  const { stats, discoveryStats, journeyStats, level, aggregates, captures, discoveries, expeditions } = input;
  const discovered = aggregates.filter((a) => a.discovered);
  const photosByCountry = photoCountByCountry(captures);

  // Rank countries by lifetime significance: exploration depth + memories + cities + lived.
  const ranked = [...discovered].sort((a, b) => score(b) - score(a));
  function score(a: CountryAggregate): number {
    const lived = a.relationships.includes('lived') || a.relationships.includes('based') ? 40 : 0;
    return a.discoveryScore + (photosByCountry.get(a.code) ?? 0) * 6 + a.cities.length * 4 + lived;
  }
  const topCodes = ranked.map((a) => a.code);
  const backdropCodes = topCodes.slice(0, 8);
  const heroPhoto: PhotoRef = ranked[0]
    ? bestCountryPhoto(ranked[0].code, captures, discoveries)
    : { kind: 'stock', code: 'WW' };

  const photos = userPhotoCount(captures, discoveries);
  const hasRichData = stats.countriesDiscovered > 0 || expeditions.length > 0 || captures.length > 0;
  const statPoints = stats.countriesDiscovered + stats.citiesDiscovered + journeyStats.total + discoveryStats.total;
  const photoLed = photos >= 3 && statPoints < 12;

  // ── Beginning ──────────────────────────────────────────────────────────────
  const y0 = earliestYear(input);
  // The country tied to the earliest year, if we can attribute it confidently.
  let originCode: string | undefined;
  if (y0) {
    const p = input.places.find((pl) => pl.kind === 'country' && (pl.firstYear === y0 || pl.firstDate?.slice(0, 4) === String(y0)));
    originCode = p?.countryCode;
  }
  const origin = originCode
    ? { label: `It began in ${countryName(originCode)}`, sub: y0 ? `Your earliest Worldly chapter · ${y0}` : 'Your earliest Worldly chapter' }
    : { label: 'Where your story began', sub: y0 ? `Your earliest Worldly chapter · ${y0}` : 'Your earliest Worldly chapter' };

  // ── Scale (strongest 3 non-zero metrics) ────────────────────────────────────
  const scaleAll: Metric[] = [
    { value: stats.countriesDiscovered, label: stats.countriesDiscovered === 1 ? 'country' : 'countries', sub: 'became part of your story' },
    { value: stats.continentsDiscovered, label: stats.continentsDiscovered === 1 ? 'continent' : 'continents', sub: stats.continents.join(' · ') || undefined },
    { value: stats.citiesDiscovered, label: stats.citiesDiscovered === 1 ? 'city' : 'cities', sub: 'explored on the ground' },
    { value: journeyStats.total, label: journeyStats.total === 1 ? 'journey' : 'journeys', sub: 'recorded along the way' },
  ];
  const scale = scaleAll.filter((m) => m.value > 0).slice(0, 3);

  // ── Explored (adaptive to how they actually travel) ─────────────────────────
  const explored: Line[] = [];
  const modeEntries = (Object.entries(journeyStats.byMode) as [JourneyMode, number][]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  if (modeEntries.length) {
    const [mode, n] = modeEntries[0];
    explored.push({ headline: `${n} ${MODE_LABEL[mode].noun}`, sub: `Your journeys, mostly by ${mode === 'flight' ? 'air' : mode}` });
  }
  const km = totalDistanceKm(expeditions);
  if (km > 500) {
    const laps = km / EARTH_CIRCUMFERENCE_KM;
    explored.push(
      laps >= 1
        ? { headline: `${km.toLocaleString()} km travelled`, sub: `Far enough to circle the world ${laps.toFixed(1)} times` }
        : { headline: `${km.toLocaleString()} km travelled`, sub: 'Across your recorded journeys' },
    );
  }
  // Most revisited country (a country you kept coming back to).
  const revisit = ranked.find((a) => (photosByCountry.get(a.code) ?? 0) >= 3 || a.cities.length >= 3);
  if (explored.length < 2 && revisit) explored.push({ headline: countryName(revisit.code), sub: 'The country you kept returning to' });
  if (explored.length === 0) {
    // No journeys/distance recorded — lead with cities/countries instead.
    if (stats.citiesDiscovered > 0) explored.push({ headline: `${stats.citiesDiscovered} cities`, sub: 'Each one a chapter of its own' });
    else explored.push({ headline: 'Every step counted', sub: 'The places you made your own' });
  }

  // ── Places that shaped them (top 1–3) ───────────────────────────────────────
  const captions = [
    { test: (a: CountryAggregate) => a.relationships.includes('lived') || a.relationships.includes('based'), text: 'The place that felt most like home' },
    { test: (a: CountryAggregate) => (photosByCountry.get(a.code) ?? 0) >= 3, text: 'Your most photographed corner of the world' },
    { test: (a: CountryAggregate) => a.cities.length >= 2, text: 'The country you kept returning to' },
  ];
  const usedCaptions = new Set<string>();
  const places: PlaceCard[] = ranked.slice(0, 3).map((a) => {
    let caption = 'A country that became part of you';
    for (const c of captions) {
      if (!usedCaptions.has(c.text) && c.test(a)) {
        caption = c.text;
        usedCaptions.add(c.text);
        break;
      }
    }
    return { code: a.code, name: a.name, caption, photo: bestCountryPhoto(a.code, captures, discoveries) };
  });

  // ── Discoveries / tastes / recommendations (never zero-valued) ──────────────
  const disc: Line[] = [];
  if (discoveryStats.total > 0) disc.push({ headline: `${discoveryStats.total} discoveries`, sub: 'Restaurants, views and hidden gems worth remembering' });
  if (discoveryStats.recommended > 0) disc.push({ headline: `${discoveryStats.recommended} recommended`, sub: 'Places you thought worth passing on' });
  if (disc.length < 2) {
    const topCat = (Object.entries(discoveryStats.byCategory) as [DiscoveryCategory, number][]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0];
    if (topCat) disc.push({ headline: `${DISCOVERY_CATEGORY_META[topCat[0]].label}`, sub: 'One of your favourite ways to explore' });
  }
  if (disc.length === 0) {
    // No discoveries logged — celebrate memories kept instead.
    if (captures.length > 0) disc.push({ headline: `${captures.length} ${captures.length === 1 ? 'memory' : 'memories'} kept`, sub: 'The moments you chose to hold onto' });
    else disc.push({ headline: 'Your collection begins', sub: 'Every place you save becomes part of the story' });
  }

  // ── Peak (identity + achievements) ──────────────────────────────────────────
  const CATEGORY_RANK: Record<string, number> = { places: 0, explorer: 1, earn: 2, core: 3, memories: 4 };
  const badges: BadgeChip[] = input.badges
    .filter((b) => b.earned)
    .sort((a, b) => (CATEGORY_RANK[a.category] ?? 9) - (CATEGORY_RANK[b.category] ?? 9))
    .slice(0, 6)
    .map((b) => ({ emoji: b.emoji, title: b.title, gradient: b.gradient }));

  // ── Portrait (signature frame) ──────────────────────────────────────────────
  const portraitStats: Metric[] = [
    { value: stats.countriesDiscovered, label: stats.countriesDiscovered === 1 ? 'country' : 'countries' },
    { value: stats.citiesDiscovered, label: stats.citiesDiscovered === 1 ? 'city' : 'cities' },
    { value: journeyStats.total, label: journeyStats.total === 1 ? 'journey' : 'journeys' },
    { value: stats.continentsDiscovered, label: stats.continentsDiscovered === 1 ? 'continent' : 'continents' },
  ].filter((m) => m.value > 0).slice(0, 4);

  return {
    firstName: input.firstName,
    hasRichData,
    photoLed,
    heroPhoto,
    backdropCodes: backdropCodes.length ? backdropCodes : ['WW'],
    origin,
    scale,
    flagCodes: stats.flagCodes,
    explored: explored.slice(0, 2),
    places,
    discoveries: disc.slice(0, 2),
    level: { level: level.level, title: level.title, xp: level.xp },
    badges,
    coversUnlocked: input.coversUnlocked,
    portrait: { title: `${input.firstName}'s World`, stats: portraitStats, photos: lifetimeCollage(captures, discoveries, topCodes, 4) },
  };
}

/** The beat active at time t (ms), and its 0..1 local progress. */
export function beatAt(ms: number): { beat: Beat; index: number; progress: number } {
  const clamped = Math.max(0, Math.min(ms, TRACK_MS - 1));
  const index = BEATS.findIndex((b) => clamped >= b.startMs && clamped < b.endMs);
  const i = index < 0 ? BEATS.length - 1 : index;
  const beat = BEATS[i];
  const progress = (clamped - beat.startMs) / Math.max(1, beat.endMs - beat.startMs);
  return { beat, index: i, progress };
}

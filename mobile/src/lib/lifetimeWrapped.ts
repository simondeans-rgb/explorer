// Lifetime Wrapped — the adaptive scene-selection engine.
//
// The soundtrack is fixed (53.8s), but the story is now a *deck of cards*: many
// short, punchy scenes rather than a few long ones. buildLifetimeStory() picks
// the strongest, non-zero, reliably-computable material for each card, and
// buildBeats() lays the enabled cards out across the track — dropping any card
// with no data (an empty globe is never shown) and giving the globe cards a
// little more room to animate. Low-data users still get a complete, photo-led
// story from whatever cards survive.

import { DISCOVERY_CATEGORY_META, CONTINENTS, type Capture, type Discovery, type Expedition, type JourneyMode, type DiscoveryCategory, type Continent } from '../types';
import type { CountryAggregate, PassportStats } from './stats';
import type { DiscoveryStats } from './discoveryStats';
import type { JourneyStats } from './journeyStats';
import type { ExplorerLevel, Badge } from './explorer';
import { countryName, continentOf } from '../data/countries';
import { bestCountryPhoto, userPhotosForCountry, lifetimeCollage, userPhotoCount, type PhotoRef } from './lifetimePhotos';
import { computeTravelStats, EARTH_CIRCUMFERENCE_MI, MOON_DISTANCE_MI } from './travelStats';
import { routeSegments, type Segment } from './journeyGeo';
import { TRACK_MS } from './lifetimeAudio';

export type BeatKind =
  | 'opening'
  | 'beginning'
  | 'continents'
  | 'countries'
  | 'cities'
  | 'distance'
  | 'transport'
  | 'journeys'
  | 'places'
  | 'discoveries'
  | 'peak'
  | 'portrait'
  | 'continues';

export interface Beat { kind: BeatKind; startMs: number; endMs: number }

// Narrative order + a relative duration weight for each card. Globe cards
// (continents, journeys) weigh more so their draw-on has room; the closing
// cards are quick. Cards are dropped from the deck when their data is missing.
const DECK: { kind: BeatKind; weight: number }[] = [
  { kind: 'opening', weight: 1.0 },
  { kind: 'beginning', weight: 1.0 },
  { kind: 'continents', weight: 1.7 },
  { kind: 'countries', weight: 1.0 },
  { kind: 'cities', weight: 1.0 },
  { kind: 'distance', weight: 1.25 },
  { kind: 'transport', weight: 1.25 },
  { kind: 'journeys', weight: 1.8 },
  { kind: 'places', weight: 1.5 },
  { kind: 'discoveries', weight: 1.25 },
  { kind: 'peak', weight: 1.5 },
  { kind: 'portrait', weight: 1.3 },
  { kind: 'continues', weight: 0.9 },
];

/** Lay the enabled cards across the fixed track, proportional to their weights.
 *  The last card is pinned to TRACK_MS so rounding never leaves a gap. */
export function buildBeats(enabled: Partial<Record<BeatKind, boolean>>): Beat[] {
  const active = DECK.filter((d) => enabled[d.kind]);
  const totalW = active.reduce((s, d) => s + d.weight, 0) || 1;
  const beats: Beat[] = [];
  let t = 0;
  active.forEach((d, i) => {
    const last = i === active.length - 1;
    const end = last ? TRACK_MS : Math.min(TRACK_MS, t + Math.round((d.weight / totalW) * TRACK_MS));
    beats.push({ kind: d.kind, startMs: t, endMs: end });
    t = end;
  });
  return beats;
}

export interface Metric { value: number; label: string; sub?: string }
export interface PlaceCard { code: string; name: string; caption: string; photo: PhotoRef; polaroids: PhotoRef[] }
export interface Line { headline: string; sub?: string }
export interface BadgeChip { emoji: string; title: string; gradient: [string, string] }

/** A globe that colours visited countries in, grouped/tinted by continent so it
 *  reads as the continents lighting up one after another. */
export interface ContinentsReveal {
  count: number;
  names: string[]; // visited continents, in reveal order
  visited: string[]; // all discovered country codes (the fill set)
  order: string[]; // codes in reveal order (grouped by continent)
  colorByCode: Record<string, string>; // code → its continent's colour
}

export interface DistanceStat {
  mi: number;
  laps: number; // times around the Earth
  moonPct: number; // % of the way to the Moon (0–100+)
  topMode?: { mode: JourneyMode; count: number; verb: string; noun: string };
}

export interface TransportStat {
  airline?: { label: string; count: number };
  aircraft?: { label: string; count: number };
  delayMin: number; // total minutes lost to late arrivals
  airlines: number; // distinct airlines flown
  timeInAirMin: number;
}

export interface JourneyRoutes { segments: Segment[]; count: number }

export interface LifetimeStory {
  firstName: string;
  hasRichData: boolean;
  photoLed: boolean; // few stats but some photos → lean on imagery
  heroPhoto: PhotoRef;
  backdropCodes: string[]; // country codes with a stock photo, for ambient backdrops
  origin: { label: string; sub: string };
  flagCodes: string[];
  // ── the split "scale" cards ────────────────────────────────────────────────
  continentsReveal: ContinentsReveal;
  countriesCount: number;
  citiesCount: number;
  distance: DistanceStat;
  transport: TransportStat;
  routes: JourneyRoutes;
  // ── narrative cards ─────────────────────────────────────────────────────────
  places: PlaceCard[]; // up to 3, with user polaroids
  discoveries: Line[]; // up to 2, never zero-valued
  discoveryNames: string[]; // for the "rain" of place names
  polaroids: PhotoRef[]; // the user's own photos, scattered as polaroids
  level: { level: number; title: string; xp: number };
  badges: BadgeChip[]; // up to 6 earned, headline-first
  coversUnlocked: number;
  portrait: { title: string; stats: Metric[]; photos: PhotoRef[] };
  beats: Beat[];
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

const MODE_LABEL: Record<JourneyMode, { verb: string; noun: string }> = {
  flight: { verb: 'flew', noun: 'flights' },
  rail: { verb: 'rode the rails', noun: 'rail journeys' },
  road: { verb: 'hit the road', noun: 'road trips' },
  cruise: { verb: 'set sail', noun: 'cruises' },
  ferry: { verb: 'crossed by sea', noun: 'ferry crossings' },
};

// One colour per continent, so the globe reads as distinct regions lighting up.
const CONTINENT_COLOR: Record<Continent, string> = {
  Europe: '#FF6B9A',
  Asia: '#FFB84D',
  Africa: '#34C77B',
  'North America': '#4DA6FF',
  'South America': '#24D1C3',
  Oceania: '#9B7CFF',
  Antarctica: '#B8C4E0',
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

/** Photos-per-country, for ranking "most photographed" places. */
function photoCountByCountry(captures: Capture[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const c of captures) if (c.countryCode) m.set(c.countryCode, (m.get(c.countryCode) ?? 0) + 1);
  return m;
}

/** Build the continents-globe reveal: every discovered country coloured by its
 *  continent, ordered continent-by-continent in the order each was first
 *  reached, so the sphere fills in region by region. */
function buildContinentsReveal(discovered: CountryAggregate[], continentNames: Continent[]): ContinentsReveal {
  // Earliest first-year seen for each continent (undefined years sort last).
  const firstYearByContinent = new Map<Continent, number>();
  for (const a of discovered) {
    const cont = a.continent ?? (continentOf(a.code) as Continent | undefined);
    if (!cont) continue;
    const y = a.firstYear ?? Infinity;
    const cur = firstYearByContinent.get(cont);
    if (cur === undefined || y < cur) firstYearByContinent.set(cont, y);
  }
  const presentContinents = [...firstYearByContinent.keys()].sort((a, b) => {
    const ya = firstYearByContinent.get(a) ?? Infinity;
    const yb = firstYearByContinent.get(b) ?? Infinity;
    if (ya !== yb) return ya - yb;
    return CONTINENTS.indexOf(a) - CONTINENTS.indexOf(b);
  });

  const order: string[] = [];
  const colorByCode: Record<string, string> = {};
  const visited: string[] = [];
  for (const cont of presentContinents) {
    const members = discovered
      .filter((a) => (a.continent ?? continentOf(a.code)) === cont)
      .sort((a, b) => (a.firstYear ?? Infinity) - (b.firstYear ?? Infinity) || a.name.localeCompare(b.name));
    for (const a of members) {
      order.push(a.code);
      visited.push(a.code);
      colorByCode[a.code] = CONTINENT_COLOR[cont] ?? '#FF6B9A';
    }
  }
  return {
    count: continentNames.length || presentContinents.length,
    names: (continentNames.length ? continentNames : presentContinents) as string[],
    visited,
    order,
    colorByCode,
  };
}

/** The user's own photographs, newest-first across their most significant
 *  countries, for scattering as polaroids. Returns only real user photos. */
function gatherPolaroids(topCodes: string[], captures: Capture[], discoveries: Discovery[], max: number): PhotoRef[] {
  const out: PhotoRef[] = [];
  const seen = new Set<string>();
  for (const code of topCodes) {
    for (const uri of userPhotosForCountry(code, captures, discoveries)) {
      const key = uri.slice(0, 128);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ kind: 'user', uri });
      if (out.length >= max) return out;
    }
  }
  return out;
}

export function buildLifetimeStory(input: LifetimeInput): LifetimeStory {
  const { stats, discoveryStats, journeyStats, level, aggregates, captures, discoveries, expeditions } = input;
  const discovered = aggregates.filter((a) => a.discovered);
  const photosByCountry = photoCountByCountry(captures);
  const travel = computeTravelStats(expeditions);

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
  let originCode: string | undefined;
  if (y0) {
    const p = input.places.find((pl) => pl.kind === 'country' && (pl.firstYear === y0 || pl.firstDate?.slice(0, 4) === String(y0)));
    originCode = p?.countryCode;
  }
  const origin = originCode
    ? { label: `It began in ${countryName(originCode)}`, sub: y0 ? `Your earliest Worldly chapter · ${y0}` : 'Your earliest Worldly chapter' }
    : { label: 'Where your story began', sub: y0 ? `Your earliest Worldly chapter · ${y0}` : 'Your earliest Worldly chapter' };

  // ── Continents / countries / cities (each its own card) ─────────────────────
  const continentsReveal = buildContinentsReveal(discovered, stats.continents);

  // ── Distance & how you travelled ────────────────────────────────────────────
  const modeEntries = (Object.entries(travel.modeCounts) as [JourneyMode, number][]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  const topMode = modeEntries[0]
    ? { mode: modeEntries[0][0], count: modeEntries[0][1], verb: MODE_LABEL[modeEntries[0][0]].verb, noun: MODE_LABEL[modeEntries[0][0]].noun }
    : undefined;
  const distance: DistanceStat = {
    mi: Math.round(travel.distanceMi),
    laps: travel.distanceMi / EARTH_CIRCUMFERENCE_MI,
    moonPct: (travel.distanceMi / MOON_DISTANCE_MI) * 100,
    topMode,
  };

  // ── Transport detail (airline / aircraft / delays) ──────────────────────────
  const transport: TransportStat = {
    airline: travel.topAirlines[0],
    aircraft: travel.topAircraft[0],
    delayMin: travel.totalDelayMin,
    airlines: travel.airlines,
    timeInAirMin: travel.timeInAirMin,
  };

  // ── Journeys globe ──────────────────────────────────────────────────────────
  const segments = routeSegments(expeditions);
  const routes: JourneyRoutes = { segments, count: segments.length };

  // ── Places that shaped them (top 1–3, each with its own polaroids) ──────────
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
    const userUris = userPhotosForCountry(a.code, captures, discoveries).slice(0, 3);
    return {
      code: a.code,
      name: a.name,
      caption,
      photo: bestCountryPhoto(a.code, captures, discoveries),
      polaroids: userUris.map((uri) => ({ kind: 'user', uri }) as PhotoRef),
    };
  });

  // ── Discoveries (lines + a list of names for the falling "rain") ────────────
  const disc: Line[] = [];
  if (discoveryStats.total > 0) disc.push({ headline: `${discoveryStats.total} discoveries`, sub: 'Restaurants, views and hidden gems worth remembering' });
  if (discoveryStats.recommended > 0) disc.push({ headline: `${discoveryStats.recommended} recommended`, sub: 'Places you thought worth passing on' });
  if (disc.length < 2) {
    const topCat = (Object.entries(discoveryStats.byCategory) as [DiscoveryCategory, number][]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0];
    if (topCat) disc.push({ headline: `${DISCOVERY_CATEGORY_META[topCat[0]].label}`, sub: 'One of your favourite ways to explore' });
  }
  if (disc.length === 0) {
    if (captures.length > 0) disc.push({ headline: `${captures.length} ${captures.length === 1 ? 'memory' : 'memories'} kept`, sub: 'The moments you chose to hold onto' });
    else disc.push({ headline: 'Your collection begins', sub: 'Every place you save becomes part of the story' });
  }
  // The rain of names: recommended / hidden-gem first, newest first, deduped.
  const discoveryNames = [...discoveries]
    .filter((d) => (d.name ?? '').trim().length > 0)
    .sort((a, b) => rankDisc(b) - rankDisc(a))
    .map((d) => d.name.trim())
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .slice(0, 16);
  function rankDisc(d: Discovery): number {
    const verdict = d.verdict === 'recommend' ? 4 : d.verdict === 'hidden-gem' ? 3 : 0;
    return verdict * 1e12 + (d.createdAt ?? 0);
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

  const polaroids = gatherPolaroids(topCodes, captures, discoveries, 8);

  // ── Assemble the deck (drop cards with no data) ─────────────────────────────
  const enabled: Partial<Record<BeatKind, boolean>> = {
    opening: true,
    beginning: hasRichData,
    continents: continentsReveal.visited.length > 0,
    countries: stats.countriesDiscovered > 0,
    cities: stats.citiesDiscovered > 0,
    distance: distance.mi > 0 || !!distance.topMode,
    transport: !!(transport.airline || transport.aircraft || transport.delayMin > 0),
    journeys: routes.count >= 2,
    places: places.length > 0,
    discoveries: discoveryNames.length > 0 || disc.length > 0,
    peak: true,
    portrait: true,
    continues: true,
  };

  return {
    firstName: input.firstName,
    hasRichData,
    photoLed,
    heroPhoto,
    backdropCodes: backdropCodes.length ? backdropCodes : ['WW'],
    origin,
    flagCodes: stats.flagCodes,
    continentsReveal,
    countriesCount: stats.countriesDiscovered,
    citiesCount: stats.citiesDiscovered,
    distance,
    transport,
    routes,
    places,
    discoveries: disc.slice(0, 2),
    discoveryNames,
    polaroids,
    level: { level: level.level, title: level.title, xp: level.xp },
    badges,
    coversUnlocked: input.coversUnlocked,
    portrait: { title: `${input.firstName}'s World`, stats: portraitStats, photos: lifetimeCollage(captures, discoveries, topCodes, 4) },
    beats: buildBeats(enabled),
  };
}

/** The beat active at time t (ms), and its 0..1 local progress. */
export function beatAt(ms: number, beats: Beat[]): { beat: Beat; index: number; progress: number } {
  const list = beats.length ? beats : buildBeats({ opening: true, portrait: true, continues: true });
  const clamped = Math.max(0, Math.min(ms, TRACK_MS - 1));
  const index = list.findIndex((b) => clamped >= b.startMs && clamped < b.endMs);
  const i = index < 0 ? list.length - 1 : index;
  const beat = list[i];
  const progress = (clamped - beat.startMs) / Math.max(1, beat.endMs - beat.startMs);
  return { beat, index: i, progress };
}

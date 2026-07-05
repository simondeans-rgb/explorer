// The Almanac's narrator: turns travel data into warm, personal prose for the
// book's Prologue and trip pages. Pure and deterministic — every sentence
// degrades gracefully when a fact is missing, so the story never reads broken.
import type { Discovery, Expedition, Journey } from '../types';

export interface StoryContext {
  expeditions: Expedition[];
  discoveries: Discovery[];
  countryName: (code: string) => string;
  /** Countries the user calls home (lived/based/born) — excluded when
   *  picking the "first overseas trip". */
  homeCodes?: Set<string>;
  /** Preformatted in the user's unit, e.g. (5700) => "3,542 mi". */
  formatKm?: (km: number) => string;
}

// Countries whose names read wrong without a definite article ("to United
// Kingdom" → "to the United Kingdom").
const THE_CODES = new Set(['GB', 'US', 'NL', 'AE', 'PH', 'CZ', 'DO', 'BS', 'GM', 'MV', 'SC', 'MH', 'KY', 'VI', 'TC', 'FO']);

/** Country name with its definite article where English wants one. */
export function countryWithArticle(code: string, name: string): string {
  return THE_CODES.has(code) ? `the ${name}` : name;
}

const SEASONS = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'];

const seasonOf = (iso: string) => SEASONS[new Date(iso).getMonth()] ?? 'summer';
const yearOf = (iso: string) => new Date(iso).getFullYear();

/** "an Airbus A320" / "a Boeing 777". */
export function withArticle(noun: string): string {
  return `${/^[aeiou]/i.test(noun.trim()) ? 'an' : 'a'} ${noun.trim()}`;
}

/** "You flew with British Airways on board an Airbus A320." (null if the trip
 *  has no flight with anything to say). */
export function flightSentence(journeys: Journey[]): string | null {
  const flight = journeys.find((j) => j.mode === 'flight' && (j.operator || j.vehicle));
  if (!flight) return null;
  const parts = ['You flew'];
  if (flight.operator) parts.push(`with ${flight.operator}`);
  if (flight.vehicle) parts.push(`on board ${withArticle(flight.vehicle)}`);
  return `${parts.join(' ')}.`;
}

// Every phrase carries its place — a love-note that floats free of geography
// reads as belonging to whatever trip was mentioned last.
const LOVE_PHRASES: Record<string, (name: string, place?: string) => string> = {
  food: (n, p) => `you loved the food at ${n}${p ? ` in ${p}` : ''}`,
  culture: (n, p) => `${n}${p ? ` in ${p}` : ''} moved you`,
  nature: (n, p) => `the wild beauty of ${n}${p ? ` in ${p}` : ''} stayed with you`,
  experience: (n, p) => `${n}${p ? ` in ${p}` : ''} became a story you still tell`,
  accommodation: (n, p) => `${n}${p ? ` in ${p}` : ''} felt like home`,
};

/** The Prologue: a few short paragraphs telling the traveller's story so far. */
export function buildAlmanacStory(ctx: StoryContext): string[] {
  const paras: string[] = [];
  const dated = ctx.expeditions
    .filter((e) => e.startDate)
    .sort((a, b) => a.startDate!.localeCompare(b.startDate!));

  // Where it all began — the first trip that left home soil, when we know
  // where home is.
  const home = ctx.homeCodes ?? new Set<string>();
  const overseas = dated.find((e) => e.countryCodes.some((c) => !home.has(c)));
  const first = overseas ?? dated[0];
  if (first) {
    const awayCode = first.countryCodes.find((c) => !home.has(c)) ?? first.countryCodes[0];
    const country = awayCode ? countryWithArticle(awayCode, ctx.countryName(awayCode)) : undefined;
    const kind = overseas && home.size ? 'overseas trip' : 'recorded trip';
    paras.push(
      country
        ? `Your first ${kind} was to ${country}, in the ${seasonOf(first.startDate!)} of ${yearOf(first.startDate!)}. Do you remember the excitement?`
        : `It all began with “${first.title}”, back in ${yearOf(first.startDate!)}. Do you remember the excitement?`,
    );

    // The first flight in the record.
    const flights = dated
      .flatMap((e) => e.journeys.filter((j) => j.mode === 'flight').map((j) => ({ when: j.date ?? e.startDate!, j })))
      .sort((a, b) => a.when.localeCompare(b.when));
    const firstFlight = flights.find((f) => f.j.operator || f.j.vehicle);
    if (firstFlight) {
      const bits = ['Your first flight in these pages was'];
      if (firstFlight.j.operator) bits.push(`with ${firstFlight.j.operator}`);
      if (firstFlight.j.vehicle) bits.push(`on board ${withArticle(firstFlight.j.vehicle)}`);
      if (firstFlight.j.from && firstFlight.j.to) bits.push(`— ${firstFlight.j.from} to ${firstFlight.j.to}`);
      paras.push(`${bits.join(' ')}.`);
    }
  }

  // The things you loved.
  const loved = ctx.discoveries.filter((d) => d.verdict === 'hidden-gem' || d.verdict === 'recommend');
  const food = loved.find((d) => d.category === 'food');
  const other = loved.find((d) => d !== food && d.category !== 'food' && LOVE_PHRASES[d.category]);
  if (food || other) {
    const placeOf = (d: Discovery) =>
      d.city || (d.countryCode ? countryWithArticle(d.countryCode, ctx.countryName(d.countryCode)) : undefined);
    const bits: string[] = [];
    if (food) bits.push(LOVE_PHRASES.food(food.name, placeOf(food)));
    if (other) bits.push(LOVE_PHRASES[other.category](other.name, placeOf(other)));
    const joined = bits.join(', and ');
    paras.push(`Along the way, ${joined}.`);
  }

  // The pull of a favourite place.
  const tripsPerCountry = new Map<string, number>();
  for (const e of dated) {
    for (const code of new Set(e.countryCodes)) {
      tripsPerCountry.set(code, (tripsPerCountry.get(code) ?? 0) + 1);
    }
  }
  const favourite = [...tripsPerCountry.entries()].filter(([c]) => !home.has(c)).sort((a, b) => b[1] - a[1])[0];
  if (favourite && favourite[1] >= 2) {
    const favName = countryWithArticle(favourite[0], ctx.countryName(favourite[0]));
    const capped = favName.charAt(0).toUpperCase() + favName.slice(1);
    paras.push(`${capped} keeps calling you back — ${favourite[1]} trips so far. Is it time for another?`);
  } else if (tripsPerCountry.size > 1) {
    paras.push(`${tripsPerCountry.size} countries in, and no two journeys alike. Where next?`);
  }

  // Scale: the biggest year, the farthest leap.
  const perYear = new Map<number, number>();
  for (const e of dated) perYear.set(yearOf(e.startDate!), (perYear.get(yearOf(e.startDate!)) ?? 0) + 1);
  const biggest = [...perYear.entries()].sort((a, b) => b[1] - a[1])[0];
  const legs = dated.flatMap((e) => e.journeys).filter((j) => (j.distanceKm ?? 0) > 0);
  const farthest = legs.sort((a, b) => (b.distanceKm ?? 0) - (a.distanceKm ?? 0))[0];
  const bits: string[] = [];
  if (biggest && biggest[1] >= 2) bits.push(`${biggest[0]} was your biggest year yet — ${biggest[1]} trips`);
  if (farthest && ctx.formatKm && farthest.from && farthest.to) {
    bits.push(`the farthest single leap: ${ctx.formatKm(farthest.distanceKm!)}, ${farthest.from} to ${farthest.to}`);
  }
  if (bits.length) {
    const line = bits.join('; ');
    paras.push(line.charAt(0).toUpperCase() + line.slice(1) + '.');
  }

  return paras;
}

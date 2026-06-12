// Year-in-Review engine — distils a Member's travels into a compact, emotional
// recap for a given scope (a calendar year or their whole lifetime). Reuses the
// same derived data the rest of the app already computes; adds nothing new to
// persist.

import type { Place, Discovery, Expedition, Continent } from '../types';
import type { CountryAggregate, PassportStats } from './stats';
import type { DiscoveryStats } from './discoveryStats';
import type { JourneyStats } from './journeyStats';
import { computeExplorerLevel } from './explorer';
import { countryName, continentOf } from '../data/countries';

export type ReviewScope = number | 'lifetime';

export interface ReviewStats {
  scope: ReviewScope;
  countries: number;
  newCountries: number;
  cities: number;
  continents: number;
  journeys: number;
  discoveries: number;
  topCountryCode?: string;
  topCountryName?: string;
  favourite?: { name: string; countryCode?: string };
  level: number;
  levelTitle: string;
  /** Country codes to draw a "flag wall" from (most-engaged first). */
  flagCodes: string[];
  /** True when there's essentially nothing to celebrate in this scope. */
  empty: boolean;
}

function expeditionYear(e: Expedition): number {
  const d = e.startDate ? new Date(e.startDate) : new Date(e.createdAt);
  return d.getFullYear();
}

interface Input {
  places: Place[];
  aggregates: CountryAggregate[];
  discoveries: Discovery[];
  expeditions: Expedition[];
  stats: PassportStats;
  discoveryStats: DiscoveryStats;
  journeyStats: JourneyStats;
}

export function computeReview(scope: ReviewScope, input: Input): ReviewStats {
  const {
    places,
    aggregates,
    discoveries,
    expeditions,
    stats,
    discoveryStats,
    journeyStats,
  } = input;
  const level = computeExplorerLevel(stats, discoveryStats, journeyStats);

  if (scope === 'lifetime') {
    const top = pickTopCountry(aggregates, discoveries);
    return {
      scope,
      countries: stats.countriesDiscovered,
      newCountries: stats.countriesDiscovered,
      cities: stats.citiesDiscovered,
      continents: stats.continentsDiscovered,
      journeys: journeyStats.total,
      discoveries: discoveryStats.total,
      topCountryCode: top?.code,
      topCountryName: top ? countryName(top.code) : undefined,
      favourite: pickFavourite(discoveries),
      level: level.level,
      levelTitle: level.title,
      flagCodes: orderedFlags(aggregates, discoveries),
      empty: stats.countriesDiscovered === 0 && discoveryStats.total === 0,
    };
  }

  const year = scope;
  const yearPlaces = places.filter((p) => p.firstYear === year);
  const yearDiscoveries = discoveries.filter(
    (d) => new Date(d.createdAt).getFullYear() === year,
  );
  const yearExpeditions = expeditions.filter((e) => expeditionYear(e) === year);

  // Active countries: anywhere you placed, discovered or journeyed this year.
  const active = new Set<string>();
  for (const p of yearPlaces) if (p.countryCode) active.add(p.countryCode);
  for (const d of yearDiscoveries) if (d.countryCode) active.add(d.countryCode);
  for (const e of yearExpeditions) for (const c of e.countryCodes) active.add(c);

  const continents = new Set<Continent>();
  for (const c of active) {
    const cont = continentOf(c);
    if (cont) continents.add(cont);
  }

  const newCountries = aggregates.filter(
    (a) => a.discovered && a.firstYear === year,
  ).length;
  const cities = yearPlaces.filter((p) => p.kind === 'city').length;

  const top = pickTopCountry(
    aggregates.filter((a) => active.has(a.code)),
    yearDiscoveries,
    active,
  );

  return {
    scope,
    countries: active.size,
    newCountries,
    cities,
    continents: continents.size,
    journeys: yearExpeditions.length,
    discoveries: yearDiscoveries.length,
    topCountryCode: top?.code,
    topCountryName: top ? countryName(top.code) : undefined,
    favourite: pickFavourite(yearDiscoveries),
    level: level.level,
    levelTitle: level.title,
    flagCodes: orderedFlags(
      aggregates.filter((a) => active.has(a.code)),
      yearDiscoveries,
      active,
    ),
    empty: active.size === 0 && yearDiscoveries.length === 0,
  };
}

function discoveryCounts(discoveries: Discovery[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const d of discoveries) {
    if (!d.countryCode) continue;
    m.set(d.countryCode, (m.get(d.countryCode) ?? 0) + 1);
  }
  return m;
}

function pickTopCountry(
  aggregates: CountryAggregate[],
  discoveries: Discovery[],
  active?: Set<string>,
): { code: string } | undefined {
  const counts = discoveryCounts(discoveries);
  const pool = aggregates.filter(
    (a) => a.discovered && (!active || active.has(a.code)),
  );
  if (pool.length === 0) return undefined;
  return [...pool].sort((a, b) => {
    const ca = counts.get(a.code) ?? 0;
    const cb = counts.get(b.code) ?? 0;
    if (cb !== ca) return cb - ca;
    return b.discoveryScore - a.discoveryScore;
  })[0];
}

function pickFavourite(
  discoveries: Discovery[],
): { name: string; countryCode?: string } | undefined {
  const positive = discoveries.filter(
    (d) => d.verdict === 'recommend' || d.verdict === 'hidden-gem',
  );
  const withNote = positive.find((d) => (d.note?.trim().length ?? 0) > 0);
  const pick = withNote ?? positive[0] ?? discoveries[0];
  return pick ? { name: pick.name, countryCode: pick.countryCode } : undefined;
}

function orderedFlags(
  aggregates: CountryAggregate[],
  discoveries: Discovery[],
  active?: Set<string>,
): string[] {
  const counts = discoveryCounts(discoveries);
  return aggregates
    .filter((a) => a.discovered && (!active || active.has(a.code)))
    .sort(
      (a, b) =>
        (counts.get(b.code) ?? 0) - (counts.get(a.code) ?? 0) ||
        b.discoveryScore - a.discoveryScore,
    )
    .map((a) => a.code)
    .slice(0, 24);
}

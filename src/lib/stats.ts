import { COUNTRY_BY_CODE } from '../data/countries';
import {
  DISCOVERY_RELATIONSHIPS,
  STAMP_FOR_RELATIONSHIP,
  type Continent,
  type Place,
  type Relationship,
  type StampKind,
} from '../types';

/** Everything the Passport knows about one country, rolled up from the
 *  Member's country place plus any city places within it. */
export interface CountryAggregate {
  code: string;
  name: string;
  continent: Continent | undefined;
  /** Effective relationships: the country place's own, plus any implied by a
   *  city within it (if you worked in a city, you worked in the country). */
  relationships: Relationship[];
  stamps: StampKind[];
  cities: Place[];
  regions: Place[];
  countryPlace?: Place;
  note?: string;
  firstYear?: number;
  discovered: boolean;
  aspiring: boolean; // wish-listed and not yet discovered
  discoveryScore: number; // 0–100, depth of engagement
}

const SCORE_WEIGHTS: Partial<Record<Relationship, number>> = {
  visited: 20,
  lived: 30,
  worked: 15,
  studied: 15,
  based: 10,
  born: 10,
};

function hasDiscovery(rels: Iterable<Relationship>): boolean {
  for (const r of rels) {
    if (DISCOVERY_RELATIONSHIPS.includes(r)) return true;
  }
  return false;
}

function computeScore(
  rels: Set<Relationship>,
  citiesDiscovered: number,
  hasNote: boolean,
): number {
  if (!hasDiscovery(rels)) return 0;
  let score = 0;
  for (const r of rels) score += SCORE_WEIGHTS[r] ?? 0;
  score += Math.min(citiesDiscovered * 8, 40);
  if (hasNote) score += 5;
  return Math.min(100, score);
}

export function aggregateByCountry(places: Place[]): CountryAggregate[] {
  const groups = new Map<string, Place[]>();
  for (const p of places) {
    if (!p.countryCode) continue;
    const list = groups.get(p.countryCode) ?? [];
    list.push(p);
    groups.set(p.countryCode, list);
  }

  const aggregates: CountryAggregate[] = [];
  for (const [code, group] of groups) {
    const countryPlace = group.find((p) => p.kind === 'country');
    const cities = group.filter((p) => p.kind === 'city');
    const regions = group.filter((p) => p.kind === 'region');

    const rels = new Set<Relationship>();
    for (const r of countryPlace?.relationships ?? []) rels.add(r);
    const discoveredCities = cities.filter((c) => hasDiscovery(c.relationships));
    for (const c of discoveredCities) {
      for (const r of c.relationships) {
        if (r !== 'aspiring') rels.add(r);
      }
    }
    // Regions also imply discovery of their country.
    const discoveredRegions = regions.filter((r) => hasDiscovery(r.relationships));
    for (const rg of discoveredRegions) {
      for (const r of rg.relationships) {
        if (r !== 'aspiring') rels.add(r);
      }
    }

    const stamps: StampKind[] = [];
    for (const r of rels) {
      const stamp = STAMP_FOR_RELATIONSHIP[r];
      if (stamp && !stamps.includes(stamp)) stamps.push(stamp);
    }

    const note = countryPlace?.note;
    const discovered =
      hasDiscovery(rels) ||
      discoveredCities.length > 0 ||
      discoveredRegions.length > 0;
    const meta = COUNTRY_BY_CODE[code];
    const years = group
      .map((p) => p.firstYear)
      .filter((y): y is number => typeof y === 'number');

    aggregates.push({
      code,
      name: countryPlace?.name || meta?.name || code,
      continent: meta?.continent,
      relationships: [...rels],
      stamps,
      cities,
      regions,
      countryPlace,
      note,
      firstYear: years.length ? Math.min(...years) : undefined,
      discovered,
      aspiring: !discovered && rels.has('aspiring'),
      discoveryScore: computeScore(rels, discoveredCities.length, Boolean(note)),
    });
  }

  return aggregates.sort((a, b) => a.name.localeCompare(b.name));
}

export interface PassportStats {
  countriesDiscovered: number;
  countriesLived: number;
  countriesWorked: number;
  countriesStudied: number;
  citiesDiscovered: number;
  regionsDiscovered: number;
  continentsDiscovered: number;
  continents: Continent[];
  flagCodes: string[];
  aspiringCountries: number;
  totalStamps: number;
  avgDiscoveryScore: number;
}

export function computeStats(aggregates: CountryAggregate[]): PassportStats {
  const discovered = aggregates.filter((a) => a.discovered);
  const continents = new Set<Continent>();
  let citiesDiscovered = 0;
  let regionsDiscovered = 0;
  let totalStamps = 0;
  let scoreSum = 0;

  for (const a of discovered) {
    if (a.continent) continents.add(a.continent);
    citiesDiscovered += a.cities.filter((c) =>
      c.relationships.some((r) => r !== 'aspiring'),
    ).length;
    regionsDiscovered += a.regions.filter((r) =>
      r.relationships.some((x) => x !== 'aspiring'),
    ).length;
    totalStamps += a.stamps.length;
    scoreSum += a.discoveryScore;
  }

  const has = (rel: Relationship) =>
    discovered.filter((a) => a.relationships.includes(rel)).length;

  return {
    countriesDiscovered: discovered.length,
    countriesLived: has('lived'),
    countriesWorked: has('worked'),
    countriesStudied: has('studied'),
    citiesDiscovered,
    regionsDiscovered,
    continentsDiscovered: continents.size,
    continents: [...continents].sort(),
    flagCodes: discovered.map((a) => a.code),
    aspiringCountries: aggregates.filter((a) => a.aspiring).length,
    totalStamps,
    avgDiscoveryScore: discovered.length
      ? Math.round(scoreSum / discovered.length)
      : 0,
  };
}

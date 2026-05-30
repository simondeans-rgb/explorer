import { countryName } from '../data/countries';
import {
  DISCOVERY_CATEGORY_META,
  JOURNEY_MODE_META,
  RELATIONSHIP_META,
  VERDICT_META,
  type Discovery,
  type Expedition,
} from '../types';
import type { CountryAggregate, PassportStats } from './stats';

export interface HistorianInput {
  memberName: string;
  scope: 'lifetime' | number;
  aggregates: CountryAggregate[];
  discoveries: Discovery[];
  expeditions: Expedition[];
  stats: PassportStats;
}

function expeditionYear(e: Expedition): number {
  return e.startDate
    ? new Date(e.startDate).getFullYear()
    : new Date(e.createdAt).getFullYear();
}

/** Assemble a compact, factual record for the Historian to write from. */
export function buildHistorianContext(input: HistorianInput): string {
  const { memberName, scope, aggregates, discoveries, expeditions, stats } =
    input;
  const lines: string[] = [];
  lines.push(`Member: ${memberName || 'Explorer'}`);
  lines.push(scope === 'lifetime' ? 'Edition: Lifetime' : `Edition: ${scope}`);

  const discovered = aggregates.filter((a) => a.discovered);
  const countries =
    scope === 'lifetime'
      ? discovered
      : discovered.filter(
          (a) =>
            a.firstYear === scope ||
            a.cities.some((c) => c.firstYear === scope),
        );

  if (countries.length) {
    lines.push('', 'Countries:');
    for (const a of countries.slice(0, 60)) {
      const rels = a.relationships
        .filter((r) => r !== 'aspiring')
        .map((r) => RELATIONSHIP_META[r].label.toLowerCase())
        .join(', ');
      const cities = a.cities.map((c) => c.name).filter(Boolean);
      const parts = [`- ${a.name}`];
      if (rels) parts.push(`(${rels})`);
      if (a.firstYear) parts.push(`since ${a.firstYear}`);
      if (cities.length) parts.push(`cities: ${cities.join(', ')}`);
      if (a.note) parts.push(`remembered: "${a.note}"`);
      lines.push(parts.join('; '));
    }
  }

  const scopedDiscoveries =
    scope === 'lifetime'
      ? discoveries
      : discoveries.filter(
          (d) => new Date(d.createdAt).getFullYear() === scope,
        );
  if (scopedDiscoveries.length) {
    lines.push('', 'Discoveries:');
    for (const d of scopedDiscoveries.slice(0, 60)) {
      const where = [d.city, d.countryCode ? countryName(d.countryCode) : '']
        .filter(Boolean)
        .join(', ');
      const parts = [`- ${d.name} (${DISCOVERY_CATEGORY_META[d.category].label})`];
      if (where) parts.push(where);
      if (d.verdict) parts.push(`verdict: ${VERDICT_META[d.verdict].label}`);
      if (d.note) parts.push(`note: "${d.note}"`);
      lines.push(parts.join('; '));
    }
  }

  const scopedExpeditions =
    scope === 'lifetime'
      ? expeditions
      : expeditions.filter((e) => expeditionYear(e) === scope);
  if (scopedExpeditions.length) {
    lines.push('', 'Expeditions:');
    for (const e of scopedExpeditions.slice(0, 40)) {
      const countriesList = e.countryCodes.map(countryName).join(', ');
      const journeys = e.journeys
        .map((j) => {
          const route = [j.from, j.to].filter(Boolean).join('→');
          const label = j.operator || JOURNEY_MODE_META[j.mode].label;
          return route ? `${label} ${route}` : label;
        })
        .join('; ');
      const parts = [`- ${e.title}`];
      if (e.startDate) parts.push(`${expeditionYear(e)}`);
      if (countriesList) parts.push(countriesList);
      if (journeys) parts.push(`journeys: ${journeys}`);
      if (e.note) parts.push(`note: "${e.note}"`);
      lines.push(parts.join('; '));
    }
  }

  lines.push(
    '',
    `Lifetime standing: ${stats.countriesDiscovered} countries, ${stats.citiesDiscovered} cities, ${stats.continentsDiscovered} continents (${stats.continents.join(', ')}), lived in ${stats.countriesLived}.`,
  );

  return lines.join('\n');
}

/** POST the record to the Historian endpoint and stream the prose back. */
export async function streamStory(
  context: string,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch('/api/historian', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ context }),
    signal,
  });

  if (!res.ok) {
    let code = '';
    try {
      code = ((await res.json()) as { error?: string }).error ?? '';
    } catch {
      /* ignore */
    }
    if (res.status === 503 || code === 'not_configured') {
      throw new Error(
        'The Travel Historian isn’t configured yet — the server needs an ANTHROPIC_API_KEY.',
      );
    }
    throw new Error('The Travel Historian is unavailable right now.');
  }

  if (!res.body) throw new Error('No response from the Historian.');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    onDelta(decoder.decode(value, { stream: true }));
  }
}

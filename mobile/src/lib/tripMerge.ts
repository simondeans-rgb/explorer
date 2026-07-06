// Detecting trips that are really one journey. Flight imports create an
// expedition per booking, so an outbound and its return (and every hop in
// between) land as separate "trips" — which fragments stats, the Almanac's
// story ("35 trips in 2025") and the book's trip chapters. Suggestions chain
// bookings when the next one departs from where the last one ended (within a
// window), or when date ranges overlap. Pure and unit-tested.
import type { Expedition, Journey } from '../types';

export interface MergeSuggestion {
  /** Chronological; the first id is the merge target. */
  ids: string[];
  title: string;
  startDate: string;
  endDate: string;
  countryCodes: string[];
  journeyCount: number;
  reason: string;
}

const DAY_MS = 86400000;
const MAX_GAP_DAYS = 16;

/** Normalise a journey endpoint to a comparable key: IATA code, else city. */
function endpointKey(label?: string): string | undefined {
  if (!label?.trim()) return undefined;
  const iata =
    label.match(/\(([A-Za-z]{3})\)\s*$/)?.[1] ?? (/^[A-Za-z]{3}$/.test(label.trim()) ? label.trim() : undefined);
  if (iata) return iata.toUpperCase();
  const city = label.split('(')[0].trim().toLowerCase();
  return city || undefined;
}

const startOf = (e: Expedition) => e.startDate!;
const endOf = (e: Expedition) => e.endDate ?? e.startDate!;

function sortedJourneys(e: Expedition): Journey[] {
  return [...e.journeys].sort((a, b) => (a.date ?? e.startDate ?? '').localeCompare(b.date ?? e.startDate ?? ''));
}

function lastArrival(e: Expedition): string | undefined {
  const js = sortedJourneys(e);
  for (let i = js.length - 1; i >= 0; i--) {
    const key = endpointKey(js[i].to);
    if (key) return key;
  }
  return undefined;
}

function firstDeparture(e: Expedition): string | undefined {
  for (const j of sortedJourneys(e)) {
    const key = endpointKey(j.from);
    if (key) return key;
  }
  return undefined;
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function unionCodes(members: Expedition[]): string[] {
  const codes: string[] = [];
  for (const m of members) for (const c of m.countryCodes) if (!codes.includes(c)) codes.push(c);
  return codes;
}

function suggestedTitle(
  members: Expedition[],
  opts: { countryName: (code: string) => string; homeCodes?: Set<string> },
): string {
  const codes = unionCodes(members);
  const away = codes.filter((c) => !opts.homeCodes?.has(c));
  const main = (away.length ? away : codes).slice(0, 2).map(opts.countryName).join(' & ');
  const start = monthLabel(startOf(members[0]));
  const end = monthLabel(members.reduce((m, e) => (endOf(e) > m ? endOf(e) : m), endOf(members[0])));
  const when = start === end ? start : `${start} – ${end}`;
  return `${main || members[0].title} · ${when}`;
}

/** The combined expedition a group would merge into. */
export function buildMergedExpedition(members: Expedition[], title: string) {
  const sorted = [...members].sort((a, b) => startOf(a).localeCompare(startOf(b)));
  return {
    title,
    countryCodes: unionCodes(sorted),
    startDate: startOf(sorted[0]),
    endDate: sorted.reduce((m, e) => (endOf(e) > m ? endOf(e) : m), endOf(sorted[0])),
    journeys: sorted.flatMap(sortedJourneys),
    note: sorted.map((e) => e.note?.trim()).filter(Boolean).join('\n') || undefined,
  };
}

export function suggestTripMerges(
  expeditions: Expedition[],
  opts: { countryName: (code: string) => string; homeCodes?: Set<string> },
): MergeSuggestion[] {
  const dated = expeditions
    .filter((e) => e.startDate)
    .sort((a, b) => startOf(a).localeCompare(startOf(b)) || a.createdAt - b.createdAt);

  interface Group {
    members: Expedition[];
    end: string;
    lastTo?: string;
    reason?: string;
  }
  const groups: Group[] = [];
  for (const e of dated) {
    const g = groups[groups.length - 1];
    if (g) {
      const gapDays = (new Date(startOf(e)).getTime() - new Date(g.end).getTime()) / DAY_MS;
      const overlap = gapDays <= 0;
      const from = firstDeparture(e);
      const chained = !overlap && gapDays <= MAX_GAP_DAYS && !!from && !!g.lastTo && from === g.lastTo;
      if (overlap || chained) {
        g.members.push(e);
        if (endOf(e) > g.end) g.end = endOf(e);
        g.lastTo = lastArrival(e) ?? g.lastTo;
        if (!g.reason) g.reason = overlap ? 'Overlapping dates' : `Connected via ${from!.length === 3 ? from!.toUpperCase() : from}`;
        continue;
      }
    }
    groups.push({ members: [e], end: endOf(e), lastTo: lastArrival(e) });
  }

  return groups
    .filter((g) => g.members.length >= 2)
    .map((g) => {
      const title = suggestedTitle(g.members, opts);
      const merged = buildMergedExpedition(g.members, title);
      return {
        ids: g.members.map((m) => m.id),
        title,
        startDate: merged.startDate,
        endDate: merged.endDate,
        countryCodes: merged.countryCodes,
        journeyCount: merged.journeys.length,
        reason: g.reason ?? 'Connected journeys',
      };
    });
}

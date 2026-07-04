import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { CircleCheck, Wand2, Plane, Download } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { AirportField } from './AirportField';
import { COLORS } from '../src/lib/theme';
import { isEndpointResolved, bestAirportMatch } from '../src/lib/airportSearch';
import { flightLookupConfigured, lookupFlight } from '../src/lib/flightLookup';
import { findEnrichable, enrichFlights, mergeFlightInfo, legFlightDate, missingDataPoints, needsActuals, type Enrichable } from '../src/lib/flightRefresh';
import { useToast } from '../src/store/toast';
import type { Expedition, Journey } from '../src/types';

interface Unresolved {
  expId: string;
  title: string;
  legId: string;
  field: 'from' | 'to';
  value: string;
}

type UpdateExpedition = (
  id: string,
  input: { title: string; countryCodes: string[]; startDate?: string; endDate?: string; journeys: Journey[]; note?: string },
) => Promise<void>;

/** Scan every flight leg across all journeys for endpoints that don't resolve
 *  to a known airport — these don't count toward the flight stats yet. */
function findUnresolved(expeditions: Expedition[]): Unresolved[] {
  const out: Unresolved[] = [];
  for (const e of expeditions) {
    for (const j of e.journeys ?? []) {
      if (j.mode !== 'flight') continue;
      (['from', 'to'] as const).forEach((field) => {
        const v = (j[field] ?? '').trim();
        if (v && !isEndpointResolved(v)) out.push({ expId: e.id, title: e.title, legId: j.id, field, value: v });
      });
    }
  }
  return out;
}

const REASON_LABEL: Record<string, string> = {
  route: 'Route',
  airline: 'Airline',
  aircraft: 'Aircraft',
  times: 'Times',
  terminals: 'Terminals',
  distance: 'Distance',
  duration: 'Duration',
  'actual times': 'Actual times',
};

/** Passport-level "Resolve flights" flow: fetch any missing flight details from
 *  the flight-number lookup, and fix every unrecognised flight stop so it counts
 *  in the stats — with one-tap suggested matches or a manual search. */
export function ResolveFlightsSheet({
  visible,
  onClose,
  expeditions,
  updateExpedition,
}: {
  visible: boolean;
  onClose: () => void;
  expeditions: Expedition[];
  updateExpedition: UpdateExpedition;
}) {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const unresolved = useMemo(() => findUnresolved(expeditions), [expeditions]);
  const enrichable = useMemo<Enrichable[]>(
    () => (flightLookupConfigured() ? findEnrichable(expeditions, Date.now(), 'all') : []),
    [expeditions],
  );

  const keyOf = (u: Unresolved) => `${u.expId}:${u.legId}:${u.field}`;
  const busy = fetchingAll || fetchingId != null;

  async function apply(expId: string, legId: string, field: 'from' | 'to', label: string) {
    const e = expeditions.find((x) => x.id === expId);
    if (!e) return;
    const journeys = e.journeys.map((j) => (j.id === legId ? { ...j, [field]: label } : j));
    await updateExpedition(expId, { title: e.title, countryCodes: e.countryCodes, startDate: e.startDate, endDate: e.endDate, journeys, note: e.note });
  }

  async function fixAll() {
    const byExp = new Map<string, Map<string, Journey>>();
    for (const u of unresolved) {
      const best = bestAirportMatch(u.value);
      if (!best) continue;
      const e = expeditions.find((x) => x.id === u.expId);
      if (!e) continue;
      let legs = byExp.get(u.expId);
      if (!legs) { legs = new Map(e.journeys.map((j) => [j.id, { ...j }])); byExp.set(u.expId, legs); }
      const leg = legs.get(u.legId);
      if (leg) (leg as Journey)[u.field] = best.label;
    }
    for (const [expId, legs] of byExp) {
      const e = expeditions.find((x) => x.id === expId);
      if (!e) continue;
      await updateExpedition(expId, { title: e.title, countryCodes: e.countryCodes, startDate: e.startDate, endDate: e.endDate, journeys: [...legs.values()], note: e.note });
    }
  }

  async function fetchOne(c: Enrichable) {
    const e = expeditions.find((x) => x.id === c.expId);
    const date = legFlightDate(c.j, e?.startDate);
    if (!e || !date) return;
    setResult(null);
    setFetchingId(c.legId);
    const r = await lookupFlight(c.j.reference ?? '', date);
    setFetchingId(null);

    // Transient network error — leave the flight flaggable so it can be retried.
    if (!r.ok && r.reason !== 'not-found' && r.reason !== 'out-of-range') {
      toast.error('Lookup failed — check your connection and try again.');
      return;
    }

    const now = Date.now();
    let patched = c.j;
    let updated = false;
    if (r.ok) {
      const merged = mergeFlightInfo(c.j, r.info);
      patched = merged;
      updated = merged !== c.j;
    }
    // Definitive answer but still incomplete → mark checked so it stops showing.
    if (!patched.flightChecked && (missingDataPoints(patched).length > 0 || needsActuals(patched, e.startDate, now))) {
      patched = { ...patched, flightChecked: true };
    }
    if (patched !== c.j) {
      const journeys = e.journeys.map((j) => (j.id === c.legId ? patched : j));
      await updateExpedition(e.id, { title: e.title, countryCodes: e.countryCodes, startDate: e.startDate, endDate: e.endDate, journeys, note: e.note });
    }
    toast.success(
      updated ? 'Flight details updated'
      : r.ok ? 'No new details available for this flight'
      : r.reason === 'out-of-range' ? 'Older than the flight database keeps'
      : 'No flight record found',
    );
  }

  async function fetchAll() {
    setResult(null);
    setFetchingAll(true);
    setProgress({ done: 0, total: enrichable.length });
    const res = await enrichFlights(expeditions, updateExpedition, {
      nowMs: Date.now(),
      mode: 'all',
      max: 60,
      onProgress: (done, total) => setProgress({ done, total }),
    });
    setFetchingAll(false);
    setProgress(null);

    // Build a clear summary — including why some flights returned nothing.
    if (res.updated > 0) {
      const extras: string[] = [];
      if (res.noData > 0) extras.push(`${res.noData} had no new data`);
      if (res.outOfRange > 0) extras.push(`${res.outOfRange} too old`);
      if (res.truncated > 0) extras.push(`${res.truncated} left — tap again`);
      setResult(`Updated ${res.updated} flight${res.updated === 1 ? '' : 's'}${extras.length ? ` · ${extras.join(' · ')}` : ''}.`);
      toast.success(`Updated ${res.updated} flight${res.updated === 1 ? '' : 's'}`);
    } else if (res.scanned === 0) {
      setResult('No flights were recent enough to look up — the flight database only covers about the last year.');
    } else if (res.outOfRange > 0 && res.noData === 0 && res.failed === 0) {
      setResult('No new details found — these flights are older than the flight database keeps (about a year).');
    } else if (res.failed > 0 && res.noData === 0) {
      setResult('Couldn’t reach the flight service — check your connection and try again.');
    } else {
      setResult('No new details were found for these flights. The database may not have a record for these numbers and dates.');
    }
  }

  const allGood = enrichable.length === 0 && unresolved.length === 0;

  return (
    <SheetShell visible={visible} title="Resolve flights" onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }}>
        {result ? (
          <View className="rounded-2xl" style={{ marginHorizontal: 20, marginTop: 4, marginBottom: allGood ? 0 : 14, backgroundColor: '#F4F3FB', paddingHorizontal: 14, paddingVertical: 11 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, lineHeight: 18 }}>{result}</Text>
          </View>
        ) : null}
        {allGood ? (
          <View className="items-center" style={{ paddingVertical: 40, paddingHorizontal: 24, gap: 10 }}>
            <View className="rounded-full items-center justify-center" style={{ height: 56, width: 56, backgroundColor: 'rgba(36,209,195,0.14)' }}>
              <CircleCheck size={26} color="#12A594" />
            </View>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 19, color: COLORS.navy }}>All flights sorted</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, textAlign: 'center', lineHeight: 18 }}>
              Every flight stop maps to a recognised airport and there are no extra details to fetch.
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, paddingTop: 4, gap: 22 }}>
            {/* Fetch missing flight details */}
            {enrichable.length > 0 ? (
              <View style={{ gap: 12 }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>Fetch flight details</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, lineHeight: 19 }}>
                    {enrichable.length} flight{enrichable.length === 1 ? '' : 's'} with details we can look up by flight number — routes, aircraft, terminals, times and any post-flight delays.
                  </Text>
                </View>

                <Pressable onPress={fetchAll} disabled={busy} className="flex-row items-center justify-center rounded-2xl" style={{ paddingVertical: 12, gap: 8, backgroundColor: COLORS.navySolid, opacity: busy ? 0.5 : 1 }}>
                  {fetchingAll ? <ActivityIndicator size="small" color="#fff" /> : <Download size={16} color="#fff" />}
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>
                    {fetchingAll ? (progress ? `Fetching ${progress.done}/${progress.total}…` : 'Fetching…') : 'Fetch all details'}
                  </Text>
                </Pressable>

                {enrichable.map((c) => (
                  <View key={`${c.expId}:${c.legId}`} className="bg-white dark:bg-card rounded-2xl" style={{ padding: 14, gap: 10, borderWidth: 1, borderColor: 'rgba(20,33,61,0.06)' }}>
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <View className="rounded-xl items-center justify-center" style={{ height: 30, width: 30, backgroundColor: COLORS.warmwhite }}>
                        <Plane size={15} color={COLORS.ink2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: COLORS.ink3 }}>{c.title.toUpperCase()}</Text>
                        <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy, marginTop: 1 }}>
                          {(c.j.reference ?? '').toUpperCase()}{c.j.from || c.j.to ? ` · ${c.j.from || '?'} → ${c.j.to || '?'}` : ''}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row flex-wrap" style={{ gap: 5 }}>
                      {c.reasons.map((r) => (
                        <View key={r} className="rounded-full" style={{ backgroundColor: '#F4F3FB', paddingHorizontal: 9, paddingVertical: 3 }}>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '600', color: COLORS.ink2 }}>{REASON_LABEL[r] ?? r}</Text>
                        </View>
                      ))}
                    </View>
                    <Pressable onPress={() => fetchOne(c)} disabled={busy} className="flex-row items-center justify-center rounded-2xl" style={{ paddingVertical: 10, gap: 7, backgroundColor: 'rgba(30,107,255,0.10)', opacity: busy && fetchingId !== c.legId ? 0.5 : 1 }}>
                      {fetchingId === c.legId ? <ActivityIndicator size="small" color="#1E6BFF" /> : <Download size={14} color="#1E6BFF" />}
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#1E6BFF' }}>{fetchingId === c.legId ? 'Fetching…' : 'Fetch details'}</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Resolve unrecognised airports */}
            {unresolved.length > 0 ? (
              <View style={{ gap: 12 }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>Match airports</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, lineHeight: 19 }}>
                    {unresolved.length} flight stop{unresolved.length === 1 ? '' : 's'} {unresolved.length === 1 ? "isn't" : "aren't"} recognised, so {unresolved.length === 1 ? "it doesn't" : "they don't"} count in your stats yet. Pick the matching airport for each.
                  </Text>
                </View>

                {unresolved.some((u) => !!bestAirportMatch(u.value)) ? (
                  <Pressable onPress={fixAll} className="flex-row items-center justify-center rounded-2xl" style={{ paddingVertical: 12, gap: 8, backgroundColor: COLORS.navySolid }}>
                    <Wand2 size={16} color="#fff" />
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Use all suggested matches</Text>
                  </Pressable>
                ) : null}

                {unresolved.map((u) => {
                  const k = keyOf(u);
                  const best = bestAirportMatch(u.value);
                  return (
                    <View key={k} className="bg-white dark:bg-card rounded-2xl" style={{ padding: 14, gap: 10, borderWidth: 1, borderColor: 'rgba(20,33,61,0.06)' }}>
                      <View>
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: COLORS.ink3 }}>{u.title.toUpperCase()} · {u.field === 'from' ? 'FROM' : 'TO'}</Text>
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy, marginTop: 1 }}>“{u.value}”</Text>
                      </View>
                      {best ? (
                        <Pressable onPress={() => apply(u.expId, u.legId, u.field, best.label)} className="flex-row items-center rounded-2xl" style={{ backgroundColor: 'rgba(36,209,195,0.10)', paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
                          <Wand2 size={15} color="#12A594" />
                          <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.navy }}>
                            Use <Text style={{ fontWeight: '700' }}>{best.city} ({best.iata})</Text>
                          </Text>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: '#12A594' }}>Apply</Text>
                        </Pressable>
                      ) : null}
                      <AirportField
                        value={drafts[k] ?? ''}
                        onChangeText={(t) => setDrafts((p) => ({ ...p, [k]: t }))}
                        onPick={(m) => { apply(u.expId, u.legId, u.field, m.label); setDrafts((p) => ({ ...p, [k]: '' })); }}
                        placeholder="Search a different airport"
                        showStatus={false}
                      />
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SheetShell>
  );
}

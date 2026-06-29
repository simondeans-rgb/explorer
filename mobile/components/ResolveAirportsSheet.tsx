import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { CircleCheck, Wand2 } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { AirportField } from './AirportField';
import { COLORS } from '../src/lib/theme';
import { isEndpointResolved, bestAirportMatch } from '../src/lib/airportSearch';
import type { Expedition, Journey } from '../src/types';

interface Unresolved {
  expId: string;
  title: string;
  legId: string;
  field: 'from' | 'to';
  value: string;
}

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

/** Passport-level "Resolve airports" flow: fix every unrecognised flight stop
 *  across all journeys, with one-tap suggested matches or a manual search. */
export function ResolveAirportsSheet({
  visible,
  onClose,
  expeditions,
  updateExpedition,
}: {
  visible: boolean;
  onClose: () => void;
  expeditions: Expedition[];
  updateExpedition: (id: string, input: { title: string; countryCodes: string[]; startDate?: string; endDate?: string; journeys: Journey[]; note?: string }) => Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const unresolved = useMemo(() => findUnresolved(expeditions), [expeditions]);

  const keyOf = (u: Unresolved) => `${u.expId}:${u.legId}:${u.field}`;

  async function apply(expId: string, legId: string, field: 'from' | 'to', label: string) {
    const e = expeditions.find((x) => x.id === expId);
    if (!e) return;
    const journeys = e.journeys.map((j) => (j.id === legId ? { ...j, [field]: label } : j));
    await updateExpedition(expId, { title: e.title, countryCodes: e.countryCodes, startDate: e.startDate, endDate: e.endDate, journeys, note: e.note });
  }

  async function fixAll() {
    // Group every confident best-match fix per expedition into one write.
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

  const anySuggestion = unresolved.some((u) => !!bestAirportMatch(u.value));

  return (
    <SheetShell visible={visible} title="Resolve airports" onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }}>
        {unresolved.length === 0 ? (
          <View className="items-center" style={{ paddingVertical: 40, paddingHorizontal: 24, gap: 10 }}>
            <View className="rounded-full items-center justify-center" style={{ height: 56, width: 56, backgroundColor: 'rgba(36,209,195,0.14)' }}>
              <CircleCheck size={26} color="#12A594" />
            </View>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 19, color: COLORS.navy }}>All flights matched</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, textAlign: 'center', lineHeight: 18 }}>
              Every flight stop maps to a recognised airport, so they all count toward your distance and flight stats.
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, paddingTop: 4, gap: 14 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, lineHeight: 19 }}>
              {unresolved.length} flight stop{unresolved.length === 1 ? '' : 's'} {unresolved.length === 1 ? "isn't" : "aren't"} recognised, so {unresolved.length === 1 ? "it doesn't" : "they don't"} count in your stats yet. Pick the matching airport for each.
            </Text>

            {anySuggestion ? (
              <Pressable onPress={fixAll} className="flex-row items-center justify-center rounded-2xl" style={{ paddingVertical: 12, gap: 8, backgroundColor: COLORS.navy }}>
                <Wand2 size={16} color="#fff" />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Use all suggested matches</Text>
              </Pressable>
            ) : null}

            {unresolved.map((u) => {
              const k = keyOf(u);
              const best = bestAirportMatch(u.value);
              return (
                <View key={k} className="bg-white rounded-2xl" style={{ padding: 14, gap: 10, borderWidth: 1, borderColor: 'rgba(20,33,61,0.06)' }}>
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
        )}
      </ScrollView>
    </SheetShell>
  );
}

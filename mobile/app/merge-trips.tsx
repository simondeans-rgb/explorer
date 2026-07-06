import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Merge, Check } from 'lucide-react-native';
import { BackButton } from '../components/BackButton';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { goBack } from '../src/lib/nav';
import { useWorldly } from '../src/hooks/useWorldly';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';
import { flagEmoji } from '../src/lib/flags';
import { suggestTripMerges, buildMergedExpedition, type MergeSuggestion } from '../src/lib/tripMerge';
import { track } from '../src/lib/analytics';

const DISMISSED_KEY = 'worldly:mergeDismissed';

/** Tidy up trips: bookings that chain into one journey (or overlap) are
 *  suggested as merges. Merging combines journeys, countries and dates, moves
 *  photos and discoveries over, and deletes the leftover shells. */
export default function MergeTripsScreen() {
  const { aggregates } = useWorldly();
  const { expeditions, discoveries, captures, mergeExpeditions } = useData();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY)
      .then((raw) => {
        if (raw) setDismissed(new Set(JSON.parse(raw) as string[]));
      })
      .catch(() => {});
  }, []);

  const suggestions = useMemo(() => {
    const nameOf = new Map(aggregates.map((a) => [a.code, a.name]));
    const home = new Set(
      aggregates
        .filter((a) => a.relationships.includes('lived') || a.relationships.includes('based') || a.relationships.includes('born'))
        .map((a) => a.code),
    );
    return suggestTripMerges(expeditions, { countryName: (c) => nameOf.get(c) ?? c, homeCodes: home });
  }, [aggregates, expeditions]);

  const visible = suggestions.filter((s) => !dismissed.has(s.ids.join('+')));

  async function dismiss(s: MergeSuggestion) {
    const next = new Set(dismissed).add(s.ids.join('+'));
    setDismissed(next);
    AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...next])).catch(() => {});
    track('trip_merge_dismissed', { trips: s.ids.length });
  }

  async function merge(s: MergeSuggestion) {
    if (busy) return;
    setBusy(s.ids.join('+'));
    try {
      const members = s.ids.map((id) => expeditions.find((e) => e.id === id)).filter((e): e is NonNullable<typeof e> => !!e);
      if (members.length < 2) return;
      const [targetId, ...sourceIds] = s.ids;
      await mergeExpeditions({
        targetId,
        sourceIds,
        merged: buildMergedExpedition(members, s.title),
        discoveryIds: discoveries.filter((d) => d.expeditionId && sourceIds.includes(d.expeditionId)).map((d) => d.id),
        captureIds: captures.filter((c) => c.expeditionId && sourceIds.includes(c.expeditionId)).map((c) => c.id),
      });
      toast.success(`Merged ${members.length} trips into “${s.title}”`);
      track('trips_merged', { trips: members.length });
    } catch {
      toast.error("Couldn't merge those trips — try again.");
    } finally {
      setBusy(null);
    }
  }

  const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 60, paddingBottom: 26, paddingHorizontal: 22 }}>
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 58, left: 18, zIndex: 20 }} />
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.9, textAlign: 'center' }}>TIDY UP</Text>
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, textAlign: 'center', marginTop: 2 }}>Merge related trips</Text>
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.95, textAlign: 'center', marginTop: 4, paddingHorizontal: 10 }}>
            Imported bookings often split one journey into several trips. Merging combines their flights, dates and photos into a single story.
          </Text>
        </LinearGradient>

        {visible.length === 0 ? (
          <View className="bg-white dark:bg-card rounded-3xl items-center" style={{ marginHorizontal: 20, marginTop: 20, padding: 26 }}>
            <Check size={26} color={COLORS.aqua} />
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 10 }}>Your trips look tidy</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
              No related bookings to merge right now. New imports are checked automatically.
            </Text>
          </View>
        ) : (
          visible.map((s) => {
            const key = s.ids.join('+');
            const members = s.ids.map((id) => expeditions.find((e) => e.id === id)).filter((e): e is NonNullable<typeof e> => !!e);
            return (
              <View key={key} className="bg-white dark:bg-card rounded-3xl" style={{ marginHorizontal: 20, marginTop: 16, padding: 16 }}>
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  <Text style={{ fontSize: 17 }}>{s.countryCodes.slice(0, 4).map((c) => flagEmoji(c)).join(' ')}</Text>
                  <View className="rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 9, paddingVertical: 3 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10.5, fontWeight: '700', color: COLORS.coral }}>{s.reason.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 19, color: COLORS.navy, marginTop: 8 }}>{s.title}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 2 }}>
                  {fmt(s.startDate)} — {fmt(s.endDate)} · {s.ids.length} trips · {s.journeyCount} journeys
                </Text>

                <View style={{ marginTop: 12, gap: 8 }}>
                  {members.map((m) => (
                    <View key={m.id} className="rounded-2xl" style={{ backgroundColor: 'rgba(142,151,184,0.10)', paddingHorizontal: 12, paddingVertical: 9 }}>
                      <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '700', color: COLORS.navy }}>{m.title}</Text>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, color: COLORS.ink3, marginTop: 1 }}>
                        {m.startDate ? fmt(m.startDate) : '—'}{m.endDate ? ` — ${fmt(m.endDate)}` : ''} · {m.journeys.length} {m.journeys.length === 1 ? 'journey' : 'journeys'}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="flex-row" style={{ gap: 10, marginTop: 14 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Merge into ${s.title}`}
                    onPress={() => merge(s)}
                    disabled={busy != null}
                    style={{ flex: 1, borderRadius: 18, overflow: 'hidden', opacity: busy && busy !== key ? 0.6 : 1 }}
                  >
                    <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 7 }}>
                      <Merge size={16} color="#fff" />
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>
                        {busy === key ? 'Merging…' : 'Merge these'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Keep these trips separate"
                    onPress={() => dismiss(s)}
                    disabled={busy != null}
                    className="rounded-2xl items-center justify-center"
                    style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(142,151,184,0.14)' }}
                  >
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2 }}>Keep separate</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

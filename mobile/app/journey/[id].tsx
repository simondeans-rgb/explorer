import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Trash2, Plus, Check, Search, Plane, TrainFront, Ship, Car, Anchor } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { DestinationImage } from '../../components/DestinationImage';
import { JourneyGlobe } from '../../components/JourneyGlobe';
import { RouteBuilder } from '../../components/RouteBuilder';
import { journeyLegSegments } from '../../src/lib/journeyGeo';
import { COLORS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName, COUNTRIES } from '../../src/data/countries';
import { goBack } from '../../src/lib/nav';
import { JOURNEY_MODES, JOURNEY_MODE_META, type JourneyMode, type Journey } from '../../src/types';
import { useData } from '../../src/store/data';
import { useToast } from '../../src/store/toast';

let idc = 0;
const newId = () => `j_${Date.now().toString(36)}_${idc++}`;

const MODE_ICON: Record<JourneyMode, ComponentType<{ size?: number; color?: string }>> = {
  flight: Plane,
  rail: TrainFront,
  cruise: Ship,
  road: Car,
  ferry: Anchor,
};

interface Leg {
  id: string;
  mode: JourneyMode;
  from: string;
  to: string;
  date: string;
  operator: string;
  reference: string;
  seat: string;
  vehicle: string;
  note: string;
}

const legFromJourney = (j: Journey): Leg => ({
  id: j.id || newId(),
  mode: j.mode,
  from: j.from ?? '',
  to: j.to ?? '',
  date: j.date ?? '',
  operator: j.operator ?? '',
  reference: j.reference ?? '',
  seat: j.seat ?? '',
  vehicle: j.vehicle ?? '',
  note: j.note ?? '',
});
const emptyLeg = (mode: JourneyMode = 'flight'): Leg => ({ id: newId(), mode, from: '', to: '', date: '', operator: '', reference: '', seat: '', vehicle: '', note: '' });
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s.trim());

function Field({ value, onChange, placeholder, flex }: { value: string; onChange: (t: string) => void; placeholder: string; flex?: boolean }) {
  return (
    <View className="bg-white rounded-2xl" style={[{ paddingHorizontal: 12, paddingVertical: 10 }, flex ? { flex: 1 } : null]}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink }} />
    </View>
  );
}

const LBL = { fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700' as const, letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 18 };

export default function JourneyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expeditions, updateExpedition, removeExpedition } = useData();
  const { toast } = useToast();
  const expedition = expeditions.find((e) => e.id === id);

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [legs, setLegs] = useState<Leg[]>([emptyLeg()]);
  const [query, setQuery] = useState('');
  const [showRoute, setShowRoute] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (expedition && !hydrated) {
      setTitle(expedition.title);
      setStartDate(expedition.startDate ?? '');
      setEndDate(expedition.endDate ?? '');
      setNote(expedition.note ?? '');
      setCodes(expedition.countryCodes ?? []);
      setLegs(expedition.journeys.length ? expedition.journeys.map(legFromJourney) : [emptyLeg()]);
      setHydrated(true);
    }
  }, [expedition, hydrated]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) && !codes.includes(c.code)).slice(0, 12);
  }, [query, codes]);

  // Flight legs (placeable on the globe) for the route you're building, live.
  const detailSegments = useMemo(() => journeyLegSegments(legs, startDate || undefined), [legs, startDate]);

  function patchLeg(legId: string, patch: Partial<Leg>) {
    setLegs((prev) => prev.map((l) => (l.id === legId ? { ...l, ...patch } : l)));
  }
  function addLeg() {
    setLegs((prev) => [...prev, emptyLeg(prev[prev.length - 1]?.mode ?? 'flight')]);
  }
  function removeLeg(legId: string) {
    setLegs((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== legId) : prev));
  }

  async function save() {
    if (!title.trim() || saving || !expedition) return;
    setSaving(true);
    try {
      const journeys: Journey[] = legs
        .filter((l) => l.from || l.to || l.operator || l.reference || l.date || l.vehicle || l.seat || l.note)
        .map((l) => {
          const j: Journey = { id: l.id, mode: l.mode };
          if (l.from.trim()) j.from = l.from.trim();
          if (l.to.trim()) j.to = l.to.trim();
          if (l.operator.trim()) j.operator = l.operator.trim();
          if (l.reference.trim()) j.reference = l.reference.trim();
          if (l.seat.trim()) j.seat = l.seat.trim();
          if (l.vehicle.trim()) j.vehicle = l.vehicle.trim();
          if (isDate(l.date)) j.date = l.date.trim();
          if (l.note.trim()) j.note = l.note.trim();
          return j;
        });
      await updateExpedition(expedition.id, {
        title,
        countryCodes: codes,
        startDate: startDate.trim() || undefined,
        endDate: endDate.trim() || undefined,
        journeys,
        note,
      });
      toast.success('Journey saved');
      goBack();
    } catch {
      setSaving(false);
      toast.error("Couldn't save — check your connection and try again.");
    }
  }

  function confirmDelete() {
    if (!expedition) return;
    Alert.alert('Delete journey?', `"${expedition.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removeExpedition(expedition.id); goBack(); } },
    ]);
  }

  if (!expedition) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.warmwhite, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>Journey not found</Text>
        <Pressable onPress={goBack} style={{ marginTop: 14 }}><Text style={{ fontFamily: 'PlusJakarta', color: COLORS.coral, fontWeight: '700' }}>Go back</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <DestinationImage code={codes[0] ?? 'WW'} scrim style={{ position: 'relative', paddingTop: 60, paddingBottom: 46, minHeight: 180, justifyContent: 'flex-end' }}>
          <Pressable onPress={goBack} hitSlop={12} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 60, left: 20, zIndex: 20 }}>
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={confirmDelete} hitSlop={12} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 60, right: 20, zIndex: 20 }}>
            <Trash2 size={18} color="#fff" />
          </Pressable>
          <View style={{ paddingHorizontal: 20 }}>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1, opacity: 0.9 }}>EDIT JOURNEY</Text>
            <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, marginTop: 2 }}>{title || expedition.title}</Text>
          </View>
          <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
          </Svg>
        </DestinationImage>

        {/* route globe — your flight legs on a spinning world */}
        {detailSegments.length > 0 ? (
          <View style={{ marginHorizontal: 20, marginTop: 16, borderRadius: 24, overflow: 'hidden' }}>
            <JourneyGlobe segments={detailSegments} maxSize={300} />
          </View>
        ) : null}

        {/* title */}
        <Text style={LBL}>TITLE</Text>
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Japan · 2026" placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>

        {/* dates */}
        <Text style={LBL}>DATES</Text>
        <View className="flex-row" style={{ marginHorizontal: 20, marginTop: 8, gap: 8 }}>
          <Field flex placeholder="Start (YYYY-MM-DD)" value={startDate} onChange={setStartDate} />
          <Field flex placeholder="End (YYYY-MM-DD)" value={endDate} onChange={setEndDate} />
        </View>

        {/* countries */}
        <Text style={LBL}>COUNTRIES</Text>
        {codes.length > 0 ? (
          <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
            {codes.map((c) => (
              <Pressable key={c} onPress={() => setCodes((prev) => prev.filter((x) => x !== c))} className="flex-row items-center rounded-full" style={{ backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 7, gap: 6 }}>
                <Text style={{ fontSize: 15 }}>{flagEmoji(c)}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.navy }}>{countryName(c)}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3 }}>×</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View className="flex-row items-center bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 8 }}>
          <Search size={18} color={COLORS.ink3} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Add a country" placeholderTextColor={COLORS.ink3} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>
        {results.length > 0 ? (
          <View style={{ marginHorizontal: 20, marginTop: 6 }}>
            {results.map((c) => (
              <Pressable key={c.code} onPress={() => { setCodes((prev) => [...prev, c.code]); setQuery(''); }} className="flex-row items-center" style={{ paddingVertical: 9, gap: 10 }}>
                <Text style={{ fontSize: 20 }}>{flagEmoji(c.code)}</Text>
                <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                <Plus size={16} color={COLORS.coral} />
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* legs */}
        <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy }}>Legs</Text>
          <View className="flex-row items-center" style={{ gap: 14 }}>
            <Pressable onPress={() => setShowRoute((v) => !v)} hitSlop={8}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: showRoute ? COLORS.coral : COLORS.ink3 }}>Multi-stop</Text>
            </Pressable>
            <Pressable onPress={addLeg} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 12, paddingVertical: 7, gap: 5 }}>
              <Plus size={14} color={COLORS.coral} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>Add leg</Text>
            </Pressable>
          </View>
        </View>
        {showRoute ? (
          <RouteBuilder onAdd={(rl) => { setLegs((prev) => [...prev, ...rl.map((l) => ({ ...emptyLeg(l.mode), from: l.from, to: l.to }))]); setShowRoute(false); }} />
        ) : null}
        {legs.map((leg, i) => {
          const meta = JOURNEY_MODE_META[leg.mode];
          return (
            <View key={leg.id} className="bg-white rounded-3xl" style={{ marginHorizontal: 20, marginTop: 10, padding: 14, gap: 10 }}>
              <View className="flex-row items-center justify-between">
                <Text style={{ fontFamily: 'Fraunces', fontSize: 15, color: COLORS.navy }}>Leg {i + 1}</Text>
                {legs.length > 1 ? (
                  <Pressable onPress={() => removeLeg(leg.id)} hitSlop={8}><Trash2 size={18} color={COLORS.ink3} /></Pressable>
                ) : null}
              </View>
              <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                {JOURNEY_MODES.map((m) => {
                  const active = leg.mode === m;
                  const Icon = MODE_ICON[m];
                  return (
                    <Pressable key={m} onPress={() => patchLeg(leg.id, { mode: m })} className="flex-row items-center rounded-full" style={{ paddingHorizontal: 11, paddingVertical: 7, gap: 5, backgroundColor: active ? COLORS.navy : COLORS.warmwhite }}>
                      <Icon size={13} color={active ? '#fff' : COLORS.coral} />
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{JOURNEY_MODE_META[m].label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View className="flex-row" style={{ gap: 8 }}>
                <Field flex placeholder={meta.from} value={leg.from} onChange={(t) => patchLeg(leg.id, { from: t })} />
                <Field flex placeholder={meta.to} value={leg.to} onChange={(t) => patchLeg(leg.id, { to: t })} />
              </View>
              <View className="flex-row" style={{ gap: 8 }}>
                <Field flex placeholder="Date (YYYY-MM-DD)" value={leg.date} onChange={(t) => patchLeg(leg.id, { date: t })} />
                <Field flex placeholder={meta.operator} value={leg.operator} onChange={(t) => patchLeg(leg.id, { operator: t })} />
              </View>
              <View className="flex-row" style={{ gap: 8 }}>
                <Field flex placeholder={meta.reference} value={leg.reference} onChange={(t) => patchLeg(leg.id, { reference: t })} />
                <Field flex placeholder={meta.seat} value={leg.seat} onChange={(t) => patchLeg(leg.id, { seat: t })} />
              </View>
              <Field placeholder="Aircraft / vehicle" value={leg.vehicle} onChange={(t) => patchLeg(leg.id, { vehicle: t })} />
              <Field placeholder="Notes" value={leg.note} onChange={(t) => patchLeg(leg.id, { note: t })} />
            </View>
          );
        })}

        {/* note */}
        <Text style={LBL}>NOTE</Text>
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput value={note} onChangeText={setNote} placeholder="A note for this journey" placeholderTextColor={COLORS.ink3} multiline style={{ fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink, minHeight: 44 }} />
        </View>

        <Pressable onPress={save} disabled={!title.trim() || saving} className="rounded-2xl items-center justify-center flex-row" style={{ marginHorizontal: 20, marginTop: 20, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: title.trim() && !saving ? 1 : 0.4, gap: 8 }}>
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Check size={18} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save changes</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

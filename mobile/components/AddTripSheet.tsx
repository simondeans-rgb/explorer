import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Check, Search, Plus, Trash2, Plane, TrainFront, Ship, Car, Anchor } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { SheetShell } from './SheetShell';
import { RouteBuilder } from './RouteBuilder';
import { AirportField } from './AirportField';
import { DateField } from './DateField';
import { FlightSummaryCard } from './FlightSummaryCard';
import { resolveEndpoint } from '../src/lib/journeyGeo';
import { lookupFlight, normaliseFlightNumber, flightLookupConfigured } from '../src/lib/flightLookup';
import { COLORS } from '../src/lib/theme';
import { useUnits } from '../src/store/units';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES } from '../src/data/countries';
import { JOURNEY_MODES, JOURNEY_MODE_META, type Journey, type JourneyMode } from '../src/types';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';

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
  carrier: string;
  reference: string;
  vehicle: string;
  departTime: string;
  arriveTime: string;
  departActual: string;
  arriveActual: string;
  departDelayMin?: number;
  arriveDelayMin?: number;
  fromTerminal: string;
  toTerminal: string;
  distanceKm?: number;
  durationMin?: number;
  note: string;
}

let legCounter = 0;
function newId() {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `leg_${Date.now().toString(36)}_${legCounter++}`;
}
function emptyLeg(mode: JourneyMode = 'flight'): Leg {
  return { id: newId(), mode, from: '', to: '', date: '', carrier: '', reference: '', vehicle: '', departTime: '', arriveTime: '', departActual: '', arriveActual: '', fromTerminal: '', toTerminal: '', note: '' };
}

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s.trim());

export function AddTripSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { importExpeditions } = useData();
  const { toast } = useToast();
  const { unit } = useUnits();
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [codes, setCodes] = useState<Set<string>>(new Set());
  const [legs, setLegs] = useState<Leg[]>([emptyLeg()]);
  const [showRoute, setShowRoute] = useState(false);
  const [saving, setSaving] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 30);
  }, [query]);

  function reset() {
    setTitle('');
    setQuery('');
    setCodes(new Set());
    setLegs([emptyLeg()]);
    setSaving(false);
  }
  function close() {
    reset();
    onClose();
  }
  function toggle(code: string) {
    setCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }
  const [lookingUp, setLookingUp] = useState<string | null>(null);
  async function lookupLeg(leg: Leg) {
    const num = normaliseFlightNumber(leg.reference);
    if (!num) { toast.error('Enter the flight number first.'); return; }
    const date = (leg.date || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast.error('Add the flight date (YYYY-MM-DD) first.'); return; }
    setLookingUp(leg.id);
    const r = await lookupFlight(num, date);
    setLookingUp(null);
    if (r.ok) {
      const i = r.info;
      patchLeg(leg.id, { from: i.from ?? leg.from, to: i.to ?? leg.to, carrier: i.airline ?? leg.carrier, vehicle: i.aircraft ?? leg.vehicle, date: i.date ?? leg.date, departTime: i.departTimeLocal ?? leg.departTime, arriveTime: i.arriveTimeLocal ?? leg.arriveTime, departActual: i.departActualLocal ?? leg.departActual, arriveActual: i.arriveActualLocal ?? leg.arriveActual, departDelayMin: i.departDelayMin ?? leg.departDelayMin, arriveDelayMin: i.arriveDelayMin ?? leg.arriveDelayMin, fromTerminal: i.fromTerminal ?? leg.fromTerminal, toTerminal: i.toTerminal ?? leg.toTerminal, distanceKm: i.distanceKm ?? leg.distanceKm, durationMin: i.durationMin ?? leg.durationMin, reference: i.flightNumber });
      toast.success(i.departTimeLocal && i.arriveTimeLocal ? `Found · ${i.departTimeLocal} → ${i.arriveTimeLocal}` : 'Flight details filled in');
    } else {
      toast.error(
        r.reason === 'no-key' ? 'Flight lookup isn’t set up yet.'
        : r.reason === 'not-found' ? 'No flight found for that number and date.'
        : r.reason === 'no-date' ? 'Add the flight date first.'
        : 'Lookup failed — check your connection.',
      );
    }
  }

  function patchLeg(id: string, patch: Partial<Leg>) {
    setLegs((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function addLeg() {
    setLegs((prev) => [...prev, emptyLeg(prev[prev.length - 1]?.mode ?? 'flight')]);
  }
  function removeLeg(id: string) {
    setLegs((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  async function save() {
    if (!ready || saving) return;
    setSaving(true);
    try {
      const journeys: Journey[] = legs
        .filter((l) => l.from || l.to || l.carrier || l.reference || l.date || l.vehicle || l.departTime || l.arriveTime || l.departActual || l.arriveActual || l.fromTerminal || l.toTerminal || l.note)
        .map((l) => {
          const j: Journey = { id: newId(), mode: l.mode };
          if (l.from.trim()) j.from = l.from.trim();
          if (l.to.trim()) j.to = l.to.trim();
          if (l.carrier.trim()) j.operator = l.carrier.trim();
          if (l.reference.trim()) j.reference = l.reference.trim();
          if (l.vehicle.trim()) j.vehicle = l.vehicle.trim();
          if (isDate(l.date)) j.date = l.date.trim();
          if (l.departTime.trim()) j.departTime = l.departTime.trim();
          if (l.arriveTime.trim()) j.arriveTime = l.arriveTime.trim();
          if (l.departActual.trim()) j.departActual = l.departActual.trim();
          if (l.arriveActual.trim()) j.arriveActual = l.arriveActual.trim();
          if (l.departDelayMin != null) j.departDelayMin = l.departDelayMin;
          if (l.arriveDelayMin != null) j.arriveDelayMin = l.arriveDelayMin;
          if (l.fromTerminal.trim()) j.fromTerminal = l.fromTerminal.trim();
          if (l.toTerminal.trim()) j.toTerminal = l.toTerminal.trim();
          if (l.distanceKm != null) j.distanceKm = l.distanceKm;
          if (l.durationMin != null) j.durationMin = l.durationMin;
          if (l.note.trim()) j.note = l.note.trim();
          return j;
        });
      const dates = legs.map((l) => l.date.trim()).filter(isDate).sort();
      await importExpeditions([
        {
          title: title.trim(),
          countryCodes: [...codes],
          startDate: dates[0],
          endDate: dates[dates.length - 1],
          journeys,
        },
      ]);
      toast.success('Journey saved');
      close();
    } catch {
      setSaving(false);
      toast.error("Couldn't save — check your connection and try again.");
    }
  }

  const ready = title.trim().length > 0 && codes.size > 0;

  return (
    <SheetShell visible={visible} title="Log a journey" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* title */}
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 }}>
          <TextInput value={title} onChangeText={setTitle} placeholder="Name this trip, e.g. Japan in spring" placeholderTextColor={COLORS.ink3} style={inputStyle} />
        </View>

        {/* countries */}
        <Text style={LBL}>COUNTRIES VISITED</Text>
        {codes.size > 0 ? (
          <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 6 }}>
            {[...codes].map((c) => (
              <Pressable key={c} onPress={() => toggle(c)} className="flex-row items-center rounded-full" style={{ paddingHorizontal: 12, paddingVertical: 6, gap: 5, backgroundColor: COLORS.navy }}>
                <Text style={{ fontSize: 14 }}>{flagEmoji(c)}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600', color: '#fff' }}>{c}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View className="flex-row items-center bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 8 }}>
          <Search size={18} color={COLORS.ink3} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search countries" placeholderTextColor={COLORS.ink3} style={{ flex: 1, ...inputStyle }} />
        </View>
        {query ? (
          <ScrollView style={{ maxHeight: 150, marginTop: 6 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {results.map((c) => {
              const active = codes.has(c.code);
              return (
                <Pressable key={c.code} onPress={() => toggle(c.code)} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 10, gap: 12, backgroundColor: active ? 'rgba(255,107,154,0.10)' : 'transparent' }}>
                  <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                  {active ? <Check size={18} color={COLORS.coral} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {/* legs */}
        <Text style={LBL}>YOUR JOURNEY</Text>
        {legs.map((leg, i) => {
          const meta = JOURNEY_MODE_META[leg.mode];
          return (
            <View key={leg.id} className="bg-white rounded-3xl" style={{ marginHorizontal: 20, marginTop: 10, padding: 14, gap: 10 }}>
              <View className="flex-row items-center justify-between">
                <Text style={{ fontFamily: 'Fraunces', fontSize: 15, color: COLORS.navy }}>Leg {i + 1}</Text>
                {legs.length > 1 ? (
                  <Pressable onPress={() => removeLeg(leg.id)} hitSlop={8}>
                    <Trash2 size={18} color={COLORS.ink3} />
                  </Pressable>
                ) : null}
              </View>

              {/* mode */}
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

              {leg.mode === 'flight' ? (
                <>
                  {/* Flight number + date lead — look up to auto-fill the rest. */}
                  <Field placeholder={meta.reference} value={leg.reference} onChange={(t) => patchLeg(leg.id, { reference: t })} />
                  <DateField value={leg.date} label="Flight date" onChange={(iso) => patchLeg(leg.id, { date: iso })} />
                  {flightLookupConfigured() ? (
                    <>
                      <Pressable onPress={() => lookupLeg(leg)} disabled={lookingUp === leg.id} className="flex-row items-center justify-center rounded-2xl" style={{ paddingVertical: 11, gap: 7, backgroundColor: 'rgba(30,107,255,0.10)' }}>
                        {lookingUp === leg.id ? <ActivityIndicator size="small" color="#1E6BFF" /> : <Search size={15} color="#1E6BFF" />}
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#1E6BFF' }}>{lookingUp === leg.id ? 'Looking up…' : 'Look up flight'}</Text>
                      </Pressable>
                      {!leg.from && !leg.to ? (
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, paddingHorizontal: 4, lineHeight: 15 }}>Enter the flight number and date, then look up to fill in the route, airline, aircraft, times and terminals automatically.</Text>
                      ) : null}
                    </>
                  ) : null}
                  <View style={{ gap: 8 }}>
                    <AirportField placeholder={meta.from} value={leg.from} near={resolveEndpoint(leg.to)} onChangeText={(t) => patchLeg(leg.id, { from: t })} onPick={(m) => patchLeg(leg.id, { from: m.label })} />
                    <AirportField placeholder={meta.to} value={leg.to} near={resolveEndpoint(leg.from)} onChangeText={(t) => patchLeg(leg.id, { to: t })} onPick={(m) => patchLeg(leg.id, { to: m.label })} />
                  </View>
                  <View className="flex-row" style={{ gap: 8 }}>
                    <Field flex placeholder={meta.operator} value={leg.carrier} onChange={(t) => patchLeg(leg.id, { carrier: t })} />
                    <Field flex placeholder="Aircraft" value={leg.vehicle} onChange={(t) => patchLeg(leg.id, { vehicle: t })} />
                  </View>
                  <View className="flex-row" style={{ gap: 8 }}>
                    <Field flex placeholder="Depart (HH:MM)" value={leg.departTime} onChange={(t) => patchLeg(leg.id, { departTime: t })} />
                    <Field flex placeholder="Arrive (HH:MM)" value={leg.arriveTime} onChange={(t) => patchLeg(leg.id, { arriveTime: t })} />
                  </View>
                  <View className="flex-row" style={{ gap: 8 }}>
                    <Field flex placeholder="Depart terminal" value={leg.fromTerminal} onChange={(t) => patchLeg(leg.id, { fromTerminal: t })} />
                    <Field flex placeholder="Arrive terminal" value={leg.toTerminal} onChange={(t) => patchLeg(leg.id, { toTerminal: t })} />
                  </View>
                  <FlightSummaryCard from={leg.from} to={leg.to} airline={leg.carrier} flightNumber={leg.reference} aircraft={leg.vehicle} departTime={leg.departTime} arriveTime={leg.arriveTime} departActual={leg.departActual} arriveActual={leg.arriveActual} fromTerminal={leg.fromTerminal} toTerminal={leg.toTerminal} distanceKm={leg.distanceKm} durationMin={leg.durationMin} departDelayMin={leg.departDelayMin} arriveDelayMin={leg.arriveDelayMin} unit={unit} />
                </>
              ) : (
                <>
                  <View className="flex-row" style={{ gap: 8 }}>
                    <Field flex placeholder={meta.from} value={leg.from} onChange={(t) => patchLeg(leg.id, { from: t })} />
                    <Field flex placeholder={meta.to} value={leg.to} onChange={(t) => patchLeg(leg.id, { to: t })} />
                  </View>
                  <DateField value={leg.date} label="Date" onChange={(iso) => patchLeg(leg.id, { date: iso })} />
                  <Field flex placeholder={meta.operator} value={leg.carrier} onChange={(t) => patchLeg(leg.id, { carrier: t })} />
                  <View className="flex-row" style={{ gap: 8 }}>
                    <Field flex placeholder={meta.reference} value={leg.reference} onChange={(t) => patchLeg(leg.id, { reference: t })} />
                    <Field flex placeholder="Vehicle" value={leg.vehicle} onChange={(t) => patchLeg(leg.id, { vehicle: t })} />
                  </View>
                  <View className="flex-row" style={{ gap: 8 }}>
                    <Field flex placeholder="Depart (HH:MM)" value={leg.departTime} onChange={(t) => patchLeg(leg.id, { departTime: t })} />
                    <Field flex placeholder="Arrive (HH:MM)" value={leg.arriveTime} onChange={(t) => patchLeg(leg.id, { arriveTime: t })} />
                  </View>
                </>
              )}
              <Field placeholder="Notes" value={leg.note} onChange={(t) => patchLeg(leg.id, { note: t })} />
            </View>
          );
        })}

        <View className="flex-row" style={{ marginHorizontal: 20, marginTop: 10, gap: 10 }}>
          <Pressable onPress={addLeg} className="flex-row items-center justify-center rounded-2xl" style={{ flex: 1, paddingVertical: 13, gap: 7, borderWidth: 1.5, borderColor: 'rgba(255,107,154,0.4)', borderStyle: 'dashed' }}>
            <Plus size={16} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.coral }}>Add leg</Text>
          </Pressable>
          <Pressable onPress={() => setShowRoute((v) => !v)} className="items-center justify-center rounded-2xl" style={{ paddingHorizontal: 16, backgroundColor: showRoute ? COLORS.navy : COLORS.warmwhite }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: showRoute ? '#fff' : COLORS.ink2 }}>Multi-stop</Text>
          </Pressable>
        </View>
        {showRoute ? (
          <RouteBuilder onAdd={(rl) => { setLegs((prev) => [...prev.filter((l) => l.from || l.to || l.carrier || l.reference || l.date || l.vehicle || l.departTime || l.arriveTime || l.departActual || l.arriveActual || l.fromTerminal || l.toTerminal || l.note), ...rl.map((l) => ({ ...emptyLeg(l.mode), from: l.from, to: l.to }))]); setShowRoute(false); }} />
        ) : null}

        <Pressable onPress={save} disabled={!ready || saving} className="rounded-2xl items-center justify-center flex-row" style={{ marginHorizontal: 20, marginTop: 16, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: ready && !saving ? 1 : 0.4, gap: 8 }}>
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Check size={18} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save journey</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SheetShell>
  );
}

function Field({ placeholder, value, onChange, flex }: { placeholder: string; value: string; onChange: (t: string) => void; flex?: boolean }) {
  return (
    <View className="rounded-2xl" style={{ flex: flex ? 1 : undefined, backgroundColor: COLORS.warmwhite, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(20,33,61,0.07)' }}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink }} />
    </View>
  );
}

const inputStyle = { fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink } as const;
const LBL = {
  fontFamily: 'PlusJakarta',
  fontSize: 11,
  fontWeight: '700' as const,
  letterSpacing: 1,
  color: COLORS.ink3,
  paddingHorizontal: 20,
  marginTop: 16,
};

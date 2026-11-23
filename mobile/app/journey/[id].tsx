import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useConfirm } from '../../src/store/confirm';
import { useLocalSearchParams, router } from 'expo-router';
import { Trash2, Plus, Check, Search, Plane, TrainFront, Ship, Car, Anchor, ImagePlus, CalendarDays, ChevronRight, Pencil } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { AddPhotoSheet } from '../../components/AddPhotoSheet';
import { BackButton } from '../../components/BackButton';
import { KeyboardDoneBar } from '../../components/KeyboardDoneBar';
import type { ComponentType } from 'react';
import { DestinationImage } from '../../components/DestinationImage';
import { JourneyGlobe } from '../../components/JourneyGlobe';
import { RouteBuilder } from '../../components/RouteBuilder';
import { AirportField } from '../../components/AirportField';
import { isEndpointResolved, bestAirportMatch } from '../../src/lib/airportSearch';
import { lookupFlight, normaliseFlightNumber, flightLookupConfigured, lookupsUsedThisMonth } from '../../src/lib/flightLookup';
import { shouldGate } from '../../src/lib/billing';
import { CircleAlert } from 'lucide-react-native';
import { DateField } from '../../components/DateField';
import { FlightSummaryCard } from '../../components/FlightSummaryCard';
import { journeyLegSegments, resolveEndpoint } from '../../src/lib/journeyGeo';
import { BRAND_GRADIENT, COLORS, SHADOW, tint } from '../../src/lib/theme';
import { haversineMi } from '../../src/lib/travelStats';
import { convertMiles, distanceUnitLabel, KM_PER_MI } from '../../src/lib/units';
import { EARTH_CIRCUMFERENCE_MI } from '../../src/lib/travelStats';
import { useUnits } from '../../src/store/units';
import { flagEmoji } from '../../src/lib/flags';
import { countryName, COUNTRIES } from '../../src/data/countries';
import { goBack } from '../../src/lib/nav';
import { JOURNEY_MODES, JOURNEY_MODE_META, type JourneyMode, type Journey } from '../../src/types';
import { useData } from '../../src/store/data';
import { DetailSkeleton } from '../../components/DetailSkeleton';
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
  flightChecked?: boolean;
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
  departTime: j.departTime ?? '',
  arriveTime: j.arriveTime ?? '',
  departActual: j.departActual ?? '',
  arriveActual: j.arriveActual ?? '',
  departDelayMin: j.departDelayMin,
  arriveDelayMin: j.arriveDelayMin,
  fromTerminal: j.fromTerminal ?? '',
  toTerminal: j.toTerminal ?? '',
  distanceKm: j.distanceKm,
  durationMin: j.durationMin,
  flightChecked: j.flightChecked,
  note: j.note ?? '',
});
const emptyLeg = (mode: JourneyMode = 'flight'): Leg => ({ id: newId(), mode, from: '', to: '', date: '', operator: '', reference: '', seat: '', vehicle: '', departTime: '', arriveTime: '', departActual: '', arriveActual: '', fromTerminal: '', toTerminal: '', note: '' });
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s.trim());

function Field({ value, onChange, placeholder, flex }: { value: string; onChange: (t: string) => void; placeholder: string; flex?: boolean }) {
  return (
    <View className="rounded-2xl" style={[{ backgroundColor: COLORS.warmwhite, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(20,33,61,0.14)' }, flex ? { flex: 1 } : null]}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink }} />
    </View>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2019-04-02" → "2 Apr 2019"; tolerates year-only / year-month dates. */
function prettyDate(iso?: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!m) return y;
  const mon = MONTHS[Number(m) - 1] ?? '';
  return d ? `${Number(d)} ${mon} ${y}` : `${mon} ${y}`;
}
function prettyRange(start?: string, end?: string): string {
  if (!start) return '';
  if (!end || end === start) return prettyDate(start);
  // Same year: don't repeat it on the start ("2 Apr – 20 Apr 2019").
  const sameYear = start.slice(0, 4) === end.slice(0, 4) && start.length > 4;
  return `${sameYear ? prettyDate(start).replace(` ${start.slice(0, 4)}`, '') : prettyDate(start)} – ${prettyDate(end)}`;
}
const cleanStop = (label?: string) => (label ?? '').replace(/\s*\(.*?\)/g, '').replace(/,.*$/, '').trim();
function fmtDuration(min: number): string {
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d > 0) return `${d}d ${h}h`;
  return h > 0 ? `${h}h ${m ? `${m}m` : ''}`.trim() : `${m}m`;
}

/** One headline number in the journey recap. */
function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View className="bg-white dark:bg-card rounded-3xl" style={{ flexGrow: 1, flexBasis: '45%', paddingVertical: 14, paddingHorizontal: 16, ...SHADOW.card }}>
      <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 26, color: COLORS.navy }}>{value}</Text>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, fontWeight: '700', letterSpacing: 0.4, color: COLORS.ink3, marginTop: 2 }}>{label.toUpperCase()}</Text>
    </View>
  );
}

const LBL = { fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700' as const, letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 18 };

export default function JourneyScreen() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const insets = useSafeAreaInsets();
  const { expeditions, updateExpedition, removeExpedition, captures, loaded } = useData();
  const { toast } = useToast();
  const { unit } = useUnits();
  const confirm = useConfirm();
  const [photoOpen, setPhotoOpen] = useState(false);
  const expedition = expeditions.find((e) => e.id === id);

  const [title, setTitle] = useState('');
  // ISO dates ('YYYY', 'YYYY-MM' or 'YYYY-MM-DD') picked via the calendar field.
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [note, setNote] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [legs, setLegs] = useState<Leg[]>([emptyLeg()]);
  const [query, setQuery] = useState('');
  const [showRoute, setShowRoute] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // Story first: a saved journey opens as a recap. The form sits behind Edit
  // (or opens directly via ?edit=1, and for a journey with nothing in it yet).
  const [editing, setEditing] = useState(edit === '1');

  useEffect(() => {
    if (expedition && !hydrated) {
      setTitle(expedition.title);
      setStartDate(expedition.startDate ?? '');
      setEndDate(expedition.endDate ?? '');
      setNote(expedition.note ?? '');
      setCodes(expedition.countryCodes ?? []);
      setLegs(expedition.journeys.length ? expedition.journeys.map(legFromJourney) : [emptyLeg()]);
      setHydrated(true);
      if (expedition.journeys.length === 0 && !expedition.note) setEditing(true);
    }
  }, [expedition, hydrated]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) && !codes.includes(c.code)).slice(0, 12);
  }, [query, codes]);

  // The recap's numbers, from the saved record: distance (measured where a
  // lookup gave one, great-circle otherwise), time on the move, legs and stops.
  const recap = useMemo(() => {
    const js = expedition?.journeys ?? [];
    let mi = 0;
    let min = 0;
    const stops: string[] = [];
    const pushStop = (label?: string) => {
      const c = cleanStop(label);
      if (c && stops[stops.length - 1] !== c) stops.push(c);
    };
    for (const j of js) {
      if (j.distanceKm) mi += j.distanceKm / KM_PER_MI;
      else {
        const a = resolveEndpoint(j.from);
        const b = resolveEndpoint(j.to);
        if (a && b) mi += haversineMi(a, b);
      }
      if (j.durationMin) min += j.durationMin;
      pushStop(j.from);
      pushStop(j.to);
    }
    return { mi, min, legs: js.length, stops, places: new Set(stops).size };
  }, [expedition]);

  // Flight legs (placeable on the globe) for the route you're building, live.
  const detailSegments = useMemo(() => journeyLegSegments(legs, startDate || undefined), [legs, startDate]);

  // Flight stops typed as free text we can't recognise — they don't count in the
  // stats until matched. Each gets a best-guess airport for one-tap resolution.
  const unresolved = useMemo(() => {
    const list: { legId: string; field: 'from' | 'to'; value: string; suggestion?: ReturnType<typeof bestAirportMatch> }[] = [];
    for (const l of legs) {
      if (l.mode !== 'flight') continue;
      (['from', 'to'] as const).forEach((field) => {
        const v = l[field];
        if (v.trim() && !isEndpointResolved(v)) list.push({ legId: l.id, field, value: v.trim(), suggestion: bestAirportMatch(v) });
      });
    }
    return list;
  }, [legs]);

  const [lookingUp, setLookingUp] = useState<string | null>(null);
  async function lookupLeg(leg: Leg) {
    const num = normaliseFlightNumber(leg.reference);
    if (!num) { toast.error('Enter the flight number first.'); return; }
    const date = (leg.date || startDate || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast.error('Add the flight date (YYYY-MM-DD) first.'); return; }
    // Paywall trigger — monthly lookup allowance. Inert until billing goes live.
    if (shouldGate('lookups', await lookupsUsedThisMonth())) {
      router.push('/upgrade?trigger=lookups');
      return;
    }
    setLookingUp(leg.id);
    const r = await lookupFlight(num, date);
    setLookingUp(null);
    if (r.ok) {
      const i = r.info;
      patchLeg(leg.id, {
        from: i.from ?? leg.from,
        to: i.to ?? leg.to,
        operator: i.airline ?? leg.operator,
        vehicle: i.aircraft ?? leg.vehicle,
        date: i.date ?? leg.date,
        departTime: i.departTimeLocal ?? leg.departTime,
        arriveTime: i.arriveTimeLocal ?? leg.arriveTime,
        departActual: i.departActualLocal ?? '',
        arriveActual: i.arriveActualLocal ?? '',
        departDelayMin: i.departDelayMin,
        arriveDelayMin: i.arriveDelayMin,
        fromTerminal: i.fromTerminal ?? leg.fromTerminal,
        toTerminal: i.toTerminal ?? leg.toTerminal,
        distanceKm: i.distanceKm ?? leg.distanceKm,
        durationMin: i.durationMin ?? leg.durationMin,
        reference: i.flightNumber,
      });
      toast.success(i.departTimeLocal && i.arriveTimeLocal ? `Found · ${i.departTimeLocal} → ${i.arriveTimeLocal}` : 'Flight details filled in');
    } else {
      toast.error(
        r.reason === 'no-key' ? 'Flight lookup isn’t set up yet.'
        : r.reason === 'no-date' ? 'Add the flight date first.'
        : r.reason === 'not-found' ? 'No flight found for that number and date.'
        : 'Lookup failed — check your connection.',
      );
    }
  }

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
        .filter((l) => l.from || l.to || l.operator || l.reference || l.date || l.vehicle || l.seat || l.departTime || l.arriveTime || l.departActual || l.arriveActual || l.fromTerminal || l.toTerminal || l.note)
        .map((l) => {
          const j: Journey = { id: l.id, mode: l.mode };
          if (l.from.trim()) j.from = l.from.trim();
          if (l.to.trim()) j.to = l.to.trim();
          if (l.operator.trim()) j.operator = l.operator.trim();
          if (l.reference.trim()) j.reference = l.reference.trim();
          if (l.seat.trim()) j.seat = l.seat.trim();
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
          if (l.flightChecked) j.flightChecked = true;
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
      // Back to the story you just updated, rather than out of the screen.
      setSaving(false);
      setEditing(false);
    } catch {
      setSaving(false);
      toast.error("Couldn't save — check your connection and try again.");
    }
  }

  async function confirmDelete() {
    if (!expedition) return;
    if (await confirm({ title: 'Delete journey?', message: `"${expedition.title}" will be removed.`, confirmLabel: 'Delete', destructive: true })) {
      removeExpedition(expedition.id);
      goBack();
    }
  }

  if (!expedition && !loaded) return <DetailSkeleton />;
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
      <ScrollView contentContainerStyle={{ paddingBottom: editing ? 220 : 120 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag">
        {/* Hero */}
        <DestinationImage code={codes[0] ?? 'WW'} scrim style={{ position: 'relative', paddingTop: 112, paddingBottom: 46, minHeight: 180, justifyContent: 'flex-end' }}>
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 60, left: 20, zIndex: 20 }} />
          {editing ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Delete journey" onPress={confirmDelete} hitSlop={12} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 60, right: 20, zIndex: 20 }}>
              <Trash2 size={18} color="#fff" />
            </Pressable>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Edit journey" onPress={() => setEditing(true)} hitSlop={10} className="flex-row items-center rounded-full bg-white/20" style={{ position: 'absolute', top: 60, right: 20, zIndex: 20, paddingHorizontal: 13, paddingVertical: 8, gap: 6 }}>
              <Pencil size={14} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#fff' }}>Edit</Text>
            </Pressable>
          )}
          <View style={{ paddingHorizontal: 20 }}>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1, opacity: 0.9 }}>
              {editing ? 'EDIT JOURNEY' : (prettyRange(expedition.startDate, expedition.endDate) || 'JOURNEY').toUpperCase()}
            </Text>
            <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, marginTop: 2 }}>{title || expedition.title}</Text>
            {!editing && codes.length > 0 ? (
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, marginTop: 4, opacity: 0.95 }}>
                {codes.slice(0, 6).map((c) => `${flagEmoji(c)} ${countryName(c)}`).join('   ')}
              </Text>
            ) : null}
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

        {/* The story: headline numbers, then the route stop by stop. */}
        {!editing && recap.legs > 0 ? (
          <>
            <View className="flex-row" style={{ flexWrap: 'wrap', paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
              {recap.mi > 0 ? <StatTile value={Math.round(convertMiles(recap.mi, unit)).toLocaleString()} label={`${distanceUnitLabel(unit)} travelled`} /> : null}
              {recap.min > 0 ? <StatTile value={fmtDuration(recap.min)} label="On the move" /> : null}
              <StatTile value={String(recap.legs)} label={recap.legs === 1 ? 'Leg' : 'Legs'} />
              {recap.places > 1 ? <StatTile value={String(recap.places)} label="Stops" /> : null}
            </View>
            {recap.mi >= EARTH_CIRCUMFERENCE_MI * 0.1 ? (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, paddingHorizontal: 24, marginTop: 8 }}>
                That’s <Text style={{ fontWeight: '800', color: COLORS.ink2 }}>{(recap.mi / EARTH_CIRCUMFERENCE_MI).toFixed(recap.mi >= EARTH_CIRCUMFERENCE_MI ? 1 : 2)}×</Text> around the Earth.
              </Text>
            ) : null}

            <Text style={LBL}>THE ROUTE</Text>
            <View className="bg-white dark:bg-card rounded-3xl" style={{ marginHorizontal: 20, marginTop: 8, paddingVertical: 6, paddingHorizontal: 16, ...SHADOW.card }}>
              {/* In the order it happened; undated legs keep their place at the end. */}
              {[...expedition.journeys].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999')).map((j, i) => {
                const Icon = MODE_ICON[j.mode] ?? Plane;
                const km = j.distanceKm ?? (() => {
                  const a = resolveEndpoint(j.from);
                  const b = resolveEndpoint(j.to);
                  return a && b ? haversineMi(a, b) * KM_PER_MI : 0;
                })();
                const meta = [
                  prettyDate(j.date),
                  [j.operator, j.reference].filter(Boolean).join(' '),
                  j.durationMin ? fmtDuration(j.durationMin) : '',
                  km > 0 ? `${Math.round(convertMiles(km / KM_PER_MI, unit)).toLocaleString()} ${distanceUnitLabel(unit)}` : '',
                ].filter(Boolean);
                return (
                  <View key={j.id || i} className="flex-row" style={{ gap: 12, paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: COLORS.tileMuted }}>
                    <View className="rounded-full items-center justify-center" style={{ height: 36, width: 36, backgroundColor: tint(COLORS.coral, 0.12) }}>
                      <Icon size={17} color={COLORS.coral} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Fraunces', fontSize: 16.5, color: COLORS.navy }}>
                        {cleanStop(j.from) || '—'}  →  {cleanStop(j.to) || '—'}
                      </Text>
                      {meta.length ? (
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 2, lineHeight: 18 }}>{meta.join('  ·  ')}</Text>
                      ) : null}
                      {j.note ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, marginTop: 4, lineHeight: 19 }}>{j.note}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}
        {!editing && expedition.note ? (
          <View style={{ marginHorizontal: 20, marginTop: 16, paddingLeft: 14, borderLeftWidth: 3, borderLeftColor: COLORS.coral }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 17, lineHeight: 25, color: COLORS.ink2 }}>{expedition.note}</Text>
          </View>
        ) : null}

        {/* memories — photos stored with this trip */}
        {(() => {
          const tripPhotos = captures
            .filter((c) => c.expeditionId === expedition.id)
            .sort((a, b) => (a.takenAt ?? a.createdAt) - (b.takenAt ?? b.createdAt));
          return (
            <>
              <View className="flex-row items-center" style={{ paddingHorizontal: 20, marginTop: 18 }}>
                <Text style={[LBL, { paddingHorizontal: 0, marginTop: 0, flex: 1 }]}>
                  {tripPhotos.length > 0 ? `MEMORIES (${tripPhotos.length})` : 'MEMORIES'}
                </Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Add a photo to this trip" onPress={() => setPhotoOpen(true)} hitSlop={8} className="flex-row items-center" style={{ gap: 5 }}>
                  <ImagePlus size={14} color={COLORS.coral} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>Add photo</Text>
                </Pressable>
              </View>
              {tripPhotos.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginTop: 8 }}>
                  {tripPhotos.map((c) => (
                    <Pressable key={c.id} onPress={() => router.push(`/memory/${c.id}`)} accessibilityRole="button" accessibilityLabel={`Memory${c.caption ? `: ${c.caption}` : ''} — tap to edit`} style={{ width: 132 }}>
                      <Image source={{ uri: c.dataUrl }} style={{ width: 132, height: 132, borderRadius: 16 }} contentFit="cover" transition={150} />
                      {c.caption ? (
                        <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, marginTop: 4 }}>{c.caption}</Text>
                      ) : null}
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 8 }}>
                  Photos you add from this trip's dates or places will appear here.
                </Text>
              )}
            </>
          );
        })()}

        {/* Plan & crew — the planner view of this same trip record */}
        <Pressable onPress={() => router.push(`/trip/${id}`)} accessibilityRole="button" accessibilityLabel="Plan this trip's itinerary and crew" className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ marginHorizontal: 20, marginTop: 16, padding: 16, gap: 12 }}>
          <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(155,124,255,0.14)' }}>
            <CalendarDays size={19} color={COLORS.lavender} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>Plan &amp; crew</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Day-by-day itinerary, invite friends, countdown</Text>
          </View>
          <ChevronRight size={18} color={COLORS.ink3} />
        </Pressable>

        {!editing ? (
          <Pressable onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Edit this journey's details" className="flex-row items-center justify-center rounded-full" style={{ alignSelf: 'center', marginTop: 22, paddingHorizontal: 20, paddingVertical: 12, gap: 7, backgroundColor: COLORS.tileMuted }}>
            <Pencil size={15} color={COLORS.ink2} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2 }}>Edit details</Text>
          </Pressable>
        ) : null}

        {editing ? (
        <>
        {/* title */}
        <Text style={LBL}>TITLE</Text>
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Japan · 2026" placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>

        {/* dates */}
        <Text style={LBL}>START DATE</Text>
        <View style={{ marginHorizontal: 20, marginTop: 8 }}>
          <DateField value={startDate} onChange={setStartDate} label="Start date" allowPartial />
        </View>
        <Text style={LBL}>END DATE</Text>
        <View style={{ marginHorizontal: 20, marginTop: 8 }}>
          <DateField value={endDate} onChange={setEndDate} label="End date" allowPartial />
        </View>

        {/* countries */}
        <Text style={LBL}>COUNTRIES</Text>
        {codes.length > 0 ? (
          <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
            {codes.map((c) => (
              <Pressable key={c} onPress={() => setCodes((prev) => prev.filter((x) => x !== c))} className="flex-row items-center rounded-full" style={{ backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 7, gap: 6 }}>
                <Text style={{ fontSize: 15 }}>{flagEmoji(c)}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.navy }}>{countryName(c)}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3 }}>×</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 8 }}>
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
        {unresolved.length > 0 ? (
          <View className="rounded-3xl" style={{ marginHorizontal: 20, marginTop: 10, padding: 14, backgroundColor: '#FDF6EA', borderWidth: 1, borderColor: '#F4D58D', gap: 10 }}>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <CircleAlert size={16} color="#C9892B" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#9A6A1E', flex: 1 }}>
                {unresolved.length} flight stop{unresolved.length === 1 ? '' : 's'} not recognised
              </Text>
            </View>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: '#9A6A1E' }}>
              These won't count toward your flight distance or domestic/international stats until matched to an airport.
            </Text>
            {unresolved.map((u, i) => (
              <View key={`${u.legId}-${u.field}-${i}`} className="flex-row items-center" style={{ gap: 8 }}>
                <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.navy, flex: 1 }}>“{u.value}”</Text>
                {u.suggestion ? (
                  <Pressable onPress={() => patchLeg(u.legId, { [u.field]: u.suggestion!.label } as Partial<Leg>)} className="rounded-full" style={{ backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: '#F4D58D' }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: '#9A6A1E' }}>Use {u.suggestion.iata}</Text>
                  </Pressable>
                ) : (
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>No match</Text>
                )}
              </View>
            ))}
          </View>
        ) : null}
        {legs.map((leg, i) => {
          const meta = JOURNEY_MODE_META[leg.mode];
          return (
            <View key={leg.id} className="bg-white dark:bg-card rounded-3xl" style={{ marginHorizontal: 20, marginTop: 10, padding: 14, gap: 10 }}>
              <View className="flex-row items-center justify-between">
                <Text style={{ fontFamily: 'Fraunces', fontSize: 15, color: COLORS.navy }}>Leg {i + 1}</Text>
                {legs.length > 1 ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Remove leg" onPress={() => removeLeg(leg.id)} hitSlop={8}><Trash2 size={18} color={COLORS.ink3} /></Pressable>
                ) : null}
              </View>
              <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                {JOURNEY_MODES.map((m) => {
                  const active = leg.mode === m;
                  const Icon = MODE_ICON[m];
                  return (
                    <Pressable key={m} onPress={() => patchLeg(leg.id, { mode: m })} className="flex-row items-center rounded-full" style={{ paddingHorizontal: 11, paddingVertical: 7, gap: 5, backgroundColor: active ? COLORS.navySolid : COLORS.warmwhite }}>
                      <Icon size={13} color={active ? '#fff' : COLORS.coral} />
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{JOURNEY_MODE_META[m].label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {leg.mode === 'flight' ? (
                <View style={{ gap: 8 }}>
                  <AirportField placeholder={meta.from} value={leg.from} near={resolveEndpoint(leg.to)} onChangeText={(t) => patchLeg(leg.id, { from: t })} onPick={(m) => patchLeg(leg.id, { from: m.label })} />
                  <AirportField placeholder={meta.to} value={leg.to} near={resolveEndpoint(leg.from)} onChangeText={(t) => patchLeg(leg.id, { to: t })} onPick={(m) => patchLeg(leg.id, { to: m.label })} />
                </View>
              ) : (
                <View className="flex-row" style={{ gap: 8 }}>
                  <Field flex placeholder={meta.from} value={leg.from} onChange={(t) => patchLeg(leg.id, { from: t })} />
                  <Field flex placeholder={meta.to} value={leg.to} onChange={(t) => patchLeg(leg.id, { to: t })} />
                </View>
              )}
              <DateField value={leg.date} label="Leg date" onChange={(iso) => patchLeg(leg.id, { date: iso, flightChecked: undefined })} />
              <Field placeholder={meta.operator} value={leg.operator} onChange={(t) => patchLeg(leg.id, { operator: t })} />
              <View className="flex-row" style={{ gap: 8 }}>
                <Field flex placeholder={meta.reference} value={leg.reference} onChange={(t) => patchLeg(leg.id, { reference: t, flightChecked: undefined })} />
                <Field flex placeholder={meta.seat} value={leg.seat} onChange={(t) => patchLeg(leg.id, { seat: t })} />
              </View>
              <View className="flex-row" style={{ gap: 8 }}>
                <Field flex placeholder="Depart (HH:MM)" value={leg.departTime} onChange={(t) => patchLeg(leg.id, { departTime: t })} />
                <Field flex placeholder="Arrive (HH:MM)" value={leg.arriveTime} onChange={(t) => patchLeg(leg.id, { arriveTime: t })} />
              </View>
              {leg.mode === 'flight' ? (
                <View className="flex-row" style={{ gap: 8 }}>
                  <Field flex placeholder="Depart terminal" value={leg.fromTerminal} onChange={(t) => patchLeg(leg.id, { fromTerminal: t })} />
                  <Field flex placeholder="Arrive terminal" value={leg.toTerminal} onChange={(t) => patchLeg(leg.id, { toTerminal: t })} />
                </View>
              ) : null}
              {leg.mode === 'flight' && flightLookupConfigured() ? (
                <Pressable onPress={() => lookupLeg(leg)} disabled={lookingUp === leg.id} className="flex-row items-center justify-center rounded-2xl" style={{ paddingVertical: 11, gap: 7, backgroundColor: 'rgba(30,107,255,0.10)' }}>
                  {lookingUp === leg.id ? <ActivityIndicator size="small" color="#1E6BFF" /> : <Search size={15} color="#1E6BFF" />}
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#1E6BFF' }}>{lookingUp === leg.id ? 'Looking up…' : 'Look up flight'}</Text>
                </Pressable>
              ) : null}
              {leg.mode === 'flight' ? (
                <FlightSummaryCard from={leg.from} to={leg.to} airline={leg.operator} flightNumber={leg.reference} aircraft={leg.vehicle} departTime={leg.departTime} arriveTime={leg.arriveTime} departActual={leg.departActual} arriveActual={leg.arriveActual} fromTerminal={leg.fromTerminal} toTerminal={leg.toTerminal} distanceKm={leg.distanceKm} durationMin={leg.durationMin} departDelayMin={leg.departDelayMin} arriveDelayMin={leg.arriveDelayMin} unit={unit} />
              ) : null}
              <Field placeholder="Aircraft / vehicle" value={leg.vehicle} onChange={(t) => patchLeg(leg.id, { vehicle: t })} />
              <Field placeholder="Notes" value={leg.note} onChange={(t) => patchLeg(leg.id, { note: t })} />
            </View>
          );
        })}

        {/* note */}
        <Text style={LBL}>NOTE</Text>
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput value={note} onChangeText={setNote} placeholder="A note for this journey" placeholderTextColor={COLORS.ink3} multiline style={{ fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink, minHeight: 44 }} />
        </View>

        </>
        ) : null}
      </ScrollView>

      {/* Save stays pinned above the keyboard-safe bottom edge while editing, so
          it can never scroll out of reach on a long list of legs. */}
      {editing ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingLeft: 20, paddingRight: 86, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 12) + 96, backgroundColor: COLORS.warmwhite, borderTopWidth: 1, borderTopColor: COLORS.tileMuted }}>
          <Pressable onPress={save} disabled={!title.trim() || saving} accessibilityRole="button" accessibilityLabel="Save changes" accessibilityState={{ disabled: !title.trim() || saving, busy: saving }} style={{ borderRadius: 18, overflow: 'hidden', opacity: !title.trim() || saving ? 0.6 : 1 }}>
            <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 8 }}>
              {saving ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Check size={18} color="#fff" />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save changes</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      ) : null}

      <AddPhotoSheet visible={photoOpen} onClose={() => setPhotoOpen(false)} initialCountryCode={codes[0]} initialExpeditionId={expedition.id} />
      <KeyboardDoneBar />
    </View>
  );
}

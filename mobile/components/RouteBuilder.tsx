import { useState, Fragment } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Plus, Check, X, ChevronRight, Plane, TrainFront, Ship, Car, Anchor } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { COLORS } from '../src/lib/theme';
import { AirportField } from './AirportField';
import { isEndpointResolved } from '../src/lib/airportSearch';
import { JOURNEY_MODES, JOURNEY_MODE_META, type JourneyMode } from '../src/types';

const MODE_ICON: Record<JourneyMode, ComponentType<{ size?: number; color?: string }>> = {
  flight: Plane,
  rail: TrainFront,
  cruise: Ship,
  road: Car,
  ferry: Anchor,
};

/** Chain a list of stops (A, B, C) into consecutive legs (A→B, B→C) of one
 *  mode, and hand them to the parent. Mirrors the web route builder. */
export function RouteBuilder({ onAdd }: { onAdd: (legs: { mode: JourneyMode; from: string; to: string }[]) => void }) {
  const [mode, setMode] = useState<JourneyMode>('flight');
  const [stops, setStops] = useState<string[]>([]);
  const [entry, setEntry] = useState('');
  const legCount = Math.max(0, stops.length - 1);

  function addStop() {
    const v = entry.trim();
    if (!v) return;
    setStops((p) => [...p, v]);
    setEntry('');
  }
  function create() {
    if (stops.length < 2) return;
    const legs = [];
    for (let i = 0; i < stops.length - 1; i++) legs.push({ mode, from: stops[i], to: stops[i + 1] });
    onAdd(legs);
    setStops([]);
    setEntry('');
  }

  return (
    <View className="bg-white dark:bg-card rounded-3xl" style={{ marginHorizontal: 20, marginTop: 10, padding: 14, gap: 10 }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 15, color: COLORS.navy }}>Build a route</Text>

      {/* mode */}
      <View className="flex-row flex-wrap" style={{ gap: 6 }}>
        {JOURNEY_MODES.map((m) => {
          const active = mode === m;
          const Icon = MODE_ICON[m];
          return (
            <Pressable key={m} onPress={() => setMode(m)} className="flex-row items-center rounded-full" style={{ paddingHorizontal: 11, paddingVertical: 7, gap: 5, backgroundColor: active ? COLORS.navySolid : COLORS.warmwhite }}>
              <Icon size={13} color={active ? '#fff' : COLORS.coral} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{JOURNEY_MODE_META[m].label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* stops */}
      {stops.length > 0 ? (
        <View className="flex-row flex-wrap items-center" style={{ gap: 6 }}>
          {stops.map((s, i) => {
            const unresolved = mode === 'flight' && !isEndpointResolved(s);
            return (
              <Fragment key={`${s}-${i}`}>
                <View className="flex-row items-center rounded-full" style={{ backgroundColor: unresolved ? '#FDF3E0' : COLORS.warmwhite, paddingLeft: 11, paddingRight: 7, paddingVertical: 6, gap: 5, borderWidth: unresolved ? 1 : 0, borderColor: '#F4B740' }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: unresolved ? '#B8791F' : COLORS.navy }}>{s}</Text>
                  <Pressable onPress={() => setStops((p) => p.filter((_, idx) => idx !== i))} hitSlop={6}>
                    <X size={13} color={COLORS.ink3} />
                  </Pressable>
                </View>
                {i < stops.length - 1 ? <ChevronRight size={14} color={COLORS.ink3} /> : null}
              </Fragment>
            );
          })}
        </View>
      ) : null}

      <AirportField
        value={entry}
        onChangeText={setEntry}
        suggest={mode === 'flight'}
        showStatus={false}
        placeholder={mode === 'flight' ? (stops.length === 0 ? 'Start — e.g. London (LHR)' : 'Next stop — code or city') : stops.length === 0 ? 'Start — e.g. London' : 'Next stop…'}
        onSubmit={addStop}
        onPick={(m) => { setStops((p) => [...p, m.label]); setEntry(''); }}
        trailing={
          <Pressable onPress={addStop} disabled={!entry.trim()} hitSlop={8} className="items-center justify-center" style={{ opacity: entry.trim() ? 1 : 0.4, paddingLeft: 4 }}>
            <Plus size={18} color={COLORS.navy} />
          </Pressable>
        }
      />
      {mode === 'flight' ? (
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, marginTop: -4 }}>
          Tip: pick a suggested airport so the leg maps and counts in your stats.
        </Text>
      ) : null}

      <Pressable onPress={create} disabled={legCount < 1} className="flex-row items-center justify-center rounded-2xl" style={{ paddingVertical: 11, gap: 6, backgroundColor: COLORS.coral, opacity: legCount < 1 ? 0.4 : 1 }}>
        <Check size={15} color="#fff" />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Add {legCount} {legCount === 1 ? 'leg' : 'legs'}</Text>
      </Pressable>
    </View>
  );
}

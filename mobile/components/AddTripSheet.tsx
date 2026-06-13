import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Check, Search, Plane, TrainFront, Ship, Car, Anchor } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES } from '../src/data/countries';
import { JOURNEY_MODES, JOURNEY_MODE_META, type JourneyMode } from '../src/types';
import { useData } from '../src/store/data';

const MODE_ICON: Record<JourneyMode, ComponentType<{ size?: number; color?: string }>> = {
  flight: Plane,
  rail: TrainFront,
  cruise: Ship,
  road: Car,
  ferry: Anchor,
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 16 }, (_, i) => currentYear - i);

export function AddTripSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addExpedition } = useData();
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [codes, setCodes] = useState<Set<string>>(new Set());
  const [year, setYear] = useState<number>(currentYear);
  const [mode, setMode] = useState<JourneyMode>('flight');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 30);
  }, [query]);

  function reset() {
    setTitle('');
    setQuery('');
    setCodes(new Set());
    setYear(currentYear);
    setMode('flight');
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
  function save() {
    if (!title.trim() || codes.size === 0) return;
    addExpedition({
      title,
      countryCodes: [...codes],
      startDate: `${year}-01-01`,
      mode,
    });
    close();
  }

  const ready = title.trim().length > 0 && codes.size > 0;

  return (
    <SheetShell visible={visible} title="Add a journey" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* title */}
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Name this trip, e.g. Japan in spring"
            placeholderTextColor={COLORS.ink3}
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        {/* countries (multi) */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
          COUNTRIES VISITED
        </Text>
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
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search countries"
            placeholderTextColor={COLORS.ink3}
            style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>
        <ScrollView style={{ maxHeight: 180, marginTop: 6 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          {results.map((c) => {
            const active = codes.has(c.code);
            return (
              <Pressable
                key={c.code}
                onPress={() => toggle(c.code)}
                className="flex-row items-center"
                style={{ paddingHorizontal: 20, paddingVertical: 10, gap: 12, backgroundColor: active ? 'rgba(255,107,154,0.10)' : 'transparent' }}
              >
                <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                {active ? <Check size={18} color={COLORS.coral} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* year */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
          YEAR
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8, gap: 8 }}>
          {YEARS.map((y) => {
            const active = year === y;
            return (
              <Pressable key={y} onPress={() => setYear(y)} className="rounded-full" style={{ paddingHorizontal: 16, paddingVertical: 9, backgroundColor: active ? COLORS.coral : '#fff' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: active ? '#fff' : COLORS.ink2 }}>{y}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* mode */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 12 }}>
          HOW YOU TRAVELLED
        </Text>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {JOURNEY_MODES.map((m) => {
            const active = mode === m;
            const Icon = MODE_ICON[m];
            return (
              <Pressable key={m} onPress={() => setMode(m)} className="flex-row items-center rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 9, gap: 6, backgroundColor: active ? COLORS.navy : '#fff' }}>
                <Icon size={14} color={active ? '#fff' : COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{JOURNEY_MODE_META[m].label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={save}
          disabled={!ready}
          className="rounded-2xl items-center justify-center flex-row"
          style={{ marginHorizontal: 20, marginTop: 20, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: ready ? 1 : 0.4, gap: 8 }}
        >
          <Check size={18} color="#fff" />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save journey</Text>
        </Pressable>
      </ScrollView>
    </SheetShell>
  );
}

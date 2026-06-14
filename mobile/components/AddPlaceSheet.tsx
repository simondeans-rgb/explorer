import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Check, Search } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES, countryName } from '../src/data/countries';
import { RELATIONSHIPS, RELATIONSHIP_META, type Relationship } from '../src/types';
import { useData } from '../src/store/data';

const REL_OPTIONS = RELATIONSHIPS.filter((r) => r !== 'aspiring');
const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => thisYear - i);

type Kind = 'country' | 'city';

export function AddPlaceSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addPlace } = useData();
  const [kind, setKind] = useState<Kind>('country');
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('');
  const [rels, setRels] = useState<Set<Relationship>>(new Set(['visited']));
  const [year, setYear] = useState<number | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 40);
  }, [query]);

  function reset() {
    setKind('country');
    setQuery('');
    setCode('');
    setCity('');
    setRels(new Set(['visited']));
    setYear(null);
  }
  function close() {
    reset();
    onClose();
  }
  function save() {
    if (!ready) return;
    addPlace({
      kind,
      countryCode: code,
      name: kind === 'city' ? city.trim() : undefined,
      relationships: [...rels],
      firstYear: year ?? undefined,
    });
    close();
  }
  function toggleRel(r: Relationship) {
    setRels((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  }

  const ready = Boolean(code && rels.size > 0 && (kind === 'country' || city.trim()));

  return (
    <SheetShell visible={visible} title="Add a place" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* Country / City */}
        <View className="flex-row bg-white rounded-2xl" style={{ marginHorizontal: 20, marginTop: 4, padding: 5, gap: 5 }}>
          {(['country', 'city'] as Kind[]).map((k) => {
            const active = kind === k;
            return (
              <Pressable key={k} onPress={() => setKind(k)} className="items-center justify-center rounded-xl" style={{ flex: 1, paddingVertical: 9, backgroundColor: active ? COLORS.navy : 'transparent' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontWeight: '700', fontSize: 13, color: active ? '#fff' : COLORS.ink3 }}>{k === 'country' ? 'Country' : 'City'}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* City name */}
        {kind === 'city' ? (
          <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 10 }}>
            <TextInput
              value={city}
              onChangeText={setCity}
              placeholder="City name, e.g. Kyoto"
              placeholderTextColor={COLORS.ink3}
              style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
            />
          </View>
        ) : null}

        {/* Country search */}
        <Text style={LBL}>{kind === 'city' ? 'WHICH COUNTRY?' : 'COUNTRY'}</Text>
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
        {code && !query ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, paddingHorizontal: 20, marginTop: 8 }}>
            {flagEmoji(code)} {countryName(code)}
          </Text>
        ) : (
          <ScrollView style={{ maxHeight: 200, marginTop: 6 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {results.map((c) => {
              const active = code === c.code;
              return (
                <Pressable key={c.code} onPress={() => { setCode(c.code); setQuery(''); }} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 11, gap: 12, backgroundColor: active ? 'rgba(255,107,154,0.10)' : 'transparent' }}>
                  <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                  {active ? <Check size={18} color={COLORS.coral} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* relationships */}
        <Text style={LBL}>YOUR CONNECTION</Text>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {REL_OPTIONS.map((r) => {
            const active = rels.has(r);
            return (
              <Pressable key={r} onPress={() => toggleRel(r)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navy : '#fff' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{RELATIONSHIP_META[r].label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* year */}
        <Text style={LBL}>FIRST VISITED (OPTIONAL)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8, gap: 8 }}>
          {YEARS.map((y) => {
            const active = year === y;
            return (
              <Pressable key={y} onPress={() => setYear(active ? null : y)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.coral : '#fff' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: active ? '#fff' : COLORS.ink2 }}>{y}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable onPress={save} disabled={!ready} className="rounded-2xl items-center justify-center flex-row" style={{ marginHorizontal: 20, marginTop: 16, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: ready ? 1 : 0.4, gap: 8 }}>
          <Check size={18} color="#fff" />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Add to your world</Text>
        </Pressable>
      </ScrollView>
    </SheetShell>
  );
}

const LBL = {
  fontFamily: 'PlusJakarta',
  fontSize: 11,
  fontWeight: '700' as const,
  letterSpacing: 1,
  color: COLORS.ink3,
  paddingHorizontal: 20,
  marginTop: 16,
};

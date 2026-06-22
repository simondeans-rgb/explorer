import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Check, Search, CalendarDays, X } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES } from '../src/data/countries';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const thisYear = new Date().getFullYear();
const YEARS = [thisYear, thisYear + 1, thisYear + 2];

export function AddTripPlanSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addTrip } = useData();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [year, setYear] = useState(thisYear);
  const [month, setMonth] = useState(new Date().getMonth());
  const [note, setNote] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 24);
  }, [query]);

  function reset() {
    setTitle('');
    setQuery('');
    setCode('');
    setYear(thisYear);
    setMonth(new Date().getMonth());
    setNote('');
  }
  function close() {
    reset();
    onClose();
  }
  function save() {
    if (!code || !title.trim()) return;
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    addTrip({ title, countryCode: code, startDate, note });
    toast.success('Trip planned');
    close();
  }

  const ready = code && title.trim().length > 0;

  return (
    <SheetShell visible={visible} title="Plan a trip" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* title */}
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Trip name, e.g. Japan in spring"
            placeholderTextColor={COLORS.ink3}
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        {/* destination */}
        <Text style={LBL}>WHERE TO?</Text>
        <View className="flex-row items-center bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 8 }}>
          <Search size={18} color={COLORS.ink3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search countries"
            placeholderTextColor={COLORS.ink3}
            style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10}>
              <X size={17} color={COLORS.ink3} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView style={{ maxHeight: 170, marginTop: 6 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          {results.map((c) => {
            const active = code === c.code;
            return (
              <Pressable key={c.code} onPress={() => setCode(active ? '' : c.code)} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 10, gap: 12, backgroundColor: active ? 'rgba(255,107,154,0.10)' : 'transparent' }}>
                <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                {active ? <Check size={18} color={COLORS.coral} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* when */}
        <Text style={LBL}>WHEN</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 6, gap: 8 }}>
          {YEARS.map((y) => {
            const active = year === y;
            return (
              <Pressable key={y} onPress={() => setYear(y)} className="rounded-full" style={{ paddingHorizontal: 16, paddingVertical: 9, backgroundColor: active ? COLORS.coral : '#fff' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: active ? '#fff' : COLORS.ink2 }}>{y}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 4, gap: 6 }}>
          {MONTHS.map((m, i) => {
            const active = month === i;
            return (
              <Pressable key={m} onPress={() => setMonth(i)} className="rounded-full" style={{ paddingHorizontal: 12, paddingVertical: 7, backgroundColor: active ? COLORS.navy : '#fff' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{m}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* note */}
        <Text style={LBL}>A NOTE (OPTIONAL)</Text>
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What's the plan?"
            placeholderTextColor={COLORS.ink3}
            multiline
            style={{ fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink, minHeight: 44 }}
          />
        </View>

        <Pressable onPress={save} disabled={!ready} className="rounded-2xl items-center justify-center flex-row" style={{ marginHorizontal: 20, marginTop: 18, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: ready ? 1 : 0.4, gap: 8 }}>
          <CalendarDays size={18} color="#fff" />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Plan this trip</Text>
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

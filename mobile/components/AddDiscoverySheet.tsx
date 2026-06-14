import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import {
  Check,
  Search,
  UtensilsCrossed,
  BedDouble,
  Landmark,
  Ticket,
  Mountain,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES } from '../src/data/countries';
import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_CATEGORY_META,
  RECOMMENDATION_VERDICTS,
  VERDICT_META,
  type DiscoveryCategory,
  type RecommendationVerdict,
} from '../src/types';
import { useData } from '../src/store/data';

const CATEGORY_ICON: Record<DiscoveryCategory, ComponentType<{ size?: number; color?: string }>> = {
  food: UtensilsCrossed,
  accommodation: BedDouble,
  culture: Landmark,
  experience: Ticket,
  nature: Mountain,
};

export function AddDiscoverySheet({
  visible,
  onClose,
  initialCountryCode,
}: {
  visible: boolean;
  onClose: () => void;
  initialCountryCode?: string;
}) {
  const { addDiscovery } = useData();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DiscoveryCategory>('food');
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [verdict, setVerdict] = useState<RecommendationVerdict>('recommend');

  useEffect(() => {
    if (visible && initialCountryCode) setCode(initialCountryCode);
  }, [visible, initialCountryCode]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 30);
  }, [query]);

  function reset() {
    setName('');
    setCategory('food');
    setCity('');
    setQuery('');
    setCode('');
    setVerdict('recommend');
  }
  function close() {
    reset();
    onClose();
  }
  function save() {
    if (!name.trim()) return;
    addDiscovery({
      name,
      category,
      countryCode: code || undefined,
      city,
      verdict,
    });
    close();
  }

  return (
    <SheetShell visible={visible} title="Add a discovery" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* name */}
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 }}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="What did you find? e.g. Sukiyabashi Jiro"
            placeholderTextColor={COLORS.ink3}
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        {/* category */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
          CATEGORY
        </Text>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {DISCOVERY_CATEGORIES.map((c) => {
            const active = category === c;
            const Icon = CATEGORY_ICON[c];
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                className="flex-row items-center rounded-full"
                style={{ paddingHorizontal: 14, paddingVertical: 9, gap: 6, backgroundColor: active ? COLORS.navy : '#fff' }}
              >
                <Icon size={14} color={active ? '#fff' : COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>
                  {DISCOVERY_CATEGORY_META[c].label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* city */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
          CITY (OPTIONAL)
        </Text>
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Tokyo"
            placeholderTextColor={COLORS.ink3}
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        {/* country */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
          COUNTRY (OPTIONAL)
        </Text>
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
            const active = code === c.code;
            return (
              <Pressable
                key={c.code}
                onPress={() => setCode(active ? '' : c.code)}
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

        {/* verdict */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
          YOUR VERDICT
        </Text>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {RECOMMENDATION_VERDICTS.map((v) => {
            const active = verdict === v;
            return (
              <Pressable
                key={v}
                onPress={() => setVerdict(v)}
                className="rounded-full"
                style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.coral : '#fff' }}
              >
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>
                  {VERDICT_META[v].label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={save}
          disabled={!name.trim()}
          className="rounded-2xl items-center justify-center flex-row"
          style={{ marginHorizontal: 20, marginTop: 20, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: name.trim() ? 1 : 0.4, gap: 8 }}
        >
          <Check size={18} color="#fff" />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save discovery</Text>
        </Pressable>
      </ScrollView>
    </SheetShell>
  );
}

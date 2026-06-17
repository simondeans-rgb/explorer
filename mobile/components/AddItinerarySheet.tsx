import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Check } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { DISCOVERY_CATEGORIES, DISCOVERY_CATEGORY_META, DISCOVERY_SUBCATEGORIES, type DiscoveryCategory } from '../src/types';
import { useData } from '../src/store/data';

export function AddItinerarySheet({ tripId, visible, onClose }: { tripId: string; visible: boolean; onClose: () => void }) {
  const { addItineraryItem } = useData();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<DiscoveryCategory | undefined>(undefined);
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);

  function reset() {
    setName('');
    setCity('');
    setCategory(undefined);
    setSubcategory(undefined);
  }
  function close() {
    reset();
    onClose();
  }
  function save() {
    if (!name.trim()) return;
    addItineraryItem(tripId, { name: name.trim(), city: city.trim() || undefined, category, subcategory });
    close();
  }

  return (
    <SheetShell visible={visible} title="Add to itinerary" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 }}>
          <TextInput value={name} onChangeText={setName} placeholder="What do you want to do/see?" placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>

        <Text style={LBL}>CITY (OPTIONAL)</Text>
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput value={city} onChangeText={setCity} placeholder="e.g. Tokyo" placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>

        <Text style={LBL}>CATEGORY (OPTIONAL)</Text>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {DISCOVERY_CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <Pressable key={c} onPress={() => { setCategory(active ? undefined : c); setSubcategory(undefined); }} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navy : '#fff' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{DISCOVERY_CATEGORY_META[c].label}</Text>
              </Pressable>
            );
          })}
        </View>

        {category ? (
          <>
            <Text style={LBL}>TYPE (OPTIONAL)</Text>
            <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
              {DISCOVERY_SUBCATEGORIES[category].map((s) => {
                const active = subcategory === s.id;
                return (
                  <Pressable key={s.id} onPress={() => setSubcategory(active ? undefined : s.id)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navy : '#fff' }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{s.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        <Pressable onPress={save} disabled={!name.trim()} className="rounded-2xl items-center justify-center flex-row" style={{ marginHorizontal: 20, marginTop: 18, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: name.trim() ? 1 : 0.4, gap: 8 }}>
          <Check size={18} color="#fff" />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Add to itinerary</Text>
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

import { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { Check, Search, X } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES } from '../src/data/countries';
import { RELATIONSHIPS, RELATIONSHIP_META, type Relationship } from '../src/types';
import { useData } from '../src/store/data';

const REL_OPTIONS = RELATIONSHIPS.filter((r) => r !== 'aspiring');

export function AddPlaceSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addPlace } = useData();
  const [query, setQuery] = useState('');
  const [code, setCode] = useState<string>('');
  const [rels, setRels] = useState<Set<Relationship>>(new Set(['visited']));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 40);
  }, [query]);

  function reset() {
    setQuery('');
    setCode('');
    setRels(new Set(['visited']));
  }
  function close() {
    reset();
    onClose();
  }
  function save() {
    if (!code || rels.size === 0) return;
    addPlace({ kind: 'country', countryCode: code, relationships: [...rels] });
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ backgroundColor: COLORS.warmwhite, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%', paddingBottom: 28 }}>
          <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy }}>Add a country</Text>
            <Pressable onPress={close} hitSlop={8} className="h-9 w-9 rounded-full items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <X size={18} color={COLORS.ink2} />
            </Pressable>
          </View>

          {/* search */}
          <View className="flex-row items-center bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8 }}>
            <Search size={18} color={COLORS.ink3} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search countries"
              placeholderTextColor={COLORS.ink3}
              style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
            />
          </View>

          <ScrollView style={{ maxHeight: 260, marginTop: 8 }} keyboardShouldPersistTaps="handled">
            {results.map((c) => {
              const active = code === c.code;
              return (
                <Pressable key={c.code} onPress={() => setCode(c.code)} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 11, gap: 12, backgroundColor: active ? 'rgba(255,107,154,0.10)' : 'transparent' }}>
                  <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                  {active ? <Check size={18} color={COLORS.coral} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* relationships */}
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 12 }}>
            YOUR CONNECTION
          </Text>
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

          <Pressable onPress={save} disabled={!code} className="rounded-2xl items-center justify-center flex-row" style={{ marginHorizontal: 20, marginTop: 18, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: code ? 1 : 0.4, gap: 8 }}>
            <Check size={18} color="#fff" />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Add to your world</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

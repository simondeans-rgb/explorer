import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Check, ChevronDown, Route, Search } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { expeditionLabel } from '../src/lib/tripMatch';
import type { Expedition } from '../src/types';

/** A friendly trip selector: a single collapsed row showing the current choice,
 *  expanding into a newest-first list (searchable once it's long) with a
 *  "No trip" option. Replaces the old wall-of-chips, which stopped scaling the
 *  moment a flight import created dozens of trips. */
export function TripPickerField({
  expeditions,
  selectedId,
  onSelect,
  collapsedHint,
}: {
  expeditions: Expedition[];
  /** '' or undefined = no trip selected. */
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Optional context line under the selection (e.g. "Matched from the photo"). */
  collapsedHint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = selectedId ? expeditions.find((e) => e.id === selectedId) : undefined;
  const searchable = expeditions.length > 8;

  const options = useMemo(() => {
    const sorted = [...expeditions].sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));
    const q = query.trim().toLowerCase();
    return q ? sorted.filter((e) => expeditionLabel(e).toLowerCase().includes(q)) : sorted;
  }, [expeditions, query]);

  function choose(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery('');
  }

  return (
    <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, marginTop: 8, overflow: 'hidden' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selected ? `Trip: ${expeditionLabel(selected)} — tap to change` : 'Choose a trip'}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center"
        style={{ paddingHorizontal: 14, paddingVertical: 13, gap: 10 }}
      >
        <View className="rounded-xl items-center justify-center" style={{ height: 34, width: 34, backgroundColor: 'rgba(255,107,154,0.10)' }}>
          <Route size={17} color={COLORS.coral} />
        </View>
        <View style={{ flex: 1 }}>
          {selected ? (
            <>
              <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>{expeditionLabel(selected)}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{collapsedHint ?? 'Tap to change'}</Text>
            </>
          ) : (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink3 }}>Not stored with a trip — tap to choose</Text>
          )}
        </View>
        <ChevronDown size={18} color={COLORS.ink3} style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }} />
      </Pressable>

      {open ? (
        <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(20,33,61,0.06)' }}>
          {searchable ? (
            <View className="flex-row items-center" style={{ paddingHorizontal: 14, paddingVertical: 9, gap: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(20,33,61,0.05)' }}>
              <Search size={15} color={COLORS.ink3} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search your trips"
                placeholderTextColor={COLORS.ink3}
                style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink, paddingVertical: 2 }}
              />
            </View>
          ) : null}
          <ScrollView style={{ maxHeight: 250 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            <Pressable
              accessibilityRole="button"
              onPress={() => choose('')}
              className="flex-row items-center"
              style={{ paddingHorizontal: 14, paddingVertical: 11, gap: 10 }}
            >
              <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink2 }}>No trip</Text>
              {!selectedId ? <Check size={16} color={COLORS.coral} /> : null}
            </Pressable>
            {options.map((e) => (
              <Pressable
                key={e.id}
                accessibilityRole="button"
                onPress={() => choose(e.id)}
                className="flex-row items-center"
                style={{ paddingHorizontal: 14, paddingVertical: 11, gap: 10, backgroundColor: selectedId === e.id ? 'rgba(255,107,154,0.08)' : 'transparent' }}
              >
                <Text style={{ fontSize: 18 }}>{e.countryCodes[0] ? flagEmoji(e.countryCodes[0]) : '🌍'}</Text>
                <Text numberOfLines={1} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.navy }}>{expeditionLabel(e)}</Text>
                {selectedId === e.id ? <Check size={16} color={COLORS.coral} /> : null}
              </Pressable>
            ))}
            {options.length === 0 ? (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, paddingHorizontal: 14, paddingVertical: 12 }}>No trips match “{query}”.</Text>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

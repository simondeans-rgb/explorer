import { useMemo, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Search, X, Check } from 'lucide-react-native';
import { COLORS, RADIUS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES, countryName } from '../src/data/countries';

/** Shared country picker used by the memory / discovery / photo editors (R24).
 *  A tappable field that opens a full modal search+list — so the list no longer
 *  lives in a nested ScrollView inside the page (the source of the scroll jank)
 *  and all three editors share one consistent interaction. */
export function CountryPickerField({
  code,
  onChange,
  label,
  placeholder = 'Add a country',
}: {
  code: string;
  onChange: (code: string) => void;
  label?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES).slice(0, 60);
  }, [query]);

  function pick(c: string) {
    onChange(c);
    setQuery('');
    setOpen(false);
  }

  return (
    <>
      {label ? (
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 18 }}>{label}</Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={code ? `Country: ${countryName(code)}. Change` : placeholder}
        className="flex-row items-center bg-white dark:bg-card rounded-2xl"
        style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 13, gap: 10, marginTop: 8 }}
      >
        <Text style={{ fontSize: 20 }}>{code ? flagEmoji(code) : '📍'}</Text>
        <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: code ? COLORS.navy : COLORS.ink3 }}>
          {code ? countryName(code) : placeholder}
        </Text>
        {code ? (
          <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear country">
            <X size={16} color={COLORS.ink3} />
          </Pressable>
        ) : null}
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Dismiss" style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Pressable onPress={(e) => e.stopPropagation()} accessible={false} style={{ maxHeight: '78%', backgroundColor: COLORS.warmwhite, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, paddingTop: 14, paddingBottom: 20 }}>
            <View style={{ alignSelf: 'center', height: 5, width: 44, borderRadius: 3, backgroundColor: 'rgba(20,33,61,0.15)', marginBottom: 10 }} />
            <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, paddingHorizontal: 20, marginBottom: 10 }}>Choose a country</Text>
            <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8 }}>
              <Search size={18} color={COLORS.ink3} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search countries" placeholderTextColor={COLORS.ink3} autoFocus style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" style={{ marginTop: 6 }} contentContainerStyle={{ paddingBottom: 16 }}>
              {results.map((c) => (
                <Pressable
                  key={c.code}
                  onPress={() => pick(c.code)}
                  accessibilityRole="button"
                  accessibilityLabel={c.name}
                  accessibilityState={{ selected: code === c.code }}
                  className="flex-row items-center"
                  style={{ paddingHorizontal: 20, paddingVertical: 11, gap: 12 }}
                >
                  <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                  {code === c.code ? <Check size={18} color={COLORS.coral} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

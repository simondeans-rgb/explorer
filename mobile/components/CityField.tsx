import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { COLORS, SHADOW } from '../src/lib/theme';
import { searchCities, type CitySuggestion } from '../src/lib/cityLookup';
import { countryName } from '../src/data/countries';
import { flagEmoji } from '../src/lib/flags';
import { hSelection } from '../src/lib/haptics';

/** A city name input with type-ahead over the bundled cities dataset, scoped to
 *  `countryCode` when the country is already chosen. Falls back gracefully to
 *  free text (the dataset only covers ≥50k-population cities), so anything the
 *  user types is still accepted. Kills the "NYC vs New York" fragmentation the
 *  plain text field caused. */
export function CityField({
  value,
  onChangeText,
  countryCode,
  onPick,
  placeholder = 'City name, e.g. Kyoto',
  autoFocus,
}: {
  value: string;
  onChangeText: (t: string) => void;
  countryCode?: string;
  /** Fired when a suggestion is chosen — carries its country so callers without
   *  a country selected can adopt it. */
  onPick?: (s: CitySuggestion) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  // Start dismissed so an edited/pre-filled value doesn't pop a list on mount;
  // typing re-opens it, picking closes it. Avoids the blur-before-tap race too.
  const [dismissed, setDismissed] = useState(true);
  const suggestions = useMemo(
    () => (dismissed ? [] : searchCities(value, countryCode)),
    [value, countryCode, dismissed],
  );
  const exact = suggestions.length === 1 && suggestions[0].name.toLowerCase() === value.trim().toLowerCase();

  return (
    <View>
      <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 8 }}>
        <MapPin size={16} color={COLORS.ink3} />
        <TextInput
          value={value}
          onChangeText={(t) => {
            setDismissed(false);
            onChangeText(t);
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.ink3}
          autoFocus={autoFocus}
          autoCorrect={false}
          style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
        />
      </View>
      {suggestions.length > 0 && !exact ? (
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginTop: 6, overflow: 'hidden', ...SHADOW.card }}>
          {suggestions.map((s, i) => (
            <Pressable
              key={`${s.name}-${s.countryCode}`}
              onPress={() => {
                hSelection();
                onChangeText(s.name);
                onPick?.(s);
                setDismissed(true);
              }}
              className="flex-row items-center"
              style={{ paddingHorizontal: 14, paddingVertical: 11, gap: 10, borderTopWidth: i === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: 'rgba(20,33,61,0.06)' }}
            >
              <Text style={{ fontSize: 16 }}>{flagEmoji(s.countryCode)}</Text>
              <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{s.name}</Text>
              {!countryCode ? (
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{countryName(s.countryCode)}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

import { useMemo, useRef, useState, type ReactNode } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Plane, CircleCheck, CircleAlert } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { searchAirports, isEndpointResolved, airportCountryName, type AirportMatch } from '../src/lib/airportSearch';

/** A flight endpoint input with airport type-ahead. As the Member types an
 *  airport code or city, matching airports surface below; picking one stores
 *  the canonical "City (IATA)" form that always resolves on the map + stats.
 *  Free text is still allowed (soft fallback) but flagged as unrecognised so
 *  it's clear it won't count until matched. */
export function AirportField({
  value,
  onChangeText,
  onPick,
  placeholder,
  suggest = true,
  showStatus = true,
  trailing,
  onSubmit,
  autoFocus,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onPick: (m: AirportMatch) => void;
  placeholder: string;
  /** Whether to show airport suggestions (off for non-flight modes). */
  suggest?: boolean;
  /** Whether to show the resolved/unrecognised status icon. */
  showStatus?: boolean;
  /** An element rendered at the right of the input row (e.g. an Add button). */
  trailing?: ReactNode;
  onSubmit?: () => void;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(
    () => (suggest && focused ? searchAirports(value) : []),
    [suggest, focused, value],
  );
  const resolved = isEndpointResolved(value);
  const showFlag = showStatus && !!value.trim();

  function pick(m: AirportMatch) {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    onPick(m);
    setFocused(false);
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        className="bg-white rounded-2xl flex-row items-center"
        style={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: showFlag && !resolved ? 1 : 0, borderColor: '#F4B740' }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.ink3}
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            // Delay so a tap on a suggestion below registers before we hide it.
            blurTimer.current = setTimeout(() => setFocused(false), 140);
          }}
          onSubmitEditing={onSubmit}
          returnKeyType={onSubmit ? 'done' : 'default'}
          style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink }}
        />
        {showFlag ? (
          resolved ? <CircleCheck size={16} color="#12A594" /> : <CircleAlert size={16} color="#E0962B" />
        ) : null}
        {trailing}
      </View>

      {showStatus && !!value.trim() && !resolved && suggestions.length === 0 ? (
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: '#B8791F', marginTop: 4, marginLeft: 4 }}>
          Not a recognised airport — won't count toward flight stats. Pick a suggestion to fix.
        </Text>
      ) : null}

      {suggestions.length > 0 ? (
        <View className="bg-white rounded-2xl" style={{ marginTop: 6, paddingVertical: 2, ...({ shadowColor: '#14213D', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 }) }}>
          {suggestions.map((m, i) => (
            <Pressable
              key={`${m.iata}-${i}`}
              onPress={() => pick(m)}
              className="flex-row items-center"
              style={{ paddingHorizontal: 12, paddingVertical: 10, gap: 10 }}
            >
              <Plane size={14} color={COLORS.coral} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy }}>
                  {m.city} <Text style={{ color: COLORS.ink3, fontWeight: '500' }}>({m.iata})</Text>
                </Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3 }}>
                  {flagEmoji(m.country)} {airportCountryName(m.country)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { X, Search as SearchIcon } from 'lucide-react-native';
import { DestinationImage } from '../components/DestinationImage';
import { DiscoveryCard } from '../components/DiscoveryCard';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { countryName, COUNTRIES } from '../src/data/countries';
import { JOURNEY_MODE_META } from '../src/types';
import { useWorldly } from '../src/hooks/useWorldly';

export default function SearchScreen() {
  const { aggregates, discoveries, expeditions } = useWorldly();
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();

  const discoveredCodes = useMemo(
    () => new Set(aggregates.filter((a) => a.discovered).map((a) => a.code)),
    [aggregates],
  );

  const countryHits = useMemo(() => {
    if (!query) return COUNTRIES.filter((c) => discoveredCodes.has(c.code)).slice(0, 12);
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(query)).slice(0, 12);
  }, [query, discoveredCodes]);

  const discoveryHits = useMemo(() => {
    if (!query) return [];
    return discoveries
      .filter((d) =>
        [d.name, d.city, d.countryCode ? countryName(d.countryCode) : '']
          .filter(Boolean)
          .some((s) => s!.toLowerCase().includes(query)),
      )
      .slice(0, 12);
  }, [query, discoveries]);

  const journeyHits = useMemo(() => {
    if (!query) return [];
    return expeditions
      .filter((e) =>
        [e.title, ...e.countryCodes.map((c) => countryName(c))]
          .some((s) => s.toLowerCase().includes(query)),
      )
      .slice(0, 10);
  }, [query, expeditions]);

  const nothing = query && countryHits.length === 0 && discoveryHits.length === 0 && journeyHits.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      {/* Search bar */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: COLORS.warmwhite }}>
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View className="flex-row items-center bg-white rounded-full" style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12, gap: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
            <SearchIcon size={18} color={COLORS.coral} />
            <TextInput
              value={q}
              onChangeText={setQ}
              autoFocus
              placeholder="Search places, food & journeys…"
              placeholderTextColor={COLORS.ink3}
              style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
            />
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8} className="rounded-full items-center justify-center" style={{ height: 44, width: 44, backgroundColor: '#fff' }}>
            <X size={20} color={COLORS.ink2} />
          </Pressable>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 40 }}>
        {nothing ? (
          <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, marginTop: 10 }}>No matches</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3, marginTop: 4, textAlign: 'center' }}>
              Try a country, a city, or the name of a place you saved.
            </Text>
          </View>
        ) : null}

        {/* Countries */}
        {countryHits.length > 0 ? (
          <View style={{ marginTop: 8 }}>
            <Text style={H}>{query ? 'COUNTRIES' : 'YOUR WORLD'}</Text>
            <View style={{ paddingHorizontal: 20, gap: 8 }}>
              {countryHits.map((c) => (
                <Pressable key={c.code} onPress={() => router.push(`/country/${c.code}`)} className="flex-row items-center bg-white rounded-2xl" style={{ padding: 10, gap: 12 }}>
                  <DestinationImage code={c.code} style={{ height: 48, width: 64, borderRadius: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>{c.name}</Text>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{c.continent}</Text>
                  </View>
                  {discoveredCodes.has(c.code) ? (
                    <Text style={{ fontSize: 18, marginRight: 4 }}>{flagEmoji(c.code)}</Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Discoveries */}
        {discoveryHits.length > 0 ? (
          <View style={{ marginTop: 18 }}>
            <Text style={H}>YOUR DISCOVERIES</Text>
            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              {discoveryHits.map((d) => (
                <DiscoveryCard key={d.id} discovery={d} onPress={() => d.countryCode && router.push(`/country/${d.countryCode}`)} />
              ))}
            </View>
          </View>
        ) : null}

        {/* Journeys */}
        {journeyHits.length > 0 ? (
          <View style={{ marginTop: 18 }}>
            <Text style={H}>YOUR JOURNEYS</Text>
            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              {journeyHits.map((e) => (
                <Pressable key={e.id} onPress={() => e.countryCodes[0] && router.push(`/country/${e.countryCodes[0]}`)} className="bg-white rounded-3xl" style={{ padding: 16 }}>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>{e.title}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 2 }}>
                    {e.countryCodes.map((c) => flagEmoji(c)).join(' ')}
                    {e.startDate ? ` · ${e.startDate.slice(0, 4)}` : ''}
                    {e.journeys[0] ? ` · ${JOURNEY_MODE_META[e.journeys[0].mode].label}` : ''}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const H = {
  fontFamily: 'PlusJakarta',
  fontSize: 12,
  fontWeight: '800' as const,
  letterSpacing: 1.2,
  color: COLORS.ink3,
  paddingHorizontal: 20,
  marginBottom: 10,
};

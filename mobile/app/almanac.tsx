import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Users, Maximize2, Sun, Snowflake } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { PageHero } from '../components/PageHero';
import { DestinationImage } from '../components/DestinationImage';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { countryName } from '../src/data/countries';
import { COUNTRY_FACTS, type CountryFacts } from '../src/data/countryFacts';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

type Entry = [string, CountryFacts];

export default function AlmanacScreen() {
  const month = new Date().getMonth();
  const entries = useMemo(() => Object.entries(COUNTRY_FACTS) as Entry[], []);

  const { mostPopulous, largest, warmest, coolest, warmRail, all } = useMemo(() => {
    const withTemp = entries.filter(([, f]) => f.temps && f.temps.length === 12);
    const byTempDesc = [...withTemp].sort((a, b) => b[1].temps![month] - a[1].temps![month]);
    return {
      mostPopulous: [...entries].sort((a, b) => b[1].population - a[1].population)[0],
      largest: [...entries].sort((a, b) => b[1].areaKm2 - a[1].areaKm2)[0],
      warmest: byTempDesc[0],
      coolest: byTempDesc[byTempDesc.length - 1],
      warmRail: byTempDesc.slice(0, 8),
      all: [...entries].sort((a, b) => countryName(a[0]).localeCompare(countryName(b[0]))),
    };
  }, [entries, month]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <PageHero eyebrow="The world, by the numbers" title="Almanac" subtitle="Superlatives, climate and facts from around the globe." gradient={['#7C6BFF', '#5B6CFF', '#24D1C3']} imageCode="WW" onBack={() => router.back()} />

        {/* Superlatives */}
        <View style={{ paddingHorizontal: 20, marginTop: 8, gap: 12 }}>
          <Superlative entry={mostPopulous} icon={Users} label="Most populous" value={`${fmtNum(mostPopulous[1].population)} people`} />
          <Superlative entry={largest} icon={Maximize2} label="Largest country" value={`${fmtNum(largest[1].areaKm2)} km²`} />
          {warmest ? <Superlative entry={warmest} icon={Sun} label={`Warmest in ${MONTHS[month]}`} value={`${warmest[1].temps![month]}°C average`} /> : null}
          {coolest ? <Superlative entry={coolest} icon={Snowflake} label={`Coolest in ${MONTHS[month]}`} value={`${coolest[1].temps![month]}°C average`} /> : null}
        </View>

        {/* Warmest right now rail */}
        {warmRail.length > 0 ? (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, paddingHorizontal: 20 }}>Warm right now</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 12 }}>
              {warmRail.map(([code, f]) => (
                <Pressable key={code} onPress={() => router.push(`/country/${code}`)} style={{ width: 130 }}>
                  <DestinationImage code={code} scrim style={{ height: 160, borderRadius: 22, padding: 12, justifyContent: 'flex-end' }}>
                    <Text style={{ position: 'absolute', top: 10, right: 12, fontFamily: 'Fraunces', fontSize: 22, color: '#fff' }}>{f.temps![month]}°</Text>
                    <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 16 }}>{countryName(code)}</Text>
                  </DestinationImage>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Every country */}
        <View style={{ marginTop: 12, paddingHorizontal: 20 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, marginBottom: 12 }}>Every country</Text>
          <View style={{ gap: 8 }}>
            {all.map(([code, f]) => (
              <Pressable key={code} onPress={() => router.push(`/country/${code}`)} className="flex-row items-center bg-white rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 12 }}>
                <Text style={{ fontSize: 24 }}>{flagEmoji(code)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 16, color: COLORS.navy }}>{countryName(code)}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{f.capital} · {fmtNum(f.population)} people</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Superlative({ entry, icon: Icon, label, value }: { entry: Entry; icon: ComponentType<{ size?: number; color?: string }>; label: string; value: string }) {
  const [code] = entry;
  return (
    <Pressable onPress={() => router.push(`/country/${code}`)}>
      <DestinationImage code={code} scrim style={{ height: 132, borderRadius: 24, padding: 16, justifyContent: 'flex-end' }}>
        <View className="flex-row items-center" style={{ gap: 6, position: 'absolute', top: 14, left: 16 }}>
          <Icon size={15} color="#fff" />
          <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1, opacity: 0.95 }}>{label.toUpperCase()}</Text>
        </View>
        <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 26 }}>{flagEmoji(code)} {countryName(code)}</Text>
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, opacity: 0.95, marginTop: 1 }}>{value}</Text>
      </DestinationImage>
    </Pressable>
  );
}

import { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Plane, Home, Briefcase, GraduationCap, Anchor, Sparkles, Building2, Map as MapIcon } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { DestinationImage } from './DestinationImage';
import { ScoreRing } from './ScoreRing';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { countryName } from '../src/data/countries';
import { RELATIONSHIP_META, type Relationship, type Place } from '../src/types';
import type { CountryAggregate } from '../src/lib/stats';

type RelStyle = { Icon: ComponentType<{ size?: number; color?: string }>; color: string; tint: string };
const REL_STYLE: Partial<Record<Relationship, RelStyle>> = {
  lived: { Icon: Home, color: '#6C5CE7', tint: 'rgba(155,124,255,0.16)' },
  worked: { Icon: Briefcase, color: '#12A594', tint: 'rgba(36,209,195,0.16)' },
  studied: { Icon: GraduationCap, color: '#C2871A', tint: 'rgba(255,184,77,0.20)' },
  based: { Icon: Anchor, color: COLORS.ink2, tint: 'rgba(20,33,61,0.06)' },
  born: { Icon: Sparkles, color: COLORS.navy, tint: 'rgba(20,33,61,0.06)' },
  visited: { Icon: Plane, color: '#E0497F', tint: 'rgba(255,107,154,0.14)' },
};
// Deeper ties first; "visited" is the baseline so it reads last.
const REL_ORDER: Relationship[] = ['lived', 'worked', 'studied', 'based', 'born', 'visited'];

const yr = (iso?: string) => (iso ? iso.slice(0, 4) : undefined);

/** Years lived, gathered from the country place + any lived city. */
function livedYears(agg: CountryAggregate): string | undefined {
  const sources: Place[] = [agg.countryPlace, ...agg.cities].filter((p): p is Place => !!p);
  const periods: { from: string; to?: string }[] = [];
  for (const p of sources) {
    if (!p.relationships.includes('lived')) continue;
    if (p.residencePeriods?.length) periods.push(...p.residencePeriods);
    else if (p.livedFrom) periods.push({ from: p.livedFrom, to: p.livedTo });
  }
  if (!periods.length) return undefined;
  periods.sort((a, b) => a.from.localeCompare(b.from));
  const from = yr(periods[0].from);
  if (!from) return undefined;
  const last = periods[periods.length - 1];
  const to = last.to ? yr(last.to) : 'present';
  return from === to ? from : `${from}–${to}`;
}

function DetailRow({ icon: Icon, text }: { icon: ComponentType<{ size?: number; color?: string }>; text: string }) {
  return (
    <View className="flex-row items-center" style={{ gap: 7 }}>
      <Icon size={14} color={COLORS.ink3} />
      <Text numberOfLines={1} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink2 }}>{text}</Text>
    </View>
  );
}

const listOf = (names: string[], max = 3) =>
  names.length <= max ? names.join(' · ') : `${names.slice(0, max).join(' · ')} +${names.length - max}`;

/** A rich Atlas country card: vibrant hero photo + a tidy detail block —
 *  relationship pills (with years lived), cities and regions visited. */
export const AtlasCountryCard = memo(function AtlasCountryCard({ aggregate: a, discoveries }: { aggregate: CountryAggregate; discoveries: number }) {
  const lived = livedYears(a);
  const rels = REL_ORDER.filter((r) => a.relationships.includes(r));
  const cityNames = a.cities.filter((c) => c.relationships.some((r) => r !== 'aspiring')).map((c) => c.name);
  const regionSeen = new Set<string>();
  const regionNames: string[] = [];
  for (const n of [...a.regions.map((r) => r.name), ...a.autoRegions]) {
    const k = n.toLowerCase();
    if (!regionSeen.has(k)) { regionSeen.add(k); regionNames.push(n); }
  }

  return (
    <Pressable onPress={() => router.push(`/country/${a.code}`)} className="bg-white rounded-3xl" style={{ overflow: 'hidden' }}>
      <DestinationImage code={a.code} scrim style={{ height: 148, padding: 14, justifyContent: 'flex-end' }}>
        <Text style={{ fontSize: 30, position: 'absolute', top: 12, left: 14 }}>{flagEmoji(a.code)}</Text>
        {a.discoveryScore > 0 ? (
          <View style={{ position: 'absolute', top: 10, right: 12 }}>
            <ScoreRing score={a.discoveryScore} size={40} />
          </View>
        ) : null}
        <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 23 }}>{countryName(a.code)}</Text>
        <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.95 }}>
          {a.continent}{a.firstYear ? ` · since ${a.firstYear}` : ''}
        </Text>
      </DestinationImage>

      <View style={{ padding: 14, gap: 9 }}>
        {rels.length > 0 ? (
          <View className="flex-row flex-wrap" style={{ gap: 6 }}>
            {rels.map((r) => {
              const s = REL_STYLE[r];
              if (!s) return null;
              const Icon = s.Icon;
              const label = r === 'lived' && lived ? `Lived · ${lived}` : RELATIONSHIP_META[r].label;
              return (
                <View key={r} className="flex-row items-center rounded-full" style={{ backgroundColor: s.tint, paddingHorizontal: 10, paddingVertical: 5, gap: 5 }}>
                  <Icon size={12} color={s.color} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, fontWeight: '700', color: s.color }}>{label}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {cityNames.length > 0 ? (
          <DetailRow icon={Building2} text={`${cityNames.length} ${cityNames.length === 1 ? 'city' : 'cities'} · ${listOf(cityNames)}`} />
        ) : null}
        {regionNames.length > 0 ? (
          <DetailRow icon={MapIcon} text={`${regionNames.length === 1 ? 'Region' : 'Regions'} · ${listOf(regionNames)}`} />
        ) : null}
        {discoveries > 0 ? (
          <DetailRow icon={Sparkles} text={`${discoveries} ${discoveries === 1 ? 'discovery' : 'discoveries'}`} />
        ) : null}
      </View>
    </Pressable>
  );
});

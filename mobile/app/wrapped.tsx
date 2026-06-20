import type { ReactNode } from 'react';
import { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { goBack } from '../src/lib/nav';
import { X, Share2 } from 'lucide-react-native';
import { DestinationImage } from '../components/DestinationImage';
import { WorldlyIcon } from '../components/WorldlyLogo';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { hasDestinationPhoto } from '../src/lib/destinationImage';
import { DISCOVERY_CATEGORY_META, type DiscoveryCategory } from '../src/types';
import { useWorldly } from '../src/hooks/useWorldly';
import { useAuth } from '../src/store/auth';
import { shareWrappedPoster } from '../src/lib/wrappedPoster';

export default function WrappedScreen() {
  const { height } = useWindowDimensions();
  const { stats, discoveryStats, journeyStats, level, aggregates } = useWorldly();
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const firstName = user?.displayName?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Explorer');

  // Backdrop codes: discovered countries that have a photo, to vary each slide.
  const photoCodes = aggregates.filter((a) => a.discovered && hasDestinationPhoto(a.code)).map((a) => a.code);
  const bg = (i: number) => photoCodes.length ? photoCodes[i % photoCodes.length] : 'WW';

  const topCategory = (Object.entries(discoveryStats.byCategory) as [DiscoveryCategory, number][])
    .sort((a, b) => b[1] - a[1])
    .filter(([, n]) => n > 0)[0]?.[0];

  // The most deeply explored country, featured on the shareable poster.
  const topCountry = [...aggregates]
    .filter((a) => a.discovered)
    .sort((a, b) => b.discoveryScore - a.discoveryScore)[0];

  async function share() {
    if (sharing) return;
    setSharing(true);
    try {
      await shareWrappedPoster({
        firstName,
        countries: stats.countriesDiscovered,
        continents: stats.continentsDiscovered,
        cities: stats.citiesDiscovered,
        journeys: journeyStats.total,
        discoveries: discoveryStats.total,
        levelNumber: level.level,
        levelTitle: level.title,
        xp: level.xp,
        topCountryName: topCountry?.name,
        topCountryCode: topCountry?.code,
        flagCodes: stats.flagCodes,
      });
    } catch {
      /* user dismissed or print unavailable */
    } finally {
      setSharing(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.night }}>
      <ScrollView pagingEnabled showsVerticalScrollIndicator={false} decelerationRate="fast">
        {/* Intro */}
        <Slide code={bg(0)} height={height}>
          <WorldlyIcon height={66} />
          <Text style={S.eyebrow}>{firstName}, here's</Text>
          <Text style={S.bigTitle}>Your world, wrapped</Text>
          <Text style={S.sub}>Everywhere you've been, in numbers. Swipe up ↑</Text>
        </Slide>

        {/* Countries */}
        <Slide code={bg(1)} height={height}>
          <Text style={S.eyebrow}>YOU'VE EXPLORED</Text>
          <Text style={S.giant}>{stats.countriesDiscovered}</Text>
          <Text style={S.bigLabel}>{stats.countriesDiscovered === 1 ? 'country' : 'countries'}</Text>
          {stats.flagCodes.length > 0 ? (
            <View className="flex-row flex-wrap items-center justify-center" style={{ gap: 4, marginTop: 22, maxWidth: 320 }}>
              {stats.flagCodes.slice(0, 40).map((c) => (
                <Text key={c} style={{ fontSize: 22 }}>{flagEmoji(c)}</Text>
              ))}
            </View>
          ) : null}
        </Slide>

        {/* Continents */}
        <Slide code={bg(2)} height={height}>
          <Text style={S.eyebrow}>ACROSS</Text>
          <Text style={S.giant}>{stats.continentsDiscovered}</Text>
          <Text style={S.bigLabel}>{stats.continentsDiscovered === 1 ? 'continent' : 'continents'}</Text>
          {stats.continents.length > 0 ? (
            <Text style={[S.sub, { marginTop: 18 }]}>{stats.continents.join(' · ')}</Text>
          ) : null}
        </Slide>

        {/* Cities + journeys */}
        <Slide code={bg(3)} height={height}>
          <Text style={S.eyebrow}>ON THE GROUND</Text>
          <View className="flex-row" style={{ gap: 40, marginTop: 10 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={S.medium}>{stats.citiesDiscovered}</Text>
              <Text style={S.smallLabel}>cities</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={S.medium}>{journeyStats.total}</Text>
              <Text style={S.smallLabel}>journeys</Text>
            </View>
          </View>
        </Slide>

        {/* Discoveries */}
        <Slide code={bg(4)} height={height}>
          <Text style={S.eyebrow}>YOU KEPT</Text>
          <Text style={S.giant}>{discoveryStats.total}</Text>
          <Text style={S.bigLabel}>discoveries</Text>
          {topCategory ? (
            <Text style={[S.sub, { marginTop: 18 }]}>
              Mostly {DISCOVERY_CATEGORY_META[topCategory].label.toLowerCase()} · {discoveryStats.recommended} you'd recommend
            </Text>
          ) : null}
        </Slide>

        {/* Level */}
        <Slide code={bg(5)} height={height}>
          <Text style={S.eyebrow}>EXPLORER LEVEL {level.level}</Text>
          <Text style={[S.bigTitle, { marginTop: 8 }]}>{level.title}</Text>
          <Text style={[S.sub, { marginTop: 10 }]}>{level.xp.toLocaleString()} XP earned</Text>
        </Slide>

        {/* Outro */}
        <Slide code={bg(6)} height={height}>
          <WorldlyIcon height={58} />
          <Text style={[S.bigTitle, { marginTop: 16 }]}>The world is waiting</Text>
          <Text style={S.sub}>Where will your next story take you?</Text>
          <Pressable onPress={share} disabled={sharing} className="flex-row items-center rounded-full bg-white" style={{ marginTop: 26, paddingHorizontal: 24, paddingVertical: 14, gap: 8, opacity: sharing ? 0.6 : 1 }}>
            <Share2 size={18} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.coral }}>{sharing ? 'Preparing…' : 'Share my Worldly'}</Text>
          </Pressable>
        </Slide>
      </ScrollView>

      {/* Close */}
      <Pressable onPress={goBack} hitSlop={8} className="absolute rounded-full items-center justify-center" style={{ top: 56, right: 20, height: 40, width: 40, backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <X size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

function Slide({ code, height, children }: { code: string; height: number; children: ReactNode }) {
  return (
    <DestinationImage code={code} scrim motion style={{ height, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
      {/* extra darkening so big text always reads */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,16,24,0.35)' }} />
      <View style={{ alignItems: 'center' }}>{children}</View>
    </DestinationImage>
  );
}

const S = {
  eyebrow: { fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '800' as const, letterSpacing: 2, color: 'rgba(255,255,255,0.9)', marginTop: 14, textAlign: 'center' as const },
  bigTitle: { fontFamily: 'Fraunces', fontSize: 40, lineHeight: 44, color: '#fff', textAlign: 'center' as const, marginTop: 6 },
  giant: { fontFamily: 'Fraunces', fontSize: 132, lineHeight: 140, color: '#fff', textAlign: 'center' as const },
  bigLabel: { fontFamily: 'Fraunces', fontSize: 28, color: '#fff', textAlign: 'center' as const, marginTop: -6 },
  medium: { fontFamily: 'Fraunces', fontSize: 76, lineHeight: 82, color: '#fff' },
  smallLabel: { fontFamily: 'PlusJakarta', fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  sub: { fontFamily: 'PlusJakarta', fontSize: 15, color: 'rgba(255,255,255,0.92)', textAlign: 'center' as const, marginTop: 10, maxWidth: 300 },
};

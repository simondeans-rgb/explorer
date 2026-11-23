import { forwardRef, useMemo } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { geoCentroid, geoDistance } from 'd3-geo';
import { StaticGlobe } from './StaticGlobe';
import { WorldlyLogo } from './WorldlyLogo';
import { BRAND_GRADIENT, COLORS } from '../src/lib/theme';
import { WORLD_FEATURES } from '../src/lib/worldGeo';
import { flagEmoji } from '../src/lib/flags';

/** Where a shared poster sends people: the App Store listing. */
export const POSTER_LINK = 'https://apps.apple.com/app/id6782019443';
export const POSTER_SITE = 'worldly-explorer.com';

/** The brand sign-off for anything shared out of the app: the Worldly lockup,
 *  the site, and a QR straight to the App Store — so a shared image is also an
 *  invitation. Sized for a 360-wide poster canvas. */
export function PosterSignoff({ line = 'Start your own map' }: { line?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ padding: 4, borderRadius: 8, backgroundColor: '#fff' }}>
        <QRCode value={POSTER_LINK} size={40} color="#0D1B2E" backgroundColor="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <WorldlyLogo height={17} white />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 9.5, fontWeight: '600', color: 'rgba(255,255,255,0.78)', marginTop: 3 }}>
          {line}  ·  {POSTER_SITE}
        </Text>
      </View>
    </View>
  );
}

export interface MapPosterProps {
  firstName: string;
  countries: number;
  cities: number;
  continents: number;
  pct: number;
  visited: Set<string>;
  flagCodes: string[];
}

/** The "Share my world" poster (9:16, drawn at 360×640 and captured at 3×).
 *  It shows the same luminous globe as the Atlas — turned to face where you've
 *  been, with a second globe for the far side when your travels wrap around —
 *  rather than a flat map, so what gets posted looks like the app. Rendered
 *  off-screen by the Atlas and captured to a PNG. */
export const MapPoster = forwardRef<View, MapPosterProps>(function MapPoster({ firstName, countries, cities, continents, pct, visited, flagCodes }, ref) {
  const { centre, far, hasFar } = useMemo(() => {
    const pts: [number, number][] = [];
    for (const wf of WORLD_FEATURES) {
      if (wf.alpha2 && visited.has(wf.alpha2)) pts.push(geoCentroid(wf.feature as never) as [number, number]);
    }
    if (!pts.length) return { centre: [10, 20] as [number, number], far: [-170, -20] as [number, number], hasFar: false };
    const c = geoCentroid({ type: 'MultiPoint', coordinates: pts }) as [number, number];
    const centre: [number, number] = [Number.isFinite(c[0]) ? c[0] : 10, Math.max(-40, Math.min(40, Number.isFinite(c[1]) ? c[1] : 20))];
    // Anything beyond ~80° from the centre is hidden on the main globe.
    const hasFar = pts.some((p) => geoDistance(p, centre) > (80 * Math.PI) / 180);
    return { centre, far: [centre[0] + 180, -centre[1]] as [number, number], hasFar };
  }, [visited]);
  const first = (firstName || 'Explorer').split(' ')[0];
  const pctStr = pct > 0 && pct < 1 ? '<1' : String(Math.round(pct));

  return (
    <View ref={ref} collapsable={false} style={{ width: 360, height: 640, backgroundColor: '#0D1B2E', overflow: 'hidden' }}>
      {/* a soft brand aurora behind the headline */}
      <LinearGradient colors={['rgba(255,107,154,0.42)', 'rgba(155,124,255,0.22)', 'rgba(13,27,46,0)']} locations={[0, 0.5, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.2, y: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }} />

      <View style={{ paddingHorizontal: 24, paddingTop: 26 }}>
        <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 10.5, fontWeight: '800', letterSpacing: 2.6, color: 'rgba(255,255,255,0.82)' }}>
          {`${first.toUpperCase()}’S WORLD`}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 2 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 92, lineHeight: 98, color: '#fff' }}>{countries}</Text>
          <View style={{ paddingBottom: 16, flex: 1 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 21, lineHeight: 24, color: '#fff' }}>{countries === 1 ? 'country' : 'countries'}</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: COLORS.coral, marginTop: 2 }}>{pctStr}% of the world</Text>
          </View>
        </View>
      </View>

      {/* the globe(s) */}
      <View style={{ height: 300, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
        <View style={{ marginRight: hasFar ? 44 : 0 }}>
          <StaticGlobe id="poster-main" size={hasFar ? 268 : 292} visited={visited} centre={centre} />
        </View>
        {hasFar ? (
          <View style={{ position: 'absolute', right: 14, bottom: 4 }}>
            <StaticGlobe id="poster-far" size={132} visited={visited} centre={far} />
          </View>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
        <View style={{ flexDirection: 'row' }}>
          {([
            [continents, continents === 1 ? 'CONTINENT' : 'CONTINENTS'],
            [cities, cities === 1 ? 'CITY' : 'CITIES'],
          ] as const).map(([n, l], i) => (
            <View key={l} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i ? 1 : 0, borderLeftColor: 'rgba(255,255,255,0.16)' }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 30, lineHeight: 34, color: '#fff' }}>{n}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 8.5, fontWeight: '700', letterSpacing: 1.4, color: '#9AA6C8', marginTop: 2 }}>{l}</Text>
            </View>
          ))}
        </View>
        {flagCodes.length > 0 ? (
          <Text numberOfLines={2} style={{ textAlign: 'center', fontSize: 17, lineHeight: 25, marginTop: 10 }}>
            {flagCodes.slice(0, 24).map((c) => flagEmoji(c)).join(' ')}
          </Text>
        ) : null}
      </View>

      {/* brand sign-off on a hairline of the signature gradient */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3 }} />
        <View style={{ paddingHorizontal: 24, paddingVertical: 14, backgroundColor: 'rgba(8,14,28,0.6)' }}>
          <PosterSignoff />
        </View>
      </View>
    </View>
  );
});

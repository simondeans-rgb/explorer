import { memo, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { geoOrthographic, geoPath, geoCentroid, geoDistance } from 'd3-geo';
import { LAND_GEOMETRY, BORDERS_GEOMETRY, WORLD_FEATURES } from '../src/lib/worldGeo';
import { COLORS } from '../src/lib/theme';

// Same luminous palette as the Atlas globe, so a country's map reads as a
// close-up of the same world.
const OCEAN_GLOW = '#1B3A6B';
const OCEAN_DEEP = '#0D1B2E';
const LAND = '#37836B';
const LAND_STROKE = '#5FC0A2';
const BORDER = 'rgba(190,230,215,0.3)';
const MAX_SCALE = 2400; // never zoom a tiny state past the map data's detail

export interface CountryMapPin {
  id: string;
  label: string;
  lon: number;
  lat: number;
  /** A memory photo taken here — shown as a round thumbnail marker. */
  photo?: string;
  /** How many memories are tied to this place. */
  photoCount?: number;
}

/** A locator map for one country: the globe turned to face it and zoomed to
 *  fit, the country lit in coral, and the places you've been dropped as pins
 *  (with a memory thumbnail where you have photos). Static SVG — no animation
 *  loop — so it's cheap to mount on a long page. */
function CountryMapInner({
  code,
  pins,
  discovered = true,
  height = 230,
  onPressPin,
}: {
  code: string;
  pins: CountryMapPin[];
  /** Wish-listed (not yet visited) countries light up lavender instead. */
  discovered?: boolean;
  height?: number;
  onPressPin?: (pin: CountryMapPin) => void;
}) {
  const [w, setW] = useState(0);

  const geo = useMemo(() => {
    if (!w) return null;
    const wf = WORLD_FEATURES.find((f) => f.alpha2 === code);
    if (!wf) return null;
    const feature = wf.feature as unknown as GeoJSON.Feature;
    const centre = geoCentroid(feature) as [number, number];
    const pad = 34;
    const projection = geoOrthographic().rotate([-centre[0], -centre[1], 0]).clipAngle(90);
    projection.fitExtent(
      [
        [pad, pad],
        [w - pad, height - pad],
      ],
      feature,
    );
    if (projection.scale() > MAX_SCALE) projection.scale(MAX_SCALE).translate([w / 2, height / 2]);
    const path = geoPath(projection);
    const placed = pins
      .filter((p) => geoDistance([p.lon, p.lat], centre) < Math.PI / 2)
      .map((p) => {
        const xy = projection([p.lon, p.lat]);
        return xy ? { pin: p, x: xy[0], y: xy[1] } : null;
      })
      .filter((p): p is { pin: CountryMapPin; x: number; y: number } => !!p && p.x > 8 && p.x < w - 8 && p.y > 8 && p.y < height - 8);
    const [tx, ty] = projection.translate();
    return {
      sphere: { cx: tx, cy: ty, r: projection.scale() },
      land: path(LAND_GEOMETRY) ?? '',
      borders: path(BORDERS_GEOMETRY) ?? '',
      country: path(feature) ?? '',
      placed,
    };
  }, [w, code, pins, height]);

  const fill = discovered ? COLORS.coral : COLORS.lavender;

  return (
    <View
      onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}
      accessibilityRole="image"
      accessibilityLabel={`Map of your places${pins.length ? `: ${pins.map((p) => p.label).join(', ')}` : ''}`}
      style={{ height, borderRadius: 24, overflow: 'hidden', backgroundColor: OCEAN_DEEP }}
    >
      {geo ? (
        <>
          <Svg width={w} height={height}>
            <Defs>
              <RadialGradient id="cm-ocean" cx="45%" cy="38%" r="75%">
                <Stop offset="0" stopColor={OCEAN_GLOW} />
                <Stop offset="1" stopColor={OCEAN_DEEP} />
              </RadialGradient>
            </Defs>
            <Circle cx={geo.sphere.cx} cy={geo.sphere.cy} r={geo.sphere.r} fill="url(#cm-ocean)" />
            {geo.land ? <Path d={geo.land} fill={LAND} stroke={LAND_STROKE} strokeWidth={0.6} /> : null}
            {geo.country ? <Path d={geo.country} fill={fill} stroke="#FFD3E0" strokeWidth={1} strokeLinejoin="round" /> : null}
            {geo.borders ? <Path d={geo.borders} fill="none" stroke={BORDER} strokeWidth={0.6} /> : null}
            {geo.placed
              .filter((p) => !p.pin.photo)
              .map((p) => (
                <Circle key={p.pin.id} cx={p.x} cy={p.y} r={4} fill="#FFFFFF" stroke={COLORS.navySolid} strokeWidth={1.2} />
              ))}
          </Svg>

          {/* Pins are real views layered over the map so they can carry a photo,
              a label and a comfortable tap target. */}
          {geo.placed.map((p) => {
            const size = p.pin.photo ? 34 : 0;
            // Keep the label on-canvas: flip it to the left near the right edge.
            const flip = p.x > w * 0.62;
            return (
              <Pressable
                key={p.pin.id}
                disabled={!onPressPin}
                onPress={onPressPin ? () => onPressPin(p.pin) : undefined}
                accessibilityRole={onPressPin ? 'button' : undefined}
                accessibilityLabel={`${p.pin.label}${p.pin.photoCount ? `, ${p.pin.photoCount} ${p.pin.photoCount === 1 ? 'memory' : 'memories'}` : ''}`}
                hitSlop={10}
                style={{
                  position: 'absolute',
                  top: p.y - Math.max(size, 20) / 2,
                  ...(flip ? { right: w - p.x - size / 2 } : { left: p.x - size / 2 }),
                  flexDirection: flip ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 5,
                  minHeight: 20,
                }}
              >
                {p.pin.photo ? (
                  <View style={{ height: size, width: size, borderRadius: size / 2, borderWidth: 2, borderColor: '#FFFFFF', overflow: 'hidden', backgroundColor: COLORS.navySolid }}>
                    <Image source={{ uri: p.pin.photo }} style={{ height: '100%', width: '100%' }} contentFit="cover" />
                  </View>
                ) : (
                  <View style={{ width: 8 }} />
                )}
                <View style={{ borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2.5, backgroundColor: 'rgba(13,27,46,0.72)' }}>
                  <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: '#fff', maxWidth: 120 }}>
                    {p.pin.label}
                    {p.pin.photoCount && p.pin.photoCount > 1 ? `  ·  ${p.pin.photoCount}` : ''}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </>
      ) : null}
    </View>
  );
}

export const CountryMap = memo(CountryMapInner);

import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Compass, ArrowRight } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { geoOrthographic, geoPath, geoInterpolate, geoDistance, geoGraticule, geoCentroid } from 'd3-geo';
import { LAND_GEOMETRY, BORDERS_GEOMETRY } from '../src/lib/worldGeo';
import type { Segment } from '../src/lib/journeyGeo';

// Square viewBox; the globe is a disc inscribed in it.
const VIEW = 320;
const CENTER = VIEW / 2;
const R = VIEW / 2 - 10; // base radius: the whole globe fits the frame
const MAX_R = 360; // cap zoom so a short route never blows up too large
const BORDER = 'rgba(190,230,215,0.28)';

// Dark, luminous theme. Land is a distinct teal-green hue (not just lighter) so
// it reads clearly against the deep-navy ocean — and makes the coral arcs pop.
const OCEAN_GLOW = '#1B3A6B';
const OCEAN_DEEP = '#0D1B2E'; // dark navy (not pure black) — within brand palette
const LAND = '#37836B';
const LAND_STROKE = '#5FC0A2';
const GRAT = 'rgba(150,180,255,0.10)';
const ROUTE = '#FF6A8E';
const ROUTE_EDGE = '#FFC2D2';

// A coarse 30° graticule reads as a globe without flooding the per-frame path.
const GRATICULE = geoGraticule().step([30, 30])();

/** Is this lon/lat on the near (camera-facing) hemisphere of the globe? */
function onNearSide(p: [number, number], center: [number, number]): boolean {
  return geoDistance(p, center) <= Math.PI / 2 + 1e-3;
}

/** An auto-rotating 3D globe (orthographic projection) with great-circle journey
 *  arcs that hug the surface and hide as they pass behind the limb. Drag to spin.
 *  Pure JS + SVG — no native module, so it ships over the air. */
export function JourneyGlobe({ segments, maxSize }: { segments: Segment[]; maxSize?: number }) {
  // Frame on the journey network: centre longitude, zoom to fit its span (close
  // routes zoom in, capped; a worldwide network stays a full globe), and shift
  // vertically so the route sits mid-frame WITHOUT tilting — the Earth's axis
  // stays vertical so the poles stay pinned top and bottom.
  const { lon0, globeR, translateY, zoomed } = useMemo(() => {
    const pts = segments.flatMap((s) => [s.from, s.to]);
    if (!pts.length) return { lon0: -10, globeR: R, translateY: CENTER, zoomed: false };
    const c = geoCentroid({ type: 'MultiPoint', coordinates: pts }) as [number, number];
    // Furthest endpoint from centre, as a fraction of the sphere radius (sin θ).
    let maxR = 0;
    for (const p of pts) {
      const th = geoDistance(p, c);
      if (th >= Math.PI / 2) {
        maxR = 1;
        break;
      }
      maxR = Math.max(maxR, Math.sin(th));
    }
    const scale = maxR < 1e-3 ? MAX_R : Math.max(R, Math.min(MAX_R, (0.72 * R) / maxR));
    const lat = Math.max(-72, Math.min(72, c[1]));
    // With zero pitch, screen-y depends only on latitude; this lands the centroid
    // at frame centre while keeping the axis vertical. Then clamp so the disc
    // fills the frame (no dead space above/below) when it's big enough to.
    const desiredTY = CENTER + scale * Math.sin((lat * Math.PI) / 180);
    const minTY = VIEW - scale;
    const maxTY = scale;
    const translateY = minTY <= maxTY ? Math.max(minTY, Math.min(maxTY, desiredTY)) : CENTER;
    return { lon0: -c[0], globeR: scale, translateY, zoomed: scale > R + 1 };
  }, [segments]);

  const [lon, setLon] = useState(lon0);
  const [anim, setAnim] = useState(0);
  const lonRef = useRef(lon);
  lonRef.current = lon;
  const animStart = useRef(Date.now());
  const dragging = useRef(false);
  const dragStart = useRef(lon0);
  // A zoomed single route stays framed (no auto-spin); the worldwide view spins.
  const spinRef = useRef(!zoomed);
  spinRef.current = !zoomed;

  // Longer networks take a little longer to draw on, capped so it never drags.
  const duration = useMemo(() => Math.min(1200 + segments.length * 340, 5200), [segments.length]);

  // Reframe + replay the chronological draw-on whenever the network changes.
  useEffect(() => {
    setLon(lon0);
    setAnim(0);
    animStart.current = Date.now();
  }, [lon0, globeR]);

  // One loop drives both the gentle auto-spin (longitude only) and the intro.
  useEffect(() => {
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - animStart.current) / duration);
      setAnim(p < 1 ? p * p * (3 - 2 * p) : 1); // smoothstep ease
      if (!dragging.current && spinRef.current) setLon((l) => (l + 0.3) % 360);
    }, 1000 / 30);
    return () => clearInterval(t);
  }, [duration]);

  function beginDrag() {
    dragging.current = true;
    dragStart.current = lonRef.current;
  }
  function applyDrag(dx: number) {
    setLon(dragStart.current + dx * 0.35); // horizontal only — keeps the axis vertical
  }
  function endDrag() {
    dragging.current = false;
  }
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => runOnJS(beginDrag)())
        .onUpdate((e) => runOnJS(applyDrag)(e.translationX))
        .onFinalize(() => runOnJS(endDrag)()),
    [],
  );

  const { landPath, borderPath, gratPath, arcs, dots } = useMemo(() => {
    const projection = geoOrthographic().translate([CENTER, translateY]).scale(globeR).rotate([lon, 0, 0]).clipAngle(90);
    const path = geoPath(projection);
    const center: [number, number] = [-lon, 0];

    const n = segments.length;
    const arcs: string[] = [];
    const dots: [number, number][] = [];
    const seen = new Set<string>();
    const addDot = (e: [number, number]) => {
      if (!onNearSide(e, center)) return;
      const xy = projection(e);
      if (!xy) return;
      const k = `${Math.round(xy[0])},${Math.round(xy[1])}`;
      if (seen.has(k)) return;
      seen.add(k);
      dots.push([xy[0], xy[1]]);
    };

    // Each route draws on within its own slice of the timeline, in date order.
    segments.forEach((s, idx) => {
      const startAt = n > 1 ? (idx / n) * 0.82 : 0;
      const localP = Math.max(0, Math.min(1, (anim - startAt) / 0.2));
      if (localP <= 0) return;
      const interp = geoInterpolate(s.from, s.to);
      let d = '';
      let started = false;
      for (let i = 0; i <= 40; i++) {
        const lp = interp((i / 40) * localP) as [number, number]; // grow the head to localP
        const xy = onNearSide(lp, center) ? projection(lp) : null;
        if (!xy) {
          started = false;
          continue;
        }
        d += `${started ? 'L' : 'M'}${xy[0].toFixed(1)} ${xy[1].toFixed(1)} `;
        started = true;
      }
      if (d) arcs.push(d);
      addDot(s.from); // origin lights up as its route starts…
      if (localP >= 0.999) addDot(s.to); // …destination when the route lands
    });

    return { landPath: path(LAND_GEOMETRY) ?? '', borderPath: path(BORDERS_GEOMETRY) ?? '', gratPath: path(GRATICULE) ?? '', arcs, dots };
  }, [lon, segments, anim, globeR, translateY]);

  const [w, setW] = useState(0);
  const size = w > 0 ? Math.min(w, maxSize ?? w) : maxSize ?? VIEW;

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ backgroundColor: OCEAN_DEEP, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <GestureDetector gesture={pan}>
        <Svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`}>
          <Defs>
            <RadialGradient id="globe-ocean" cx="42%" cy="36%" r="72%">
              <Stop offset="0" stopColor={OCEAN_GLOW} />
              <Stop offset="1" stopColor={OCEAN_DEEP} />
            </RadialGradient>
            <RadialGradient id="globe-atmo" cx="50%" cy="50%" r="50%">
              <Stop offset="0.82" stopColor="#6E8BFF" stopOpacity="0" />
              <Stop offset="1" stopColor="#6E8BFF" stopOpacity="0.5" />
            </RadialGradient>
            <RadialGradient id="globe-shade" cx="36%" cy="30%" r="78%">
              <Stop offset="0.5" stopColor="#000010" stopOpacity="0" />
              <Stop offset="1" stopColor="#000010" stopOpacity="0.5" />
            </RadialGradient>
          </Defs>
          {/* atmospheric halo */}
          <Circle cx={CENTER} cy={translateY} r={globeR + 7} fill="url(#globe-atmo)" />
          {/* ocean sphere */}
          <Circle cx={CENTER} cy={translateY} r={globeR} fill="url(#globe-ocean)" />
          {/* graticule + land + country outlines (clipped to the near hemisphere) */}
          {gratPath ? <Path d={gratPath} fill="none" stroke={GRAT} strokeWidth={0.5} /> : null}
          {landPath ? <Path d={landPath} fill={LAND} stroke={LAND_STROKE} strokeWidth={0.5} /> : null}
          {borderPath ? <Path d={borderPath} fill="none" stroke={BORDER} strokeWidth={0.4} /> : null}
          {/* journey arcs */}
          {arcs.map((d, i) => (
            <Path key={`a-${i}`} d={d} fill="none" stroke={ROUTE} strokeWidth={1.5} strokeOpacity={0.95} strokeLinecap="round" />
          ))}
          {dots.map((p, i) => (
            <Circle key={`d-${i}`} cx={p[0]} cy={p[1]} r={2} fill={ROUTE} stroke={ROUTE_EDGE} strokeWidth={0.7} />
          ))}
          {/* spherical shading for depth */}
          <Circle cx={CENTER} cy={translateY} r={globeR} fill="url(#globe-shade)" />
        </Svg>
      </GestureDetector>

      {segments.length === 0 ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 }}>
          <View className="rounded-2xl items-center justify-center" style={{ height: 48, width: 48, backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <Compass size={24} color="#fff" />
          </View>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 19, color: '#fff', marginTop: 12 }}>Where to next?</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: 'rgba(255,255,255,0.72)', textAlign: 'center', marginTop: 4, lineHeight: 18 }}>
            No journeys mapped here yet. Find your next destination and start planning the adventure.
          </Text>
          <Pressable onPress={() => router.push('/explore')} className="flex-row items-center rounded-full" style={{ marginTop: 16, backgroundColor: ROUTE, paddingHorizontal: 16, paddingVertical: 10, gap: 6 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '700', color: '#fff' }}>Find inspiration</Text>
            <ArrowRight size={15} color="#fff" />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Compass, ArrowRight } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { geoOrthographic, geoPath, geoInterpolate, geoDistance, geoGraticule, geoCentroid } from 'd3-geo';
import { LAND_GEOMETRY } from '../src/lib/worldGeo';
import type { Segment } from '../src/lib/journeyGeo';

// Square viewBox; the globe is a disc inscribed in it.
const VIEW = 320;
const CENTER = VIEW / 2;
const R = VIEW / 2 - 10;

// Dark, luminous theme — matches the places/route maps.
const OCEAN_GLOW = '#22417C';
const OCEAN_DEEP = '#070C1C';
const LAND = '#33457E';
const LAND_STROKE = '#485C9E';
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
  // Open framed on the centre of the journey network.
  const initial = useMemo<[number, number]>(() => {
    const pts = segments.flatMap((s) => [s.from, s.to]);
    if (!pts.length) return [-10, -12];
    const c = geoCentroid({ type: 'MultiPoint', coordinates: pts });
    return [-c[0], -Math.max(-55, Math.min(55, c[1]))];
  }, [segments]);

  const [rot, setRot] = useState<[number, number]>(initial);
  const rotRef = useRef(rot);
  rotRef.current = rot;
  const dragging = useRef(false);
  const dragStart = useRef<[number, number]>(initial);

  useEffect(() => {
    setRot(initial);
  }, [initial]);

  // Gentle auto-spin (~9°/s), paused while the user is dragging.
  useEffect(() => {
    const t = setInterval(() => {
      if (dragging.current) return;
      const [l, p] = rotRef.current;
      setRot([(l + 0.3) % 360, p]);
    }, 1000 / 30);
    return () => clearInterval(t);
  }, []);

  function beginDrag() {
    dragging.current = true;
    dragStart.current = rotRef.current;
  }
  function applyDrag(dx: number, dy: number) {
    const [l0, p0] = dragStart.current;
    setRot([l0 + dx * 0.35, Math.max(-82, Math.min(82, p0 - dy * 0.35))]);
  }
  function endDrag() {
    dragging.current = false;
  }
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => runOnJS(beginDrag)())
        .onUpdate((e) => runOnJS(applyDrag)(e.translationX, e.translationY))
        .onFinalize(() => runOnJS(endDrag)()),
    [],
  );

  const { landPath, gratPath, arcs, dots } = useMemo(() => {
    const projection = geoOrthographic().translate([CENTER, CENTER]).scale(R).rotate([rot[0], rot[1], 0]).clipAngle(90);
    const path = geoPath(projection);
    const center: [number, number] = [-rot[0], -rot[1]];

    const arcs: string[] = [];
    for (const s of segments) {
      const interp = geoInterpolate(s.from, s.to);
      let d = '';
      let started = false;
      for (let i = 0; i <= 40; i++) {
        const lp = interp(i / 40) as [number, number];
        const xy = onNearSide(lp, center) ? projection(lp) : null;
        if (!xy) {
          started = false;
          continue;
        }
        d += `${started ? 'L' : 'M'}${xy[0].toFixed(1)} ${xy[1].toFixed(1)} `;
        started = true;
      }
      if (d) arcs.push(d);
    }

    const dots: [number, number][] = [];
    const seen = new Set<string>();
    for (const s of segments) {
      for (const e of [s.from, s.to]) {
        if (!onNearSide(e, center)) continue;
        const xy = projection(e);
        if (!xy) continue;
        const k = `${Math.round(xy[0])},${Math.round(xy[1])}`;
        if (seen.has(k)) continue;
        seen.add(k);
        dots.push([xy[0], xy[1]]);
      }
    }
    return { landPath: path(LAND_GEOMETRY) ?? '', gratPath: path(GRATICULE) ?? '', arcs, dots };
  }, [rot, segments]);

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
          <Circle cx={CENTER} cy={CENTER} r={R + 7} fill="url(#globe-atmo)" />
          {/* ocean sphere */}
          <Circle cx={CENTER} cy={CENTER} r={R} fill="url(#globe-ocean)" />
          {/* graticule + land (clipped to the near hemisphere by the projection) */}
          {gratPath ? <Path d={gratPath} fill="none" stroke={GRAT} strokeWidth={0.5} /> : null}
          {landPath ? <Path d={landPath} fill={LAND} stroke={LAND_STROKE} strokeWidth={0.4} /> : null}
          {/* journey arcs */}
          {arcs.map((d, i) => (
            <Path key={`a-${i}`} d={d} fill="none" stroke={ROUTE} strokeWidth={1.5} strokeOpacity={0.95} strokeLinecap="round" />
          ))}
          {dots.map((p, i) => (
            <Circle key={`d-${i}`} cx={p[0]} cy={p[1]} r={2} fill={ROUTE} stroke={ROUTE_EDGE} strokeWidth={0.7} />
          ))}
          {/* spherical shading for depth */}
          <Circle cx={CENTER} cy={CENTER} r={R} fill="url(#globe-shade)" />
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

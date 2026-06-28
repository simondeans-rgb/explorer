import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Compass, ArrowRight } from 'lucide-react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { geoOrthographic, geoPath, geoInterpolate, geoDistance, geoGraticule, geoCentroid, geoContains } from 'd3-geo';
import { LAND_GEOMETRY, BORDERS_GEOMETRY, WORLD_FEATURES } from '../src/lib/worldGeo';
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
// Choropleth fills for the Places globe (match the old flat map).
const PLACE_VISITED = '#FF6A8E';
const PLACE_VISITED_EDGE = '#FFC2D2';
const PLACE_WISHLIST = '#A48BFF';

export interface PlacesLayer {
  visited: Set<string>;
  wishlist?: Set<string>;
  onPressCountry?: (code: string) => void;
}

// A coarse 30° graticule reads as a globe without flooding the per-frame path.
const GRATICULE = geoGraticule().step([30, 30])();

/** Is this lon/lat on the near (camera-facing) hemisphere of the globe? */
function onNearSide(p: [number, number], center: [number, number]): boolean {
  return geoDistance(p, center) <= Math.PI / 2 + 1e-3;
}

const LAT_LIMIT = 80; // never let the user tilt past the pole
const ZOOM_MIN = 0.85;
const ZOOM_MAX = 3;
const IDLE_MS = 3500; // resume the gentle auto-spin after this much inactivity
const RESET_MS = 800; // duration of the snap-back-to-north framing on filter change

/** Shortest signed longitude delta in (-180, 180]. */
function shortLonDelta(from: number, to: number): number {
  return (((to - from) % 360) + 540) % 360 - 180;
}

/** An interactive 3D globe (orthographic projection) with great-circle journey
 *  arcs that hug the surface and hide as they pass behind the limb. Drag to spin
 *  in any direction, pinch to zoom; it gently auto-spins when idle and snaps back
 *  to a north-up framing of the region whenever the filter changes. Pure JS + SVG
 *  — no native module, so it ships over the air. */
export function JourneyGlobe({
  segments,
  maxSize,
  resetKey,
  scrollRef,
  places,
}: {
  segments: Segment[];
  maxSize?: number;
  resetKey?: string | number;
  scrollRef?: RefObject<unknown>;
  /** When set, the globe colours visited/wishlist countries instead of (or as
   *  well as) drawing journey arcs — turning it into the Places map. */
  places?: PlacesLayer;
}) {
  // The country polygons to fill, paired with their colour (Places mode only).
  const placeFeatures = useMemo(() => {
    if (!places) return [] as { code: string; feature: GeoJSON.Feature; fill: string }[];
    const out: { code: string; feature: GeoJSON.Feature; fill: string }[] = [];
    for (const wf of WORLD_FEATURES) {
      const c = wf.alpha2;
      if (!c) continue;
      if (places.visited.has(c)) out.push({ code: c, feature: wf.feature as unknown as GeoJSON.Feature, fill: PLACE_VISITED });
      else if (places.wishlist?.has(c)) out.push({ code: c, feature: wf.feature as unknown as GeoJSON.Feature, fill: PLACE_WISHLIST });
    }
    return out;
  }, [places]);

  // Points the globe frames itself on: visited-country centroids in Places mode,
  // otherwise the journey endpoints.
  const framePts = useMemo<[number, number][]>(() => {
    if (places) {
      return placeFeatures
        .filter((f) => places.visited.has(f.code))
        .map((f) => geoCentroid(f.feature) as [number, number]);
    }
    return segments.flatMap((s) => [s.from, s.to]);
  }, [places, placeFeatures, segments]);

  // Frame on the network: centre longitude, zoom to fit its span (close routes
  // zoom in, capped; a worldwide network stays a full globe), and shift
  // vertically so it sits mid-frame WITHOUT tilting — the Earth's axis stays
  // vertical so the poles stay pinned top and bottom.
  const { lon0, globeR, translateY } = useMemo(() => {
    const pts = framePts;
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
  }, [framePts]);

  const [lon, setLon] = useState(lon0);
  const [lat, setLat] = useState(0); // pitch — 0 keeps north up; user drag tilts it
  const [zoom, setZoom] = useState(1); // pinch multiplier on the framed radius
  const [anim, setAnim] = useState(0);
  const lonRef = useRef(lon);
  lonRef.current = lon;
  const latRef = useRef(lat);
  latRef.current = lat;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const lon0Ref = useRef(lon0);
  lon0Ref.current = lon0;
  // For tapping a country: the live projection, on-screen layout, the country
  // polygons and the press handler — all read through a ref so the memoised tap
  // gesture never sees a stale closure.
  const hitRef = useRef<{
    project: ReturnType<typeof geoOrthographic> | null;
    size: number;
    frameH: number;
    w: number;
    features: { code: string; feature: GeoJSON.Feature; fill: string }[];
    onPress?: (code: string) => void;
  }>({ project: null, size: 0, frameH: 0, w: 0, features: [] });
  const animStart = useRef(Date.now());
  const dragging = useRef(false);
  const lastInteract = useRef(0); // when the user last let go (for idle auto-spin)
  const dragStartLon = useRef(lon0);
  const dragStartLat = useRef(0);
  const pinchStartZoom = useRef(1);
  // Snap-back animation toward (lon0, lat 0, zoom 1) when the network changes.
  const reset = useRef({ active: false, start: 0, fromLon: lon0, fromLat: 0, fromZoom: 1 });

  const rEff = Math.min(MAX_R, globeR * zoom);

  // Longer networks take a little longer to draw on, capped so it never drags.
  const duration = useMemo(() => Math.min(1200 + segments.length * 340, 5200), [segments.length]);

  // Reframe (animated snap to north-up over the region) + replay the draw-on
  // whenever the network changes — e.g. when a year filter is toggled.
  useEffect(() => {
    reset.current = { active: true, start: Date.now(), fromLon: lonRef.current, fromLat: latRef.current, fromZoom: zoomRef.current };
    setAnim(0);
    animStart.current = Date.now();
    lastInteract.current = Date.now();
  }, [lon0, globeR, resetKey]);

  // One loop drives the intro draw-on, the snap-back, and the idle auto-spin.
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      const p = Math.min(1, (now - animStart.current) / duration);
      setAnim(p < 1 ? p * p * (3 - 2 * p) : 1); // smoothstep ease
      if (reset.current.active) {
        const k = Math.min(1, (now - reset.current.start) / RESET_MS);
        const e = 1 - Math.pow(1 - k, 3); // ease-out cubic
        const r = reset.current;
        setLon(r.fromLon + shortLonDelta(r.fromLon, lon0Ref.current) * e);
        setLat(r.fromLat * (1 - e));
        setZoom(r.fromZoom + (1 - r.fromZoom) * e);
        if (k >= 1) reset.current.active = false;
      } else if (!dragging.current && now - lastInteract.current > IDLE_MS) {
        setLon((l) => (l + 0.3) % 360); // gentle idle spin around the current tilt
      }
    }, 1000 / 30);
    return () => clearInterval(t);
  }, [duration]);

  function beginGesture() {
    dragging.current = true;
    reset.current.active = false;
    dragStartLon.current = lonRef.current;
    dragStartLat.current = latRef.current;
    pinchStartZoom.current = zoomRef.current;
  }
  function applyPan(dx: number, dy: number) {
    setLon(dragStartLon.current + dx * 0.35); // left/right spins
    setLat(Math.max(-LAT_LIMIT, Math.min(LAT_LIMIT, dragStartLat.current - dy * 0.3))); // up/down tilts
  }
  function applyPinch(s: number) {
    setZoom(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinchStartZoom.current * s)));
  }
  function endGesture() {
    dragging.current = false;
    lastInteract.current = Date.now();
  }
  // Tap a country on the Places globe: invert the tap pixel to lon/lat (via the
  // live projection), then hit-test it against the visited/wishlist polygons.
  function handleTap(x: number, y: number) {
    const { project, size: s, frameH: fh, w: ww, features, onPress } = hitRef.current;
    if (!onPress || !project || !s) return;
    const offX = (ww - s) / 2;
    const offY = (fh - s) / 2; // negative: SVG overflows the cropped container
    const vb: [number, number] = [((x - offX) * VIEW) / s, ((y - offY) * VIEW) / s];
    const ll = project.invert?.(vb);
    if (!ll || Number.isNaN(ll[0])) return;
    for (const f of features) {
      if (geoContains(f.feature, ll)) {
        onPress(f.code);
        return;
      }
    }
  }
  const gesture = useMemo(() => {
    let pan = Gesture.Pan()
      .onBegin(() => runOnJS(beginGesture)())
      .onUpdate((e) => runOnJS(applyPan)(e.translationX, e.translationY))
      .onFinalize(() => runOnJS(endGesture)());
    let pinch = Gesture.Pinch()
      .onBegin(() => runOnJS(beginGesture)())
      .onUpdate((e) => runOnJS(applyPinch)(e.scale))
      .onFinalize(() => runOnJS(endGesture)());
    // Let vertical drags rotate the globe instead of scrolling the page behind it.
    if (scrollRef) {
      pan = pan.blocksExternalGesture(scrollRef as never);
      pinch = pinch.blocksExternalGesture(scrollRef as never);
    }
    const tap = Gesture.Tap().maxDistance(10).maxDuration(260).onEnd((e) => runOnJS(handleTap)(e.x, e.y));
    return Gesture.Simultaneous(pan, pinch, tap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef]);

  const { landPath, borderPath, gratPath, arcs, dots, countryFills, projection } = useMemo(() => {
    const projection = geoOrthographic().translate([CENTER, translateY]).scale(rEff).rotate([lon, lat, 0]).clipAngle(90);
    const path = geoPath(projection);
    const center: [number, number] = [-lon, -lat];

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

    // Places mode: fill visited/wishlist countries on the near hemisphere.
    const countryFills = placeFeatures
      .map((f) => ({ code: f.code, d: path(f.feature) ?? '', fill: f.fill }))
      .filter((f) => f.d);

    return { landPath: path(LAND_GEOMETRY) ?? '', borderPath: path(BORDERS_GEOMETRY) ?? '', gratPath: path(GRATICULE) ?? '', arcs, dots, countryFills, projection };
  }, [lon, lat, rEff, segments, anim, translateY, placeFeatures]);

  const [w, setW] = useState(0);
  const size = w > 0 ? Math.min(w, maxSize ?? w) : maxSize ?? VIEW;
  // Crop the container shorter than the square SVG so the globe fills its frame
  // edge-to-edge instead of leaving a navy band of dead space above/below the
  // disc (the poles, which carry no content, are what gets clipped).
  const frameH = Math.round(size * 0.86);
  // Keep the projection + layout + country data fresh for tap hit-testing.
  hitRef.current = { project: projection, size, frameH, w, features: placeFeatures, onPress: places?.onPressCountry };

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ backgroundColor: OCEAN_DEEP, height: frameH, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <GestureDetector gesture={gesture}>
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
          <Circle cx={CENTER} cy={translateY} r={rEff + 7} fill="url(#globe-atmo)" />
          {/* ocean sphere */}
          <Circle cx={CENTER} cy={translateY} r={rEff} fill="url(#globe-ocean)" />
          {/* graticule + land + country outlines (clipped to the near hemisphere) */}
          {gratPath ? <Path d={gratPath} fill="none" stroke={GRAT} strokeWidth={0.5} /> : null}
          {landPath ? <Path d={landPath} fill={LAND} stroke={LAND_STROKE} strokeWidth={0.5} /> : null}
          {/* Places mode: visited (coral) / wishlist (lavender) country fills */}
          {countryFills.map((c) => (
            <Path
              key={c.code}
              d={c.d}
              fill={c.fill}
              fillOpacity={anim}
              stroke={c.fill === PLACE_VISITED ? PLACE_VISITED_EDGE : '#FFFFFF'}
              strokeWidth={0.4}
              strokeOpacity={0.5 * anim}
            />
          ))}
          {borderPath ? <Path d={borderPath} fill="none" stroke={BORDER} strokeWidth={0.4} /> : null}
          {/* journey arcs */}
          {arcs.map((d, i) => (
            <Path key={`a-${i}`} d={d} fill="none" stroke={ROUTE} strokeWidth={1.5} strokeOpacity={0.95} strokeLinecap="round" />
          ))}
          {dots.map((p, i) => (
            <Circle key={`d-${i}`} cx={p[0]} cy={p[1]} r={2} fill={ROUTE} stroke={ROUTE_EDGE} strokeWidth={0.7} />
          ))}
          {/* spherical shading for depth */}
          <Circle cx={CENTER} cy={translateY} r={rEff} fill="url(#globe-shade)" />
        </Svg>
      </GestureDetector>

      {!places && segments.length === 0 ? (
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

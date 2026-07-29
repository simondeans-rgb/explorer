import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Plane, Clock, Wifi, PlaneLanding } from 'lucide-react-native';
import { COLORS, SHADOW, BRAND_GRADIENT } from '../src/lib/theme';
import { iataFromLabel, formatDuration, airportTz, airportCountry, destinationClock, type TodaysFlight } from '../src/lib/liveFlight';
import { useLiveFlight } from '../src/hooks/useLiveFlight';
import { fetchWeather, type Weather } from '../src/lib/weather';
import { DestinationImage } from './DestinationImage';
import { FlightRouteMap } from './FlightRouteMap';

const ROUTE_CORAL = '#FF6A55';

function city(label?: string): string {
  return (label || '').split('(')[0].trim();
}

/** A frosted pill for overlaying on photography. */
function Glass({ children, tint }: { children: ReactNode; tint?: string }) {
  return (
    <View className="flex-row items-center rounded-full" style={{ backgroundColor: tint ?? 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 6, gap: 5 }}>
      {children}
    </View>
  );
}
function GlassText({ children }: { children: ReactNode }) {
  return <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: '#fff' }}>{children}</Text>;
}

/** A pill on the card surface (in-air layout). */
function Chip({ icon: Icon, label, tint, color }: { icon?: typeof Plane; label: string; tint?: string; color?: string }) {
  return (
    <View className="flex-row items-center rounded-full" style={{ backgroundColor: tint ?? 'rgba(20,33,61,0.06)', paddingHorizontal: 10, paddingVertical: 6, gap: 5 }}>
      {Icon ? <Icon size={13} color={color ?? COLORS.ink2} /> : null}
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: color ?? COLORS.ink2 }}>{label}</Text>
    </View>
  );
}

/** The day-of live-flight card — the first, most visual thing on Story on a
 *  flight day. Grounded: a destination-photo hero with gate/delay/countdown.
 *  In the air: a full-width live map (route always unobstructed) with the flight
 *  detail above and progress/ETA below. */
export function FlightLiveTile({ flight }: { flight: TodaysFlight }) {
  const live = useLiveFlight(flight);
  const { status, phase, progress, minutesLeft, departMs, now } = live;
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.max(260, screenW - 40); // full width within Story's 20pt padding

  const fromIata = iataFromLabel(flight.fromLabel) ?? '—';
  const toIata = iataFromLabel(flight.toLabel) ?? '—';
  const heroCountry = airportCountry(toIata) || airportCountry(fromIata);
  const canMap = !!(flight.fromCoord && flight.toCoord);

  const [weather, setWeather] = useState<Weather | null>(null);
  const destLng = flight.toCoord?.[0];
  const destLat = flight.toCoord?.[1];
  useEffect(() => {
    if (destLat == null || destLng == null) return;
    let active = true;
    fetchWeather(destLat, destLng).then((w) => { if (active) setWeather(w); });
    return () => { active = false; };
  }, [destLat, destLng]);
  const clock = useMemo(() => destinationClock(airportTz(toIata), new Date(now)), [toIata, now]);

  const delay = phase === 'landed' ? (status?.arriveDelayMin ?? 0) : (status?.departDelayMin ?? 0);
  const delayText = delay > 3 ? `Delayed ${formatDuration(delay)}` : delay < -3 ? `${formatDuration(-delay)} early` : 'On time';
  const delayLight = delay > 3 ? { tint: 'rgba(245,158,11,0.16)', color: '#B45309' } : { tint: 'rgba(16,159,143,0.14)', color: '#0E9F8F' };
  const delaySolid = delay > 3 ? 'rgba(245,158,11,0.9)' : 'rgba(16,159,143,0.9)';

  const open = () => router.push(`/trip/${flight.expeditionId}`);
  const weatherLabel = weather ? `${weather.emoji} ${weather.tempC}°` : '';
  const clockLabel = clock ? `${city(flight.toLabel) || toIata} ${clock.localTime} · ${clock.diffLabel}` : '';

  // ── In the air: a full-width map panel with detail above + progress below ──
  if (phase === 'enroute' && canMap) {
    return (
      <Pressable onPress={open} className="bg-white dark:bg-card rounded-3xl" style={{ overflow: 'hidden', ...SHADOW.card }}>
        {/* Detail (card surface, above the map) */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <View className="flex-row items-center" style={{ gap: 10 }}>
            <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(255,106,85,0.14)' }}>
              <Plane size={20} color={COLORS.coral} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>{fromIata} → {toIata}</Text>
              <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{flight.flightNumber} · {city(flight.fromLabel)} to {city(flight.toLabel)}</Text>
            </View>
            {status ? <Chip icon={Clock} label={delayText} tint={delayLight.tint} color={delayLight.color} /> : null}
          </View>
          {(weather || clock) ? (
            <View className="flex-row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {weather ? <Chip label={`${weatherLabel} · ${weather.label}`} /> : null}
              {clock ? <Chip icon={Clock} label={clockLabel} /> : null}
            </View>
          ) : null}
        </View>

        {/* The route map — full width, nothing drawn over it */}
        <FlightRouteMap from={flight.fromCoord!} to={flight.toCoord!} position={live.position} progress={progress} width={cardW} height={168} radius={0} />

        {/* Progress + ETA (card surface, below the map) */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
          <View className="flex-row items-end justify-between">
            <View>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 26, color: COLORS.navy }}>{minutesLeft > 0 ? formatDuration(minutesLeft) : 'Landing'}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>
                {minutesLeft > 0 ? 'to landing' : 'arriving now'}
                {status?.position?.altitudeFt ? ` · ${Math.round(status.position.altitudeFt).toLocaleString()} ft` : ''}
                {status?.position?.groundSpeedKt ? ` · ${Math.round(status.position.groundSpeedKt)} kt` : ''}
              </Text>
            </View>
            <Chip icon={Wifi} label={live.positionIsLive ? 'Live' : 'Estimated'} tint={live.positionIsLive ? 'rgba(255,106,85,0.14)' : 'rgba(20,33,61,0.06)'} color={live.positionIsLive ? COLORS.coral : COLORS.ink3} />
          </View>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(20,33,61,0.08)', marginTop: 10, overflow: 'hidden' }}>
            <View style={{ height: 5, borderRadius: 3, width: `${Math.round(progress * 100)}%`, backgroundColor: ROUTE_CORAL }} />
          </View>
        </View>
      </Pressable>
    );
  }

  // ── Grounded (pre-flight / landed): a destination-photo hero ─────────────
  const grounded = (
    <View style={{ minHeight: 210, padding: 16, justifyContent: 'space-between' }}>
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <Glass><Plane size={13} color="#fff" /><GlassText>{flight.flightNumber}</GlassText></Glass>
        {phase === 'boarding' ? <Glass tint="rgba(255,106,85,0.9)"><GlassText>Boarding</GlassText></Glass> : null}
        <View style={{ flex: 1 }} />
        {status ? <Glass tint={delaySolid}><Clock size={12} color="#fff" /><GlassText>{delayText}</GlassText></Glass> : null}
      </View>
      <View style={{ gap: 8 }}>
        <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', opacity: 0.9 }}>
          {city(flight.fromLabel)} → {city(flight.toLabel)}
        </Text>
        {phase === 'landed' ? (
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <PlaneLanding size={22} color="#fff" />
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 27 }}>Landed in {city(flight.toLabel) || toIata}</Text>
          </View>
        ) : departMs && departMs > now ? (
          <View>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.85 }}>Departs in</Text>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 34, lineHeight: 38 }}>{formatDuration(Math.round((departMs - now) / 60000))}</Text>
          </View>
        ) : (
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 26 }}>{flight.departTime ? `Departs ${flight.departTime}` : 'Have a wonderful flight'}</Text>
        )}
        <View className="flex-row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {weather ? <Glass><GlassText>{weather.emoji} {weather.tempC}° · {weather.label}</GlassText></Glass> : null}
          {clock ? <Glass><Clock size={12} color="#fff" /><GlassText>{clock.localTime} · {clock.diffLabel}</GlassText></Glass> : null}
          {phase === 'landed'
            ? (status?.arriveGate ? <Glass><GlassText>Gate {status.arriveGate}</GlassText></Glass> : null)
            : (<>
                {status?.departTerminal ? <Glass><GlassText>Terminal {status.departTerminal}</GlassText></Glass> : null}
                {status?.departGate ? <Glass tint="rgba(255,106,85,0.9)"><GlassText>Gate {status.departGate}</GlassText></Glass> : null}
              </>)}
        </View>
      </View>
    </View>
  );

  return (
    <Pressable onPress={open} className="rounded-3xl" style={{ overflow: 'hidden', ...SHADOW.card }}>
      {heroCountry ? (
        <DestinationImage code={heroCountry} scrim style={{ minHeight: 210 }}>{grounded}</DestinationImage>
      ) : (
        <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>{grounded}</LinearGradient>
      )}
    </Pressable>
  );
}

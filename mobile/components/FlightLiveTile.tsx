import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Plane, Clock, Wifi } from 'lucide-react-native';
import { SHADOW, BRAND_GRADIENT } from '../src/lib/theme';
import { iataFromLabel, formatDuration, airportTz, airportCountry, destinationClock, type TodaysFlight } from '../src/lib/liveFlight';
import { useLiveFlight } from '../src/hooks/useLiveFlight';
import { fetchWeather, type Weather } from '../src/lib/weather';
import { DestinationImage } from './DestinationImage';
import { FlightRouteMap } from './FlightRouteMap';

const ROUTE_CORAL = '#FF6A55';

function city(label?: string): string {
  return (label || '').split('(')[0].trim();
}

/** A frosted pill for overlaying on photography / the map. */
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

/** The day-of live-flight card — the first, most visual thing on Story on a
 *  flight day. Grounded: a destination-photo hero with gate/delay/countdown.
 *  In the air: a live route map hero with the aircraft, progress and ETA. */
export function FlightLiveTile({ flight }: { flight: TodaysFlight }) {
  const live = useLiveFlight(flight);
  const { status, phase, progress, minutesLeft, departMs, now } = live;
  const { width: screenW } = useWindowDimensions();
  const heroW = Math.max(260, screenW - 40); // full-bleed within Story's 20pt padding

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

  const delayBadge = useMemo(() => {
    const d = phase === 'landed' ? (status?.arriveDelayMin ?? 0) : (status?.departDelayMin ?? 0);
    if (!status) return null;
    if (d > 3) return { label: `Delayed ${formatDuration(d)}`, tint: 'rgba(245,158,11,0.9)' };
    if (d < -3) return { label: `${formatDuration(-d)} early`, tint: 'rgba(16,159,143,0.9)' };
    return { label: 'On time', tint: 'rgba(16,159,143,0.9)' };
  }, [status, phase]);

  const open = () => router.push(`/trip/${flight.expeditionId}`);

  // Shared top row: flight number + status.
  const topRow = (
    <View className="flex-row items-center" style={{ gap: 8 }}>
      <Glass><Plane size={13} color="#fff" /><GlassText>{flight.flightNumber}</GlassText></Glass>
      {phase === 'boarding' ? <Glass tint="rgba(255,106,85,0.9)"><GlassText>Boarding</GlassText></Glass> : null}
      <View style={{ flex: 1 }} />
      {delayBadge ? <Glass tint={delayBadge.tint}><Clock size={12} color="#fff" /><GlassText>{delayBadge.label}</GlassText></Glass> : null}
    </View>
  );

  // Shared weather + destination-time chips.
  const infoChips = (weather || clock) ? (
    <View className="flex-row" style={{ gap: 8, flexWrap: 'wrap' }}>
      {weather ? <Glass><GlassText>{weather.emoji} {weather.tempC}°</GlassText></Glass> : null}
      {clock ? <Glass><Clock size={12} color="#fff" /><GlassText>{city(flight.toLabel) || toIata} {clock.localTime} · {clock.diffLabel}</GlassText></Glass> : null}
    </View>
  ) : null;

  // ── In the air: the live map is the hero ────────────────────────────────
  if (phase === 'enroute' && canMap) {
    return (
      <Pressable onPress={open} className="rounded-3xl" style={{ overflow: 'hidden', ...SHADOW.card }}>
        <View style={{ height: 230 }}>
          <FlightRouteMap from={flight.fromCoord!} to={flight.toCoord!} position={live.position} progress={progress} width={heroW} height={230} radius={0} />
          <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110 }} pointerEvents="none" />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.72)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 150 }} pointerEvents="none" />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 16, gap: 8 }}>
            {topRow}
            {infoChips}
          </View>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>{fromIata} → {toIata}</Text>
            <View className="flex-row items-end justify-between" style={{ marginTop: 2 }}>
              <View>
                <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, lineHeight: 34 }}>
                  {minutesLeft > 0 ? formatDuration(minutesLeft) : 'Landing'}
                </Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                  {minutesLeft > 0 ? 'to landing' : 'arriving now'}
                  {status?.position?.altitudeFt ? ` · ${Math.round(status.position.altitudeFt).toLocaleString()} ft` : ''}
                  {status?.position?.groundSpeedKt ? ` · ${Math.round(status.position.groundSpeedKt)} kt` : ''}
                </Text>
              </View>
              <Glass tint={live.positionIsLive ? 'rgba(255,106,85,0.9)' : 'rgba(255,255,255,0.2)'}>
                <Wifi size={12} color="#fff" /><GlassText>{live.positionIsLive ? 'Live' : 'Est.'}</GlassText>
              </Glass>
            </View>
            <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 10, overflow: 'hidden' }}>
              <View style={{ height: 5, borderRadius: 3, width: `${Math.round(progress * 100)}%`, backgroundColor: ROUTE_CORAL }} />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // ── Grounded (pre-flight / landed): a destination-photo hero ─────────────
  const grounded = (
    <View style={{ minHeight: 210, padding: 16, justifyContent: 'space-between' }}>
      {topRow}
      <View style={{ gap: 8 }}>
        <Text numberOfLines={1} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', opacity: 0.9 }}>
          {city(flight.fromLabel)} → {city(flight.toLabel)}
        </Text>
        {phase === 'landed' ? (
          <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 27 }}>Landed in {city(flight.toLabel) || toIata}</Text>
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

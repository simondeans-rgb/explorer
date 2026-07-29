import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Plane, PlaneTakeoff, PlaneLanding, DoorOpen, Clock, Wifi } from 'lucide-react-native';
import { COLORS, SHADOW } from '../src/lib/theme';
import { iataFromLabel, formatDuration, airportTz, destinationClock, type TodaysFlight } from '../src/lib/liveFlight';
import { useLiveFlight } from '../src/hooks/useLiveFlight';
import { fetchWeather, type Weather } from '../src/lib/weather';
import { FlightRouteMap } from './FlightRouteMap';

function city(label?: string): string {
  return (label || '').split('(')[0].trim();
}

function Chip({ icon: Icon, label, tint = 'rgba(20,33,61,0.06)', color = COLORS.ink2 }: { icon: typeof Plane; label: string; tint?: string; color?: string }) {
  return (
    <View className="flex-row items-center rounded-full" style={{ backgroundColor: tint, paddingHorizontal: 10, paddingVertical: 6, gap: 5 }}>
      <Icon size={13} color={color} />
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color }}>{label}</Text>
    </View>
  );
}

/** The day-of live-flight card — the first thing on Story on a flight day.
 *  Pre-flight: gate, terminal, delay + a countdown. In the air: a live route
 *  map with the aircraft's position and time-to-landing. After: a landed note. */
export function FlightLiveTile({ flight }: { flight: TodaysFlight }) {
  const live = useLiveFlight(flight);
  const { status, phase, progress, minutesLeft, departMs, now } = live;
  const { width: screenW } = useWindowDimensions();
  const mapWidth = Math.max(240, screenW - 72); // Story pad (20·2) + card pad (16·2)

  const fromIata = iataFromLabel(flight.fromLabel) ?? '—';
  const toIata = iataFromLabel(flight.toLabel) ?? '—';

  // Destination weather (Open-Meteo, cached) + local time / offset.
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
  const depDelay = status?.departDelayMin ?? 0;
  const arrDelay = status?.arriveDelayMin ?? 0;

  const delayBadge = useMemo(() => {
    const d = phase === 'landed' ? arrDelay : depDelay;
    if (!status) return null;
    if (d > 3) return { label: `Delayed ${formatDuration(d)}`, tint: 'rgba(245,158,11,0.16)', color: '#B45309' };
    if (d < -3) return { label: `${formatDuration(-d)} early`, tint: 'rgba(16,159,143,0.14)', color: '#0E9F8F' };
    return { label: 'On time', tint: 'rgba(16,159,143,0.14)', color: '#0E9F8F' };
  }, [status, phase, depDelay, arrDelay]);

  const open = () => router.push(`/trip/${flight.expeditionId}`);
  const canMap = !!(flight.fromCoord && flight.toCoord);

  return (
    <Pressable onPress={open} className="bg-white dark:bg-card rounded-3xl" style={{ padding: 16, ...SHADOW.card }}>
      {/* Header: flight number + route */}
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(255,106,85,0.14)' }}>
          <Plane size={20} color={COLORS.coral} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>{fromIata} → {toIata}</Text>
          <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>
            {flight.flightNumber} · {city(flight.fromLabel)} to {city(flight.toLabel)}
          </Text>
        </View>
        {delayBadge ? <Chip icon={Clock} label={delayBadge.label} tint={delayBadge.tint} color={delayBadge.color} /> : null}
      </View>

      {/* Destination strip — local weather + current time & offset */}
      {(weather || clock) ? (
        <View className="flex-row items-center" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {weather ? (
            <View className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(20,33,61,0.06)', paddingHorizontal: 10, paddingVertical: 6, gap: 5 }}>
              <Text style={{ fontSize: 13 }}>{weather.emoji}</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.ink2 }}>{weather.tempC}° · {weather.label}</Text>
            </View>
          ) : null}
          {clock ? <Chip icon={Clock} label={`${city(flight.toLabel) || toIata} ${clock.localTime} · ${clock.diffLabel}`} /> : null}
        </View>
      ) : null}

      {/* In the air — live route map + progress */}
      {phase === 'enroute' && canMap ? (
        <View style={{ marginTop: 14 }}>
          <FlightRouteMap from={flight.fromCoord!} to={flight.toCoord!} position={live.position} progress={progress} width={mapWidth} height={148} />
          <View className="flex-row items-center justify-between" style={{ marginTop: 12 }}>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <PlaneLanding size={15} color={COLORS.coral} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>
                {minutesLeft > 0 ? `${formatDuration(minutesLeft)} to landing` : 'Arriving now'}
              </Text>
            </View>
            <Chip
              icon={Wifi}
              label={live.positionIsLive ? 'Live' : 'Estimated'}
              tint={live.positionIsLive ? 'rgba(255,106,85,0.14)' : 'rgba(20,33,61,0.06)'}
              color={live.positionIsLive ? COLORS.coral : COLORS.ink3}
            />
          </View>
          {/* progress bar */}
          <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(20,33,61,0.08)', marginTop: 10, overflow: 'hidden' }}>
            <View style={{ height: 5, borderRadius: 3, width: `${Math.round(progress * 100)}%`, backgroundColor: COLORS.coral }} />
          </View>
          {status?.position?.altitudeFt || status?.position?.groundSpeedKt ? (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, color: COLORS.ink3, marginTop: 8 }}>
              {status.position.altitudeFt ? `${Math.round(status.position.altitudeFt).toLocaleString()} ft` : ''}
              {status.position.altitudeFt && status.position.groundSpeedKt ? ' · ' : ''}
              {status.position.groundSpeedKt ? `${Math.round(status.position.groundSpeedKt)} kt` : ''}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Pre-flight — gate/terminal + countdown */}
      {(phase === 'scheduled' || phase === 'boarding' || phase === 'unknown' || phase === 'departed') ? (
        <View style={{ marginTop: 14 }}>
          <View className="flex-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {phase === 'boarding' ? <Chip icon={PlaneTakeoff} label="Boarding" tint="rgba(255,106,85,0.14)" color={COLORS.coral} /> : null}
            {status?.departTerminal ? <Chip icon={DoorOpen} label={`Terminal ${status.departTerminal}`} /> : null}
            {status?.departGate ? <Chip icon={DoorOpen} label={`Gate ${status.departGate}`} tint="rgba(255,106,85,0.14)" color={COLORS.coral} /> : null}
            {flight.departTime ? <Chip icon={PlaneTakeoff} label={`Departs ${flight.departTime}`} /> : null}
          </View>
          {departMs && departMs > now ? (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 10 }}>
              Departs in <Text style={{ fontWeight: '800', color: COLORS.navy }}>{formatDuration(Math.round((departMs - now) / 60000))}</Text>
              {status?.departGate ? '' : ' · gate shown when set'}
            </Text>
          ) : (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 10 }}>Have a wonderful flight.</Text>
          )}
        </View>
      ) : null}

      {/* Landed */}
      {phase === 'landed' ? (
        <View className="flex-row items-center" style={{ marginTop: 14, gap: 6 }}>
          <PlaneLanding size={16} color={COLORS.aqua} />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>
            Landed in {city(flight.toLabel) || toIata}
            {status?.arriveGate ? ` · Gate ${status.arriveGate}` : ''}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

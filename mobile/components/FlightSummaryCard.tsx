import { useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Plane } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { formatDistance, distanceUnitLabel, KM_PER_MI, type DistanceUnit } from '../src/lib/units';

// A boarding-pass style summary of a looked-up flight, so the loaded details
// read as one engaging card: airline logo + number, the route in big IATA codes
// on a dashed plane path, scheduled and actual times with terminals and any
// delay, plus distance and duration.
const BLUE = '#1E6BFF';
const TEAL = '#00A88E';

function iataOf(label?: string): string | undefined {
  const m = (label || '').match(/\(([A-Za-z]{3})\)/);
  return m ? m[1].toUpperCase() : undefined;
}
function cityOf(label?: string): string {
  if (!label) return '';
  return label.replace(/\s*\([A-Za-z]{3}\)\s*/, ' ').split(',')[0].trim();
}
function fmtDur(min?: number): string | undefined {
  if (!min || min <= 0) return undefined;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}
/** The 2-char airline designator that starts a flight number (BA1314 → BA). */
function airlineCode(flightNumber?: string): string | undefined {
  const n = (flightNumber || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = n.match(/^([A-Z]{2}|[A-Z]\d|\d[A-Z])/);
  return m ? m[1] : undefined;
}
/** Scheduled-vs-actual line under a time: "17:24 · 34m late" (or "on time"). */
function actualInfo(actual?: string, delayMin?: number): { label: string; tint: string } | null {
  if (!actual && delayMin == null) return null;
  const d = delayMin ?? 0;
  const late = d >= 2;
  const early = d <= -2;
  const mag = Math.abs(d);
  const h = Math.floor(mag / 60);
  const m = mag % 60;
  const span = h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
  const status = late ? `${span} late` : early ? `${span} early` : 'on time';
  return { label: actual ? `${actual} · ${status}` : status, tint: late ? COLORS.coral : TEAL };
}

export interface FlightSummaryProps {
  from?: string;
  to?: string;
  airline?: string;
  flightNumber?: string;
  aircraft?: string;
  departTime?: string;
  arriveTime?: string;
  departActual?: string;
  arriveActual?: string;
  fromTerminal?: string;
  toTerminal?: string;
  distanceKm?: number;
  durationMin?: number;
  departDelayMin?: number;
  arriveDelayMin?: number;
  unit: DistanceUnit;
}

/** Renders the boarding-pass summary, or null when there isn't enough to show. */
export function FlightSummaryCard(p: FlightSummaryProps) {
  const [logoOk, setLogoOk] = useState(true);
  const fromCode = iataOf(p.from) ?? (p.from ? cityOf(p.from).slice(0, 3).toUpperCase() : '—');
  const toCode = iataOf(p.to) ?? (p.to ? cityOf(p.to).slice(0, 3).toUpperCase() : '—');
  const hasRoute = !!(p.from || p.to);
  const dur = fmtDur(p.durationMin);
  const depInfo = actualInfo(p.departActual, p.departDelayMin);
  const arrInfo = actualInfo(p.arriveActual, p.arriveDelayMin);
  const dist = p.distanceKm != null ? `${formatDistance(p.distanceKm / KM_PER_MI, p.unit)} ${distanceUnitLabel(p.unit)}` : undefined;
  const code = airlineCode(p.flightNumber);
  const hasFooter = !!dist;

  if (!hasRoute && !p.departTime && !dist) return null;

  return (
    <View className="rounded-3xl" style={{ backgroundColor: '#fff', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(30,107,255,0.14)' }}>
      {/* header */}
      <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 16, paddingTop: 13 }}>
        <View className="flex-row items-center" style={{ gap: 8, flexShrink: 1 }}>
          {code && logoOk ? (
            <Image
              source={{ uri: `https://images.kiwi.com/airlines/128/${code}.png` }}
              onError={() => setLogoOk(false)}
              contentFit="contain"
              style={{ height: 24, width: 24, borderRadius: 6 }}
            />
          ) : (
            <View className="rounded-full items-center justify-center" style={{ height: 24, width: 24, backgroundColor: 'rgba(30,107,255,0.12)' }}>
              <Plane size={13} color={BLUE} />
            </View>
          )}
          <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '800', color: COLORS.navy, flexShrink: 1 }}>
            {p.airline || 'Flight'}{p.flightNumber ? ` · ${p.flightNumber}` : ''}
          </Text>
        </View>
        {p.aircraft ? (
          <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, marginLeft: 8, flexShrink: 0 }}>{p.aircraft}</Text>
        ) : null}
      </View>

      {/* route */}
      <View className="flex-row items-center" style={{ paddingHorizontal: 16, paddingTop: 10, gap: 10 }}>
        <View style={{ alignItems: 'flex-start' }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 30, color: COLORS.navy, lineHeight: 32 }}>{fromCode}</Text>
          <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, maxWidth: 96 }}>{cityOf(p.from) || ' '}</Text>
        </View>
        <View className="flex-row items-center" style={{ flex: 1, gap: 4 }}>
          <View style={{ flex: 1, height: 1, borderBottomWidth: 1.5, borderColor: 'rgba(30,107,255,0.35)', borderStyle: 'dashed' }} />
          <Plane size={15} color={BLUE} style={{ transform: [{ rotate: '90deg' }] }} />
          <View style={{ flex: 1, height: 1, borderBottomWidth: 1.5, borderColor: 'rgba(30,107,255,0.35)', borderStyle: 'dashed' }} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 30, color: COLORS.navy, lineHeight: 32 }}>{toCode}</Text>
          <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, maxWidth: 96, textAlign: 'right' }}>{cityOf(p.to) || ' '}</Text>
        </View>
      </View>

      {/* times: a status label, then scheduled (big), terminal, actual + delay */}
      {p.departTime || p.arriveTime ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 6 }}>
          {(() => {
            const actual = !!(p.departActual || p.arriveActual);
            const tint = actual ? TEAL : COLORS.ink3;
            return (
              <View className="flex-row">
                <View className="rounded-full" style={{ backgroundColor: tint + '1A', paddingHorizontal: 9, paddingVertical: 2 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: tint }}>{actual ? 'ACTUAL' : 'SCHEDULED'}</Text>
                </View>
              </View>
            );
          })()}
          <View className="flex-row items-start justify-between">
          <View style={{ flexShrink: 1 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '800', color: COLORS.navy }}>{p.departTime || '—'}</Text>
            {p.fromTerminal ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, color: COLORS.ink3 }}>Terminal {p.fromTerminal}</Text> : null}
            {depInfo ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: depInfo.tint, marginTop: 2 }}>{depInfo.label}</Text> : null}
          </View>
          {dur ? (
            <View className="rounded-full" style={{ backgroundColor: '#F4F3FB', paddingHorizontal: 10, paddingVertical: 3, marginTop: 3 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.ink2 }}>{dur}</Text>
            </View>
          ) : null}
          <View style={{ alignItems: 'flex-end', flexShrink: 1 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '800', color: COLORS.navy }}>{p.arriveTime || '—'}</Text>
            {p.toTerminal ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, color: COLORS.ink3 }}>Terminal {p.toTerminal}</Text> : null}
            {arrInfo ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: arrInfo.tint, marginTop: 2 }}>{arrInfo.label}</Text> : null}
          </View>
          </View>
        </View>
      ) : null}

      {/* footer: dashed tear line + distance */}
      {hasFooter ? (
        <>
          <View style={{ marginTop: 12, marginHorizontal: 16, borderTopWidth: 1, borderColor: '#EEEDF5', borderStyle: 'dashed' }} />
          <View className="flex-row items-center" style={{ paddingHorizontal: 16, paddingVertical: 11, gap: 6 }}>
            <Plane size={12} color={COLORS.ink3} style={{ transform: [{ rotate: '45deg' }] }} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink2 }}>
              <Text style={{ fontWeight: '700', color: COLORS.navy }}>{dist}</Text> flown
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

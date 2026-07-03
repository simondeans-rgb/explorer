import { View, Text } from 'react-native';
import { Plane } from 'lucide-react-native';
import { COLORS } from '../src/lib/theme';
import { formatDistance, KM_PER_MI, type DistanceUnit } from '../src/lib/units';

// A boarding-pass style summary of a looked-up flight, so the loaded details
// read as one engaging card instead of a stack of fields: airline + number,
// the route in big IATA codes with a plane on a dashed path, scheduled times
// with terminals, and a footer of distance, duration and any delay.
const BLUE = '#1E6BFF';

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
function delayChip(min?: number): { text: string; late: boolean } | undefined {
  if (min == null || Math.abs(min) < 2) return undefined;
  const mag = Math.abs(min);
  const h = Math.floor(mag / 60);
  const m = mag % 60;
  const span = h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
  return { text: `${span} ${min > 0 ? 'late' : 'early'}`, late: min > 0 };
}

export interface FlightSummaryProps {
  from?: string;
  to?: string;
  airline?: string;
  flightNumber?: string;
  aircraft?: string;
  departTime?: string;
  arriveTime?: string;
  fromTerminal?: string;
  toTerminal?: string;
  distanceKm?: number;
  durationMin?: number;
  departDelayMin?: number;
  arriveDelayMin?: number;
  unit: DistanceUnit;
}

/** Renders the boarding-pass summary. Returns null when there isn't enough to
 *  show (so it only appears once a flight has been resolved / looked up). */
export function FlightSummaryCard(p: FlightSummaryProps) {
  const fromCode = iataOf(p.from) ?? (p.from ? cityOf(p.from).slice(0, 3).toUpperCase() : '—');
  const toCode = iataOf(p.to) ?? (p.to ? cityOf(p.to).slice(0, 3).toUpperCase() : '—');
  const hasRoute = !!(p.from || p.to);
  const dur = fmtDur(p.durationMin);
  const dep = delayChip(p.departDelayMin);
  const arr = delayChip(p.arriveDelayMin);
  const dist = p.distanceKm != null ? formatDistance(p.distanceKm / KM_PER_MI, p.unit) : undefined;
  const hasFooter = !!(dist || dep || arr);

  if (!hasRoute && !p.departTime && !hasFooter) return null;

  return (
    <View className="rounded-3xl" style={{ backgroundColor: '#fff', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(30,107,255,0.14)' }}>
      {/* header */}
      <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 16, paddingTop: 13 }}>
        <View className="flex-row items-center" style={{ gap: 7, flexShrink: 1 }}>
          <View className="rounded-full items-center justify-center" style={{ height: 22, width: 22, backgroundColor: 'rgba(30,107,255,0.12)' }}>
            <Plane size={12} color={BLUE} />
          </View>
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

      {/* times */}
      {p.departTime || p.arriveTime ? (
        <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <View>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '800', color: COLORS.navy }}>{p.departTime || '—'}</Text>
            {p.fromTerminal ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, color: COLORS.ink3 }}>Terminal {p.fromTerminal}</Text> : null}
          </View>
          {dur ? (
            <View className="rounded-full" style={{ backgroundColor: '#F4F3FB', paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.ink2 }}>{dur}</Text>
            </View>
          ) : null}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '800', color: COLORS.navy }}>{p.arriveTime || '—'}</Text>
            {p.toTerminal ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 10, color: COLORS.ink3 }}>Terminal {p.toTerminal}</Text> : null}
          </View>
        </View>
      ) : null}

      {/* footer: dashed tear line + distance & delays */}
      {hasFooter ? (
        <>
          <View style={{ marginTop: 12, marginHorizontal: 16, borderTopWidth: 1, borderColor: '#EEEDF5', borderStyle: 'dashed' }} />
          <View className="flex-row items-center justify-between flex-wrap" style={{ paddingHorizontal: 16, paddingVertical: 11, gap: 6 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink2 }}>
              {dist ? <Text style={{ fontWeight: '700', color: COLORS.navy }}>{dist}</Text> : ' '}
            </Text>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              {([['Dep', dep], ['Arr', arr]] as const).map(([lbl, chip]) =>
                chip ? (
                  <View key={lbl} className="rounded-full" style={{ paddingHorizontal: 9, paddingVertical: 3, backgroundColor: (chip.late ? COLORS.coral : '#00A88E') + '1A' }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: chip.late ? COLORS.coral : '#00A88E' }}>{lbl} {chip.text}</Text>
                  </View>
                ) : null,
              )}
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

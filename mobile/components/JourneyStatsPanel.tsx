import { useMemo, useState, memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Svg, { Rect, Line, Polyline, Circle, Text as SvgText } from 'react-native-svg';
import { Plane, TrainFront, Ship, Car, Anchor, Globe2, Moon, ArrowRight, Clock, Timer, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { shouldGate } from '../src/lib/billing';
import type { ComponentType } from 'react';
import type { JourneyMode } from '../src/types';
import { COLORS, SHADOW } from '../src/lib/theme';
import {
  computeTravelStats,
  EARTH_CIRCUMFERENCE_MI,
  MOON_DISTANCE_MI,
  LONDON_NY_MI,
  type TravelStats,
} from '../src/lib/travelStats';
import type { Expedition } from '../src/types';
import { useUnits } from '../src/store/units';
import { convertMiles, distanceUnitLabel, type DistanceUnit } from '../src/lib/units';

const group = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Minutes → "3d 11h" / "13h 5m" / "45m" for the time-in-air headline. */
function fmtAir(min: number): string {
  if (min <= 0) return '0h';
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const MODE_ICON: Record<JourneyMode, ComponentType<{ size?: number; color?: string }>> = {
  flight: Plane,
  rail: TrainFront,
  cruise: Ship,
  road: Car,
  ferry: Anchor,
};
const MODE_LABEL: Record<JourneyMode, string> = {
  flight: 'Flights',
  rail: 'Rail',
  cruise: 'Cruise',
  road: 'Road',
  ferry: 'Ferry',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Gran = 'year' | 'month' | 'weekday';

/** A compact bar/line chart drawn with react-native-svg, sized to its width. */
function Chart({ values, labels, kind, width, partialLast }: { values: number[]; labels: string[]; kind: 'line' | 'bar'; width: number; partialLast?: boolean }) {
  const H = 150;
  const padL = 26;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const innerW = Math.max(1, width - padL - padR);
  const innerH = H - padT - padB;
  const max = Math.max(1, ...values);
  // Nice round top gridline.
  const niceMax = max <= 5 ? 5 : max <= 10 ? 10 : Math.ceil(max / 10) * 10;
  const n = values.length;
  const x = (i: number) => padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const xBand = (i: number) => padL + (i + 0.5) * (innerW / Math.max(1, n));
  const y = (v: number) => padT + innerH - (v / niceMax) * innerH;
  const gridYs = [0, niceMax / 2, niceMax];

  // For dense month/year axes, thin the labels so they don't overlap.
  const labelEvery = n > 9 ? 2 : 1;

  return (
    <Svg width={width} height={H}>
      {gridYs.map((g, i) => (
        <Line key={i} x1={padL} y1={y(g)} x2={width - padR} y2={y(g)} stroke={COLORS.tileMuted} strokeWidth={1} />
      ))}
      {gridYs.map((g, i) => (
        <SvgText key={`l${i}`} x={padL - 6} y={y(g) + 3} fontSize={9} fill={COLORS.ink3} textAnchor="end">
          {Math.round(g)}
        </SvgText>
      ))}
      {kind === 'bar'
        ? values.map((v, i) => {
            const bw = (innerW / n) * 0.6;
            const cx = xBand(i);
            const bh = (v / niceMax) * innerH;
            return <Rect key={i} x={cx - bw / 2} y={padT + innerH - bh} width={bw} height={Math.max(0, bh)} rx={3} fill={COLORS.lavender} />;
          })
        : (
          <>
            {/* solid line through completed points; the current (partial) year
                is drawn with a dashed lead-in + a hollow dot so it doesn't read
                as a real drop-off. */}
            <Polyline points={values.slice(0, partialLast && n > 1 ? n - 1 : n).map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={COLORS.lavender} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {partialLast && n > 1 ? (
              <Line x1={x(n - 2)} y1={y(values[n - 2])} x2={x(n - 1)} y2={y(values[n - 1])} stroke={COLORS.lavender} strokeWidth={2.5} strokeDasharray="4 4" strokeLinecap="round" />
            ) : null}
            {values.map((v, i) => {
              const partial = partialLast && i === n - 1;
              return <Circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill="#fff" stroke={partial ? COLORS.ink3 : COLORS.lavender} strokeWidth={2} />;
            })}
            {partialLast && n > 0 ? (
              <SvgText x={x(n - 1)} y={y(values[n - 1]) - 8} fontSize={8.5} fill={COLORS.ink3} textAnchor="middle">so far</SvgText>
            ) : null}
          </>
        )}
      {labels.map((lab, i) => {
        // Always label the last point (the in-progress year); when thinning,
        // drop its neighbour instead so the two never collide.
        const isLast = i === n - 1;
        const drawn = isLast || (i % labelEvery === 0 && !(labelEvery > 1 && i === n - 2));
        return drawn ? (
          <SvgText key={`x${i}`} x={kind === 'bar' ? xBand(i) : x(i)} y={H - 6} fontSize={9} fill={COLORS.ink3} textAnchor="middle">
            {lab}
          </SvgText>
        ) : null;
      })}
    </Svg>
  );
}

/** One "× around Earth / to the Moon" comparison row with a proportional bar. */
function CompareRow({ Icon, tint, multiple, label, frac }: { Icon: ComponentType<{ size?: number; color?: string }>; tint: string; multiple: number; label: string; frac: number }) {
  const fmt = multiple >= 10 ? Math.round(multiple).toString() : multiple >= 1 ? multiple.toFixed(1) : multiple.toFixed(2);
  return (
    <View className="flex-row items-center" style={{ gap: 10 }}>
      <View className="rounded-full items-center justify-center" style={{ height: 30, width: 30, backgroundColor: tint + '22' }}>
        <Icon size={16} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <View className="rounded-full" style={{ height: 26, backgroundColor: COLORS.tileMuted, overflow: 'hidden', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(6, Math.min(100, frac * 100))}%`, backgroundColor: tint + '33', borderRadius: 999 }} />
          <Text style={{ marginLeft: 12, fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink2 }}>
            <Text style={{ fontWeight: '800', color: COLORS.ink }}>{fmt}×</Text> {label}
          </Text>
        </View>
      </View>
    </View>
  );
}

function ExtremeRow({ title, f, unit }: { title: string; f: { from: string; to: string; mi: number; date?: string }; unit: DistanceUnit }) {
  return (
    <View className="flex-row items-center" style={{ gap: 8 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, fontWeight: '700' }}>{title}</Text>
        <View className="flex-row items-center" style={{ gap: 5, marginTop: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.ink, flexShrink: 1 }}>{f.from || '—'}</Text>
          <ArrowRight size={12} color={COLORS.ink3} />
          <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.ink, flexShrink: 1 }}>{f.to || '—'}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 15, color: COLORS.navy }}>{group(convertMiles(f.mi, unit))} <Text style={{ fontSize: 11, color: COLORS.ink3 }}>{distanceUnitLabel(unit)}</Text></Text>
    </View>
  );
}

function Segmented({ value, onChange }: { value: Gran; onChange: (g: Gran) => void }) {
  const opts: { id: Gran; label: string }[] = [
    { id: 'year', label: 'Year' },
    { id: 'month', label: 'Month' },
    { id: 'weekday', label: 'Weekday' },
  ];
  return (
    <View className="flex-row rounded-full" style={{ backgroundColor: COLORS.tileMuted, padding: 3 }}>
      {opts.map((o) => {
        const active = value === o.id;
        return (
          <Pressable key={o.id} onPress={() => onChange(o.id)} style={{ flex: 1, paddingVertical: 6, borderRadius: 999, backgroundColor: active ? '#fff' : 'transparent', ...(active ? SHADOW.card : null) }}>
            <Text style={{ textAlign: 'center', fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: active ? COLORS.navySolid : COLORS.ink3 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A ranked list (airlines / aircraft) with a proportional bar behind each row. */
function RankBlock({ title, rows, tint }: { title: string; rows: { label: string; count: number }[]; tint: string }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: COLORS.ink3 }}>{title}</Text>
      {rows.map((r) => (
        <View key={r.label} className="rounded-xl" style={{ height: 30, backgroundColor: COLORS.tileMuted, overflow: 'hidden', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(8, (r.count / max) * 100)}%`, backgroundColor: tint + '2E' }} />
          <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 11 }}>
            <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.ink, flexShrink: 1 }}>{r.label}</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink2, marginLeft: 8 }}>
              <Text style={{ fontWeight: '800', color: COLORS.navy }}>{r.count}</Text> {r.count === 1 ? 'flight' : 'flights'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** One airline punctuality row: average delay + on-time rate. */
function PunctRow({ p, label }: { p: { airline: string; avgDelayMin: number; onTimeRate: number; samples: number }; label: string }) {
  const late = p.avgDelayMin >= 2;
  const early = p.avgDelayMin <= -2;
  const tint = late ? COLORS.coral : COLORS.aqua;
  const avg = Math.abs(p.avgDelayMin);
  const avgText = avg < 2 ? 'on time' : `${avg}m ${late ? 'late' : 'early'} avg`;
  return (
    <View className="flex-row items-center" style={{ gap: 8 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, fontWeight: '700' }}>{label}</Text>
        <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.navy }}>{p.airline}</Text>
      </View>
      <View className="items-end">
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '800', color: early || !late ? COLORS.aqua : tint }}>{avgText}</Text>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3 }}>{Math.round(p.onTimeRate * 100)}% on time · {p.samples} flight{p.samples === 1 ? '' : 's'}</Text>
      </View>
    </View>
  );
}

/** The Flighty-style stats block shown under the Journeys globe: flight counts,
 *  a per-year/month/weekday chart, distance flown with cosmic comparisons, the
 *  longest/shortest flight, and a tally of every other way you've travelled. */
function JourneyStatsPanelInner({ expeditions }: { expeditions: Expedition[] }) {
  const stats: TravelStats = useMemo(() => computeTravelStats(expeditions), [expeditions]);
  const { unit } = useUnits();
  const [gran, setGran] = useState<Gran>(stats.yearsCovered.length > 1 ? 'year' : 'month');
  const [chartW, setChartW] = useState(0);

  const { flights, distanceMi } = stats;
  const otherModes = (Object.keys(stats.modeCounts) as JourneyMode[]).filter((m) => m !== 'flight' && stats.modeCounts[m] > 0);

  // Nothing to show if there are no flights and no other legs.
  if (stats.totalLegs === 0) return null;

  const currentYear = new Date().getFullYear();
  const chart = (() => {
    if (gran === 'month') return { values: stats.perMonth, labels: MONTHS, kind: 'bar' as const, partialLast: false };
    if (gran === 'weekday') return { values: stats.perWeekday, labels: WEEKDAYS, kind: 'bar' as const, partialLast: false };
    const py = stats.perYear;
    return {
      values: py.map((p) => p.count),
      labels: py.map((p) => p.label),
      kind: 'line' as const,
      partialLast: py.length > 0 && py[py.length - 1].label === String(currentYear),
    };
  })();
  const hasChartData = chart.values.some((v) => v > 0);
  const chartsGated = shouldGate('charts');

  const earthX = distanceMi / EARTH_CIRCUMFERENCE_MI;
  const moonX = distanceMi / MOON_DISTANCE_MI;
  const lnyX = distanceMi / LONDON_NY_MI;
  const maxX = Math.max(earthX, moonX, lnyX, 0.0001);

  return (
    <View style={{ gap: 12 }}>
      {/* Flights + chart */}
      {flights.total > 0 ? (
        <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 16, ...SHADOW.card }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: COLORS.ink3 }}>FLIGHTS</Text>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 44, color: COLORS.navy, lineHeight: 50 }}>{group(flights.total)}</Text>
          <View className="flex-row" style={{ flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {([
              ['domestic', flights.domestic],
              ['international', flights.international],
              ['long-haul', flights.longHaul],
              ['airports', stats.airports],
              ['airlines', stats.airlines],
            ] as [string, number][]).filter(([, v]) => v > 0).map(([label, v]) => (
              <View key={label} className="flex-row items-baseline rounded-full" style={{ backgroundColor: COLORS.tileMuted, paddingHorizontal: 10, paddingVertical: 4, gap: 4 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '800', color: COLORS.navy }}>{v}</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{v === 1 ? label.replace(/s$/, '') : label}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: COLORS.ink3, marginBottom: 8 }}>FLIGHTS PER {gran.toUpperCase()}</Text>
            <Segmented value={gran} onChange={setGran} />
          </View>
          <View onLayout={(e) => setChartW(e.nativeEvent.layout.width)}>
            {chartW > 0 ? (
              chartsGated ? (
                // Paywall trigger — the chart is visible but frosted for
                // Wanderers. Inert (never rendered) until billing goes live.
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Unlock all flight charts with Explorer"
                  onPress={() => router.push('/upgrade?trigger=charts')}
                  className="items-center justify-center rounded-2xl"
                  style={{ height: 150, backgroundColor: 'rgba(155,124,255,0.08)', gap: 6 }}
                >
                  <Lock size={18} color={COLORS.lavender} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: COLORS.navy }}>Every year of your flying life</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, color: COLORS.ink3 }}>Unlock the full dashboard with Explorer</Text>
                </Pressable>
              ) : hasChartData ? (
                <Chart values={chart.values} labels={chart.labels} kind={chart.kind} width={chartW} partialLast={chart.partialLast} />
              ) : (
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, textAlign: 'center', paddingVertical: 24 }}>
                  Add dates to your flights to see this chart.
                </Text>
              )
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Distance flown + cosmic comparisons */}
      {distanceMi > 0 ? (
        <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 16, ...SHADOW.card }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: COLORS.ink3 }}>DISTANCE FLOWN</Text>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 40, color: COLORS.navy, lineHeight: 46 }}>
            {group(convertMiles(distanceMi, unit))} <Text style={{ fontSize: 20, color: COLORS.ink3 }}>{distanceUnitLabel(unit)}</Text>
          </Text>
          {stats.avgFlightMi > 0 ? (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginBottom: 12 }}>Average flight: {group(convertMiles(stats.avgFlightMi, unit))} {distanceUnitLabel(unit)}</Text>
          ) : <View style={{ height: 8 }} />}
          <View style={{ gap: 8 }}>
            <CompareRow Icon={Globe2} tint={COLORS.aqua} multiple={earthX} frac={earthX / maxX} label="around the Earth" />
            <CompareRow Icon={Plane} tint={COLORS.sunburst} multiple={lnyX} frac={lnyX / maxX} label="London → New York" />
            <CompareRow Icon={Moon} tint={COLORS.lavender} multiple={moonX} frac={moonX / maxX} label="to the Moon" />
          </View>

          {stats.longest || stats.shortest ? (
            <View style={{ gap: 12, marginTop: 16, borderTopWidth: 1, borderTopColor: COLORS.tileMuted, paddingTop: 14 }}>
              {stats.longest ? <ExtremeRow title="LONGEST FLIGHT" f={stats.longest} unit={unit} /> : null}
              {stats.shortest && stats.shortest !== stats.longest ? <ExtremeRow title="SHORTEST FLIGHT" f={stats.shortest} unit={unit} /> : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Trends — time in the air, favourite aircraft & airlines, punctuality */}
      {flights.total > 0 && (stats.timeInAirMin > 0 || stats.topAircraft.length > 0 || stats.topAirlines.length > 0) ? (
        <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 16, gap: 16, ...SHADOW.card }}>
          {stats.timeInAirMin > 0 ? (
            <View>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <Clock size={13} color={COLORS.ink3} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: COLORS.ink3 }}>TIME IN THE AIR</Text>
              </View>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 40, color: COLORS.navy, lineHeight: 46 }}>{fmtAir(stats.timeInAirMin)}</Text>
              {stats.timeInAirEstimated ? (
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3 }}>Estimated where flight times aren’t known.</Text>
              ) : null}
            </View>
          ) : null}

          {stats.topAirlines.length > 0 ? (
            <RankBlock title="TOP AIRLINES" rows={stats.topAirlines} tint={COLORS.lavender} />
          ) : null}
          {stats.topAircraft.length > 0 ? (
            <RankBlock title="TOP AIRCRAFT" rows={stats.topAircraft} tint={COLORS.lavender} />
          ) : null}

          {stats.punctuality.length > 0 || stats.totalDelayMin > 0 ? (
            <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: COLORS.tileMuted, paddingTop: 14 }}>
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <Timer size={13} color={COLORS.ink3} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: COLORS.ink3 }}>PUNCTUALITY</Text>
              </View>
              {stats.totalDelayMin > 0 ? (
                <View className="flex-row items-center justify-between rounded-2xl" style={{ backgroundColor: 'rgba(255,107,154,0.08)', paddingHorizontal: 12, paddingVertical: 9 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.ink2 }}>Time lost to delays</Text>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.coral }}>{fmtAir(stats.totalDelayMin)}</Text>
                </View>
              ) : null}
              {stats.punctuality.slice(0, 1).map((p) => (
                <PunctRow key={`best-${p.airline}`} p={p} label="Most on time" />
              ))}
              {stats.punctuality.length > 1 ? (
                <PunctRow key="worst" p={stats.punctuality[stats.punctuality.length - 1]} label="Most delayed" />
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Every other way you've travelled */}
      {otherModes.length > 0 ? (
        <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 16, ...SHADOW.card }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: COLORS.ink3, marginBottom: 12 }}>OTHER JOURNEYS</Text>
          <View className="flex-row" style={{ flexWrap: 'wrap', gap: 10 }}>
            {otherModes.map((m) => {
              const Icon = MODE_ICON[m];
              return (
                <View key={m} className="flex-row items-center rounded-2xl" style={{ backgroundColor: COLORS.tileMuted, paddingHorizontal: 14, paddingVertical: 10, gap: 9, minWidth: 104 }}>
                  <View className="rounded-full items-center justify-center" style={{ height: 32, width: 32, backgroundColor: COLORS.card, ...SHADOW.card }}>
                    <Icon size={16} color={COLORS.lavender} />
                  </View>
                  <View>
                    <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, lineHeight: 22 }}>{stats.modeCounts[m]}</Text>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3 }}>{MODE_LABEL[m]}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Heavy SVG — memoised so parent re-renders (frequent, via the global data
 *  context) don't redraw every path unless the inputs actually changed. */
export const JourneyStatsPanel = memo(JourneyStatsPanelInner);

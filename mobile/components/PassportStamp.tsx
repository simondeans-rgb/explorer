import { View } from 'react-native';
import Svg, { Path, Circle, Ellipse, Rect, Line, Text as SvgText } from 'react-native-svg';
import { countryName, alpha3Of } from '../src/data/countries';
import type { Place } from '../src/types';
import type { CountryAggregate } from '../src/lib/stats';

// Classic passport-ink colors — one is picked deterministically per country.
const INKS = ['#B23A48', '#23456B', '#2E6E4E', '#1A7F8C', '#6D3B9E', '#A1521E'];
const BASE_OP = 0.74; // weathered, translucent ink

type Corner = 'top-right' | 'top-left' | 'center';

/** Deterministic FNV-1a hash so a country's stamp is identical everywhere. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** First city entered (earliest by date), else null. */
function firstCity(cities: Place[]): Place | null {
  const visited = cities.filter((c) => c.relationships.some((r) => r !== 'aspiring'));
  if (!visited.length) return null;
  const key = (p: Place) => p.firstDate ?? (p.firstYear ? `${p.firstYear}` : '9999') ;
  return [...visited].sort((a, b) => key(a).localeCompare(key(b)) || a.name.localeCompare(b.name))[0];
}

/** A 5-point star path centred at (cx, cy). */
function star5(cx: number, cy: number, r: number): string {
  let d = '';
  for (let i = 0; i < 5; i++) {
    const ao = ((-90 + i * 72) * Math.PI) / 180;
    const ai = ((-90 + i * 72 + 36) * Math.PI) / 180;
    const xo = cx + r * Math.cos(ao);
    const yo = cy + r * Math.sin(ao);
    const xi = cx + r * 0.42 * Math.cos(ai);
    const yi = cy + r * 0.42 * Math.sin(ai);
    d += `${i ? 'L' : 'M'}${xo.toFixed(1)} ${yo.toFixed(1)} L${xi.toFixed(1)} ${yi.toFixed(1)} `;
  }
  return d + 'Z';
}

/** A scalloped (petal-edged) ring path. */
function scallop(cx: number, cy: number, r: number, n: number, bump: number): string {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI;
    const a1 = ((i + 0.5) / n) * 2 * Math.PI;
    const a2 = ((i + 1) / n) * 2 * Math.PI;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const xm = cx + (r + bump) * Math.cos(a1);
    const ym = cy + (r + bump) * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    d += `${i ? '' : `M${x0.toFixed(1)} ${y0.toFixed(1)} `}Q${xm.toFixed(1)} ${ym.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} `;
  }
  return d + 'Z';
}

/** Lay a string of glyphs along a circular arc (top arc, reads left→right). */
function arcText(text: string, cx: number, cy: number, r: number, startDeg: number, endDeg: number, fontSize: number, fill: string, op: number) {
  const chars = [...text];
  const n = chars.length;
  return chars.map((ch, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const a = startDeg + (endDeg - startDeg) * t;
    const rad = (a * Math.PI) / 180;
    const x = cx + r * Math.sin(rad);
    const y = cy - r * Math.cos(rad);
    return (
      <SvgText key={i} x={x} y={y} fill={fill} opacity={op} fontSize={fontSize} fontWeight="bold" textAnchor="middle" dy={fontSize * 0.34} transform={`rotate(${a.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`}>
        {ch}
      </SvgText>
    );
  });
}

/** Render one of five passport-stamp designs into a 0–100 viewBox. */
function design(idx: number, label: string, alpha3: string, year: string, ink: string) {
  const op = BASE_OP;
  const arcLabel = label.length > 10 ? alpha3 : label;
  const flatLabel = label.length > 13 ? alpha3 : label;
  const arcFont = Math.max(6, Math.min(9, Math.floor(70 / Math.max(arcLabel.length, 1))));
  const flatFont = Math.max(7, Math.min(13, Math.floor(132 / Math.max(flatLabel.length, 1))));
  const txt = (x: number, y: number, s: string, fs: number, ls = 0) => (
    <SvgText x={x} y={y} fill={ink} opacity={op} fontSize={fs} fontWeight="bold" textAnchor="middle" letterSpacing={ls}>{s}</SvgText>
  );

  switch (idx % 5) {
    case 0: // round date stamp
      return (
        <>
          <Circle cx={50} cy={50} r={45} stroke={ink} strokeWidth={2.4} fill="none" opacity={op} />
          <Circle cx={50} cy={50} r={37} stroke={ink} strokeWidth={1} fill="none" opacity={op} />
          {arcText(arcLabel, 50, 50, 41, -66, 66, arcFont, ink, op)}
          {year ? txt(50, 55, year, 14) : null}
          <Path d={star5(33, 50, 3)} fill={ink} opacity={op} />
          <Path d={star5(67, 50, 3)} fill={ink} opacity={op} />
          {[...Array(12)].map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <Line key={i} x1={50 + 33 * Math.sin(a)} y1={50 - 33 * Math.cos(a)} x2={50 + 37 * Math.sin(a)} y2={50 - 37 * Math.cos(a)} stroke={ink} strokeWidth={0.7} opacity={op * 0.8} />;
          })}
        </>
      );
    case 1: // rounded-rectangle admission stamp
      return (
        <>
          <Rect x={8} y={26} width={84} height={48} rx={9} ry={9} stroke={ink} strokeWidth={2.2} fill="none" opacity={op} />
          <Rect x={12} y={30} width={76} height={40} rx={6} ry={6} stroke={ink} strokeWidth={0.8} fill="none" opacity={op} />
          {txt(50, 41, 'ARRIVED', 7, 2)}
          {txt(50, 41 + flatFont + 4, flatLabel, flatFont)}
          {year ? txt(50, 66, year, 10, 1) : null}
        </>
      );
    case 2: // oval stamp
      return (
        <>
          <Ellipse cx={50} cy={50} rx={46} ry={31} stroke={ink} strokeWidth={2.2} fill="none" opacity={op} />
          <Ellipse cx={50} cy={50} rx={40} ry={25} stroke={ink} strokeWidth={0.8} fill="none" opacity={op} />
          {txt(50, 49, flatLabel, flatFont)}
          {year ? txt(50, 63, year, 10, 1) : null}
          <Path d={star5(50, 35, 2.4)} fill={ink} opacity={op} />
        </>
      );
    case 3: // triangle stamp
      return (
        <>
          <Path d="M50 12 L90 80 L10 80 Z" stroke={ink} strokeWidth={2.2} fill="none" strokeLinejoin="round" opacity={op} />
          <Path d="M50 22 L80 75 L20 75 Z" stroke={ink} strokeWidth={0.8} fill="none" strokeLinejoin="round" opacity={op} />
          {txt(50, 45, 'ADMITTED', 6, 1.5)}
          {txt(50, 45 + Math.min(flatFont, 11) + 3, label.length > 10 ? alpha3 : label, Math.min(flatFont, 11))}
          {year ? txt(50, 71, year, 9, 1) : null}
        </>
      );
    default: // scalloped seal
      return (
        <>
          <Path d={scallop(50, 50, 40, 14, 3.2)} stroke={ink} strokeWidth={1.6} fill="none" opacity={op} />
          <Circle cx={50} cy={50} r={31} stroke={ink} strokeWidth={1.6} fill="none" opacity={op} />
          {arcText(arcLabel, 50, 50, 35, -64, 64, arcFont, ink, op)}
          {year ? txt(50, 54, year, 13) : null}
          <Path d={star5(50, 68, 3) } fill={ink} opacity={op} />
        </>
      );
  }
}

/** A weathered passport stamp overlaid on a visited country's photo card.
 *  Deterministic per country code (same design/color/angle/position everywhere). */
export function PassportStamp({ aggregate, size, corner = 'top-right' }: { aggregate: CountryAggregate; size: number; corner?: Corner }) {
  if (!aggregate.discovered) return null;

  const city = firstCity(aggregate.cities);
  const rawLabel = city?.name ?? countryName(aggregate.code);
  const label = rawLabel.toUpperCase();
  const alpha3 = alpha3Of(aggregate.code).toUpperCase();
  const yearNum = city?.firstYear ?? (city?.firstDate ? Number(city.firstDate.slice(0, 4)) : undefined) ?? aggregate.firstYear;
  const year = yearNum ? String(yearNum) : '';

  const seed = hash32(aggregate.code);
  const idx = seed % 5;
  const ink = INKS[(seed >>> 3) % INKS.length];
  const rotation = ((seed >>> 6) % 25) - 12; // −12°…+12°
  const jx = ((seed >>> 11) % 14) - 7;
  const jy = ((seed >>> 15) % 14) - 7;

  const pos =
    corner === 'center'
      ? { top: '50%' as const, left: '50%' as const, marginTop: -size / 2 + jy, marginLeft: -size / 2 + jx }
      : corner === 'top-left'
        ? { top: 8 + jy, left: 6 + jx }
        : { top: 8 + jy, right: 6 + jx };

  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, transform: [{ rotate: `${rotation}deg` }], ...pos }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {design(idx, label, alpha3, year, ink)}
      </Svg>
    </View>
  );
}

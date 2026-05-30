import { alpha3Of } from '../../data/countries';
import type { StampKind } from '../../types';

// Passport stamps follow the Brand Book §07 system: a stamped tile carrying the
// country name, its ISO-3 code, the year, and the relationship — coloured from
// the Navigator / Cartographer palettes by stamp type.
interface StampStyle {
  bg: string;
  accent: string;
  code: string; // colour of the large ISO-3 code
  status: string;
}

const STAMP_STYLE: Record<StampKind, StampStyle> = {
  discovery: { bg: '#0D1B2E', accent: '#C9A84C', code: '#F8F4EC', status: 'Discovered' },
  residency: { bg: '#5C1A28', accent: '#D4955A', code: '#F0E8DC', status: 'Lived' },
  work: { bg: '#2A4568', accent: '#E8C97A', code: '#F8F4EC', status: 'Worked' },
  study: { bg: '#1C3A2C', accent: '#7EC8A0', code: '#F8F4EC', status: 'Studied' },
};

export function Stamp({
  kind,
  code,
  year,
  seed = 0,
}: {
  kind: StampKind;
  code: string;
  year?: number;
  seed?: number;
}) {
  const s = STAMP_STYLE[kind];
  const rotate = ((seed % 5) - 2) * 3;
  return (
    <span
      title={`${s.status} · ${alpha3Of(code)}`}
      style={{ backgroundColor: s.bg, rotate: `${rotate}deg` }}
      className="relative inline-flex h-[84px] w-[84px] flex-col items-center justify-center gap-0.5 rounded-md select-none"
    >
      <span
        className="absolute inset-[6px] rounded border-[1.5px] border-dashed"
        style={{ borderColor: s.accent, opacity: 0.4 }}
      />
      <span
        className="relative z-10 text-[7.5px] font-medium uppercase tracking-[0.16em]"
        style={{ color: s.accent }}
      >
        {s.status}
      </span>
      <span
        className="relative z-10 font-display text-xl font-semibold leading-none"
        style={{ color: s.code }}
      >
        {alpha3Of(code)}
      </span>
      <span
        className="relative z-10 text-[8px]"
        style={{ color: s.accent, opacity: 0.8 }}
      >
        {year ?? '—'}
      </span>
    </span>
  );
}

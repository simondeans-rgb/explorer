import { View } from 'react-native';
import { Dropdown, type DropdownOption } from './Dropdown';

// A tap-to-pick date: three wheel-style dropdowns (year / month / day) instead
// of a free-text field, so dates are never typed. Value is an ISO string
// (`YYYY`, `YYYY-MM`, or `YYYY-MM-DD`) and each part is optional — pick as much
// precision as you have. Pure JS (ships over-the-air), consistent with the trip
// and place date pickers elsewhere.

const THIS_YEAR = new Date().getFullYear();
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEAR_OPTS: DropdownOption[] = Array.from({ length: 96 }, (_, i) => ({ label: String(THIS_YEAR - i), value: THIS_YEAR - i }));
const MONTH_OPTS: DropdownOption[] = MONTHS.map((m, i) => ({ label: m, value: i }));
const DAY_OPTS: DropdownOption[] = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: i + 1 }));

/** Build an ISO date from optional year / month (0-based) / day parts. */
function isoFrom(year: number | null, month: number | null, day: number | null): string {
  if (!year) return '';
  if (month == null) return `${year}`;
  const mm = String(month + 1).padStart(2, '0');
  if (!day) return `${year}-${mm}`;
  return `${year}-${mm}-${String(day).padStart(2, '0')}`;
}
/** Split an ISO date into year / month (0-based) / day parts. */
function partsOf(iso?: string): { y: number | null; m: number | null; d: number | null } {
  if (!iso) return { y: null, m: null, d: null };
  const [y, m, d] = iso.split('-').map(Number);
  return { y: y || null, m: m ? m - 1 : null, d: d || null };
}

export function DateField({ value, onChange, label }: { value: string; onChange: (iso: string) => void; label?: string }) {
  const { y, m, d } = partsOf(value);
  const t = (part: string) => (label ? `${label} · ${part}` : part);
  return (
    <View className="flex-row" style={{ gap: 8 }}>
      <Dropdown placeholder="Year" title={t('year')} value={y} options={YEAR_OPTS} onSelect={(v) => onChange(isoFrom(v, m, d))} flex={1.2} />
      <Dropdown placeholder="Month" title={t('month')} value={m} options={MONTH_OPTS} onSelect={(v) => onChange(isoFrom(y, v, d))} flex={1.2} />
      <Dropdown placeholder="Day" title={t('day')} value={d} options={DAY_OPTS} onSelect={(v) => onChange(isoFrom(y, m, v))} flex={1} />
    </View>
  );
}

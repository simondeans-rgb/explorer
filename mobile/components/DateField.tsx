import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS, SHADOW } from '../src/lib/theme';

// A tap-to-pick calendar date field: shows the chosen date and opens a month
// calendar to pick a day — no typing, no separate year/month/day inputs.
// Tapping the "March 2026" header steps up to a month grid, then a year grid,
// so any year is a couple of taps away. With `allowPartial`, a date can also
// be saved at year or month precision ("2015", "June 2015") for old memories.
// Value is ISO: `YYYY`, `YYYY-MM` (partial) or `YYYY-MM-DD`. Pure JS (OTA-safe).

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
function parseISO(v?: string): { y: number; m?: number; d?: number } | null {
  const mm = (v || '').match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!mm) return null;
  return { y: +mm[1], m: mm[2] ? +mm[2] - 1 : undefined, d: mm[3] ? +mm[3] : undefined };
}
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
function pretty(v?: string): string | null {
  const p = parseISO(v);
  if (!p) return null;
  if (p.m === undefined) return String(p.y);
  if (p.d === undefined) return `${MONTHS[p.m]} ${p.y}`;
  return `${MONTHS[p.m]} ${ordinal(p.d)}, ${p.y}`;
}

type Mode = 'days' | 'months' | 'years';

export function DateField({
  value,
  onChange,
  label,
  allowPartial,
}: {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  /** Allow saving at year / month precision (for "sometime in 2015" memories). */
  allowPartial?: boolean;
}) {
  const sel = parseISO(value);
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('days');
  const [viewY, setViewY] = useState(sel ? sel.y : now.getFullYear());
  const [viewM, setViewM] = useState(sel?.m ?? now.getMonth());

  function openCal() {
    if (sel) {
      setViewY(sel.y);
      setViewM(sel.m ?? now.getMonth());
    }
    setMode(sel && sel.m === undefined ? 'years' : 'days');
    setOpen(true);
  }
  function shift(delta: number) {
    if (mode === 'years') {
      setViewY(viewY + delta * 12);
      return;
    }
    if (mode === 'months') {
      setViewY(viewY + delta);
      return;
    }
    let m = viewM + delta;
    let y = viewY;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewM(m);
    setViewY(y);
  }
  function pick(y: number, m: number, d: number) {
    onChange(isoOf(y, m, d));
    setOpen(false);
  }
  function done(v: string) {
    onChange(v);
    setOpen(false);
  }

  // Build a 6×7 grid including trailing days from the adjacent months.
  const firstDow = new Date(viewY, viewM, 1).getDay();
  const daysThis = new Date(viewY, viewM + 1, 0).getDate();
  const daysPrev = new Date(viewY, viewM, 0).getDate();
  const cells: { y: number; m: number; d: number; inMonth: boolean }[] = [];
  for (let i = 0; i < firstDow; i++) {
    const d = daysPrev - firstDow + 1 + i;
    cells.push({ y: viewM === 0 ? viewY - 1 : viewY, m: (viewM + 11) % 12, d, inMonth: false });
  }
  for (let d = 1; d <= daysThis; d++) cells.push({ y: viewY, m: viewM, d, inMonth: true });
  let nd = 1;
  while (cells.length % 7 !== 0 || cells.length < 42) {
    cells.push({ y: viewM === 11 ? viewY + 1 : viewY, m: (viewM + 1) % 12, d: nd++, inMonth: false });
    if (cells.length >= 42) break;
  }

  // 12-year page centred so the view year is in it.
  const yearBase = viewY - ((viewY % 12) + 12) % 12;
  const years = Array.from({ length: 12 }, (_, i) => yearBase + i);

  const fieldLabel = pretty(value) ?? (value || (label ?? 'Select date'));
  const headerLabel = mode === 'years' ? `${years[0]} – ${years[11]}` : mode === 'months' ? String(viewY) : `${MONTHS[viewM]} ${viewY}`;

  const cellTxt = { fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '600' as const };

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={pretty(value) ? `Date: ${pretty(value)}` : (label ?? 'Select date')} onPress={openCal} className="bg-white rounded-2xl flex-row items-center" style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 9, ...SHADOW.card }}>
        <CalendarIcon size={17} color={COLORS.ink3} />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '600', color: pretty(value) ? COLORS.ink : COLORS.ink3, flex: 1 }}>{fieldLabel}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(14,16,24,0.45)', alignItems: 'center', justifyContent: 'center', padding: 26 }}>
          <Pressable onPress={() => {}} className="bg-white" style={{ width: '100%', maxWidth: 340, borderRadius: 24, overflow: 'hidden', padding: 14, ...SHADOW.float }}>
            {/* header — tap the title to zoom out to months, then years */}
            <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
              <Pressable accessibilityRole="button" accessibilityLabel="Previous" onPress={() => shift(-1)} hitSlop={10} className="rounded-xl items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.warmwhite }}>
                <ChevronLeft size={18} color={COLORS.navy} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={mode === 'days' ? 'Choose month and year' : mode === 'months' ? 'Choose year' : 'Year range'}
                onPress={() => setMode(mode === 'days' ? 'months' : 'years')}
                hitSlop={8}
                className="flex-row items-center rounded-xl"
                style={{ gap: 5, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: mode === 'days' ? 'transparent' : COLORS.warmwhite }}
              >
                <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>{headerLabel}</Text>
                {mode !== 'years' ? <ChevronRight size={13} color={COLORS.ink3} style={{ transform: [{ rotate: '90deg' }] }} /> : null}
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Next" onPress={() => shift(1)} hitSlop={10} className="rounded-xl items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.warmwhite }}>
                <ChevronRight size={18} color={COLORS.navy} />
              </Pressable>
            </View>

            {mode === 'years' ? (
              <>
                <View className="flex-row flex-wrap">
                  {years.map((y) => {
                    const isSel = !!sel && sel.y === y;
                    return (
                      <Pressable key={y} onPress={() => { setViewY(y); setMode('months'); }} style={{ width: '25%', alignItems: 'center', paddingVertical: 6 }}>
                        <View className="items-center justify-center rounded-xl" style={{ height: 40, minWidth: 62, paddingHorizontal: 6, backgroundColor: isSel ? COLORS.navy : y === now.getFullYear() ? COLORS.warmwhite : 'transparent' }}>
                          <Text style={[cellTxt, { color: isSel ? '#fff' : COLORS.navy }]}>{y}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                {allowPartial ? (
                  <Pressable onPress={() => done(String(viewY))} hitSlop={8} style={{ alignItems: 'center', paddingTop: 10 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>Just use {viewY}</Text>
                  </Pressable>
                ) : null}
              </>
            ) : mode === 'months' ? (
              <>
                <View className="flex-row flex-wrap">
                  {MONTHS.map((m, i) => {
                    const isSel = !!sel && sel.y === viewY && sel.m === i;
                    return (
                      <Pressable key={m} onPress={() => { setViewM(i); setMode('days'); }} style={{ width: '33.33%', alignItems: 'center', paddingVertical: 6 }}>
                        <View className="items-center justify-center rounded-xl" style={{ height: 40, minWidth: 84, paddingHorizontal: 6, backgroundColor: isSel ? COLORS.navy : 'transparent' }}>
                          <Text style={[cellTxt, { color: isSel ? '#fff' : COLORS.navy }]}>{m.slice(0, 3)}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                {allowPartial ? (
                  <Pressable onPress={() => done(`${viewY}-${pad(viewM + 1)}`)} hitSlop={8} style={{ alignItems: 'center', paddingTop: 10 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>Just use {MONTHS[viewM]} {viewY}</Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <>
                {/* weekdays */}
                <View className="flex-row">
                  {WEEKDAYS.map((w) => (
                    <Text key={w} style={{ width: `${100 / 7}%`, textAlign: 'center', fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.ink3, paddingVertical: 6 }}>{w}</Text>
                  ))}
                </View>
                {/* days */}
                <View className="flex-row flex-wrap">
                  {cells.map((c, i) => {
                    const isSel = !!sel && c.inMonth && sel.y === c.y && sel.m === c.m && sel.d === c.d;
                    const isToday = c.inMonth && c.y === now.getFullYear() && c.m === now.getMonth() && c.d === now.getDate();
                    return (
                      <Pressable key={i} onPress={() => pick(c.y, c.m, c.d)} style={{ width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 3 }}>
                        <View className="items-center justify-center rounded-xl" style={{ height: 38, width: 38, backgroundColor: isSel ? COLORS.navy : 'transparent', borderWidth: isToday && !isSel ? 1.5 : 0, borderColor: 'rgba(30,107,255,0.4)' }}>
                          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: isSel ? '800' : '500', color: isSel ? '#fff' : c.inMonth ? COLORS.navy : COLORS.ink3 }}>{c.d}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}

            {/* clear */}
            {value ? (
              <Pressable onPress={() => done('')} hitSlop={8} style={{ alignItems: 'center', paddingTop: 8 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.ink3 }}>Clear date</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

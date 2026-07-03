import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS, SHADOW } from '../src/lib/theme';

// A tap-to-pick calendar date field: shows the chosen date and opens a month
// calendar to pick a day — no typing, no separate year/month/day inputs. Value
// is an ISO `YYYY-MM-DD` string. Pure JS (ships over-the-air).

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
function parseISO(v?: string): { y: number; m: number; d: number } | null {
  const mm = (v || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return mm ? { y: +mm[1], m: +mm[2] - 1, d: +mm[3] } : null;
}
function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}
function pretty(v?: string): string | null {
  const p = parseISO(v);
  return p ? `${MONTHS[p.m]} ${ordinal(p.d)}, ${p.y}` : null;
}

export function DateField({ value, onChange, label }: { value: string; onChange: (iso: string) => void; label?: string }) {
  const sel = parseISO(value);
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [viewY, setViewY] = useState(sel ? sel.y : now.getFullYear());
  const [viewM, setViewM] = useState(sel ? sel.m : now.getMonth());

  function openCal() {
    if (sel) { setViewY(sel.y); setViewM(sel.m); }
    setOpen(true);
  }
  function shift(delta: number) {
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

  const label3 = pretty(value) ?? (value || (label ?? 'Select date'));

  return (
    <>
      <Pressable onPress={openCal} className="bg-white rounded-2xl flex-row items-center" style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 9, ...SHADOW.card }}>
        <CalendarIcon size={17} color={COLORS.ink3} />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '600', color: pretty(value) ? COLORS.ink : COLORS.ink3, flex: 1 }}>{label3}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(14,16,24,0.45)', alignItems: 'center', justifyContent: 'center', padding: 26 }}>
          <Pressable onPress={() => {}} className="bg-white" style={{ width: '100%', maxWidth: 340, borderRadius: 24, overflow: 'hidden', padding: 14, ...SHADOW.float }}>
            {/* header */}
            <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
              <Pressable onPress={() => shift(-1)} hitSlop={10} className="rounded-xl items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.warmwhite }}>
                <ChevronLeft size={18} color={COLORS.navy} />
              </Pressable>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>{MONTHS[viewM]} {viewY}</Text>
              <Pressable onPress={() => shift(1)} hitSlop={10} className="rounded-xl items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.warmwhite }}>
                <ChevronRight size={18} color={COLORS.navy} />
              </Pressable>
            </View>
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
            {/* clear */}
            {value ? (
              <Pressable onPress={() => { onChange(''); setOpen(false); }} hitSlop={8} style={{ alignItems: 'center', paddingTop: 8 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.ink3 }}>Clear date</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { Dropdown, type DropdownOption } from './Dropdown';
import { Button } from './Button';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { countryName } from '../src/data/countries';
import type { Place } from '../src/types';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';
import { useConfirm } from '../src/store/confirm';

const thisYear = new Date().getFullYear();
const YEAR_OPTS: DropdownOption[] = Array.from({ length: 96 }, (_, i) => ({ label: String(thisYear - i), value: thisYear - i }));

const LBL = { fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700' as const, letterSpacing: 1, color: COLORS.ink3, marginBottom: 7 };

/** Edit a visited city: amend the year, add a note, or remove it. */
export function EditCitySheet({ city, onClose }: { city: Place | null; onClose: () => void }) {
  const { updatePlace, removePlace } = useData();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [year, setYear] = useState<number | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!city) return;
    setYear(city.firstYear ?? (city.firstDate ? Number(city.firstDate.slice(0, 4)) || null : null));
    setNote(city.note ?? '');
  }, [city]);

  async function save() {
    if (!city) return;
    await updatePlace(city.id, { firstYear: year ?? null, firstDate: year ? String(year) : null, note });
    toast.success('City updated');
    onClose();
  }

  async function del() {
    if (!city) return;
    if (await confirm({ title: `Remove ${city.name}?`, message: `${city.name} and its dates will be removed from ${countryName(city.countryCode)}.`, confirmLabel: 'Remove', destructive: true })) {
      removePlace(city.id);
      onClose();
    }
  }

  return (
    <SheetShell visible={!!city} title={city?.name ?? 'City'} onClose={onClose}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8, gap: 16 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3 }}>
          {city ? `${flagEmoji(city.countryCode)}  ${countryName(city.countryCode)}` : ''}
        </Text>

        <View>
          <Text style={LBL}>YEAR VISITED</Text>
          <Dropdown placeholder="Add a year" title="Year visited" value={year} options={YEAR_OPTS} onSelect={setYear} minWidth={140} />
        </View>

        <View>
          <Text style={LBL}>NOTE</Text>
          <View className="bg-white rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="A memory from this city…"
              placeholderTextColor={COLORS.ink3}
              multiline
              style={{ fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink, minHeight: 64, textAlignVertical: 'top' }}
            />
          </View>
        </View>

        <Button label="Save changes" onPress={save} />
        <Pressable onPress={del} hitSlop={8} className="flex-row items-center justify-center" style={{ gap: 7, paddingVertical: 6 }}>
          <Trash2 size={15} color={COLORS.danger} />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.danger }}>Remove city</Text>
        </Pressable>
      </View>
    </SheetShell>
  );
}

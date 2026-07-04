import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { DateField } from './DateField';
import { Button } from './Button';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { countryName } from '../src/data/countries';
import type { Place } from '../src/types';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';


const LBL = { fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700' as const, letterSpacing: 1, color: COLORS.ink3, marginBottom: 7 };

/** Edit a visited city: amend the year, add a note, or remove it. */
export function EditCitySheet({ city, onClose }: { city: Place | null; onClose: () => void }) {
  const { updatePlace, removePlace } = useData();
  const { toast } = useToast();
  const [when, setWhen] = useState('');
  const [note, setNote] = useState('');
  // Inline confirm — a nested Modal (the global confirm dialog) can't present
  // over this sheet's own Modal on iOS, which froze the screen.
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!city) return;
    setWhen(city.firstDate ?? (city.firstYear ? String(city.firstYear) : ''));
    setNote(city.note ?? '');
    setConfirming(false);
  }, [city]);

  async function save() {
    if (!city) return;
    await updatePlace(city.id, { firstYear: when ? Number(when.slice(0, 4)) : null, firstDate: when || null, note });
    toast.success('City updated');
    onClose();
  }

  function del() {
    if (!city) return;
    removePlace(city.id);
    toast.success(`${city.name} removed`);
    onClose();
  }

  return (
    <SheetShell visible={!!city} title={city?.name ?? 'City'} onClose={onClose}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8, gap: 16 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3 }}>
          {city ? `${flagEmoji(city.countryCode)}  ${countryName(city.countryCode)}` : ''}
        </Text>

        <View>
          <Text style={LBL}>WHEN VISITED</Text>
          <View style={{ marginTop: 8 }}><DateField value={when} onChange={setWhen} label="When you visited" allowPartial /></View>
        </View>

        <View>
          <Text style={LBL}>NOTE</Text>
          <View className="bg-white dark:bg-card rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12 }}>
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

        {confirming ? (
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink2, textAlign: 'center', lineHeight: 20 }}>
              Remove {city?.name} and its dates from {city ? countryName(city.countryCode) : ''}?
            </Text>
            <View className="flex-row" style={{ gap: 10 }}>
              <Pressable onPress={() => setConfirming(false)} className="flex-1 items-center justify-center rounded-full" style={{ paddingVertical: 14, backgroundColor: 'rgba(20,33,61,0.06)' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2 }}>Keep</Text>
              </Pressable>
              <Pressable onPress={del} className="flex-1 flex-row items-center justify-center rounded-full" style={{ paddingVertical: 14, gap: 7, backgroundColor: COLORS.danger }}>
                <Trash2 size={15} color="#fff" />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Button label="Save changes" onPress={save} />
            <Pressable onPress={() => setConfirming(true)} hitSlop={8} className="flex-row items-center justify-center" style={{ gap: 7, paddingVertical: 6 }}>
              <Trash2 size={15} color={COLORS.danger} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.danger }}>Remove city</Text>
            </Pressable>
          </>
        )}
      </View>
    </SheetShell>
  );
}

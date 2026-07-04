import { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { COLORS, SHADOW } from '../src/lib/theme';

export interface DropdownOption {
  label: string;
  value: number;
}

/** A compact, on-brand select: a pill that opens a tappable list in a modal.
 *  Tapping the current value again clears it (so it stays optional). */
export function Dropdown({
  placeholder,
  title,
  value,
  options,
  onSelect,
  minWidth = 92,
  flex,
}: {
  placeholder: string;
  title?: string;
  value: number | null;
  options: DropdownOption[];
  onSelect: (v: number | null) => void;
  minWidth?: number;
  flex?: number;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="bg-white dark:bg-card rounded-2xl flex-row items-center justify-between"
        style={{ paddingHorizontal: 14, paddingVertical: 11, gap: 8, minWidth, flex, ...SHADOW.card }}
      >
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '600', color: selected ? COLORS.ink : COLORS.ink3 }}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={16} color={COLORS.ink3} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(14,16,24,0.45)', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <Pressable onPress={() => {}} className="bg-white dark:bg-card" style={{ width: '100%', maxWidth: 300, maxHeight: '70%', borderRadius: 24, overflow: 'hidden', ...SHADOW.float }}>
            {title ? <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4 }}>{title}</Text> : null}
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      onSelect(active ? null : o.value);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between"
                    style={{ paddingHorizontal: 18, paddingVertical: 13, backgroundColor: active ? 'rgba(255,107,154,0.08)' : 'transparent' }}
                  >
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: active ? '700' : '500', color: active ? COLORS.coral : COLORS.ink }}>{o.label}</Text>
                    {active ? <Check size={16} color={COLORS.coral} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

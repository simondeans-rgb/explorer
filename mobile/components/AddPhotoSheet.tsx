import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Camera, ImagePlus, Check, Search, X } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES } from '../src/data/countries';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';
import { pickPhotoDataUrl } from '../src/lib/photo';

export function AddPhotoSheet({
  visible,
  onClose,
  initialCountryCode,
}: {
  visible: boolean;
  onClose: () => void;
  initialCountryCode?: string;
}) {
  const { addCapture } = useData();
  const { toast } = useToast();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && initialCountryCode) setCode(initialCountryCode);
  }, [visible, initialCountryCode]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 24);
  }, [query]);

  function reset() {
    setPhoto(null);
    setCaption('');
    setQuery('');
    setCode('');
    setPicking(false);
    setSaving(false);
  }
  function close() {
    reset();
    onClose();
  }
  async function pick(source: 'camera' | 'library') {
    setPicking(true);
    try {
      const data = await pickPhotoDataUrl(source);
      if (data) setPhoto(data);
    } finally {
      setPicking(false);
    }
  }
  async function save() {
    if (!photo || saving) return;
    setSaving(true);
    try {
      await addCapture({ dataUrl: photo, countryCode: code || undefined, caption });
      toast.success('Memory saved');
      close();
    } catch {
      setSaving(false);
      toast.error("Couldn't save — check your connection and try again.");
    }
  }

  return (
    <SheetShell visible={visible} title="Add a memory" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* photo preview / picker */}
        <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
          {photo ? (
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: photo }} style={{ width: '100%', height: 220, borderRadius: 20 }} contentFit="cover" />
              <Pressable
                onPress={() => setPhoto(null)}
                className="absolute rounded-full items-center justify-center"
                style={{ top: 10, right: 10, height: 34, width: 34, backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <X size={18} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row" style={{ gap: 10 }}>
              <Pressable onPress={() => pick('camera')} disabled={picking} className="items-center justify-center bg-white rounded-2xl" style={{ flex: 1, paddingVertical: 26, gap: 8 }}>
                <Camera size={26} color={COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Take photo</Text>
              </Pressable>
              <Pressable onPress={() => pick('library')} disabled={picking} className="items-center justify-center bg-white rounded-2xl" style={{ flex: 1, paddingVertical: 26, gap: 8 }}>
                <ImagePlus size={26} color={COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Library</Text>
              </Pressable>
            </View>
          )}
          {picking ? (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 8, textAlign: 'center' }}>Preparing photo…</Text>
          ) : null}
        </View>

        {/* caption */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
          CAPTION (OPTIONAL)
        </Text>
        <View className="bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="A line about this moment"
            placeholderTextColor={COLORS.ink3}
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        {/* country */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
          WHERE (OPTIONAL)
        </Text>
        <View className="flex-row items-center bg-white rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 8 }}>
          <Search size={18} color={COLORS.ink3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search countries"
            placeholderTextColor={COLORS.ink3}
            style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>
        <ScrollView style={{ maxHeight: 160, marginTop: 6 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          {results.map((c) => {
            const active = code === c.code;
            return (
              <Pressable
                key={c.code}
                onPress={() => setCode(active ? '' : c.code)}
                className="flex-row items-center"
                style={{ paddingHorizontal: 20, paddingVertical: 10, gap: 12, backgroundColor: active ? 'rgba(255,107,154,0.10)' : 'transparent' }}
              >
                <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                {active ? <Check size={18} color={COLORS.coral} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          onPress={save}
          disabled={!photo || saving}
          className="rounded-2xl items-center justify-center flex-row"
          style={{ marginHorizontal: 20, marginTop: 18, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: photo && !saving ? 1 : 0.4, gap: 8 }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Check size={18} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save memory</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SheetShell>
  );
}

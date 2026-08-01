import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Trash2, Check, Search, MapPin, X } from 'lucide-react-native';
import { BackButton } from '../../components/BackButton';
import { DetailSkeleton } from '../../components/DetailSkeleton';
import { TripPickerField } from '../../components/TripPickerField';
import { COLORS } from '../../src/lib/theme';
import { goBack } from '../../src/lib/nav';
import { flagEmoji } from '../../src/lib/flags';
import { COUNTRIES, countryName } from '../../src/data/countries';
import { useData } from '../../src/store/data';
import { useToast } from '../../src/store/toast';
import { useConfirm } from '../../src/store/confirm';
import { isObjectionable } from '../../src/lib/textFilter';

/** Tap a memory (photo) to view it large and edit it — caption, the trip it
 *  belongs to, and where it was taken — or delete it. */
export default function MemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { captures, expeditions, updateCapture, removeCapture, loaded } = useData();
  const { toast } = useToast();
  const confirm = useConfirm();
  const capture = captures.find((c) => c.id === id);

  const [caption, setCaption] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('');
  const [expId, setExpId] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  // Seed the form once, when the capture first becomes available (handles a
  // cold-start deep link where the data arrives after mount).
  const seeded = useRef(false);
  useEffect(() => {
    if (capture && !seeded.current) {
      seeded.current = true;
      setCaption(capture.caption ?? '');
      setCode(capture.countryCode ?? '');
      setCity(capture.city ?? '');
      setExpId(capture.expeditionId);
    }
  }, [capture]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES).slice(0, 24);
  }, [query]);

  const takenLabel = capture?.takenAt
    ? new Date(capture.takenAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
    : undefined;

  function save() {
    if (!capture) return;
    if (caption.trim() && isObjectionable(caption)) {
      toast.error('Please remove offensive language from the caption.');
      return;
    }
    updateCapture(capture.id, {
      caption: caption.trim() || null,
      countryCode: code || null,
      city: city.trim() || null,
      expeditionId: expId || null,
    });
    toast.success('Memory updated');
    goBack();
  }

  async function confirmDelete() {
    if (!capture) return;
    if (await confirm({ title: 'Delete memory?', message: 'This photo will be removed from your archive.', confirmLabel: 'Delete', destructive: true })) {
      removeCapture(capture.id);
      goBack();
    }
  }

  if (!capture && !loaded) return <DetailSkeleton />;

  if (!capture) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.warmwhite, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>Memory not found</Text>
        <Pressable onPress={goBack} style={{ marginTop: 14 }}>
          <Text style={{ fontFamily: 'PlusJakarta', color: COLORS.coral, fontWeight: '700' }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag">
        {/* Photo */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: capture.dataUrl }} style={{ width: '100%', height: 420 }} contentFit="cover" transition={200} />
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 60, left: 20, zIndex: 20 }} />
          <Pressable
            onPress={confirmDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete memory"
            hitSlop={12}
            className="h-9 w-9 rounded-full items-center justify-center bg-white/20"
            style={{ position: 'absolute', top: 60, right: 20, zIndex: 20 }}
          >
            <Trash2 size={18} color="#fff" />
          </Pressable>
        </View>

        {(code || takenLabel) ? (
          <View className="flex-row items-center" style={{ gap: 6, paddingHorizontal: 20, marginTop: 14 }}>
            <MapPin size={14} color={COLORS.ink3} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2 }}>
              {code ? `${flagEmoji(code)} ${city ? `${city}, ` : ''}${countryName(code)}` : (city || '')}
              {takenLabel ? `${code || city ? ' · ' : ''}${takenLabel}` : ''}
            </Text>
          </View>
        ) : null}

        {/* Caption */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 18 }}>CAPTION</Text>
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="A line about this moment"
            placeholderTextColor={COLORS.ink3}
            multiline
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink, minHeight: 24 }}
          />
        </View>

        {/* Trip */}
        {expeditions.length > 0 ? (
          <>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 18 }}>TRIP</Text>
            <TripPickerField expeditions={expeditions} selectedId={expId || undefined} onSelect={setExpId} />
          </>
        ) : null}

        {/* Location */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 18 }}>WHERE</Text>
        <Pressable
          onPress={() => setShowCountries((v) => !v)}
          className="flex-row items-center bg-white dark:bg-card rounded-2xl"
          style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 13, gap: 10, marginTop: 8 }}
        >
          <Text style={{ fontSize: 20 }}>{code ? flagEmoji(code) : '📍'}</Text>
          <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: code ? COLORS.navy : COLORS.ink3 }}>
            {code ? countryName(code) : 'Add a country'}
          </Text>
          {code ? (
            <Pressable onPress={() => { setCode(''); setShowCountries(false); }} hitSlop={10} accessibilityRole="button" accessibilityLabel="Clear country">
              <X size={16} color={COLORS.ink3} />
            </Pressable>
          ) : null}
        </Pressable>

        {showCountries ? (
          <>
            <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 8 }}>
              <Search size={18} color={COLORS.ink3} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Search countries" placeholderTextColor={COLORS.ink3} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} autoFocus />
            </View>
            <ScrollView style={{ maxHeight: 200, marginTop: 6 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {results.map((c) => (
                <Pressable
                  key={c.code}
                  onPress={() => { setCode(c.code); setQuery(''); setShowCountries(false); }}
                  className="flex-row items-center"
                  style={{ paddingHorizontal: 20, paddingVertical: 10, gap: 12 }}
                >
                  <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                  {code === c.code ? <Check size={18} color={COLORS.coral} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* City */}
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="City or place (optional)"
            placeholderTextColor={COLORS.ink3}
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
        </View>

        <Pressable
          onPress={save}
          accessibilityRole="button"
          accessibilityLabel="Save memory"
          className="rounded-2xl items-center justify-center flex-row"
          style={{ marginHorizontal: 20, marginTop: 22, paddingVertical: 15, backgroundColor: COLORS.coral, gap: 8 }}
        >
          <Check size={18} color="#fff" />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save changes</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

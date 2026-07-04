import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Camera, ImagePlus, Check, Search, X, MapPin } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES, countryName } from '../src/data/countries';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';
import { pickPhotoWithMeta } from '../src/lib/photo';
import { countryAt } from '../src/lib/geoLookup';
import { matchExpedition, expeditionLabel } from '../src/lib/tripMatch';
import { TripPickerField } from './TripPickerField';
import { track } from '../src/lib/analytics';

export function AddPhotoSheet({
  visible,
  onClose,
  initialCountryCode,
  initialExpeditionId,
}: {
  visible: boolean;
  onClose: () => void;
  initialCountryCode?: string;
  /** Pre-link to a trip (e.g. when adding from that trip's page). */
  initialExpeditionId?: string;
}) {
  const { addCapture, expeditions } = useData();
  const { toast } = useToast();
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  // From the photo's own metadata:
  const [takenAt, setTakenAt] = useState<number | undefined>();
  const [detectedCode, setDetectedCode] = useState<string | undefined>();
  // Trip link: undefined = untouched (suggestion applies), '' = explicitly none.
  const [expId, setExpId] = useState<string | undefined>();

  useEffect(() => {
    if (visible && initialCountryCode) setCode(initialCountryCode);
    if (visible && initialExpeditionId) setExpId(initialExpeditionId);
  }, [visible, initialCountryCode, initialExpeditionId]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 24);
  }, [query]);

  // The trip this photo most plausibly belongs to, from its geotag + timestamp.
  const suggested = useMemo(
    () => (photo ? matchExpedition(expeditions, { countryCode: detectedCode || code || undefined, takenAt }) : undefined),
    [photo, expeditions, detectedCode, code, takenAt],
  );
  const selectedExpId = expId === undefined ? suggested?.id : expId || undefined;
  const selectedExp = selectedExpId ? expeditions.find((e) => e.id === selectedExpId) : undefined;

  function reset() {
    setPhoto(null);
    setCaption('');
    setQuery('');
    setCode('');
    setPicking(false);
    setSaving(false);
    setTakenAt(undefined);
    setDetectedCode(undefined);
    setExpId(undefined);
  }
  function close() {
    reset();
    onClose();
  }
  async function pick(source: 'camera' | 'library') {
    setPicking(true);
    try {
      const picked = await pickPhotoWithMeta(source);
      if (!picked) return;
      setPhoto(picked.dataUrl);
      setTakenAt(picked.takenAt);
      // Geotag → country, pre-filled but always changeable below.
      if (picked.latitude !== undefined && picked.longitude !== undefined) {
        const found = countryAt(picked.longitude, picked.latitude);
        if (found) {
          setDetectedCode(found);
          setCode((c) => c || found);
        }
      }
    } finally {
      setPicking(false);
    }
  }
  async function save() {
    if (!photo || saving) return;
    setSaving(true);
    try {
      await addCapture({ dataUrl: photo, countryCode: code || undefined, caption, expeditionId: selectedExpId, takenAt });
      track('photo_added', { geotagged: Boolean(detectedCode), trip_linked: Boolean(selectedExpId), trip_auto: Boolean(selectedExpId && expId === undefined) });
      toast.success(selectedExp ? `Memory saved to ${expeditionLabel(selectedExp)}` : 'Memory saved');
      close();
    } catch {
      setSaving(false);
      toast.error("Couldn't save — check your connection and try again.");
    }
  }

  const takenLabel = takenAt
    ? new Date(takenAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
    : undefined;

  return (
    <SheetShell visible={visible} title="Add a memory" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* photo preview / picker */}
        <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
          {photo ? (
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: photo }} style={{ width: '100%', height: 220, borderRadius: 20 }} contentFit="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
                onPress={() => { setPhoto(null); setTakenAt(undefined); setDetectedCode(undefined); setExpId(undefined); }}
                className="absolute rounded-full items-center justify-center"
                style={{ top: 10, right: 10, height: 34, width: 34, backgroundColor: 'rgba(0,0,0,0.5)' }}
              >
                <X size={18} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row" style={{ gap: 10 }}>
              <Pressable accessibilityRole="button" accessibilityLabel="Take photo" onPress={() => pick('camera')} disabled={picking} className="items-center justify-center bg-white dark:bg-card rounded-2xl" style={{ flex: 1, paddingVertical: 26, gap: 8 }}>
                <Camera size={26} color={COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Take photo</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Choose from library" onPress={() => pick('library')} disabled={picking} className="items-center justify-center bg-white dark:bg-card rounded-2xl" style={{ flex: 1, paddingVertical: 26, gap: 8 }}>
                <ImagePlus size={26} color={COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Library</Text>
              </Pressable>
            </View>
          )}
          {picking ? (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 8, textAlign: 'center' }}>Preparing photo…</Text>
          ) : null}
          {/* What the photo told us */}
          {photo && (detectedCode || takenLabel) ? (
            <View className="flex-row items-center justify-center" style={{ gap: 6, marginTop: 10 }}>
              <MapPin size={13} color={COLORS.ink3} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink2 }}>
                {detectedCode ? `${flagEmoji(detectedCode)} ${countryName(detectedCode)}` : 'No location on this photo'}
                {takenLabel ? ` · ${takenLabel}` : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* trip link — pre-filled from the photo's date + place */}
        {photo && expeditions.length > 0 ? (
          <>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
              TRIP
            </Text>
            <TripPickerField
              expeditions={expeditions}
              selectedId={selectedExpId}
              onSelect={setExpId}
              collapsedHint={expId === undefined && suggested && suggested.id === selectedExpId ? 'Matched from the photo — tap to change' : undefined}
            />
          </>
        ) : null}

        {/* caption */}
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
          CAPTION (OPTIONAL)
        </Text>
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
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
          {detectedCode ? 'WHERE (FROM THE PHOTO — TAP TO CHANGE)' : 'WHERE (OPTIONAL)'}
        </Text>
        <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 8 }}>
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
          accessibilityRole="button"
          accessibilityLabel="Save memory"
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

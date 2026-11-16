import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, Check, MapPin, Pencil, ChevronRight, Plane } from 'lucide-react-native';
import { BackButton } from '../../components/BackButton';
import { DetailSkeleton } from '../../components/DetailSkeleton';
import { TripPickerField } from '../../components/TripPickerField';
import { CountryPickerField } from '../../components/CountryPickerField';
import { BRAND_GRADIENT, COLORS, SHADOW, tint } from '../../src/lib/theme';
import { goBack } from '../../src/lib/nav';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
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
  // Opens as the memory itself — photo, caption, where and when. The form is
  // one tap away behind Edit.
  const [editing, setEditing] = useState(false);

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

  const takenLabel = capture?.takenAt
    ? new Date(capture.takenAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })
    : undefined;

  // Only enable "Save changes" when something actually changed — matches the
  // discovery/journey editors, which gate their save on a dirty/required field (R34).
  const dirty = !!capture && (
    caption !== (capture.caption ?? '') ||
    code !== (capture.countryCode ?? '') ||
    city !== (capture.city ?? '') ||
    expId !== capture.expeditionId
  );

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
    setEditing(false);
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
          <Image source={{ uri: capture.dataUrl }} style={{ width: '100%', height: editing ? 300 : 520 }} contentFit="cover" transition={200} />
          {/* Read mode: the caption sits on the photo, magazine-style. */}
          {!editing ? (
            <LinearGradient colors={['transparent', 'rgba(8,9,15,0.72)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 22, paddingTop: 90, paddingBottom: 22 }}>
              {capture.caption ? (
                <Text style={{ fontFamily: 'Fraunces', fontSize: 26, lineHeight: 32, color: '#fff' }}>{capture.caption}</Text>
              ) : null}
              {(code || city || takenLabel) ? (
                <View className="flex-row items-center" style={{ gap: 6, marginTop: capture.caption ? 8 : 0 }}>
                  <MapPin size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '600', color: 'rgba(255,255,255,0.95)', flexShrink: 1 }}>
                    {code ? `${flagEmoji(code)} ${city ? `${city}, ` : ''}${countryName(code)}` : (city || '')}
                    {takenLabel ? `${code || city ? '  ·  ' : ''}${takenLabel}` : ''}
                  </Text>
                </View>
              ) : null}
            </LinearGradient>
          ) : null}
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
          {!editing ? (
            <Pressable onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Edit memory" hitSlop={10} className="flex-row items-center rounded-full bg-white/20" style={{ position: 'absolute', top: 60, right: 66, zIndex: 20, paddingHorizontal: 13, paddingVertical: 8, gap: 6 }}>
              <Pencil size={14} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#fff' }}>Edit</Text>
            </Pressable>
          ) : null}
        </View>

        {!editing ? (
          <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 12 }}>
            {(() => {
              const trip = expeditions.find((e) => e.id === capture.expeditionId);
              return trip ? (
                <Pressable onPress={() => router.push(`/journey/${trip.id}`)} accessibilityRole="button" accessibilityLabel={`From the trip ${trip.title}. Open it`} className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ padding: 14, gap: 12, ...SHADOW.card }}>
                  <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: tint(COLORS.coral, 0.12) }}>
                    <Plane size={18} color={COLORS.coral} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: COLORS.ink3 }}>FROM THE TRIP</Text>
                    <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 1 }}>{trip.title}</Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.ink3} />
                </Pressable>
              ) : null;
            })()}
            {capture.countryCode ? (
              <Pressable onPress={() => router.push(`/country/${capture.countryCode}`)} accessibilityRole="button" accessibilityLabel={`Open ${countryName(capture.countryCode)}`} className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ padding: 14, gap: 12, ...SHADOW.card }}>
                <Text style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{flagEmoji(capture.countryCode)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: COLORS.ink3 }}>TAKEN IN</Text>
                  <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 1 }}>{capture.city ? `${capture.city}, ` : ''}{countryName(capture.countryCode)}</Text>
                </View>
                <ChevronRight size={18} color={COLORS.ink3} />
              </Pressable>
            ) : null}
            {!capture.caption || !capture.countryCode ? (
              <Pressable onPress={() => setEditing(true)} accessibilityRole="button" className="flex-row items-center justify-center rounded-full" style={{ alignSelf: 'center', marginTop: 6, paddingHorizontal: 20, paddingVertical: 12, gap: 7, backgroundColor: COLORS.tileMuted }}>
                <Pencil size={15} color={COLORS.ink2} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2 }}>
                  {!capture.caption ? 'Add a caption' : 'Add where this was'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {editing ? (
        <>

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
        <CountryPickerField code={code} onChange={setCode} label="WHERE" />

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
          disabled={!dirty}
          accessibilityRole="button"
          accessibilityLabel="Save memory"
          accessibilityState={{ disabled: !dirty }}
          style={{ marginHorizontal: 20, marginTop: 22, borderRadius: 18, overflow: 'hidden', opacity: dirty ? 1 : 0.45 }}
        >
          <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 8 }}>
            <Check size={18} color="#fff" />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save changes</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={() => setEditing(false)} accessibilityRole="button" hitSlop={8} style={{ alignItems: 'center', marginTop: 14 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink3 }}>Cancel</Text>
        </Pressable>
        </>
        ) : null}
      </ScrollView>
    </View>
  );
}

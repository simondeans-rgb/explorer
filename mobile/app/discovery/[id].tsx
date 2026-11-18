import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useConfirm } from '../../src/store/confirm';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, Check, Camera, ImagePlus, X, Pencil, MapPin, ChevronRight } from 'lucide-react-native';
import { BackButton } from '../../components/BackButton';
import { DestinationImage } from '../../components/DestinationImage';
import { BRAND_GRADIENT, COLORS, SHADOW, tint } from '../../src/lib/theme';
import { countryName } from '../../src/data/countries';
import { countryFacts } from '../../src/data/countryFacts';
import { pickPhotoDataUrl } from '../../src/lib/photo';
import { goBack } from '../../src/lib/nav';
import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_CATEGORY_META,
  DISCOVERY_SUBCATEGORIES,
  RECOMMENDATION_VERDICTS,
  VERDICT_META,
  type DiscoveryCategory,
  type RecommendationVerdict,
} from '../../src/types';
import { useData } from '../../src/store/data';
import { TripPickerField } from '../../components/TripPickerField';
import { CountryPickerField } from '../../components/CountryPickerField';
import { DetailSkeleton } from '../../components/DetailSkeleton';
import { useToast } from '../../src/store/toast';

export default function DiscoveryScreen() {
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const { discoveries, updateDiscovery, removeDiscovery, expeditions, loaded } = useData();
  const { toast } = useToast();
  const confirm = useConfirm();
  const discovery = discoveries.find((d) => d.id === id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<DiscoveryCategory>('food');
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);
  const [city, setCity] = useState('');
  const [code, setCode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [expeditionId, setExpeditionId] = useState('');
  const [verdict, setVerdict] = useState<RecommendationVerdict | undefined>(undefined);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // Opens as the discovery itself; the form is behind Edit (?edit=1 opens it directly).
  const [editing, setEditing] = useState(edit === '1');

  // Seed the form once from the loaded discovery.
  useEffect(() => {
    if (discovery && !hydrated) {
      setName(discovery.name);
      setCategory(discovery.category);
      setSubcategory(discovery.subcategory);
      setCity(discovery.city ?? '');
      setCode(discovery.countryCode ?? '');
      setLandmark(discovery.landmark ?? '');
      setExpeditionId(discovery.expeditionId ?? '');
      setVerdict(discovery.verdict);
      setNote(discovery.note ?? '');
      setPhoto(discovery.photo ?? null);
      setHydrated(true);
    }
  }, [discovery, hydrated]);

  const subcategories = DISCOVERY_SUBCATEGORIES[category];
  const landmarks = useMemo(() => (code ? countryFacts(code)?.landmarks ?? [] : []), [code]);

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
    if (!name.trim() || saving || !discovery) return;
    setSaving(true);
    try {
      await updateDiscovery(discovery.id, {
        name,
        category,
        subcategory,
        countryCode: code || undefined,
        city,
        landmark: landmark || undefined,
        expeditionId: expeditionId || undefined,
        verdict,
        note,
        photo,
      });
      toast.success('Changes saved');
      setSaving(false);
      setEditing(false);
    } catch {
      setSaving(false);
      toast.error("Couldn't save — check your connection and try again.");
    }
  }

  async function confirmDelete() {
    if (!discovery) return;
    if (await confirm({ title: 'Delete discovery?', message: `"${discovery.name}" will be removed.`, confirmLabel: 'Delete', destructive: true })) {
      removeDiscovery(discovery.id);
      goBack();
    }
  }

  // Cold start on the cloud: wait for the first sync before deciding it's
  // missing, so we show a skeleton instead of flashing "not found".
  if (!discovery && !loaded) return <DetailSkeleton />;

  if (!discovery) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.warmwhite, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>Discovery not found</Text>
        <Pressable onPress={goBack} style={{ marginTop: 14 }}><Text style={{ fontFamily: 'PlusJakarta', color: COLORS.coral, fontWeight: '700' }}>Go back</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="on-drag">
        {/* Hero */}
        <DestinationImage code={code || 'WW'} scrim style={{ position: 'relative', paddingTop: 60, paddingBottom: 46, minHeight: 180, justifyContent: 'flex-end' }}>
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 60, left: 20, zIndex: 20 }} />
          {editing ? (
            <Pressable onPress={confirmDelete} accessibilityRole="button" accessibilityLabel="Delete discovery" hitSlop={12} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 60, right: 20, zIndex: 20 }}>
              <Trash2 size={18} color="#fff" />
            </Pressable>
          ) : (
            <Pressable onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Edit discovery" hitSlop={10} className="flex-row items-center rounded-full bg-white/20" style={{ position: 'absolute', top: 60, right: 20, zIndex: 20, paddingHorizontal: 13, paddingVertical: 8, gap: 6 }}>
              <Pencil size={14} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#fff' }}>Edit</Text>
            </Pressable>
          )}
          <View style={{ paddingHorizontal: 20 }}>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1, opacity: 0.9 }}>
              {editing ? 'EDIT DISCOVERY' : DISCOVERY_CATEGORY_META[discovery.category].label.toUpperCase()}
            </Text>
            <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, marginTop: 2 }}>{name || discovery.name}</Text>
          </View>
          <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
          </Svg>
        </DestinationImage>

        {!editing ? (
          <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 14 }}>
            {discovery.photo ? (
              <Image source={{ uri: discovery.photo }} style={{ width: '100%', height: 240, borderRadius: 24 }} contentFit="cover" transition={200} />
            ) : null}
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {discovery.verdict ? (
                <View className="rounded-full" style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: tint(COLORS.coral, 0.12) }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '800', color: COLORS.coral }}>{VERDICT_META[discovery.verdict].label}</Text>
                </View>
              ) : null}
              {discovery.city || discovery.countryCode ? (
                <Pressable
                  disabled={!discovery.countryCode}
                  onPress={() => router.push(`/country/${discovery.countryCode}`)}
                  accessibilityRole={discovery.countryCode ? 'button' : undefined}
                  className="flex-row items-center rounded-full bg-white dark:bg-card"
                  style={{ paddingHorizontal: 12, paddingVertical: 6, gap: 5, ...SHADOW.card }}
                >
                  <MapPin size={13} color={COLORS.ink3} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: COLORS.ink2 }}>
                    {[discovery.city, discovery.countryCode ? countryName(discovery.countryCode) : null].filter(Boolean).join(', ')}
                  </Text>
                </Pressable>
              ) : null}
              {discovery.landmark ? (
                <View className="rounded-full" style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: COLORS.tileMuted }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '700', color: COLORS.ink2 }}>{discovery.landmark}</Text>
                </View>
              ) : null}
            </View>
            {discovery.note ? (
              <View style={{ paddingLeft: 14, borderLeftWidth: 3, borderLeftColor: COLORS.coral }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 19, lineHeight: 28, color: COLORS.ink2 }}>{discovery.note}</Text>
              </View>
            ) : (
              <Pressable onPress={() => setEditing(true)} accessibilityRole="button">
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3 }}>No note yet — <Text style={{ fontWeight: '700', color: COLORS.coral }}>add a line to remember it by</Text></Text>
              </Pressable>
            )}
            {(() => {
              const trip = expeditions.find((e) => e.id === discovery.expeditionId);
              return trip ? (
                <Pressable onPress={() => router.push(`/journey/${trip.id}`)} accessibilityRole="button" accessibilityLabel={`From the trip ${trip.title}. Open it`} className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ padding: 14, gap: 12, ...SHADOW.card }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: COLORS.ink3 }}>FROM THE TRIP</Text>
                    <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 1 }}>{trip.title}</Text>
                  </View>
                  <ChevronRight size={18} color={COLORS.ink3} />
                </Pressable>
              ) : null;
            })()}
          </View>
        ) : null}

        {editing ? (
        <>
        {/* name */}
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 14 }}>
          <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>

        {/* photo */}
        <View style={{ marginHorizontal: 20, marginTop: 10 }}>
          {photo ? (
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: photo }} style={{ width: '100%', height: 160, borderRadius: 18 }} contentFit="cover" />
              <Pressable onPress={() => setPhoto(null)} accessibilityRole="button" accessibilityLabel="Remove photo" hitSlop={10} className="absolute rounded-full items-center justify-center" style={{ top: 10, right: 10, height: 32, width: 32, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <X size={16} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row" style={{ gap: 10 }}>
              <Pressable onPress={() => pick('camera')} disabled={picking} className="flex-row items-center justify-center bg-white dark:bg-card rounded-2xl" style={{ flex: 1, paddingVertical: 14, gap: 7 }}>
                <Camera size={18} color={COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Photo</Text>
              </Pressable>
              <Pressable onPress={() => pick('library')} disabled={picking} className="flex-row items-center justify-center bg-white dark:bg-card rounded-2xl" style={{ flex: 1, paddingVertical: 14, gap: 7 }}>
                <ImagePlus size={18} color={COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Library</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* category */}
        <Text style={LBL}>CATEGORY</Text>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {DISCOVERY_CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <Pressable key={c} onPress={() => { setCategory(c); setSubcategory(undefined); }} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navySolid : COLORS.card }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{DISCOVERY_CATEGORY_META[c].label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* type / subcategory */}
        <Text style={LBL}>TYPE</Text>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {subcategories.map((s) => {
            const active = subcategory === s.id;
            return (
              <Pressable key={s.id} onPress={() => setSubcategory(active ? undefined : s.id)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navySolid : COLORS.card }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* city */}
        <Text style={LBL}>CITY</Text>
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput value={city} onChangeText={setCity} placeholder="City" placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>

        {/* country */}
        <Text style={LBL}>COUNTRY</Text>
        <CountryPickerField code={code} onChange={(c) => { setCode(c); setLandmark(''); }} />

        {/* landmark — only when the country has known landmarks */}
        {landmarks.length > 0 ? (
          <>
            <Text style={LBL}>LANDMARK</Text>
            <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
              {landmarks.map((l) => {
                const active = landmark === l;
                return (
                  <Pressable key={l} onPress={() => setLandmark(active ? '' : l)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navySolid : COLORS.card }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{l}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {/* trip — only when the user has trips to attach to */}
        {expeditions.length > 0 ? (
          <>
            <Text style={LBL}>TRIP</Text>
            <TripPickerField expeditions={expeditions} selectedId={expeditionId} onSelect={setExpeditionId} />
          </>
        ) : null}

        {/* verdict */}
        <Text style={LBL}>YOUR VERDICT</Text>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {RECOMMENDATION_VERDICTS.map((v) => {
            const active = verdict === v;
            return (
              <Pressable key={v} onPress={() => setVerdict(active ? undefined : v)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.coral : COLORS.card }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{VERDICT_META[v].label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* note */}
        <Text style={LBL}>NOTE</Text>
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput value={note} onChangeText={setNote} placeholder="A line to remember it by" placeholderTextColor={COLORS.ink3} multiline style={{ fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink, minHeight: 48 }} />
        </View>

        <Pressable onPress={save} disabled={!name.trim() || saving} accessibilityRole="button" accessibilityLabel="Save changes" style={{ marginHorizontal: 20, marginTop: 18, borderRadius: 18, overflow: 'hidden', opacity: name.trim() && !saving ? 1 : 0.5 }}>
          <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 8 }}>
            {saving ? <ActivityIndicator color="#fff" /> : (
              <>
                <Check size={18} color="#fff" />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save changes</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
        </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const LBL = {
  fontFamily: 'PlusJakarta',
  fontSize: 11,
  fontWeight: '700' as const,
  letterSpacing: 1,
  color: COLORS.ink3,
  paddingHorizontal: 20,
  marginTop: 16,
};

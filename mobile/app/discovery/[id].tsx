import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useConfirm } from '../../src/store/confirm';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';
import { Trash2, Check, Search, Camera, ImagePlus, X } from 'lucide-react-native';
import { BackButton } from '../../components/BackButton';
import { DestinationImage } from '../../components/DestinationImage';
import { COLORS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { COUNTRIES, countryName } from '../../src/data/countries';
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
import { useToast } from '../../src/store/toast';

export default function DiscoveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { discoveries, updateDiscovery, removeDiscovery, expeditions } = useData();
  const { toast } = useToast();
  const confirm = useConfirm();
  const discovery = discoveries.find((d) => d.id === id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<DiscoveryCategory>('food');
  const [subcategory, setSubcategory] = useState<string | undefined>(undefined);
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [expeditionId, setExpeditionId] = useState('');
  const [verdict, setVerdict] = useState<RecommendationVerdict | undefined>(undefined);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 24);
  }, [query]);

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
      goBack();
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
          <Pressable onPress={confirmDelete} hitSlop={12} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 60, right: 20, zIndex: 20 }}>
            <Trash2 size={18} color="#fff" />
          </Pressable>
          <View style={{ paddingHorizontal: 20 }}>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1, opacity: 0.9 }}>EDIT DISCOVERY</Text>
            <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 30, marginTop: 2 }}>{name || discovery.name}</Text>
          </View>
          <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
          </Svg>
        </DestinationImage>

        {/* name */}
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 14 }}>
          <TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={COLORS.ink3} style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>

        {/* photo */}
        <View style={{ marginHorizontal: 20, marginTop: 10 }}>
          {photo ? (
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: photo }} style={{ width: '100%', height: 160, borderRadius: 18 }} contentFit="cover" />
              <Pressable onPress={() => setPhoto(null)} className="absolute rounded-full items-center justify-center" style={{ top: 10, right: 10, height: 32, width: 32, backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
              <Pressable key={c} onPress={() => { setCategory(c); setSubcategory(undefined); }} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navySolid : '#fff' }}>
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
              <Pressable key={s.id} onPress={() => setSubcategory(active ? undefined : s.id)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navySolid : '#fff' }}>
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
        <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 8 }}>
          <Search size={18} color={COLORS.ink3} />
          <TextInput value={query} onChangeText={setQuery} placeholder={code ? `${flagEmoji(code)} ${countryName(code)}` : 'Search countries'} placeholderTextColor={code ? COLORS.ink2 : COLORS.ink3} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>
        {query ? (
          <ScrollView style={{ maxHeight: 160, marginTop: 6 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {results.map((c) => {
              const active = code === c.code;
              return (
                <Pressable key={c.code} onPress={() => { setCode(c.code); setQuery(''); setLandmark(''); }} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 10, gap: 12, backgroundColor: active ? 'rgba(255,107,154,0.10)' : 'transparent' }}>
                  <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                  {active ? <Check size={18} color={COLORS.coral} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {/* landmark — only when the country has known landmarks */}
        {landmarks.length > 0 ? (
          <>
            <Text style={LBL}>LANDMARK</Text>
            <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
              {landmarks.map((l) => {
                const active = landmark === l;
                return (
                  <Pressable key={l} onPress={() => setLandmark(active ? '' : l)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navySolid : '#fff' }}>
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
              <Pressable key={v} onPress={() => setVerdict(active ? undefined : v)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.coral : '#fff' }}>
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

        <Pressable onPress={save} disabled={!name.trim() || saving} className="rounded-2xl items-center justify-center flex-row" style={{ marginHorizontal: 20, marginTop: 18, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: name.trim() && !saving ? 1 : 0.4, gap: 8 }}>
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Check size={18} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save changes</Text>
            </>
          )}
        </Pressable>
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

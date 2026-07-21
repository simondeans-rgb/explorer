import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import {
  Check,
  Search,
  Camera,
  ImagePlus,
  X,
  UtensilsCrossed,
  BedDouble,
  Landmark as LandmarkIcon,
  Ticket,
  Mountain,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { SheetShell } from './SheetShell';
import { CityField } from './CityField';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES } from '../src/data/countries';
import { countryFacts } from '../src/data/countryFacts';
import { pickPhotoDataUrl } from '../src/lib/photo';
import {
  DISCOVERY_CATEGORIES,
  DISCOVERY_CATEGORY_META,
  DISCOVERY_SUBCATEGORIES,
  RECOMMENDATION_VERDICTS,
  VERDICT_META,
  type DiscoveryCategory,
  type RecommendationVerdict,
} from '../src/types';
import { router } from 'expo-router';
import { useData } from '../src/store/data';
import { shouldGate } from '../src/lib/billing';
import { TripPickerField } from './TripPickerField';
import { useToast } from '../src/store/toast';

const CATEGORY_ICON: Record<DiscoveryCategory, ComponentType<{ size?: number; color?: string }>> = {
  food: UtensilsCrossed,
  accommodation: BedDouble,
  culture: LandmarkIcon,
  experience: Ticket,
  nature: Mountain,
};

const SectionLabel = ({ children }: { children: string }) => (
  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 1, color: COLORS.ink3, paddingHorizontal: 20, marginTop: 16 }}>
    {children}
  </Text>
);

/** A small pill toggle used for the chip groups. */
const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navySolid : '#fff' }}>
    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{label}</Text>
  </Pressable>
);

export function AddDiscoverySheet({
  visible,
  onClose,
  initialCountryCode,
  initialName,
  initialCategory,
  initialCity,
  initialSubcategory,
  initialLandmark,
  startExpanded,
}: {
  visible: boolean;
  onClose: () => void;
  initialCountryCode?: string;
  initialName?: string;
  initialCategory?: DiscoveryCategory;
  initialCity?: string;
  initialSubcategory?: string;
  initialLandmark?: string;
  /** Open with every optional field visible (e.g. from "Add full details"). */
  startExpanded?: boolean;
}) {
  const { addDiscovery, expeditions, discoveries } = useData();
  const { toast } = useToast();
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
  // Quick mode by default: name + photo + verdict only. Everything else sits
  // behind "Add more detail" so capture stays under fifteen seconds.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (initialCountryCode) setCode(initialCountryCode);
    if (initialName) setName(initialName);
    if (initialCategory) setCategory(initialCategory);
    if (initialCity) setCity(initialCity);
    if (initialSubcategory) setSubcategory(initialSubcategory);
    if (initialLandmark) setLandmark(initialLandmark);
    // Prefilled detail fields would be invisible collapsed — open them up.
    if (startExpanded || initialLandmark || initialSubcategory) setExpanded(true);
  }, [visible, initialCountryCode, initialName, initialCategory, initialCity, initialSubcategory, initialLandmark, startExpanded]);

  async function pick(source: 'camera' | 'library') {
    setPicking(true);
    try {
      const data = await pickPhotoDataUrl(source);
      if (data) setPhoto(data);
    } finally {
      setPicking(false);
    }
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 30);
  }, [query]);

  const subcategories = DISCOVERY_SUBCATEGORIES[category];
  const landmarks = useMemo(() => (code ? countryFacts(code)?.landmarks ?? [] : []), [code]);

  function chooseCategory(c: DiscoveryCategory) {
    setCategory(c);
    setSubcategory(undefined); // finer type is per-category — clear when category changes
  }
  function chooseLandmark(l: string) {
    if (landmark === l) {
      setLandmark('');
      return;
    }
    setLandmark(l);
    if (!name.trim()) setName(l); // mirror web: prefill the name from the landmark
  }

  function reset() {
    setName('');
    setCategory('food');
    setSubcategory(undefined);
    setCity('');
    setQuery('');
    setCode('');
    setLandmark('');
    setExpeditionId('');
    setVerdict(undefined);
    setNote('');
    setPhoto(null);
    setPicking(false);
    setSaving(false);
    setExpanded(false);
  }
  function close() {
    reset();
    onClose();
  }
  async function save() {
    if (!name.trim() || saving) return;
    // Paywall trigger — the 11th discovery. Inert until billing goes live.
    if (shouldGate('discoveries', discoveries.length)) {
      close();
      router.push('/upgrade?trigger=discoveries');
      return;
    }
    setSaving(true);
    try {
      await addDiscovery({
        name,
        category,
        subcategory,
        countryCode: code || undefined,
        city,
        landmark: landmark || undefined,
        expeditionId: expeditionId || undefined,
        verdict,
        note,
        photo: photo ?? undefined,
      });
      toast.success('Discovery saved');
      close();
    } catch {
      setSaving(false);
      toast.error("Couldn't save — check your connection and try again.");
    }
  }

  return (
    <SheetShell visible={visible} title="Add a discovery" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* name */}
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 4 }}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="What did you find? e.g. Sukiyabashi Jiro"
            placeholderTextColor={COLORS.ink3}
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }}
          />
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

        {/* verdict — part of quick mode: location + verdict is the minimum capture */}
        <SectionLabel>YOUR VERDICT (OPTIONAL)</SectionLabel>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {RECOMMENDATION_VERDICTS.map((v) => {
            const active = verdict === v;
            return (
              <Pressable
                key={v}
                onPress={() => setVerdict(active ? undefined : v)}
                className="rounded-full"
                style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.coral : '#fff' }}
              >
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>
                  {VERDICT_META[v].label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* everything else lives behind the expander — quick capture first */}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((e) => !e)}
          className="flex-row items-center justify-center"
          style={{ marginHorizontal: 20, marginTop: 16, paddingVertical: 11, gap: 6, borderRadius: 16, backgroundColor: 'rgba(20,33,61,0.05)' }}
        >
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '700', color: COLORS.navy }}>
            {expanded ? 'Fewer details' : 'Add more detail'}
          </Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '700', color: COLORS.coral }}>{expanded ? '‹' : '›'}</Text>
        </Pressable>
        {!expanded ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, color: COLORS.ink3, textAlign: 'center', marginTop: 5, paddingHorizontal: 32 }}>
            Category, place, trip &amp; notes
          </Text>
        ) : null}

        {expanded ? (
          <>
        {/* category */}
        <SectionLabel>CATEGORY</SectionLabel>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {DISCOVERY_CATEGORIES.map((c) => {
            const active = category === c;
            const Icon = CATEGORY_ICON[c];
            return (
              <Pressable
                key={c}
                onPress={() => chooseCategory(c)}
                className="flex-row items-center rounded-full"
                style={{ paddingHorizontal: 14, paddingVertical: 9, gap: 6, backgroundColor: active ? COLORS.navySolid : '#fff' }}
              >
                <Icon size={14} color={active ? '#fff' : COLORS.coral} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>
                  {DISCOVERY_CATEGORY_META[c].label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* type / subcategory */}
        <SectionLabel>TYPE (OPTIONAL)</SectionLabel>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {subcategories.map((s) => (
            <Chip
              key={s.id}
              label={s.label}
              active={subcategory === s.id}
              onPress={() => setSubcategory(subcategory === s.id ? undefined : s.id)}
            />
          ))}
        </View>

        {/* country */}
        <SectionLabel>COUNTRY (OPTIONAL)</SectionLabel>
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
        <ScrollView style={{ maxHeight: 180, marginTop: 6 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
          {results.map((c) => {
            const active = code === c.code;
            return (
              <Pressable
                key={c.code}
                onPress={() => {
                  setCode(active ? '' : c.code);
                  setLandmark(''); // landmarks are country-specific
                }}
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

        {/* city — type-ahead over the cities dataset, scoped to the country. */}
        <SectionLabel>CITY (OPTIONAL)</SectionLabel>
        <View style={{ marginHorizontal: 20, marginTop: 8 }}>
          <CityField value={city} onChangeText={setCity} countryCode={code || undefined} onPick={(s) => { if (!code) setCode(s.countryCode); }} placeholder="e.g. Tokyo" />
        </View>

        {/* landmark — only when a country is chosen and it has known landmarks */}
        {landmarks.length > 0 ? (
          <>
            <SectionLabel>LANDMARK (OPTIONAL)</SectionLabel>
            <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
              {landmarks.map((l) => (
                <Chip key={l} label={l} active={landmark === l} onPress={() => chooseLandmark(l)} />
              ))}
            </View>
          </>
        ) : null}

        {/* trip — only when the user has trips to attach to */}
        {expeditions.length > 0 ? (
          <>
            <SectionLabel>TRIP (OPTIONAL)</SectionLabel>
            <TripPickerField expeditions={expeditions} selectedId={expeditionId} onSelect={setExpeditionId} />
          </>
        ) : null}

        {/* note */}
        <SectionLabel>A DETAIL WORTH REMEMBERING (OPTIONAL)</SectionLabel>
        <View className="bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 }}>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Why it stayed with you…"
            placeholderTextColor={COLORS.ink3}
            multiline
            style={{ fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink, minHeight: 72, textAlignVertical: 'top' }}
          />
        </View>
          </>
        ) : null}

        <Pressable
          onPress={save}
          disabled={!name.trim() || saving}
          className="rounded-2xl items-center justify-center flex-row"
          style={{ marginHorizontal: 20, marginTop: 20, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: name.trim() && !saving ? 1 : 0.4, gap: 8 }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Check size={18} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Save discovery</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SheetShell>
  );
}

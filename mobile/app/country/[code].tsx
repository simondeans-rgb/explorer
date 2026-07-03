import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Camera,
  Plus,
  Building2,
  Coins,
  Users,
  Maximize2,
  ChevronRight,
  Pencil,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { AddDiscoverySheet } from '../../components/AddDiscoverySheet';
import { AddPhotoSheet } from '../../components/AddPhotoSheet';
import { DestinationImage } from '../../components/DestinationImage';
import { BackButton } from '../../components/BackButton';
import { PassportStamp } from '../../components/PassportStamp';
import { DiscoveryCard } from '../../components/DiscoveryCard';
import { EditCitySheet } from '../../components/EditCitySheet';
import { LandmarkDetailSheet, type LandmarkPerson } from '../../components/LandmarkDetailSheet';
import { COLORS, SHADOW } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName, continentOf } from '../../src/data/countries';
import { countryFacts } from '../../src/data/countryFacts';
import { landmarkCity } from '../../src/data/landmarkCities';
import { useLandmarkInfo } from '../../src/lib/landmarkInfo';
import {
  RELATIONSHIP_META,
  JOURNEY_MODE_META,
  type RecommendationVerdict,
  type Place,
} from '../../src/types';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useData } from '../../src/store/data';
import { useUnits } from '../../src/store/units';
import { convertAreaKm2, areaUnitLabel, convertCelsius, tempUnitLabel, type TempUnit } from '../../src/lib/units';
import { useAuth } from '../../src/store/auth';
import { useFriends } from '../../src/hooks/useFriends';
import { goBack } from '../../src/lib/nav';

// Best-first: positive verdicts lead, then neutral, then negatives.
const VERDICT_ORDER: Record<string, number> = {
  recommend: 0,
  'hidden-gem': 1,
  'worth-visiting': 2,
  _none: 3,
  overrated: 4,
  avoid: 5,
};

const VERDICT_LABEL: Record<string, string> = {
  recommend: 'Recommends',
  'hidden-gem': 'Hidden gem',
  'worth-visiting': 'Worth a visit',
  overrated: 'Overrated',
  avoid: 'Would avoid',
};

/** Rough northern-hemisphere season for an ISO date — used to tell apart two
 *  trips to the same country in the same year. */
function seasonOf(iso?: string): string {
  const m = iso ? Number(iso.slice(5, 7)) : 0;
  if (!m) return '';
  if (m === 12 || m <= 2) return 'Winter';
  if (m <= 5) return 'Spring';
  if (m <= 8) return 'Summer';
  return 'Autumn';
}

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

function Fact({ icon: Icon, label, value, tint = COLORS.coral }: { icon: ComponentType<{ size?: number; color?: string }>; label: string; value: string; tint?: string }) {
  return (
    <View className="rounded-2xl" style={{ flexGrow: 1, flexBasis: '47%', padding: 14, backgroundColor: `${tint}14` }}>
      <View className="flex-row items-center" style={{ gap: 7 }}>
        <View className="rounded-lg items-center justify-center" style={{ height: 24, width: 24, backgroundColor: `${tint}2B` }}>
          <Icon size={13} color={tint} />
        </View>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: COLORS.ink2 }}>{label.toUpperCase()}</Text>
      </View>
      <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 6 }}>{value}</Text>
    </View>
  );
}

function TempChart({ temps, tempUnit }: { temps: number[]; tempUnit: TempUnit }) {
  const max = Math.max(...temps, 1);
  const min = Math.min(...temps, 0);
  const span = Math.max(max - min, 1);
  return (
    <View className="rounded-2xl" style={{ padding: 16, backgroundColor: 'rgba(77,166,255,0.08)' }}>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: COLORS.ink2 }}>AVERAGE TEMPERATURE {tempUnitLabel(tempUnit)}</Text>
      <View className="flex-row items-end" style={{ height: 92, marginTop: 12, gap: 3 }}>
        {temps.map((t, i) => {
          const h = 10 + Math.round(((t - min) / span) * 52);
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.ink2, marginBottom: 3 }}>{convertCelsius(t, tempUnit)}°</Text>
              <View style={{ width: '100%', height: h, borderRadius: 4, backgroundColor: t >= 24 ? COLORS.coral : t >= 12 ? COLORS.sunburst : COLORS.aqua }} />
            </View>
          );
        })}
      </View>
      <View className="flex-row" style={{ marginTop: 6, gap: 4 }}>
        {MONTHS.map((m, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3 }}>{m}</Text>
        ))}
      </View>
    </View>
  );
}

function CircleAvatar({ name }: { name: string }) {
  return (
    <View className="rounded-full items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(155,124,255,0.16)' }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.lavender }}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
      <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginBottom: 10 }}>{title}</Text>
      {children}
    </View>
  );
}

/** A landmark row with a real photo (a Wikipedia image, falling back to the
 *  country's stock photo). Tapping it opens the detail sheet; the + records a
 *  discovery prefilled for this landmark. */
function LandmarkRow({
  code,
  landmark,
  hint,
  recorded,
  friendCount,
  onOpen,
  onAdd,
}: {
  code: string;
  landmark: string;
  hint?: string;
  recorded: boolean;
  friendCount: number;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const info = useLandmarkInfo(landmark, true, hint);
  return (
    <Pressable onPress={onOpen} className="bg-white rounded-2xl flex-row items-center" style={{ padding: 12, gap: 12 }}>
      <View style={{ height: 60, width: 60, borderRadius: 14, overflow: 'hidden' }}>
        {info?.image ? (
          <Image source={{ uri: info.image }} style={{ height: 60, width: 60 }} contentFit="cover" transition={200} cachePolicy="memory-disk" />
        ) : (
          <DestinationImage code={code} style={{ height: 60, width: 60 }} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{landmark}</Text>
        {recorded ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.aqua, marginTop: 1 }}>You've been ✓</Text>
        ) : friendCount > 0 ? (
          <View className="flex-row items-center" style={{ gap: 4, marginTop: 2 }}>
            <Users size={12} color={COLORS.lavender} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, fontWeight: '700', color: COLORS.lavender }}>{friendCount} {friendCount === 1 ? 'friend' : 'friends'}</Text>
          </View>
        ) : (
          <View className="flex-row items-center" style={{ gap: 3, marginTop: 2 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, color: COLORS.ink3 }}>View details</Text>
            <ChevronRight size={12} color={COLORS.ink3} />
          </View>
        )}
      </View>
      <Pressable onPress={onAdd} hitSlop={6} className="rounded-full items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.coral }}>
        <Plus size={18} color="#fff" strokeWidth={2.6} />
      </Pressable>
    </Pressable>
  );
}

export default function CountryScreen() {
  const { code: rawCode } = useLocalSearchParams<{ code: string }>();
  const code = (rawCode ?? '').toUpperCase();
  const { aggregates, discoveries, expeditions } = useWorldly();
  const { captures } = useData();
  const { unit, tempUnit } = useUnits();
  const { user } = useAuth();
  const myName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'You');
  const { friends, friendsData } = useFriends(user?.uid, myName);
  const [discOpen, setDiscOpen] = useState(false);
  const [discName, setDiscName] = useState<string | undefined>(undefined);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [editCity, setEditCity] = useState<Place | null>(null);
  const [landmarkDetail, setLandmarkDetail] = useState<
    { name: string; photo?: string; own?: { verdict?: RecommendationVerdict; note?: string } | null; friends: LandmarkPerson[] } | null
  >(null);

  // Friends' discoveries in this country, with the friend's name attached.
  const friendDiscoveries = useMemo(() => {
    const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
    return friendsData.discoveries
      .filter((d) => d.countryCode === code)
      .map((d) => ({ name: d.name, verdict: d.verdict, note: d.note, photo: d.photo, uid: d.userId, friend: nameByUid.get(d.userId) ?? 'Friend' }));
  }, [friendsData.discoveries, friends, code]);

  function friendsForLandmark(landmark: string) {
    const ll = landmark.toLowerCase();
    const seen = new Map<string, { person: LandmarkPerson; photo?: string }>();
    for (const d of friendDiscoveries) {
      const dn = d.name.toLowerCase();
      if (dn.includes(ll) || ll.includes(dn)) seen.set(d.uid, { person: { name: d.friend, verdict: d.verdict, note: d.note }, photo: d.photo });
    }
    return [...seen.values()];
  }

  function openAddDiscovery(name?: string) {
    setDiscName(name);
    setDiscOpen(true);
  }

  const agg = useMemo(() => aggregates.find((a) => a.code === code), [aggregates, code]);
  const facts = countryFacts(code);
  const myDiscoveries = useMemo(
    () =>
      discoveries
        .filter((d) => d.countryCode === code)
        .sort((a, b) => (VERDICT_ORDER[a.verdict ?? '_none'] ?? 3) - (VERDICT_ORDER[b.verdict ?? '_none'] ?? 3)),
    [discoveries, code],
  );
  const myJourneys = useMemo(() => {
    const list = expeditions.filter((e) => e.countryCodes.includes(code));
    // Home-country cards shouldn't list trips that merely start/return home —
    // those belong to where you actually went. Keep only trips that are wholly
    // within your home country/countries (genuinely about this place).
    const homeCodes = new Set(
      aggregates.filter((a) => a.relationships.includes('lived') || a.relationships.includes('based')).map((a) => a.code),
    );
    if (!homeCodes.has(code)) return list;
    return list.filter((e) => e.countryCodes.every((c) => homeCodes.has(c)));
  }, [expeditions, code, aggregates]);
  const myPhotos = useMemo(() => captures.filter((c) => c.countryCode === code), [captures, code]);

  // Friends in your circle who've been to this country, with their top rec.
  const circleHere = useMemo(() => {
    const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
    const present = new Map<string, string>();
    for (const p of friendsData.places) {
      if (p.countryCode !== code) continue;
      if (!p.relationships.some((r) => r !== 'aspiring')) continue;
      if (!present.has(p.userId)) present.set(p.userId, nameByUid.get(p.userId) ?? 'Friend');
    }
    const rank = (v?: string) => VERDICT_ORDER[v ?? '_none'] ?? 3;
    const topByUid = new Map<string, { name: string; verdict?: RecommendationVerdict }>();
    for (const d of friendDiscoveries) {
      if (!present.has(d.uid)) continue;
      const cur = topByUid.get(d.uid);
      if (!cur || rank(d.verdict) < rank(cur.verdict)) topByUid.set(d.uid, { name: d.name, verdict: d.verdict });
    }
    return [...present.entries()]
      .map(([uid, fname]) => ({ uid, name: fname, top: topByUid.get(uid) }))
      .sort((a, b) => (a.top ? 0 : 1) - (b.top ? 0 : 1));
  }, [friendsData.places, friends, friendDiscoveries, code]);

  // Same-country-same-year trips get a season suffix so they're distinguishable.
  const dupJourneyKeys = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of myJourneys) {
      const k = `${e.countryCodes[0] ?? ''}|${e.startDate?.slice(0, 4) ?? '?'}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([k]) => k));
  }, [myJourneys]);

  const name = countryName(code) || code;
  const continent = agg?.continent ?? continentOf(code);
  const rels = (agg?.relationships ?? []).filter((r) => r !== 'aspiring');
  const cities = agg?.cities ?? [];

  // Open the rich detail sheet for a landmark — your saved note + any friends'.
  function openLandmarkDetail(landmark: string) {
    const recorded = myDiscoveries.find((d) => d.landmark === landmark || d.name.toLowerCase() === landmark.toLowerCase());
    const fl = friendsForLandmark(landmark);
    const photo = recorded?.photo ?? fl.find((f) => f.photo)?.photo;
    setLandmarkDetail({
      name: landmark,
      photo,
      own: recorded ? { verdict: recorded.verdict, note: recorded.note } : null,
      friends: fl.map((f) => f.person),
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 112 }}>
        {/* Hero */}
        <DestinationImage code={code} scrim motion style={{ position: 'relative', paddingTop: 60, paddingBottom: 52, minHeight: 240, justifyContent: 'flex-end' }}>
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 60, left: 20, zIndex: 20 }} />
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 52 }}>{flagEmoji(code)}</Text>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 38, marginTop: 6 }}>{name}</Text>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, opacity: 0.95, marginTop: 2 }}>
              {continent ?? 'Somewhere on Earth'}
              {agg?.firstYear ? ` · since ${agg.firstYear}` : ''}
            </Text>
          </View>
          {agg ? <PassportStamp aggregate={agg} size={124} corner="center" /> : null}
          <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
          </Svg>
        </DestinationImage>

        {/* Quick actions */}
        <View className="flex-row" style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          <Pressable onPress={() => openAddDiscovery()} className="flex-row items-center justify-center bg-white rounded-2xl" style={{ flex: 1, paddingVertical: 13, gap: 7 }}>
            <Plus size={16} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Discovery</Text>
          </Pressable>
          <Pressable onPress={() => setPhotoOpen(true)} className="flex-row items-center justify-center bg-white rounded-2xl" style={{ flex: 1, paddingVertical: 13, gap: 7 }}>
            <Camera size={16} color={COLORS.coral} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy }}>Photo</Text>
          </Pressable>
        </View>

        {/* About */}
        {facts ? (
          <Section title={`About ${name}`}>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              <Fact icon={Building2} label="Capital" value={facts.capital} tint={COLORS.coral} />
              <Fact icon={Coins} label="Currency" value={facts.currency} tint={COLORS.sunburst} />
              <Fact icon={Users} label="Population" value={fmtNum(facts.population)} tint={COLORS.aqua} />
              <Fact icon={Maximize2} label="Area" value={`${fmtNum(convertAreaKm2(facts.areaKm2, unit))} ${areaUnitLabel(unit)}`} tint={COLORS.lavender} />
            </View>
            {facts.temps && facts.temps.length === 12 ? (
              <View style={{ marginTop: 10 }}>
                <TempChart temps={facts.temps} tempUnit={tempUnit} />
              </View>
            ) : null}
          </Section>
        ) : null}

        {/* Landmarks */}
        {facts?.landmarks && facts.landmarks.length > 0 ? (
          <Section title="Landmarks & sights">
            <View style={{ gap: 8 }}>
              {facts.landmarks.map((l) => {
                const recorded = !!myDiscoveries.find((d) => d.landmark === l || d.name.toLowerCase() === l.toLowerCase());
                const fl = friendsForLandmark(l);
                return (
                  <LandmarkRow
                    key={l}
                    code={code}
                    landmark={l}
                    hint={name}
                    recorded={recorded}
                    friendCount={fl.length}
                    onOpen={() => openLandmarkDetail(l)}
                    onAdd={() => openAddDiscovery(l)}
                  />
                );
              })}
            </View>
          </Section>
        ) : null}

        {/* Your relationship */}
        {rels.length > 0 || agg?.aspiring ? (
          <Section title="Your relationship">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {agg?.aspiring && rels.length === 0 ? (
                <View className="rounded-full" style={{ backgroundColor: 'rgba(155,124,255,0.16)', paddingHorizontal: 12, paddingVertical: 7 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.lavender }}>On your wishlist</Text>
                </View>
              ) : null}
              {rels.map((r) => (
                <View key={r} className="rounded-full" style={{ backgroundColor: COLORS.navy, paddingHorizontal: 12, paddingVertical: 7 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: '#fff' }}>{RELATIONSHIP_META[r].label}</Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {/* Cities */}
        {cities.length > 0 ? (
          <Section title="Cities">
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {cities.map((c) => (
                <Pressable key={c.id} onPress={() => setEditCity(c)} className="rounded-full bg-white flex-row items-center" style={{ paddingHorizontal: 14, paddingVertical: 8, gap: 6, ...SHADOW.card }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2 }}>{c.name}{c.firstYear ? ` · ${c.firstYear}` : ''}</Text>
                  <Pencil size={12} color={COLORS.ink3} />
                </Pressable>
              ))}
            </View>
          </Section>
        ) : null}

        {/* Memories */}
        {myPhotos.length > 0 ? (
          <Section title={`Memories (${myPhotos.length})`}>
            <View style={{ marginHorizontal: -20 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
                {myPhotos.map((p) => (
                  <View key={p.id} style={{ width: 150, borderRadius: 20, overflow: 'hidden' }}>
                    <Image source={{ uri: p.dataUrl }} style={{ width: 150, height: 190 }} contentFit="cover" transition={200} />
                    {p.caption ? (
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.55)']} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, paddingTop: 30 }}>
                        <Text numberOfLines={2} className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600' }}>{p.caption}</Text>
                      </LinearGradient>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            </View>
          </Section>
        ) : null}

        {/* Discoveries — best first */}
        {myDiscoveries.length > 0 ? (
          <Section title={`Discoveries (${myDiscoveries.length})`}>
            <View style={{ gap: 10 }}>
              {myDiscoveries.map((d) => (
                <DiscoveryCard key={d.id} discovery={d} onPress={() => router.push(`/discovery/${d.id}`)} />
              ))}
            </View>
          </Section>
        ) : null}

        {/* Circle discovery gap — you've been here but logged nothing yet. */}
        {rels.length > 0 && myDiscoveries.length === 0 ? (
          <Pressable onPress={() => setDiscOpen(true)} className="rounded-3xl" style={{ marginHorizontal: 20, marginTop: 4, padding: 16, gap: 6, backgroundColor: 'rgba(255,107,154,0.08)' }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>Your Circle hasn’t seen your picks yet</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, lineHeight: 19 }}>
              You’ve been to {name} — add your first discovery so your Circle can see what you loved.
            </Text>
            <View className="flex-row items-center rounded-full" style={{ alignSelf: 'flex-start', backgroundColor: COLORS.coral, paddingHorizontal: 14, paddingVertical: 9, gap: 6, marginTop: 4 }}>
              <Plus size={15} color="#fff" />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: '#fff' }}>Add your first discovery</Text>
            </View>
          </Pressable>
        ) : null}

        {/* Your Circle — friends who've been here + their top rec */}
        {friends.length > 0 ? (
          <Section title="Your Circle">
            {circleHere.length > 0 ? (
              <View style={{ gap: 10 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginBottom: 2 }}>
                  {circleHere.length} {circleHere.length === 1 ? 'person' : 'people'} in your circle {circleHere.length === 1 ? 'has' : 'have'} been to {name}.
                </Text>
                {circleHere.map((f) => (
                  <View key={f.uid} className="bg-white rounded-3xl flex-row items-center" style={{ padding: 14, gap: 12 }}>
                    <CircleAvatar name={f.name} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{f.name}</Text>
                      {f.top ? (
                        <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 1 }}>
                          {VERDICT_LABEL[f.top.verdict ?? ''] ?? 'Loved'}: {f.top.name}
                        </Text>
                      ) : (
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 1 }}>Visited {name}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-white rounded-3xl" style={{ padding: 16 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, color: COLORS.ink3, textAlign: 'center' }}>
                  None of your circle have been here yet — be the first.
                </Text>
              </View>
            )}
          </Section>
        ) : null}

        {/* Journeys */}
        {myJourneys.length > 0 ? (
          <Section title={`Journeys (${myJourneys.length})`}>
            <View style={{ gap: 10 }}>
              {myJourneys.map((e) => {
                const key = `${e.countryCodes[0] ?? ''}|${e.startDate?.slice(0, 4) ?? '?'}`;
                const season = dupJourneyKeys.has(key) ? seasonOf(e.startDate) : '';
                return (
                  <View key={e.id} className="bg-white rounded-3xl" style={{ padding: 16 }}>
                    <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>{season ? `${e.title} · ${season}` : e.title}</Text>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 2 }}>
                      {e.countryCodes.map((c) => flagEmoji(c)).join(' ')}
                      {e.startDate ? ` · ${e.startDate.slice(0, 4)}` : ''}
                      {e.journeys[0] ? ` · ${JOURNEY_MODE_META[e.journeys[0].mode].label}` : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Section>
        ) : null}

        {/* Empty */}
        {rels.length === 0 && !agg?.aspiring && myDiscoveries.length === 0 && myPhotos.length === 0 && myJourneys.length === 0 ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink3, textAlign: 'center' }}>
              Nothing here yet. Add a discovery or photo to start {name}'s story.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <AddDiscoverySheet
        visible={discOpen}
        onClose={() => { setDiscOpen(false); setDiscName(undefined); }}
        initialCountryCode={code}
        initialName={discName}
        initialCategory={discName ? 'culture' : undefined}
        initialSubcategory={discName ? 'landmark' : undefined}
        initialLandmark={discName}
        initialCity={discName ? landmarkCity(discName) ?? facts?.capital : undefined}
      />
      <AddPhotoSheet visible={photoOpen} onClose={() => setPhotoOpen(false)} initialCountryCode={code} />
      <EditCitySheet city={editCity} onClose={() => setEditCity(null)} />

      {/* Landmark / place detail */}
      <LandmarkDetailSheet
        visible={!!landmarkDetail}
        onClose={() => setLandmarkDetail(null)}
        name={landmarkDetail?.name}
        countryCode={code}
        placeLabel={name}
        hint={name}
        photo={landmarkDetail?.photo}
        own={landmarkDetail?.own}
        friends={landmarkDetail?.friends ?? []}
      />
    </View>
  );
}

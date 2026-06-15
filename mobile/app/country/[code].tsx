import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ChevronLeft,
  Camera,
  Plus,
  Building2,
  Coins,
  Users,
  Maximize2,
  Landmark,
  X,
} from 'lucide-react-native';
import type { ComponentType } from 'react';
import { AddDiscoverySheet } from '../../components/AddDiscoverySheet';
import { AddPhotoSheet } from '../../components/AddPhotoSheet';
import { DestinationImage } from '../../components/DestinationImage';
import { DiscoveryCard } from '../../components/DiscoveryCard';
import { COLORS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName, continentOf } from '../../src/data/countries';
import { countryFacts } from '../../src/data/countryFacts';
import {
  RELATIONSHIP_META,
  JOURNEY_MODE_META,
  VERDICT_META,
} from '../../src/types';
import { useWorldly } from '../../src/hooks/useWorldly';
import { useData } from '../../src/store/data';
import { useAuth } from '../../src/store/auth';
import { useFriends } from '../../src/hooks/useFriends';

// Best-first: positive verdicts lead, then neutral, then negatives.
const VERDICT_ORDER: Record<string, number> = {
  recommend: 0,
  'hidden-gem': 1,
  'worth-visiting': 2,
  _none: 3,
  overrated: 4,
  avoid: 5,
};

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return `${n}`;
}

function Fact({ icon: Icon, label, value }: { icon: ComponentType<{ size?: number; color?: string }>; label: string; value: string }) {
  return (
    <View className="bg-white rounded-2xl" style={{ flexGrow: 1, flexBasis: '47%', padding: 14 }}>
      <View className="flex-row items-center" style={{ gap: 6 }}>
        <Icon size={14} color={COLORS.coral} />
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: COLORS.ink3 }}>{label.toUpperCase()}</Text>
      </View>
      <Text numberOfLines={1} style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy, marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function TempChart({ temps }: { temps: number[] }) {
  const max = Math.max(...temps, 1);
  const min = Math.min(...temps, 0);
  const span = Math.max(max - min, 1);
  return (
    <View className="bg-white rounded-2xl" style={{ padding: 16 }}>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: COLORS.ink3 }}>AVERAGE TEMPERATURE °C</Text>
      <View className="flex-row items-end" style={{ height: 70, marginTop: 12, gap: 4 }}>
        {temps.map((t, i) => {
          const h = 10 + Math.round(((t - min) / span) * 52);
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ width: '100%', height: h, borderRadius: 4, backgroundColor: t >= 24 ? COLORS.coral : t >= 12 ? COLORS.sunburst : COLORS.aqua }} />
            </View>
          );
        })}
      </View>
      <View className="flex-row" style={{ marginTop: 6, gap: 4 }}>
        {MONTHS.map((m, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'PlusJakarta', fontSize: 9, color: COLORS.ink3 }}>{m}</Text>
        ))}
      </View>
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

export default function CountryScreen() {
  const { code: rawCode } = useLocalSearchParams<{ code: string }>();
  const code = (rawCode ?? '').toUpperCase();
  const { aggregates, discoveries, expeditions } = useWorldly();
  const { captures } = useData();
  const { user } = useAuth();
  const myName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'You');
  const { friends, friendsData } = useFriends(user?.uid, myName);
  const [discOpen, setDiscOpen] = useState(false);
  const [discName, setDiscName] = useState<string | undefined>(undefined);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [whoModal, setWhoModal] = useState<{ landmark: string; people: { name: string; verdict?: string }[] } | null>(null);

  // Friends' discoveries in this country, with the friend's name attached.
  const friendDiscoveries = useMemo(() => {
    const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
    return friendsData.discoveries
      .filter((d) => d.countryCode === code)
      .map((d) => ({ name: d.name, verdict: d.verdict, uid: d.userId, friend: nameByUid.get(d.userId) ?? 'Friend' }));
  }, [friendsData.discoveries, friends, code]);

  function friendsForLandmark(landmark: string) {
    const ll = landmark.toLowerCase();
    const seen = new Map<string, { name: string; verdict?: string }>();
    for (const d of friendDiscoveries) {
      const dn = d.name.toLowerCase();
      if (dn.includes(ll) || ll.includes(dn)) seen.set(d.uid, { name: d.friend, verdict: d.verdict });
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
  const myJourneys = useMemo(() => expeditions.filter((e) => e.countryCodes.includes(code)), [expeditions, code]);
  const myPhotos = useMemo(() => captures.filter((c) => c.countryCode === code), [captures, code]);

  const name = countryName(code) || code;
  const continent = agg?.continent ?? continentOf(code);
  const rels = (agg?.relationships ?? []).filter((r) => r !== 'aspiring');
  const cities = agg?.cities ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 112 }}>
        {/* Hero */}
        <DestinationImage code={code} scrim motion style={{ position: 'relative', paddingTop: 60, paddingBottom: 52, minHeight: 240, justifyContent: 'flex-end' }}>
          <Pressable onPress={() => router.back()} hitSlop={8} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 60, left: 20 }}>
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 52 }}>{flagEmoji(code)}</Text>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 38, marginTop: 6 }}>{name}</Text>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, opacity: 0.95, marginTop: 2 }}>
              {continent ?? 'Somewhere on Earth'}
              {agg?.firstYear ? ` · since ${agg.firstYear}` : ''}
            </Text>
          </View>
          <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,64 C220,118 460,16 720,44 C980,72 1220,120 1440,70 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
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
              <Fact icon={Building2} label="Capital" value={facts.capital} />
              <Fact icon={Coins} label="Currency" value={facts.currency} />
              <Fact icon={Users} label="Population" value={fmtNum(facts.population)} />
              <Fact icon={Maximize2} label="Area" value={`${fmtNum(facts.areaKm2)} km²`} />
            </View>
            {facts.temps && facts.temps.length === 12 ? (
              <View style={{ marginTop: 10 }}>
                <TempChart temps={facts.temps} />
              </View>
            ) : null}
          </Section>
        ) : null}

        {/* Landmarks */}
        {facts?.landmarks && facts.landmarks.length > 0 ? (
          <Section title="Landmarks & sights">
            <View style={{ gap: 8 }}>
              {facts.landmarks.map((l) => {
                const recorded = myDiscoveries.find((d) => d.landmark === l || d.name.toLowerCase() === l.toLowerCase());
                const fl = friendsForLandmark(l);
                return (
                  <View key={l} className="bg-white rounded-2xl flex-row items-center" style={{ padding: 14, gap: 10 }}>
                    <View className="rounded-xl items-center justify-center" style={{ height: 38, width: 38, backgroundColor: 'rgba(255,107,154,0.12)' }}>
                      <Landmark size={18} color={COLORS.coral} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{l}</Text>
                      {recorded ? (
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.aqua, marginTop: 1 }}>You've been ✓</Text>
                      ) : null}
                    </View>

                    {/* friends who visited */}
                    {fl.length > 0 ? (
                      <Pressable onPress={() => setWhoModal({ landmark: l, people: fl })} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(155,124,255,0.14)', paddingHorizontal: 8, paddingVertical: 5, gap: 4 }}>
                        <Users size={13} color={COLORS.lavender} />
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.lavender }}>{fl.length}</Text>
                      </Pressable>
                    ) : null}

                    {/* add to discoveries */}
                    <Pressable onPress={() => openAddDiscovery(l)} hitSlop={6} className="rounded-full items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.coral }}>
                      <Plus size={18} color="#fff" strokeWidth={2.6} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </Section>
        ) : null}

        {/* Your connection */}
        {rels.length > 0 || agg?.aspiring ? (
          <Section title="Your connection">
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
                <View key={c.id} className="rounded-full bg-white" style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2 }}>{c.name}</Text>
                </View>
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
                <DiscoveryCard key={d.id} discovery={d} />
              ))}
            </View>
          </Section>
        ) : null}

        {/* Journeys */}
        {myJourneys.length > 0 ? (
          <Section title={`Journeys (${myJourneys.length})`}>
            <View style={{ gap: 10 }}>
              {myJourneys.map((e) => (
                <View key={e.id} className="bg-white rounded-3xl" style={{ padding: 16 }}>
                  <Text style={{ fontFamily: 'Fraunces', fontSize: 17, color: COLORS.navy }}>{e.title}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 2 }}>
                    {e.countryCodes.map((c) => flagEmoji(c)).join(' ')}
                    {e.startDate ? ` · ${e.startDate.slice(0, 4)}` : ''}
                    {e.journeys[0] ? ` · ${JOURNEY_MODE_META[e.journeys[0].mode].label}` : ''}
                  </Text>
                </View>
              ))}
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

      <AddDiscoverySheet visible={discOpen} onClose={() => { setDiscOpen(false); setDiscName(undefined); }} initialCountryCode={code} initialName={discName} />
      <AddPhotoSheet visible={photoOpen} onClose={() => setPhotoOpen(false)} initialCountryCode={code} />

      {/* Who visited this landmark */}
      <Modal visible={!!whoModal} transparent animationType="fade" onRequestClose={() => setWhoModal(null)}>
        <Pressable onPress={() => setWhoModal(null)} style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32, backgroundColor: 'rgba(14,16,24,0.5)' }}>
          <Pressable onPress={(e) => e.stopPropagation()} className="bg-white rounded-3xl" style={{ padding: 20 }}>
            <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
              <Text style={{ flex: 1, fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy }}>{whoModal?.landmark}</Text>
              <Pressable onPress={() => setWhoModal(null)} hitSlop={8} className="rounded-full items-center justify-center" style={{ height: 30, width: 30, backgroundColor: COLORS.warmwhite }}>
                <X size={16} color={COLORS.ink2} />
              </Pressable>
            </View>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 2, marginBottom: 12 }}>Visited by your circle</Text>
            <View style={{ gap: 8 }}>
              {(whoModal?.people ?? []).map((p, i) => (
                <View key={i} className="flex-row items-center" style={{ gap: 10 }}>
                  <View className="rounded-full items-center justify-center" style={{ height: 36, width: 36, backgroundColor: 'rgba(155,124,255,0.16)' }}>
                    <Text style={{ fontFamily: 'Fraunces', fontSize: 15, color: COLORS.lavender }}>{p.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{p.name}</Text>
                  {p.verdict ? (
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{VERDICT_META[p.verdict as keyof typeof VERDICT_META]?.label}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

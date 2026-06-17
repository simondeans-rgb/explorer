import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, Users, X, UserPlus, LogOut } from 'lucide-react-native';
import { DestinationImage } from '../../components/DestinationImage';
import { AddItinerarySheet } from '../../components/AddItinerarySheet';
import { ItineraryPlanner, type Suggestion } from '../../components/ItineraryPlanner';
import { COLORS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { VERDICT_META, type RecommendationVerdict } from '../../src/types';
import { useData } from '../../src/store/data';
import { useAuth } from '../../src/store/auth';
import { useFriends } from '../../src/hooks/useFriends';
import { goBack } from '../../src/lib/nav';

export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, addItineraryItem, removeItineraryItem, updateItineraryItem, addTripCollaborator, removeTripCollaborator } = useData();
  const { user } = useAuth();
  const myName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'You');
  const { friends, friendsData } = useFriends(user?.uid, myName);
  const [addOpen, setAddOpen] = useState(false);
  const [crewOpen, setCrewOpen] = useState(false);
  const [detail, setDetail] = useState<{ title: string; friend?: string; verdict?: RecommendationVerdict; note?: string; sugg?: Suggestion } | null>(null);

  const trip = trips.find((t) => t.id === id);

  // Friends' discoveries in this trip's country.
  const friendDiscoveries = useMemo(() => {
    if (!trip) return [];
    const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
    return friendsData.discoveries
      .filter((d) => d.countryCode === trip.countryCode)
      .map((d) => ({ id: d.id, name: d.name, city: d.city, verdict: d.verdict, category: d.category, subcategory: d.subcategory, note: d.note, friend: nameByUid.get(d.userId) ?? 'Friend' }));
  }, [trip, friends, friendsData.discoveries]);

  if (!trip) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.warmwhite, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>Trip not found</Text>
        <Pressable onPress={goBack} style={{ marginTop: 14 }}><Text style={{ fontFamily: 'PlusJakarta', color: COLORS.coral, fontWeight: '700' }}>Go back</Text></Pressable>
      </View>
    );
  }

  const days = Math.max(0, Math.ceil((Date.parse(trip.startDate) - Date.now()) / 86_400_000));
  const itineraryNames = new Set(trip.itinerary.map((i) => i.name.toLowerCase()));

  // Number of days in the trip (defaults to 3 when no end date is set).
  const dayCount = (() => {
    if (trip.endDate && trip.startDate) {
      const n = Math.floor((Date.parse(trip.endDate) - Date.parse(trip.startDate)) / 86_400_000) + 1;
      return Math.min(Math.max(n, 1), 21);
    }
    return 3;
  })();

  // Friends' picks not already on the plan — draggable into a day.
  const suggestions: Suggestion[] = friendDiscoveries
    .filter((d) => !itineraryNames.has(d.name.toLowerCase()))
    .map((d) => ({ id: d.id, name: d.name, city: d.city, category: d.category, subcategory: d.subcategory, verdict: d.verdict, friend: d.friend, note: d.note }));

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 112 }}>
        {/* Hero */}
        <DestinationImage code={trip.countryCode} scrim motion style={{ position: 'relative', paddingTop: 60, paddingBottom: 52, minHeight: 230, justifyContent: 'flex-end' }}>
          <Pressable onPress={goBack} hitSlop={12} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: "absolute", top: 60, left: 20, zIndex: 20 }}>
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
          <View style={{ paddingHorizontal: 20 }}>
            {days > 0 ? (
              <View className="flex-row items-baseline" style={{ gap: 9 }}>
                <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 60, lineHeight: 60, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 }}>{days}</Text>
                <Text className="text-white" style={{ fontFamily: 'PlusJakarta-Bold', fontSize: 15, letterSpacing: 2, opacity: 0.92, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 }}>{days === 1 ? 'DAY TO GO' : 'DAYS TO GO'}</Text>
              </View>
            ) : (
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta-Bold', fontSize: 13, letterSpacing: 2, opacity: 0.92, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 }}>HAPPENING NOW</Text>
            )}
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 34, marginTop: 8 }}>{trip.title}</Text>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, opacity: 0.95, marginTop: 2 }}>
              {flagEmoji(trip.countryCode)} {countryName(trip.countryCode)}
              {trip.startDate ? ` · ${trip.startDate.slice(0, 7)}` : ''}
            </Text>
          </View>
          <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,72 C240,44 480,40 720,58 C960,76 1200,92 1440,72 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
          </Svg>
        </DestinationImage>

        {trip.note ? (
          <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 15, fontStyle: 'italic', color: COLORS.ink2, borderLeftWidth: 2, borderLeftColor: 'rgba(255,107,154,0.5)', paddingLeft: 12 }}>{trip.note}</Text>
          </View>
        ) : null}

        {/* Trip crew — collaborate on the itinerary */}
        {user ? (() => {
          const isOwner = trip.userId === user.uid;
          const available = friends.filter((f) => !trip.memberIds.includes(f.uid));
          const nameOf = (m: string) => (m === user.uid ? 'You' : trip.memberNames?.[m] ?? friends.find((f) => f.uid === m)?.name ?? 'Friend');
          return (
            <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
              <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Trip crew</Text>
                {isOwner && available.length > 0 ? (
                  <Pressable onPress={() => setCrewOpen((v) => !v)} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(155,124,255,0.14)', paddingHorizontal: 12, paddingVertical: 7, gap: 5 }}>
                    <UserPlus size={14} color={COLORS.lavender} />
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.lavender }}>Add friend</Text>
                  </Pressable>
                ) : null}
              </View>

              <View className="bg-white rounded-3xl" style={{ padding: 14, gap: 12 }}>
                {trip.memberIds.map((m) => {
                  const owner = m === trip.userId;
                  const label = nameOf(m);
                  return (
                    <View key={m} className="flex-row items-center" style={{ gap: 10 }}>
                      <View className="rounded-full items-center justify-center" style={{ height: 34, width: 34, backgroundColor: 'rgba(155,124,255,0.16)' }}>
                        <Text style={{ fontFamily: 'Fraunces', fontSize: 14, color: COLORS.lavender }}>{label.charAt(0).toUpperCase()}</Text>
                      </View>
                      <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{label}</Text>
                      {owner ? (
                        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '700', color: COLORS.ink3 }}>OWNER</Text>
                      ) : isOwner ? (
                        <Pressable onPress={() => removeTripCollaborator(trip.id, m)} hitSlop={8}><X size={16} color={COLORS.ink3} /></Pressable>
                      ) : null}
                    </View>
                  );
                })}
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, lineHeight: 17 }}>
                  {trip.memberIds.length === 1
                    ? 'Add a friend and you can build this itinerary together — everyone on the trip can edit it.'
                    : 'Everyone here can view and edit the itinerary together.'}
                </Text>
              </View>

              {crewOpen && isOwner ? (
                <View className="bg-white rounded-3xl" style={{ marginTop: 10, padding: 8 }}>
                  {available.map((f) => (
                    <Pressable key={f.uid} onPress={() => { addTripCollaborator(trip.id, { uid: user.uid, name: myName }, { uid: f.uid, name: f.name }); setCrewOpen(false); }} className="flex-row items-center" style={{ paddingHorizontal: 8, paddingVertical: 10, gap: 10 }}>
                      <View className="rounded-full items-center justify-center" style={{ height: 30, width: 30, backgroundColor: 'rgba(255,107,154,0.14)' }}>
                        <Text style={{ fontFamily: 'Fraunces', fontSize: 13, color: COLORS.coral }}>{f.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{f.name}</Text>
                      <Plus size={16} color={COLORS.coral} />
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {!isOwner ? (
                <Pressable onPress={() => { removeTripCollaborator(trip.id, user.uid); goBack(); }} className="flex-row items-center justify-center" style={{ marginTop: 12, paddingVertical: 8, gap: 6 }}>
                  <LogOut size={15} color={COLORS.ink3} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.ink3 }}>Leave this trip</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })() : null}

        {/* Itinerary planner — drag ideas onto days */}
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <View className="flex-row items-center justify-between" style={{ marginBottom: 6 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Plan your days</Text>
            <Pressable onPress={() => setAddOpen(true)} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 12, paddingVertical: 7, gap: 5 }}>
              <Plus size={14} color={COLORS.coral} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>Add idea</Text>
            </Pressable>
          </View>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginBottom: 14, lineHeight: 17 }}>Long-press a card and drag it onto a day &amp; time. Tap to see details.</Text>

          <ItineraryPlanner
            startDate={trip.startDate}
            dayCount={dayCount}
            itinerary={trip.itinerary}
            suggestions={suggestions}
            onMoveItem={(itemId, day, slot) => updateItineraryItem(trip.id, itemId, { day, slot })}
            onAddSuggestion={(s, day, slot) => addItineraryItem(trip.id, { name: s.name, city: s.city, category: s.category, subcategory: s.subcategory, verdict: s.verdict, fromFriend: s.friend, day, slot })}
            onRemoveItem={(itemId) => removeItineraryItem(trip.id, itemId)}
            onOpenItem={(i) => setDetail({ title: i.name, friend: i.fromFriend, verdict: i.verdict })}
            onOpenSuggestion={(s) => setDetail({ title: s.name, friend: s.friend, verdict: s.verdict, note: s.note, sugg: s })}
          />
        </View>
      </ScrollView>

      {/* Detail overlay */}
      {detail ? (
          <Pressable onPress={() => setDetail(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(14,16,24,0.5)', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
            <Pressable onPress={() => {}} className="bg-white rounded-3xl" style={{ width: '100%', maxWidth: 360, padding: 22 }}>
              <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>{detail.title}</Text>
              <View className="flex-row items-center" style={{ gap: 8, marginTop: 8 }}>
                {detail.friend ? (
                  <View className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(155,124,255,0.14)', paddingHorizontal: 10, paddingVertical: 5, gap: 5 }}>
                    <Users size={13} color={COLORS.lavender} />
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.lavender }}>{detail.friend}</Text>
                  </View>
                ) : null}
                {detail.verdict ? (
                  <View className="rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>{VERDICT_META[detail.verdict].label}</Text>
                  </View>
                ) : null}
              </View>
              {detail.note ? (
                <Text style={{ fontFamily: 'Fraunces', fontSize: 15, fontStyle: 'italic', color: COLORS.ink2, marginTop: 14, lineHeight: 21, borderLeftWidth: 2, borderLeftColor: 'rgba(255,107,154,0.5)', paddingLeft: 12 }}>“{detail.note}”</Text>
              ) : detail.friend ? (
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 14 }}>{detail.friend} recommended this — no note left.</Text>
              ) : null}
              {detail.sugg ? (
                <Pressable
                  onPress={() => { const s = detail.sugg!; addItineraryItem(trip.id, { name: s.name, city: s.city, category: s.category, subcategory: s.subcategory, verdict: s.verdict, fromFriend: s.friend }); setDetail(null); }}
                  className="rounded-2xl items-center justify-center flex-row"
                  style={{ marginTop: 18, paddingVertical: 13, backgroundColor: COLORS.coral, gap: 7 }}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Add to ideas</Text>
                </Pressable>
              ) : null}
            </Pressable>
          </Pressable>
      ) : null}

      <AddItinerarySheet tripId={trip.id} visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

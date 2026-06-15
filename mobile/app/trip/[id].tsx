import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Plus, Trash2, MapPin, CalendarDays, Users } from 'lucide-react-native';
import { DestinationImage } from '../../components/DestinationImage';
import { AddItinerarySheet } from '../../components/AddItinerarySheet';
import { COLORS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { VERDICT_META, DISCOVERY_CATEGORY_META } from '../../src/types';
import { useData } from '../../src/store/data';
import { useAuth } from '../../src/store/auth';
import { useFriends } from '../../src/hooks/useFriends';

export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, addItineraryItem, removeItineraryItem } = useData();
  const { user } = useAuth();
  const myName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'You');
  const { friends, friendsData } = useFriends(user?.uid, myName);
  const [addOpen, setAddOpen] = useState(false);

  const trip = trips.find((t) => t.id === id);

  // Friends' discoveries in this trip's country.
  const friendDiscoveries = useMemo(() => {
    if (!trip) return [];
    const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
    return friendsData.discoveries
      .filter((d) => d.countryCode === trip.countryCode)
      .map((d) => ({ id: d.id, name: d.name, city: d.city, verdict: d.verdict, category: d.category, friend: nameByUid.get(d.userId) ?? 'Friend' }));
  }, [trip, friends, friendsData.discoveries]);

  if (!trip) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.warmwhite, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>Trip not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 14 }}><Text style={{ fontFamily: 'PlusJakarta', color: COLORS.coral, fontWeight: '700' }}>Go back</Text></Pressable>
      </View>
    );
  }

  const days = Math.max(0, Math.ceil((Date.parse(trip.startDate) - Date.now()) / 86_400_000));
  const itineraryNames = new Set(trip.itinerary.map((i) => i.name.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 112 }}>
        {/* Hero */}
        <DestinationImage code={trip.countryCode} scrim motion style={{ position: 'relative', paddingTop: 60, paddingBottom: 52, minHeight: 230, justifyContent: 'flex-end' }}>
          <Pressable onPress={() => router.back()} hitSlop={8} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 60, left: 20 }}>
            <ChevronLeft size={20} color="#fff" />
          </Pressable>
          <View style={{ paddingHorizontal: 20 }}>
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <CalendarDays size={14} color="#fff" />
              <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1, opacity: 0.95 }}>
                {days === 0 ? 'HAPPENING NOW' : `${days} DAYS TO GO`}
              </Text>
            </View>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 34, marginTop: 4 }}>{trip.title}</Text>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 14, opacity: 0.95, marginTop: 2 }}>
              {flagEmoji(trip.countryCode)} {countryName(trip.countryCode)}
              {trip.startDate ? ` · ${trip.startDate.slice(0, 7)}` : ''}
            </Text>
          </View>
          <Svg width="100%" height={42} viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1 }}>
            <Path d="M0,64 C220,118 460,16 720,44 C980,72 1220,120 1440,70 L1440,121 L0,121 Z" fill={COLORS.warmwhite} />
          </Svg>
        </DestinationImage>

        {trip.note ? (
          <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 15, fontStyle: 'italic', color: COLORS.ink2, borderLeftWidth: 2, borderLeftColor: 'rgba(255,107,154,0.5)', paddingLeft: 12 }}>{trip.note}</Text>
          </View>
        ) : null}

        {/* Itinerary */}
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Your itinerary</Text>
            <Pressable onPress={() => setAddOpen(true)} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.12)', paddingHorizontal: 12, paddingVertical: 7, gap: 5 }}>
              <Plus size={14} color={COLORS.coral} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>Add</Text>
            </Pressable>
          </View>

          {trip.itinerary.length === 0 ? (
            <View className="bg-white rounded-3xl items-center" style={{ paddingVertical: 26, paddingHorizontal: 20 }}>
              <Text style={{ fontSize: 32 }}>🗒️</Text>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 8, textAlign: 'center' }}>
                Nothing planned yet. Add places, or pull ideas from your friends below.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {trip.itinerary.map((it) => (
                <View key={it.id} className="bg-white rounded-2xl flex-row items-center" style={{ padding: 14, gap: 12 }}>
                  <View className="rounded-xl items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.warmwhite }}>
                    <MapPin size={16} color={COLORS.coral} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{it.name}</Text>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>
                      {[it.city, it.category ? DISCOVERY_CATEGORY_META[it.category].label : null, it.fromFriend ? `from ${it.fromFriend}` : null].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Pressable onPress={() => removeItineraryItem(trip.id, it.id)} hitSlop={6}>
                    <Trash2 size={18} color={COLORS.ink3} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* From your circle */}
        {friendDiscoveries.length > 0 ? (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View className="flex-row items-center" style={{ gap: 6, marginBottom: 12 }}>
              <Users size={16} color={COLORS.lavender} />
              <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>From your circle</Text>
            </View>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: -6, marginBottom: 12 }}>
              Places your friends found in {countryName(trip.countryCode)} — tap + to add to your plan.
            </Text>
            <View style={{ gap: 8 }}>
              {friendDiscoveries.map((d) => {
                const added = itineraryNames.has(d.name.toLowerCase());
                return (
                  <View key={d.id} className="bg-white rounded-2xl flex-row items-center" style={{ padding: 14, gap: 12 }}>
                    <View className="rounded-full items-center justify-center" style={{ height: 34, width: 34, backgroundColor: 'rgba(155,124,255,0.16)' }}>
                      <Text style={{ fontFamily: 'Fraunces', fontSize: 14, color: COLORS.lavender }}>{d.friend.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>{d.name}</Text>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>
                        {[d.city, d.friend, d.verdict ? VERDICT_META[d.verdict].label : null].filter(Boolean).join(' · ')}
                      </Text>
                    </View>
                    {added ? (
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.aqua }}>Added</Text>
                    ) : (
                      <Pressable onPress={() => addItineraryItem(trip.id, { name: d.name, city: d.city, category: d.category, verdict: d.verdict, fromFriend: d.friend })} hitSlop={6} className="rounded-full items-center justify-center" style={{ height: 34, width: 34, backgroundColor: COLORS.coral }}>
                        <Plus size={18} color="#fff" strokeWidth={2.6} />
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <AddItinerarySheet tripId={trip.id} visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

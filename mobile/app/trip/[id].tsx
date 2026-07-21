import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, ActivityIndicator, Share, Modal } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useConfirm } from '../../src/store/confirm';
import { useLocalSearchParams } from 'expo-router';
import { Plus, X, UserPlus, LogOut, FileDown, FileText, MessageSquareShare, Navigation, Trash2 } from 'lucide-react-native';
import { BackButton } from '../../components/BackButton';
import { DestinationImage } from '../../components/DestinationImage';
import { AddItinerarySheet } from '../../components/AddItinerarySheet';
import { ItineraryPlanner, itineraryMeta, type Suggestion } from '../../components/ItineraryPlanner';
import { LandmarkDetailSheet, type LandmarkPerson } from '../../components/LandmarkDetailSheet';
import { LocationPrimingSheet } from '../../components/LocationPrimingSheet';
import { COLORS } from '../../src/lib/theme';
import { flagEmoji } from '../../src/lib/flags';
import { countryName } from '../../src/data/countries';
import { countryFacts } from '../../src/data/countryFacts';
import { landmarkCity } from '../../src/data/landmarkCities';
import { ITINERARY_SLOTS, type RecommendationVerdict } from '../../src/types';
import { buildItineraryHtml, saveItineraryDoc } from '../../src/lib/itineraryDoc';
import { shareItineraryPdf, buildItineraryText } from '../../src/lib/itineraryPdf';
import { track } from '../../src/lib/analytics';
import { detectLocation } from '../../src/lib/checkIn';
import { backgroundTrackingAvailable, startTripTracking, stopTripTracking } from '../../src/lib/tracking';
import { useData } from '../../src/store/data';
import { useToast } from '../../src/store/toast';
import { useAuth } from '../../src/store/auth';
import { useFriends } from '../../src/hooks/useFriends';
import { goBack } from '../../src/lib/nav';
import { DetailSkeleton } from '../../components/DetailSkeleton';

export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips, places, loaded, addPlace, addItineraryItem, removeItineraryItem, reorderItinerary, setDayNote, setTripTracking, addTripCollaborator, removeTripCollaborator, removeTrip } = useData();
  const { toast } = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();
  const myName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'You');
  const { friends, friendsData } = useFriends(user?.uid, myName);
  const [addOpen, setAddOpen] = useState(false);
  const [crewOpen, setCrewOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [primeOpen, setPrimeOpen] = useState(false);
  const [detail, setDetail] = useState<{ name: string; city?: string; photo?: string; own?: { verdict?: RecommendationVerdict; note?: string } | null; friends: LandmarkPerson[] } | null>(null);

  const trip = trips.find((t) => t.id === id);

  // Friends' discoveries in this trip's country.
  const friendDiscoveries = useMemo(() => {
    if (!trip) return [];
    const nameByUid = new Map(friends.map((f) => [f.uid, f.name]));
    return friendsData.discoveries
      .filter((d) => d.countryCode === trip.countryCode)
      .map((d) => ({ id: d.id, name: d.name, city: d.city, verdict: d.verdict, category: d.category, subcategory: d.subcategory, note: d.note, photo: d.photo, friend: nameByUid.get(d.userId) ?? 'Friend' }));
  }, [trip, friends, friendsData.discoveries]);

  // Is today within the trip's date window? (Foreground auto check-in only runs
  // while a tracked trip is live, so it effectively stops itself at trip's end.)
  const tripActive = useMemo(() => {
    if (!trip) return false;
    const today = new Date().toISOString().slice(0, 10);
    if (trip.startDate && today < trip.startDate) return false;
    if (trip.endDate && today > trip.endDate) return false;
    return true;
  }, [trip]);

  // Read the live places via a ref so the check-in callback stays stable and
  // always dedupes against the latest map.
  const placesRef = useRef(places);
  placesRef.current = places;
  const checkingRef = useRef(false);

  const runCheckIn = useCallback(
    async (silent: boolean) => {
      if (checkingRef.current) return;
      checkingRef.current = true;
      setChecking(true);
      try {
        const res = await detectLocation();
        if (res.status !== 'ok') {
          if (!silent) {
            if (res.status === 'denied') toast.error('Turn on location access for Worldly to check in.');
            else if (res.status === 'unavailable') toast.error('Location services are off on this device.');
            else toast.error("Couldn't find your location — try again.");
          }
          return;
        }
        const cc = res.countryCode;
        const today = new Date().toISOString().slice(0, 10);
        const cur = placesRef.current;
        const added: string[] = [];
        const hasCountry = cur.some((p) => p.kind === 'country' && p.countryCode === cc && p.relationships.some((r) => r !== 'aspiring'));
        if (!hasCountry) {
          addPlace({ kind: 'country', countryCode: cc, relationships: ['visited'], firstDate: today });
          added.push(countryName(cc) || cc);
        }
        if (res.city) {
          const hasCity = cur.some((p) => p.kind === 'city' && p.countryCode === cc && p.name.trim().toLowerCase() === res.city!.trim().toLowerCase());
          if (!hasCity) {
            addPlace({ kind: 'city', countryCode: cc, name: res.city, relationships: ['visited'], firstDate: today });
            added.push(res.city);
          }
        }
        if (added.length) toast.success(`Added ${added.join(' · ')} to your map ✓`);
        else if (!silent) toast.info(`You're in ${res.city ? `${res.city}, ` : ''}${countryName(cc) || cc} — already on your map.`);
      } finally {
        checkingRef.current = false;
        setChecking(false);
      }
    },
    [addPlace, toast],
  );

  // When a tracked trip is open and live, quietly check in on entry.
  useEffect(() => {
    if (trip?.autoTrack && tripActive) runCheckIn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip?.id, trip?.autoTrack, tripActive]);

  if (!trip && !loaded) return <DetailSkeleton />;
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

  // Ideas to drag onto a day: friends' picks + this country's popular landmarks.
  const suggestions: Suggestion[] = (() => {
    const friendPicks: Suggestion[] = friendDiscoveries
      .filter((d) => !itineraryNames.has(d.name.toLowerCase()))
      .map((d) => ({ id: d.id, name: d.name, city: d.city, category: d.category, subcategory: d.subcategory, verdict: d.verdict, friend: d.friend, note: d.note, photo: d.photo }));
    const friendNames = new Set(friendPicks.map((s) => s.name.toLowerCase()));
    const landmarks: Suggestion[] = (countryFacts(trip.countryCode)?.landmarks ?? [])
      .filter((l) => !itineraryNames.has(l.toLowerCase()) && !friendNames.has(l.toLowerCase()))
      .map((l) => ({ id: `lm:${l}`, name: l, city: landmarkCity(l), category: 'culture', subcategory: 'landmark', landmark: true }));
    return [...friendPicks, ...landmarks];
  })();

  // Open the detail sheet for a place — gathering any friends who saved it
  // (matched by name) so a friend's recommendation shows alongside the
  // landmark's photo + description.
  const openDetail = (name: string, photo?: string, city?: string) => {
    const ll = name.toLowerCase();
    const matches = friendDiscoveries.filter((d) => d.name.toLowerCase() === ll);
    const friends: LandmarkPerson[] = matches.map((d) => ({ name: d.friend, verdict: d.verdict, note: d.note }));
    setDetail({ name, city, photo: photo ?? matches.find((d) => d.photo)?.photo, friends });
  };

  function buildDocInput() {
    if (!trip) return null;
    const fmt = (n: number) => {
      if (!trip.startDate) return `Day ${n}`;
      const d = new Date(trip.startDate);
      d.setDate(d.getDate() + (n - 1));
      return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    };
    const days = Array.from({ length: dayCount }, (_, i) => i + 1).map((n) => ({
      label: `Day ${n} — ${fmt(n)}`,
      note: trip.dayNotes?.[String(n)],
      slots: ITINERARY_SLOTS.map((s) => ({
        label: s.label,
        items: trip.itinerary.filter((it) => it.day === n && (it.slot ?? 'allday') === s.id).map((it) => ({ name: it.name, meta: itineraryMeta(it) })),
      })),
    }));
    const unscheduled = trip.itinerary.filter((it) => !it.day);
    if (unscheduled.length) {
      days.push({ label: 'Ideas (unscheduled)', note: undefined, slots: [{ label: 'Ideas', items: unscheduled.map((it) => ({ name: it.name, meta: itineraryMeta(it) })) }] });
    }
    const crew = trip.memberIds.map((m) => (m === user?.uid ? myName : trip.memberNames?.[m] ?? 'Friend'));
    return {
      title: trip.title,
      subtitle: `${countryName(trip.countryCode)}${trip.startDate ? ` · ${trip.startDate}${trip.endDate ? ` – ${trip.endDate}` : ''}` : ''}`,
      crew: trip.memberIds.length > 1 ? crew : undefined,
      days,
    };
  }

  async function exportPlan(kind: 'pdf' | 'text' | 'doc') {
    if (exporting || !trip) return;
    setExportOpen(false);
    setExporting(true);
    try {
      const input = buildDocInput();
      if (!input) return;
      if (kind === 'pdf') {
        const ok = await shareItineraryPdf(input);
        if (!ok) toast.error('Sharing is unavailable on this device.');
      } else if (kind === 'text') {
        await Share.share({ message: buildItineraryText(input) });
      } else {
        const ok = await saveItineraryDoc(`${trip.title} itinerary`, buildItineraryHtml(input));
        if (!ok) toast.error('Sharing is unavailable on this device.');
      }
      track('itinerary_exported', { kind });
    } catch {
      toast.error("Couldn't export the plan.");
    } finally {
      setExporting(false);
    }
  }

  // Toggle location tracking for this trip. In a real build this starts/stops
  // background tracking (auto-adds places as you move, even when the app is
  // closed); in Expo Go it falls back to a one-off foreground check-in.
  async function onToggleTracking(on: boolean) {
    if (!trip) return;
    setTripTracking(trip.id, on);
    if (!on) {
      await stopTripTracking();
      return;
    }
    if (backgroundTrackingAvailable()) {
      const res = await startTripTracking({ id: trip.id, title: trip.title, endDate: trip.endDate });
      if (res === 'started') {
        toast.success('Tracking on — places will be added as you travel ✓');
        runCheckIn(true);
      } else if (res === 'denied-background') {
        toast.error('Choose “Always Allow” for location so Worldly can log places in the background.');
      } else if (res === 'denied-foreground') {
        toast.error('Turn on location access for Worldly to track this trip.');
      } else if (res === 'unsupported') {
        runCheckIn(false);
      } else {
        toast.error("Couldn't start tracking — try again.");
      }
    } else {
      toast.info('Background tracking needs the installed app — using single check-ins for now.');
      runCheckIn(false);
    }
  }

  // Owner (or a local/guest trip) can delete the whole trip.
  const canDelete = !user || trip.userId === user.uid;
  async function confirmDelete() {
    if (!trip) return;
    if (await confirm({ title: 'Delete trip?', message: `"${trip.title}" and its itinerary will be permanently removed.`, confirmLabel: 'Delete', destructive: true })) {
      removeTrip(trip.id);
      goBack();
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 112 }}>
        {/* Hero */}
        <DestinationImage code={trip.countryCode} scrim motion style={{ position: 'relative', paddingTop: 60, paddingBottom: 52, minHeight: 230, justifyContent: 'flex-end' }}>
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 60, left: 20, zIndex: 20 }} />
          {canDelete ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Delete trip" onPress={confirmDelete} hitSlop={12} className="h-9 w-9 rounded-full items-center justify-center bg-white/20" style={{ position: 'absolute', top: 60, right: 20, zIndex: 20 }}>
              <Trash2 size={18} color="#fff" />
            </Pressable>
          ) : null}
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

              <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14, gap: 12 }}>
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
                        <Pressable accessibilityRole="button" accessibilityLabel="Remove collaborator" onPress={() => removeTripCollaborator(trip.id, m)} hitSlop={8}><X size={16} color={COLORS.ink3} /></Pressable>
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
                <View className="bg-white dark:bg-card rounded-3xl" style={{ marginTop: 10, padding: 8 }}>
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

        {/* Travel log — auto-add the places you visit (foreground check-in) */}
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy, marginBottom: 12 }}>Travel log</Text>
          <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 16, gap: 12 }}>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(36,209,195,0.14)' }}>
                <Navigation size={19} color={COLORS.aqua} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>Auto-add places I visit</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{trip.autoTrack ? (tripActive ? 'On — logging places while you travel' : 'On — resumes during your trip dates') : 'Off'}</Text>
              </View>
              <Switch
                value={!!trip.autoTrack}
                onValueChange={(v) => (v ? setPrimeOpen(true) : onToggleTracking(false))}
                trackColor={{ false: 'rgba(20,33,61,0.12)', true: COLORS.aqua }}
                thumbColor="#fff"
              />
            </View>

            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, lineHeight: 18 }}>
              {backgroundTrackingAvailable()
                ? 'Worldly adds the cities & countries you pass through to your map automatically — even with the app closed. It stops on its own once the trip ends, and samples sparingly to stay easy on your battery. Choose “Always Allow” when prompted.'
                : "Open Worldly while you're travelling and we'll add the city & country you're in to your map. (Hands-free background tracking needs the installed app.)"}
            </Text>

            <Pressable
              onPress={() => runCheckIn(false)}
              disabled={checking}
              className="rounded-2xl items-center justify-center flex-row"
              style={{ paddingVertical: 13, gap: 8, backgroundColor: 'rgba(36,209,195,0.12)', opacity: checking ? 0.6 : 1 }}
            >
              {checking ? (
                <ActivityIndicator color={COLORS.aqua} />
              ) : (
                <>
                  <Navigation size={16} color={COLORS.aqua} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.aqua }}>Check in here now</Text>
                </>
              )}
            </Pressable>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, color: COLORS.ink3, textAlign: 'center', marginTop: 6 }}>
              Adds your current location to this trip.
            </Text>
          </View>
        </View>

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
            dayNotes={trip.dayNotes ?? {}}
            onReorder={(items) => reorderItinerary(trip.id, items)}
            onAddSuggestion={(s, day, slot) => addItineraryItem(trip.id, { name: s.name, city: s.city, category: s.category, subcategory: s.subcategory, verdict: s.verdict, fromFriend: s.friend, day, slot })}
            onRemoveItem={(itemId) => removeItineraryItem(trip.id, itemId)}
            onDayNote={(d, t) => setDayNote(trip.id, d, t)}
            onOpenItem={(i) => openDetail(i.name, undefined, i.city)}
            onOpenSuggestion={(s) => openDetail(s.name, s.photo, s.city)}
          />

          <Pressable onPress={() => setExportOpen(true)} disabled={exporting} className="flex-row items-center justify-center rounded-full" style={{ alignSelf: 'center', marginTop: 18, paddingHorizontal: 18, paddingVertical: 10, gap: 7, backgroundColor: 'rgba(20,33,61,0.05)', opacity: exporting ? 0.6 : 1 }}>
            <FileDown size={16} color={COLORS.navy} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '700', color: COLORS.navy }}>{exporting ? 'Preparing…' : 'Export your plan'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Export chooser */}
      <Modal visible={exportOpen} transparent animationType="slide" onRequestClose={() => setExportOpen(false)}>
        <Pressable onPress={() => setExportOpen(false)} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: COLORS.warmwhite, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 14, paddingBottom: 36, paddingHorizontal: 20 }}>
            <View style={{ alignSelf: 'center', height: 5, width: 44, borderRadius: 3, backgroundColor: 'rgba(20,33,61,0.15)', marginBottom: 10 }} />
            <Text style={{ fontFamily: 'Fraunces', fontSize: 20, color: COLORS.navy, marginBottom: 12 }}>Export your plan</Text>
            {(
              [
                { k: 'pdf' as const, Icon: FileDown, title: 'Download as PDF', sub: 'A clean, printable copy to share or keep' },
                { k: 'text' as const, Icon: MessageSquareShare, title: 'Share as text', sub: 'Compact plan for Messages or WhatsApp' },
                { k: 'doc' as const, Icon: FileText, title: 'Word & Docs copy', sub: 'Opens in Word, Pages or Google Docs' },
              ]
            ).map(({ k, Icon, title, sub }) => (
              <Pressable key={k} accessibilityRole="button" accessibilityLabel={title} onPress={() => exportPlan(k)} className="bg-white dark:bg-card flex-row items-center rounded-2xl" style={{ padding: 14, gap: 13, marginBottom: 9 }}>
                <View className="rounded-2xl items-center justify-center" style={{ height: 42, width: 42, backgroundColor: 'rgba(255,106,85,0.12)' }}>
                  <Icon size={20} color={COLORS.coral} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>{title}</Text>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{sub}</Text>
                </View>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Place / landmark detail */}
      <LandmarkDetailSheet
        visible={!!detail}
        onClose={() => setDetail(null)}
        name={detail?.name}
        countryCode={trip.countryCode}
        placeLabel={[detail?.city, countryName(trip.countryCode)].filter(Boolean).join(' · ')}
        hint={countryName(trip.countryCode)}
        photo={detail?.photo}
        own={detail?.own}
        friends={detail?.friends ?? []}
      />

      <LocationPrimingSheet
        visible={primeOpen}
        background={backgroundTrackingAvailable()}
        onClose={() => setPrimeOpen(false)}
        onContinue={() => { setPrimeOpen(false); onToggleTracking(true); }}
      />

      <AddItinerarySheet tripId={trip.id} visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Switch, Platform } from 'react-native';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Cloud, CloudOff, LogOut, Download, Merge, Plane, RotateCcw, FileDown, CircleCheck, ChevronRight,
  BellRing, Sparkles, Users, MapPinned, Sun, Moon, SunMoon, Ruler, Thermometer,
  ShieldCheck, FileText, Mail, Trash2,
} from 'lucide-react-native';
import { BackButton } from '../components/BackButton';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { goBack } from '../src/lib/nav';
import { useWorldly } from '../src/hooks/useWorldly';
import { useAuth } from '../src/store/auth';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';
import { useConfirm } from '../src/store/confirm';
import { useOnboarding } from '../src/store/onboarding';
import { useUnits } from '../src/store/units';
import type { DistanceUnit, TempUnit } from '../src/lib/units';
import { exportMyData } from '../src/lib/exportData';
import { anniversariesEnabled, setAnniversariesEnabled, postTripRemindersEnabled, setPostTripRemindersEnabled, requestNotificationPermission, rescheduleNotifications } from '../src/lib/notifications';
import { friendActivityEnabled, enableFriendActivity, disableFriendActivity, tripActivityEnabled, enableTripActivity, disableTripActivity, refreshPushToken } from '../src/lib/push';
import { getAppearanceMode, setAppearanceMode, type AppearanceMode } from '../src/lib/appearance';
import { isEndpointResolved } from '../src/lib/airportSearch';
import { flightLookupConfigured } from '../src/lib/flightLookup';
import { findEnrichable } from '../src/lib/flightRefresh';
import { suggestTripMerges } from '../src/lib/tripMerge';
import { track } from '../src/lib/analytics';
import { AuthSheet } from '../components/AuthSheet';
import { DeleteAccountSheet } from '../components/DeleteAccountSheet';
import { ResolveFlightsSheet } from '../components/ResolveFlightsSheet';

const PRIVACY_URL = 'https://stickynotes-sand.vercel.app/privacy';
const TERMS_URL = 'https://stickynotes-sand.vercel.app/terms';
const SUPPORT_EMAIL = 'worldly@simondeans.com';

const LABEL = { fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800' as const, letterSpacing: 1, color: COLORS.ink3, marginBottom: 10 };

function Row({ icon: Icon, tint, label, sub, right, onPress, first }: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  tint?: string;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  first?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center"
      style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderTopWidth: first ? 0 : 1, borderTopColor: 'rgba(20,33,61,0.06)' }}
    >
      <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: tint ?? 'rgba(142,151,184,0.14)' }}>
        <Icon size={19} color={COLORS.ink2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>{label}</Text>
        {sub ? <Text numberOfLines={2} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      {right ?? (onPress ? <ChevronRight size={18} color={COLORS.ink3} /> : null)}
    </Pressable>
  );
}

/** Settings, behind the Passport gear: Data · Preferences · About & legal ·
 *  Account. Delete account sits last, separated and destructive — never
 *  adjacent to Export. */
export default function SettingsScreen() {
  const { aggregates } = useWorldly();
  const { configured, user, signOutUser } = useAuth();
  const { places, discoveries, expeditions, captures, trips, recalculateJourneys, updateExpedition } = useData();
  const { toast } = useToast();
  const confirm = useConfirm();
  const { replay } = useOnboarding();
  const { unit, setUnit, tempUnit, setTempUnit } = useUnits();

  const [authOpen, setAuthOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [recalcing, setRecalcing] = useState(false);
  const [notifOn, setNotifOn] = useState(false);
  const [postTripOn, setPostTripOn] = useState(false);
  const [circleNotifOn, setCircleNotifOn] = useState(false);
  const [crewNotifOn, setCrewNotifOn] = useState(false);
  const [appearance, setAppearance] = useState<AppearanceMode>('system');

  useEffect(() => {
    anniversariesEnabled().then(setNotifOn);
    postTripRemindersEnabled().then(setPostTripOn);
    friendActivityEnabled().then(setCircleNotifOn);
    tripActivityEnabled().then(setCrewNotifOn);
    getAppearanceMode().then(setAppearance);
    refreshPushToken();
  }, []);

  // Flight stops that don't resolve to a known airport + flights with details
  // still fetchable — surfaced under Data so imports stay accurate.
  const unresolvedAirports = useMemo(() => {
    let n = 0;
    for (const e of expeditions) {
      for (const j of e.journeys ?? []) {
        if (j.mode !== 'flight') continue;
        if (j.from?.trim() && !isEndpointResolved(j.from)) n++;
        if (j.to?.trim() && !isEndpointResolved(j.to)) n++;
      }
    }
    return n;
  }, [expeditions]);
  const fetchableFlights = useMemo(
    () => (flightLookupConfigured() ? findEnrichable(expeditions, Date.now(), 'all').length : 0),
    [expeditions],
  );
  const flightsToSort = unresolvedAirports + fetchableFlights;

  const mergeCount = useMemo(() => {
    const nameOf = new Map(aggregates.map((a) => [a.code, a.name]));
    const home = new Set(
      aggregates
        .filter((a) => a.relationships.includes('lived') || a.relationships.includes('based') || a.relationships.includes('born'))
        .map((a) => a.code),
    );
    return suggestTripMerges(expeditions, { countryName: (c) => nameOf.get(c) ?? c, homeCodes: home }).length;
  }, [aggregates, expeditions]);

  async function onToggleNotif(v: boolean) {
    if (v) {
      if (!(await requestNotificationPermission())) {
        toast.error('Allow notifications in Settings to get anniversary reminders.');
        return;
      }
      await setAnniversariesEnabled(true);
      setNotifOn(true);
      track('notification_toggled', { type: 'anniversaries', on: true });
      await rescheduleNotifications(expeditions, places, trips);
      toast.success('Anniversary reminders on ✈️');
    } else {
      await setAnniversariesEnabled(false);
      setNotifOn(false);
      track('notification_toggled', { type: 'anniversaries', on: false });
      await rescheduleNotifications(expeditions, places, trips);
    }
  }

  async function onTogglePostTrip(v: boolean) {
    if (v) {
      if (!(await requestNotificationPermission())) {
        toast.error('Allow notifications in Settings to get trip reminders.');
        return;
      }
      await setPostTripRemindersEnabled(true);
      setPostTripOn(true);
      track('notification_toggled', { type: 'post_trip', on: true });
      await rescheduleNotifications(expeditions, places, trips);
      toast.success('Trip discovery reminders on ✨');
    } else {
      await setPostTripRemindersEnabled(false);
      setPostTripOn(false);
      track('notification_toggled', { type: 'post_trip', on: false });
      await rescheduleNotifications(expeditions, places, trips);
    }
  }

  async function onToggleCircleNotif(v: boolean) {
    if (v) {
      if (!user) {
        toast.error('Sign in to hear when your circle travels.');
        return;
      }
      if (!(await enableFriendActivity())) {
        toast.error('Allow notifications to hear from your circle.');
        return;
      }
      setCircleNotifOn(true);
      track('notification_toggled', { type: 'circle', on: true });
      toast.success('Circle updates on 👋');
    } else {
      await disableFriendActivity();
      setCircleNotifOn(false);
      track('notification_toggled', { type: 'circle', on: false });
    }
  }

  async function onToggleCrewNotif(v: boolean) {
    if (v) {
      if (!user) {
        toast.error('Sign in to get trip crew updates.');
        return;
      }
      if (!(await enableTripActivity())) {
        toast.error('Allow notifications to get trip crew updates.');
        return;
      }
      setCrewNotifOn(true);
      track('notification_toggled', { type: 'trip_crew', on: true });
      toast.success('Trip crew updates on 🗺️');
    } else {
      await disableTripActivity();
      setCrewNotifOn(false);
      track('notification_toggled', { type: 'trip_crew', on: false });
    }
  }

  async function onRecalcJourneys() {
    if (recalcing) return;
    setRecalcing(true);
    try {
      const homeCodes = aggregates
        .filter((a) => a.relationships.includes('lived') || a.relationships.includes('based'))
        .map((a) => a.code);
      const n = await recalculateJourneys(expeditions, homeCodes);
      toast.success(n > 0 ? `Updated ${n} ${n === 1 ? 'journey' : 'journeys'}` : 'Your journeys are already up to date');
    } catch {
      toast.error("Couldn't recalculate — try again.");
    } finally {
      setRecalcing(false);
    }
  }

  async function onExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const ok = await exportMyData({
        account: { email: user?.email, name: user?.displayName },
        places,
        discoveries,
        expeditions,
        captures,
        trips,
      });
      if (!ok) toast.error('Sharing is unavailable on this device.');
    } catch {
      toast.error("Couldn't export your data — please try again.");
    } finally {
      setExporting(false);
    }
  }

  const seg = (active: boolean) => ({ flex: 1, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? COLORS.navySolid : 'transparent' });
  const segText = (active: boolean) => ({ textAlign: 'center' as const, fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700' as const, color: active ? '#fff' : COLORS.ink3 });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingTop: 58, paddingHorizontal: 20 }}>
          <BackButton onPress={goBack} />
          <Text style={{ fontFamily: 'Fraunces', fontSize: 32, color: COLORS.navy, marginTop: 16 }}>Settings</Text>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginTop: 3 }}>Your data, preferences and account.</Text>
        </View>

        {/* 1 — DATA */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={LABEL}>DATA</Text>
          {!configured ? (
            <View className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ padding: 16, gap: 12, marginBottom: 10 }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 42, width: 42, backgroundColor: 'rgba(142,151,184,0.14)' }}>
                <CloudOff size={20} color={COLORS.ink3} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>Offline demo</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Your world is saved on this device.</Text>
              </View>
            </View>
          ) : user ? (
            <View className="bg-white dark:bg-card rounded-3xl flex-row items-center" style={{ padding: 16, gap: 12, marginBottom: 10 }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 42, width: 42, backgroundColor: 'rgba(36,209,195,0.14)' }}>
                <Cloud size={20} color={COLORS.aqua} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>Synced to the cloud</Text>
                <Text numberOfLines={1} style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>{user.email}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign out"
                onPress={async () => {
                  if (await confirm({ title: 'Sign out?', message: 'Your world stays safely synced — sign back in anytime to pick up where you left off.', confirmLabel: 'Sign out', destructive: true })) signOutUser();
                }}
                hitSlop={8}
                className="rounded-full flex-row items-center"
                style={{ paddingHorizontal: 14, paddingVertical: 9, gap: 6, backgroundColor: COLORS.warmwhite }}
              >
                <LogOut size={15} color={COLORS.ink2} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.ink2 }}>Sign out</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel="Sync your world" onPress={() => setAuthOpen(true)} style={{ marginBottom: 10 }}>
              <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="rounded-3xl flex-row items-center" style={{ padding: 16, gap: 12 }}>
                <View className="rounded-2xl items-center justify-center bg-white/20" style={{ height: 42, width: 42 }}>
                  <Cloud size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 16 }}>Sync your world</Text>
                  <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, opacity: 0.9, marginTop: 1 }}>Sign in to keep it on every device.</Text>
                </View>
              </LinearGradient>
            </Pressable>
          )}

          <View className="bg-white dark:bg-card rounded-3xl" style={{ overflow: 'hidden' }}>
            <Row first icon={Download} tint="rgba(36,209,195,0.14)" label="Import travels" sub="Flighty CSV, a country list, or your photos." onPress={() => router.push('/import')} />
            {expeditions.length > 0 ? (
              <Row
                icon={Plane}
                label="Resolve flights"
                sub={
                  unresolvedAirports > 0 && fetchableFlights > 0
                    ? `${unresolvedAirports} to match · ${fetchableFlights} with details to fetch`
                    : unresolvedAirports > 0
                      ? `${unresolvedAirports} flight stop${unresolvedAirports === 1 ? '' : 's'} to match for accurate stats`
                      : fetchableFlights > 0
                        ? `${fetchableFlights} flight${fetchableFlights === 1 ? '' : 's'} with details to fetch`
                        : 'All flights matched & up to date'
                }
                right={
                  flightsToSort > 0 ? (
                    <View className="rounded-full items-center justify-center" style={{ minWidth: 22, height: 22, paddingHorizontal: 7, backgroundColor: '#F4B740' }}>
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', color: '#fff' }}>{flightsToSort}</Text>
                    </View>
                  ) : (
                    <CircleCheck size={18} color="#12A594" />
                  )
                }
                onPress={() => setResolveOpen(true)}
              />
            ) : null}
            {mergeCount > 0 ? (
              <Row
                icon={Merge}
                tint="rgba(155,124,255,0.14)"
                label="Merge related trips"
                sub={`${mergeCount} ${mergeCount === 1 ? 'set of bookings looks' : 'sets of bookings look'} like one journey.`}
                onPress={() => router.push('/merge-trips')}
              />
            ) : null}
            <Row icon={RotateCcw} label={recalcing ? 'Recalculating…' : 'Recalculate journeys'} sub="Rebuild your trips if you’ve updated your home history." onPress={onRecalcJourneys} />
            <Row icon={FileDown} label={exporting ? 'Preparing your data…' : 'Export my data'} sub="Everything you’ve logged, as a file you keep." onPress={onExport} />
          </View>
        </View>

        {/* 2 — PREFERENCES */}
        <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
          <Text style={LABEL}>PREFERENCES</Text>
          <View className="bg-white dark:bg-card rounded-3xl" style={{ paddingHorizontal: 16 }}>
            <View className="flex-row items-center" style={{ gap: 12, paddingVertical: 14 }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(255,107,154,0.12)' }}>
                <BellRing size={19} color={COLORS.coral} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>Travel anniversaries</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>“On this day” memories of where you've been</Text>
              </View>
              <Switch accessibilityLabel="Travel anniversaries" value={notifOn} onValueChange={onToggleNotif} trackColor={{ false: 'rgba(20,33,61,0.12)', true: COLORS.coral }} thumbColor="#fff" />
            </View>
            <View className="flex-row items-center" style={{ gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(20,33,61,0.06)' }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(245,166,35,0.14)' }}>
                <Sparkles size={19} color="#F5A623" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>Trip discovery reminders</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>After a trip, a nudge to log what you found</Text>
              </View>
              <Switch accessibilityLabel="Trip discovery reminders" value={postTripOn} onValueChange={onTogglePostTrip} trackColor={{ false: 'rgba(20,33,61,0.12)', true: '#F5A623' }} thumbColor="#fff" />
            </View>
            <View className="flex-row items-center" style={{ gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(20,33,61,0.06)' }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(155,124,255,0.14)' }}>
                <Users size={19} color={COLORS.lavender} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>From your circle</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>When friends log trips & recommendations</Text>
              </View>
              <Switch accessibilityLabel="Updates from your circle" value={circleNotifOn} onValueChange={onToggleCircleNotif} trackColor={{ false: 'rgba(20,33,61,0.12)', true: COLORS.lavender }} thumbColor="#fff" />
            </View>
            <View className="flex-row items-center" style={{ gap: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(20,33,61,0.06)' }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(36,209,195,0.14)' }}>
                <MapPinned size={19} color={COLORS.aqua} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>Trip crew updates</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>When crew edit a shared itinerary</Text>
              </View>
              <Switch accessibilityLabel="Trip crew updates" value={crewNotifOn} onValueChange={onToggleCrewNotif} trackColor={{ false: 'rgba(20,33,61,0.12)', true: COLORS.aqua }} thumbColor="#fff" />
            </View>
          </View>

          {Platform.OS === 'ios' ? (
            <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14, marginTop: 10 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy, marginBottom: 10 }}>Appearance</Text>
              <View className="flex-row" style={{ gap: 5 }}>
                {([
                  ['system', 'System', SunMoon],
                  ['light', 'Light', Sun],
                  ['dark', 'Dark', Moon],
                ] as const).map(([mode, label, ModeIcon]) => {
                  const active = appearance === mode;
                  return (
                    <Pressable
                      key={mode}
                      accessibilityRole="button"
                      accessibilityLabel={`${label} appearance`}
                      accessibilityState={{ selected: active }}
                      onPress={() => {
                        setAppearance(mode);
                        setAppearanceMode(mode);
                        track('appearance_changed', { mode });
                      }}
                      className="flex-row items-center justify-center rounded-2xl"
                      style={{ flex: 1, paddingVertical: 11, gap: 6, backgroundColor: active ? COLORS.coral : 'rgba(142,151,184,0.10)' }}
                    >
                      <ModeIcon size={15} color={active ? '#fff' : COLORS.ink3} />
                      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: active ? '#fff' : COLORS.ink2 }}>{label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View className="bg-white dark:bg-card rounded-3xl" style={{ padding: 14, marginTop: 10 }}>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 38, width: 38, backgroundColor: 'rgba(142,151,184,0.14)' }}>
                <Ruler size={18} color={COLORS.ink2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>Distance</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Defaults to your region — override anytime</Text>
              </View>
            </View>
            <View className="flex-row rounded-full" style={{ backgroundColor: 'rgba(142,151,184,0.14)', padding: 3, marginTop: 12 }}>
              {([['mi', 'Miles (mi)'], ['km', 'Kilometres (km)']] as [DistanceUnit, string][]).map(([id, label]) => (
                <Pressable key={id} accessibilityRole="button" accessibilityLabel={label} onPress={() => setUnit(id)} style={seg(unit === id)}>
                  <Text style={segText(unit === id)}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row items-center" style={{ gap: 12, marginTop: 18 }}>
              <View className="rounded-2xl items-center justify-center" style={{ height: 38, width: 38, backgroundColor: 'rgba(142,151,184,0.14)' }}>
                <Thermometer size={18} color={COLORS.ink2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.navy }}>Temperature</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Used on country temperature charts</Text>
              </View>
            </View>
            <View className="flex-row rounded-full" style={{ backgroundColor: 'rgba(142,151,184,0.14)', padding: 3, marginTop: 12 }}>
              {([['c', 'Celsius (°C)'], ['f', 'Fahrenheit (°F)']] as [TempUnit, string][]).map(([id, label]) => (
                <Pressable key={id} accessibilityRole="button" accessibilityLabel={label} onPress={() => setTempUnit(id)} style={seg(tempUnit === id)}>
                  <Text style={segText(tempUnit === id)}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

        </View>

        {/* 3 — ABOUT & LEGAL */}
        <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
          <Text style={LABEL}>ABOUT & LEGAL</Text>
          <View className="bg-white dark:bg-card rounded-3xl" style={{ overflow: 'hidden' }}>
            <Row first icon={ShieldCheck} label="Privacy Policy" onPress={() => Linking.openURL(PRIVACY_URL)} />
            <Row icon={FileText} label="Terms of Service" onPress={() => Linking.openURL(TERMS_URL)} />
            <Row icon={Mail} label="Contact support" sub={SUPPORT_EMAIL} onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Worldly%20support`)} />
            <Row icon={RotateCcw} label="Replay the welcome tour" onPress={() => { goBack(); replay(); }} />
          </View>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, textAlign: 'center', marginTop: 12 }}>
            Worldly v{Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </View>

        {/* 4 — ACCOUNT: last, separated, destructive. Never adjacent to Export. */}
        {user ? (
          <View style={{ paddingHorizontal: 20, marginTop: 34 }}>
            <Text style={LABEL}>ACCOUNT</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete my account"
              onPress={() => setDeleteOpen(true)}
              className="bg-white dark:bg-card rounded-3xl flex-row items-center"
              style={{ padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(224,36,94,0.25)' }}
            >
              <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: 'rgba(224,36,94,0.10)' }}>
                <Trash2 size={19} color="#E0245E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#E0245E' }}>Delete my account</Text>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 1 }}>Permanently removes your account and synced data.</Text>
              </View>
              <ChevronRight size={18} color="#E0245E" />
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <AuthSheet visible={authOpen} onClose={() => setAuthOpen(false)} />
      <DeleteAccountSheet visible={deleteOpen} onClose={() => setDeleteOpen(false)} />
      <ResolveFlightsSheet visible={resolveOpen} onClose={() => setResolveOpen(false)} expeditions={expeditions} updateExpedition={updateExpedition} />
    </View>
  );
}

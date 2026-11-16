import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Check, Sparkles } from 'lucide-react-native';
import { BackButton } from '../components/BackButton';
import { WorldlyIcon } from '../components/WorldlyLogo';
import { BRAND_GRADIENT, COLORS, GRADIENTS, SHADOW } from '../src/lib/theme';
import { StaticGlobe } from '../components/StaticGlobe';
import { useWorldly } from '../src/hooks/useWorldly';
import { goBack } from '../src/lib/nav';
import { billingEnabled, restorePurchases, useTier, type PaywallTrigger } from '../src/lib/billing';
import {
  ANNUAL_HEADLINE,
  EXPLORER_BENEFITS,
  MONTHLY_HEADLINE,
  PRICE_ANNUAL,
  PRICE_ANNUAL_AS_MONTHLY,
  PRICE_MONTHLY,
  WANDERER_LIMITS,
} from '../src/lib/limits';
import { track } from '../src/lib/analytics';
import { useToast } from '../src/store/toast';

// Trigger-aware headlines: the paywall opens at high-intent moments, and the
// first line acknowledges the moment rather than pitching generically.
const HEADLINES: Record<PaywallTrigger | 'default', { title: string; sub: string }> = {
  default: { title: 'Travel further with Explorer', sub: 'Everything in Worldly, unlimited.' },
  countries: { title: 'Your free Atlas is full', sub: "You've explored 25 countries — Explorer keeps going, without limits." },
  circle: { title: 'Your circle is growing', sub: 'Explorer unlocks unlimited connections and every friend’s picks.' },
  discoveries: { title: 'Ten discoveries logged', sub: 'Explorer remembers every place that stayed with you.' },
  itineraries: { title: 'Plan every trip', sub: 'Explorer unlocks unlimited itineraries with your trip crew.' },
  charts: { title: 'See your whole flying life', sub: 'Every chart, every year, every airline — unlocked with Explorer.' },
  wrapped: { title: 'Your Year in Travel is ready', sub: 'Share the card and the poster with Explorer.' },
  'post-trip': { title: 'Welcome home', sub: 'Log what you found and let Worldly tell the story — with Explorer.' },
  lookups: { title: 'Out of free lookups this month', sub: 'Explorer looks up every flight, every time.' },
  covers: { title: 'Collect every cover', sub: 'Explorer includes the whole collection — seasonal packs too.' },
};

// Free vs Explorer, side by side — the limits come straight from the same
// table that enforces them, so the paywall can never drift from the rules.
const COMPARE: { label: string; free: string; paid: string }[] = [
  { label: 'Countries', free: `Up to ${WANDERER_LIMITS.countries}`, paid: 'Unlimited' },
  { label: 'Cities', free: `Up to ${WANDERER_LIMITS.cities}`, paid: 'Unlimited' },
  { label: 'Discoveries', free: `Up to ${WANDERER_LIMITS.discoveries}`, paid: 'Unlimited' },
  { label: 'Circle connections', free: `Up to ${WANDERER_LIMITS.circle}`, paid: 'Unlimited' },
  { label: 'Flight lookups', free: `${WANDERER_LIMITS.flightLookupsPerMonth} a month`, paid: 'Unlimited' },
  { label: 'Trip itineraries', free: `${WANDERER_LIMITS.itineraries}`, paid: 'Unlimited' },
  { label: 'Flight statistics', free: 'Headlines', paid: 'Full dashboard' },
  { label: 'Wrapped & Almanac', free: 'View', paid: 'Share & export' },
  { label: 'Passport Covers', free: 'Earned', paid: 'Every cover' },
];

export default function UpgradeScreen() {
  const { trigger } = useLocalSearchParams<{ trigger?: string }>();
  const { toast } = useToast();
  const tier = useTier();
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  // Show, don't tell: the header carries the member's own world.
  const { aggregates, stats } = useWorldly();
  const visited = useMemo(() => new Set(aggregates.filter((a) => a.discovered).map((a) => a.code)), [aggregates]);
  const [restoring, setRestoring] = useState(false);
  async function restore() {
    if (restoring) return;
    setRestoring(true);
    try {
      const r = await restorePurchases();
      if (r === 'restored') toast.success('Explorer restored — welcome back.');
      else if (r === 'not-needed') toast.success('Nothing to restore — every feature is already unlocked.');
      else toast.error('No previous purchase found for this Apple ID.');
    } finally {
      setRestoring(false);
    }
  }
  const copy = useMemo(() => HEADLINES[(trigger as PaywallTrigger) ?? 'default'] ?? HEADLINES.default, [trigger]);

  function subscribe() {
    // Purchase wiring lands with RevenueCat; this screen is unreachable from
    // the app until then, but stays graceful if opened directly.
    track('paywall_cta', { trigger: trigger ?? 'default', plan });
    if (!billingEnabled()) {
      toast.success('Introductory offer — everything is already unlocked. Enjoy!');
      goBack();
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <LinearGradient colors={GRADIENTS.story} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 }}>
          <BackButton onPress={goBack} style={{ position: 'absolute', top: 58, left: 18, zIndex: 20 }} />
          <View className="items-center">
            {visited.size > 0 ? (
              <View accessible accessibilityLabel={`Your world so far: ${stats.countriesDiscovered} countries`} style={{ alignItems: 'center', marginTop: 8 }}>
                <StaticGlobe id="paywall" size={148} visited={visited} centre={[10, 22]} />
                <View className="rounded-full" style={{ marginTop: -14, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(13,27,46,0.78)' }}>
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, fontWeight: '800', color: '#fff' }}>
                    {stats.countriesDiscovered} {stats.countriesDiscovered === 1 ? 'country' : 'countries'} and counting
                  </Text>
                </View>
              </View>
            ) : (
              <WorldlyIcon height={44} />
            )}
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, opacity: 0.9, marginTop: 14 }}>WORLDLY EXPLORER</Text>
            <Text className="text-white" style={{ fontFamily: 'Fraunces', fontSize: 28, textAlign: 'center', marginTop: 4 }}>{copy.title}</Text>
            <Text className="text-white" style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, opacity: 0.95, textAlign: 'center', marginTop: 6, lineHeight: 19 }}>{copy.sub}</Text>
          </View>
        </LinearGradient>

        {/* Benefits */}
        <View className="bg-white dark:bg-card rounded-3xl" style={{ marginHorizontal: 20, marginTop: -14, padding: 18 }}>
          {EXPLORER_BENEFITS.map((b) => (
            <View key={b} className="flex-row items-center" style={{ gap: 11, paddingVertical: 6.5 }}>
              <View className="rounded-full items-center justify-center" style={{ height: 22, width: 22, backgroundColor: 'rgba(36,209,195,0.16)' }}>
                <Check size={13} color="#12A594" strokeWidth={3} />
              </View>
              <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink, lineHeight: 19 }}>{b}</Text>
            </View>
          ))}
        </View>

        {/* What changes — free vs Explorer */}
        <View className="bg-white dark:bg-card rounded-3xl" style={{ marginHorizontal: 20, marginTop: 14, paddingVertical: 12, paddingHorizontal: 16, ...SHADOW.card }}>
          <View className="flex-row" style={{ paddingBottom: 8 }}>
            <Text style={{ flex: 1.3, fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: COLORS.ink3 }}>WHAT YOU GET</Text>
            <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: COLORS.ink3 }}>FREE</Text>
            <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: COLORS.coral }}>EXPLORER</Text>
          </View>
          {COMPARE.map((r) => (
            <View key={r.label} className="flex-row items-center" style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLORS.tileMuted }}>
              <Text style={{ flex: 1.3, fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: COLORS.ink }}>{r.label}</Text>
              <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3 }}>{r.free}</Text>
              <Text style={{ flex: 1, textAlign: 'center', fontFamily: 'PlusJakarta', fontSize: 12.5, fontWeight: '800', color: COLORS.navy }}>{r.paid}</Text>
            </View>
          ))}
        </View>

        {/* Plans — annual first and pre-selected */}
        <View style={{ marginHorizontal: 20, marginTop: 18, gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: plan === 'annual' }}
            onPress={() => setPlan('annual')}
            className="bg-white dark:bg-card rounded-3xl"
            style={{ padding: 16, borderWidth: 2.5, borderColor: plan === 'annual' ? COLORS.coral : 'transparent' }}
          >
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15.5, fontWeight: '800', color: COLORS.navy }}>Annual</Text>
              <View className="rounded-full" style={{ paddingHorizontal: 8, paddingVertical: 2.5, backgroundColor: COLORS.coral }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5, color: '#fff' }}>BEST VALUE</Text>
              </View>
            </View>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, marginTop: 3 }}>
              {ANNUAL_HEADLINE}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: plan === 'monthly' }}
            onPress={() => setPlan('monthly')}
            className="bg-white dark:bg-card rounded-3xl"
            style={{ padding: 16, borderWidth: 2.5, borderColor: plan === 'monthly' ? COLORS.coral : 'transparent' }}
          >
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15.5, fontWeight: '800', color: COLORS.navy }}>Monthly</Text>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, marginTop: 3 }}>{MONTHLY_HEADLINE} — cancel any time</Text>
          </Pressable>
        </View>

        <Pressable onPress={subscribe} accessibilityRole="button" style={{ marginHorizontal: 20, marginTop: 18, borderRadius: 22, overflow: 'hidden' }}>
          <LinearGradient colors={BRAND_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 }}>
            <Sparkles size={17} color="#fff" />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15.5, fontWeight: '800', color: '#fff' }}>
              {plan === 'annual' ? `Start Explorer — ${PRICE_ANNUAL}/year` : `Start Explorer — ${PRICE_MONTHLY}/month`}
            </Text>
          </LinearGradient>
        </Pressable>
        {plan === 'annual' ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11.5, color: COLORS.ink3, textAlign: 'center', marginTop: 8 }}>
            That's about {PRICE_ANNUAL_AS_MONTHLY} a month.
          </Text>
        ) : null}

        <Pressable onPress={restore} disabled={restoring} accessibilityRole="button" accessibilityLabel="Restore purchases" hitSlop={8} style={{ alignSelf: 'center', marginTop: 16, paddingVertical: 6, paddingHorizontal: 12, opacity: restoring ? 0.5 : 1 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '700', color: COLORS.ink2, textDecorationLine: 'underline' }}>Restore purchases</Text>
        </Pressable>

        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, color: COLORS.ink3, textAlign: 'center', marginTop: 10, paddingHorizontal: 36, lineHeight: 16 }}>
          {tier === 'explorer' && !billingEnabled()
            ? 'Introductory offer: every feature is free for early explorers. Pricing arrives in a future update — founding explorers will be looked after.'
            : 'Billed through the App Store. Cancel any time in Settings › Subscriptions.'}
        </Text>
      </ScrollView>
    </View>
  );
}

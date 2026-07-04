import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { MapPin, Gem, Heart, ThumbsUp, Meh, ThumbsDown, Check, Users, Plus, Sparkles } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { countryName } from '../src/data/countries';
import { flagEmoji } from '../src/lib/flags';
import { RECOMMENDATION_VERDICTS, VERDICT_META, type RecommendationVerdict } from '../src/types';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';
import { track } from '../src/lib/analytics';

// The Quick Log — capture first, enrich later. One place + one verdict, saved
// the moment the verdict is tapped. Everything else (name refinement, category,
// photo, note) is optional enrichment added later in the discovery editor.

// Reverse-geocode the current position to the most granular sensible label —
// a venue/POI name if the device reports one, else the street, so a restaurant
// can be captured without typing. Always editable afterwards.
async function detectPlace(): Promise<{ status: 'ok' | 'denied' | 'error'; countryCode?: string; city?: string; name?: string }> {
  try {
    const Location = await import('expo-location');
    if (!(await Location.hasServicesEnabledAsync())) return { status: 'error' };
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return { status: 'denied' };
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const a = (await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }))[0];
    if (!a) return { status: 'error' };
    const countryCode = a.isoCountryCode?.toUpperCase();
    const city = a.city ?? a.subregion ?? a.district ?? a.region ?? undefined;
    const nm = a.name?.trim();
    let name: string | undefined;
    if (nm && !/^\d+$/.test(nm) && nm.toLowerCase() !== (city ?? '').toLowerCase()) name = nm;
    else if (a.street) name = a.streetNumber ? `${a.streetNumber} ${a.street}` : a.street;
    return { status: 'ok', countryCode, city, name };
  } catch {
    return { status: 'error' };
  }
}

const VERDICT_STYLE: Record<RecommendationVerdict, { tint: string; icon: ComponentType<{ size?: number; color?: string }> }> = {
  recommend: { tint: '#00A88E', icon: ThumbsUp },
  'hidden-gem': { tint: '#F5A623', icon: Gem },
  'worth-visiting': { tint: '#1E6BFF', icon: Heart },
  overrated: { tint: '#FF8A3D', icon: Meh },
  avoid: { tint: COLORS.danger, icon: ThumbsDown },
};

export function QuickLogSheet({ visible, onClose, onExpand }: { visible: boolean; onClose: () => void; onExpand?: () => void }) {
  const { addDiscovery, discoveries } = useData();
  const { toast } = useToast();
  const [where, setWhere] = useState('');
  const [countryCode, setCountryCode] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState<RecommendationVerdict | null>(null);
  const [saved, setSaved] = useState<{ verdict: RecommendationVerdict; count: number } | null>(null);

  // Try to seed the location the moment the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setWhere(''); setCountryCode(undefined); setCity(undefined); setSaved(null); setSaving(null);
    let cancelled = false;
    setLocating(true);
    detectPlace()
      .then((r) => {
        if (cancelled || r.status !== 'ok') return;
        setCountryCode(r.countryCode);
        setCity(r.city);
        setWhere((w) => w || r.name || r.city || '');
      })
      .finally(() => { if (!cancelled) setLocating(false); });
    return () => { cancelled = true; };
  }, [visible]);

  async function useLocation() {
    setLocating(true);
    const r = await detectPlace();
    setLocating(false);
    if (r.status === 'ok') {
      setCountryCode(r.countryCode);
      setCity(r.city);
      // Explicit tap → fill with the most specific place we found (overwrite).
      setWhere(r.name || r.city || '');
    } else {
      toast.error(r.status === 'denied' ? 'Location permission is off — type where you are instead.' : "Couldn't get your location — type it instead.");
    }
  }

  async function log(verdict: RecommendationVerdict) {
    const name = where.trim() || city || '';
    if (!name) { toast.error('Where are you? Add a place or use your location.'); return; }
    if (saving) return;
    setSaving(verdict);
    try {
      await addDiscovery({ name, category: 'experience', verdict, countryCode, city });
      track('verdict_logged', { verdict, located: Boolean(countryCode) });
      const count = verdict === 'hidden-gem'
        ? discoveries.filter((d) => d.verdict === 'hidden-gem').length + 1
        : discoveries.length + 1;
      setSaved({ verdict, count });
    } catch {
      toast.error("Couldn't save — check your connection and try again.");
    } finally {
      setSaving(null);
    }
  }

  const locChip = useMemo(() => {
    if (!countryCode) return null;
    return `${flagEmoji(countryCode)} ${city ? `${city}, ` : ''}${countryName(countryCode)}`;
  }, [countryCode, city]);

  return (
    <SheetShell visible={visible} title="Leave your verdict" onClose={onClose}>
      {saved ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8, alignItems: 'center', gap: 12 }}>
          <View className="rounded-full items-center justify-center" style={{ height: 60, width: 60, backgroundColor: VERDICT_STYLE[saved.verdict].tint + '1F' }}>
            <Check size={30} color={VERDICT_STYLE[saved.verdict].tint} />
          </View>
          <Text style={{ fontFamily: 'Fraunces', fontSize: 22, color: COLORS.navy }}>Logged!</Text>
          <View className="flex-row items-center rounded-full" style={{ gap: 6, backgroundColor: 'rgba(30,107,255,0.08)', paddingHorizontal: 12, paddingVertical: 6 }}>
            <Users size={13} color="#1E6BFF" />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '600', color: '#1E6BFF' }}>Your Circle can see this</Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Sparkles size={15} color="#F5A623" />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.ink2 }}>
              {saved.verdict === 'hidden-gem'
                ? `${saved.count} hidden gem${saved.count === 1 ? '' : 's'} found`
                : `${saved.count} discover${saved.count === 1 ? 'y' : 'ies'} logged`}
            </Text>
          </View>
          <View className="flex-row" style={{ gap: 10, marginTop: 6, alignSelf: 'stretch' }}>
            <Pressable onPress={() => { setSaved(null); setWhere(''); }} className="flex-row items-center justify-center rounded-2xl" style={{ flex: 1, paddingVertical: 13, gap: 7, backgroundColor: COLORS.warmwhite }}>
              <Plus size={16} color={COLORS.coral} />
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.coral }}>Log another</Text>
            </Pressable>
            <Pressable onPress={onClose} className="items-center justify-center rounded-2xl" style={{ flex: 1, paddingVertical: 13, backgroundColor: COLORS.coral }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: '#fff' }}>Done</Text>
            </Pressable>
          </View>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, textAlign: 'center', marginTop: 2 }}>Add a photo, name or note any time from your discoveries.</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10, gap: 12 }}>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, color: COLORS.ink2 }}>Was it worth it? Rate it in seconds — add the details later.</Text>

          {/* Where */}
          <View style={{ gap: 6 }}>
            <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 9 }}>
              <MapPin size={18} color={COLORS.ink3} />
              <TextInput value={where} onChangeText={setWhere} placeholder="Where are you? e.g. a restaurant, café…" placeholderTextColor={COLORS.ink3} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink }} />
              <Pressable onPress={useLocation} hitSlop={8} className="flex-row items-center rounded-full" style={{ backgroundColor: 'rgba(255,107,154,0.10)', paddingHorizontal: 10, paddingVertical: 6, gap: 5 }}>
                {locating ? <ActivityIndicator size="small" color={COLORS.coral} /> : <MapPin size={13} color={COLORS.coral} />}
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: COLORS.coral }}>{locating ? '…' : 'Locate'}</Text>
              </Pressable>
            </View>
            {locChip ? <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, paddingHorizontal: 4 }}>{locChip}</Text> : null}
          </View>

          {/* Verdict — the hero */}
          <View style={{ gap: 8 }}>
            {RECOMMENDATION_VERDICTS.map((v) => {
              const s = VERDICT_STYLE[v];
              const Icon = s.icon;
              const busy = saving === v;
              return (
                <Pressable key={v} accessibilityRole="button" accessibilityLabel={`${VERDICT_META[v].label} — ${VERDICT_META[v].hint}`} onPress={() => log(v)} disabled={!!saving} className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 13, gap: 12, borderWidth: 1.5, borderColor: s.tint + '33', opacity: saving && !busy ? 0.5 : 1 }}>
                  <View className="rounded-full items-center justify-center" style={{ height: 38, width: 38, backgroundColor: s.tint + '1A' }}>
                    {busy ? <ActivityIndicator size="small" color={s.tint} /> : <Icon size={19} color={s.tint} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 16, fontWeight: '800', color: COLORS.navy }}>{VERDICT_META[v].label}</Text>
                    <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>{VERDICT_META[v].hint}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row items-center justify-center" style={{ gap: 6, marginTop: 2 }}>
            <Users size={13} color={COLORS.ink3} />
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3 }}>Your verdict will be visible to your Circle</Text>
          </View>

          {onExpand ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Add full details — photo, category and notes" onPress={onExpand} hitSlop={8} style={{ alignItems: 'center', paddingVertical: 4 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>Add full details instead — photo, category & notes</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </SheetShell>
  );
}

import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Check, Search } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { DateField } from './DateField';
import { CityField } from './CityField';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { COUNTRIES, countryName } from '../src/data/countries';
import { RELATIONSHIPS, RELATIONSHIP_META, type Relationship } from '../src/types';
import { router } from 'expo-router';
import { useData } from '../src/store/data';
import { shouldGate } from '../src/lib/billing';
import { maybeAskForRating } from '../src/lib/rating';
import { useToast } from '../src/store/toast';
import { useConfirm } from '../src/store/confirm';
import { useCelebration } from '../src/store/celebration';
import { hImpact, hSelection } from '../src/lib/haptics';
import { countryMilestone } from '../src/lib/milestone';

const REL_OPTIONS = RELATIONSHIPS.filter((r) => r !== 'aspiring');
// Reach back ~96 years so birth / long-ago residence years are selectable.

type Kind = 'country' | 'city';


export function AddPlaceSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addPlace, places, expeditions, recalculateJourneys } = useData();
  const { toast } = useToast();
  const confirm = useConfirm();
  const { celebrate } = useCelebration();
  const [kind, setKind] = useState<Kind>('country');
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('');
  const [rels, setRels] = useState<Set<Relationship>>(new Set(['visited']));

  // ISO dates at whatever precision the user picked ('YYYY[-MM[-DD]]').
  const [when, setWhen] = useState('');

  // Residence end (when Lived/Based).
  const [present, setPresent] = useState(true);
  const [until, setUntil] = useState('');

  const isResidence = rels.has('lived') || rels.has('based');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
    return list.slice(0, 40);
  }, [query]);

  function reset() {
    setKind('country');
    setQuery('');
    setCode('');
    setCity('');
    setRels(new Set(['visited']));
    setWhen('');
    setPresent(true);
    setUntil('');
  }
  function close() {
    reset();
    onClose();
  }
  function save(keepOpen = false) {
    if (!ready) return;
    // Paywall trigger — the 26th country. Inert until billing goes live.
    if (kind === 'country' && shouldGate('countries', new Set(places.filter((p) => p.kind === 'country').map((p) => p.countryCode)).size)) {
      close();
      router.push('/upgrade?trigger=countries');
      return;
    }
    const firstDate = when || undefined;
    let livedFrom: string | undefined;
    let livedTo: string | undefined;
    let residencePeriods: { from: string; to?: string }[] | undefined;
    if (isResidence && firstDate) {
      livedFrom = firstDate;
      livedTo = present ? undefined : until || undefined;
      residencePeriods = [{ from: firstDate, ...(livedTo ? { to: livedTo } : {}) }];
    }
    addPlace({
      kind,
      countryCode: code,
      name: kind === 'city' ? city.trim() : undefined,
      relationships: [...rels],
      firstYear: when ? Number(when.slice(0, 4)) : undefined,
      firstDate,
      livedFrom,
      livedTo,
      residencePeriods,
    });

    // Delight: a haptic on every add, a full confetti celebration on milestones
    // (first country, every tenth, a new continent, all seven). The core action
    // should feel like something, not just a toast.
    const priorCodes = new Set(places.filter((p) => p.kind === 'country').map((p) => p.countryCode));
    const isNewCountry = kind === 'country' && !priorCodes.has(code);
    if (isNewCountry) {
      const count = priorCodes.size + 1;
      const cel = countryMilestone(priorCodes, code);
      if (cel) {
        celebrate(cel); // the provider fires a success haptic on show
      } else {
        hImpact('medium');
      }
      if (count === 10 || count === 25 || count === 50) maybeAskForRating(`country_${count}`);
    } else {
      hImpact('light');
    }

    toast.success(kind === 'city' ? 'City added' : 'Country added');
    const wasResidence = isResidence;
    const newCode = code;
    if (keepOpen) {
      // Stay open for rapid batch entry — reset the pick, keep the sheet.
      setCode('');
      setQuery('');
      setCity('');
      setRels(new Set(['visited']));
      setWhen('');
      setPresent(true);
      setUntil('');
    } else {
      close();
    }
    // Adding somewhere you've lived can change which trips are "from home", so
    // offer to re-resolve imported journeys against the new home set.
    if (!keepOpen && wasResidence && expeditions.some((e) => e.journeys.some((j) => j.id?.startsWith('imp_')))) {
      confirm({
        title: 'Recalculate journeys?',
        message: 'You added a place you’ve lived. Re-resolve your imported trips so they lead with the destination rather than home?',
        confirmLabel: 'Recalculate',
      }).then((yes) => {
        if (!yes) return;
        const homeCodes = [
          ...new Set([
            newCode,
            ...places.filter((p) => p.relationships.includes('lived') || p.relationships.includes('based')).map((p) => p.countryCode),
          ]),
        ];
        recalculateJourneys(expeditions, homeCodes).then((n) => {
          if (n > 0) toast.success(`Updated ${n} ${n === 1 ? 'journey' : 'journeys'}`);
        });
      });
    }
  }
  function toggleRel(r: Relationship) {
    hSelection();
    setRels((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  }

  const ready = Boolean(code && rels.size > 0 && (kind === 'country' || city.trim()));

  return (
    <SheetShell visible={visible} title="Add a place" onClose={close}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
        {/* Country / City */}
        <View className="flex-row bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, marginTop: 4, padding: 5, gap: 5 }}>
          {(['country', 'city'] as Kind[]).map((k) => {
            const active = kind === k;
            return (
              <Pressable key={k} onPress={() => { hSelection(); setKind(k); }} className="items-center justify-center rounded-xl" style={{ flex: 1, paddingVertical: 9, backgroundColor: active ? COLORS.navySolid : 'transparent' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontWeight: '700', fontSize: 13, color: active ? '#fff' : COLORS.ink3 }}>{k === 'country' ? 'Country' : 'City'}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* City name — type-ahead over the cities dataset, scoped to the country. */}
        {kind === 'city' ? (
          <View style={{ marginHorizontal: 20, marginTop: 10 }}>
            <CityField value={city} onChangeText={setCity} countryCode={code || undefined} onPick={(s) => { if (!code) setCode(s.countryCode); }} />
          </View>
        ) : null}

        {/* Country search */}
        <Text style={LBL}>{kind === 'city' ? 'WHICH COUNTRY?' : 'COUNTRY'}</Text>
        <View className="flex-row items-center bg-white dark:bg-card rounded-2xl" style={{ marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 8, marginTop: 8 }}>
          <Search size={18} color={COLORS.ink3} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search countries" placeholderTextColor={COLORS.ink3} style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 16, color: COLORS.ink }} />
        </View>
        {code && !query ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2, paddingHorizontal: 20, marginTop: 8 }}>{flagEmoji(code)} {countryName(code)}</Text>
        ) : (
          <ScrollView style={{ maxHeight: 200, marginTop: 6 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {results.map((c) => {
              const active = code === c.code;
              return (
                <Pressable key={c.code} onPress={() => { setCode(c.code); setQuery(''); }} className="flex-row items-center" style={{ paddingHorizontal: 20, paddingVertical: 11, gap: 12, backgroundColor: active ? 'rgba(255,107,154,0.10)' : 'transparent' }}>
                  <Text style={{ fontSize: 22 }}>{flagEmoji(c.code)}</Text>
                  <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.navy }}>{c.name}</Text>
                  {active ? <Check size={18} color={COLORS.coral} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* relationships */}
        <Text style={LBL}>YOUR CONNECTION</Text>
        <View className="flex-row flex-wrap" style={{ paddingHorizontal: 20, marginTop: 8, gap: 8 }}>
          {REL_OPTIONS.map((r) => {
            const active = rels.has(r);
            return (
              <Pressable key={r} onPress={() => toggleRel(r)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: active ? COLORS.navySolid : '#fff' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '600', color: active ? '#fff' : COLORS.ink2 }}>{RELATIONSHIP_META[r].label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* when — optional year / month / day dropdowns */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={{ ...LBL, paddingHorizontal: 0, marginTop: 0 }}>{isResidence ? 'LIVED FROM' : 'WHEN (OPTIONAL)'}</Text>
          <View style={{ marginTop: 8 }}>
            <DateField value={when} onChange={setWhen} label={isResidence ? 'When you moved there' : 'When you first went'} allowPartial />
          </View>
        </View>

        {/* residence end */}
        {isResidence ? (
          <>
            <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20, marginTop: 16 }}>
              <Text style={{ ...LBL, paddingHorizontal: 0, marginTop: 0 }}>LIVED UNTIL</Text>
              <Pressable onPress={() => setPresent((v) => !v)} className="rounded-full" style={{ paddingHorizontal: 14, paddingVertical: 7, backgroundColor: present ? COLORS.navySolid : '#fff' }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, fontWeight: '700', color: present ? '#fff' : COLORS.ink2 }}>{present ? 'Still here ✓' : 'Still here'}</Text>
              </Pressable>
            </View>
            {!present ? (
              <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                <DateField value={until} onChange={setUntil} label="When you moved away" allowPartial />
              </View>
            ) : null}
          </>
        ) : null}

        <Pressable onPress={() => save(false)} disabled={!ready} className="rounded-2xl items-center justify-center flex-row" style={{ marginHorizontal: 20, marginTop: 18, paddingVertical: 15, backgroundColor: COLORS.coral, opacity: ready ? 1 : 0.4, gap: 8 }}>
          <Check size={18} color="#fff" />
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>Add to your world</Text>
        </Pressable>
        {kind === 'country' && !isResidence ? (
          <Pressable onPress={() => save(true)} disabled={!ready} className="items-center justify-center" style={{ marginTop: 10, paddingVertical: 8, opacity: ready ? 1 : 0.4 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.coral }}>Save & add another</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SheetShell>
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

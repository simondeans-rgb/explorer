import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Check } from 'lucide-react-native';
import { SheetShell } from './SheetShell';
import { COLORS } from '../src/lib/theme';
import { flagEmoji } from '../src/lib/flags';
import { countryName } from '../src/data/countries';
import type { PlaceRow } from '../src/lib/flightyImport';
import type { PhotoCandidate } from '../src/lib/photoScan';
import { uriToDataUrl } from '../src/lib/photo';
import { useData } from '../src/store/data';
import { useToast } from '../src/store/toast';
import { track } from '../src/lib/analytics';

/** After a photo scan, let the user review the detected countries — which are
 *  new vs already on their map — and choose exactly which new ones to add.
 *  A second, opt-in step then offers the scanned photos themselves as
 *  country-page captures (each pre-selected, tap to leave out). */
export function ScanResultSheet({
  visible,
  scanned,
  located,
  rows,
  existingCodes,
  photos = {},
  busy,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  scanned: number;
  located: number;
  rows: PlaceRow[];
  existingCodes: Set<string>;
  /** Capture candidates per country code, from the scan. */
  photos?: Record<string, PhotoCandidate[]>;
  busy: boolean;
  onClose: () => void;
  onConfirm: (selected: PlaceRow[]) => void;
}) {
  const { addCapture } = useData();
  const { toast } = useToast();
  const [step, setStep] = useState<'countries' | 'photos'>('countries');
  const [photoCodes, setPhotoCodes] = useState<string[]>([]);
  const [photoSel, setPhotoSel] = useState<Set<string>>(new Set());
  const [savingPhotos, setSavingPhotos] = useState(false);
  // Split detected countries into new (addable) and already-on-the-map.
  const { fresh, already } = useMemo(() => {
    const seen = new Set<string>();
    const fresh: PlaceRow[] = [];
    const already: PlaceRow[] = [];
    for (const r of rows) {
      const code = r.countryCode;
      if (!code || seen.has(code)) continue;
      seen.add(code);
      (existingCodes.has(code) ? already : fresh).push(r);
    }
    const byName = (a: PlaceRow, b: PlaceRow) => countryName(a.countryCode).localeCompare(countryName(b.countryCode));
    return { fresh: fresh.sort(byName), already: already.sort(byName) };
  }, [rows, existingCodes]);

  // Selection: every new country starts selected.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (visible) {
      setSelected(new Set(fresh.map((r) => r.countryCode)));
      setStep('countries');
    }
  }, [visible, fresh]);

  const allOn = fresh.length > 0 && selected.size === fresh.length;
  const toggle = (code: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  const toggleAll = () =>
    setSelected(allOn ? new Set() : new Set(fresh.map((r) => r.countryCode)));

  const confirm = () => {
    const chosen = fresh.filter((r) => selected.has(r.countryCode));
    onConfirm(chosen);
    // Offer the photos themselves next — for the countries just added.
    const withPhotos = chosen.map((r) => r.countryCode).filter((c) => (photos[c] ?? []).length > 0);
    if (withPhotos.length > 0) {
      setPhotoCodes(withPhotos);
      setPhotoSel(new Set(withPhotos.flatMap((c) => (photos[c] ?? []).map((p) => `${c}|${p.uri}`))));
      setStep('photos');
    }
  };

  async function savePhotos() {
    if (savingPhotos) return;
    setSavingPhotos(true);
    try {
      let added = 0;
      for (const code of photoCodes) {
        for (const p of photos[code] ?? []) {
          if (!photoSel.has(`${code}|${p.uri}`)) continue;
          const dataUrl = await uriToDataUrl(p.uri);
          if (!dataUrl) continue;
          await addCapture({ dataUrl, countryCode: code, takenAt: p.takenAt });
          added++;
        }
      }
      track('scan_photos_added', { count: added });
      if (added > 0) toast.success(`Added ${added} photo${added === 1 ? '' : 's'} to your country pages`);
      else toast.error("Those photos couldn't be read — they may be in iCloud.");
    } catch {
      toast.error("Couldn't add those photos.");
    } finally {
      setSavingPhotos(false);
      onClose();
    }
  }

  if (step === 'photos') {
    return (
      <SheetShell visible={visible} title="Add the photos too?" onClose={onClose}>
        <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, paddingHorizontal: 20, marginBottom: 6, lineHeight: 18 }}>
          These are from your scan — add them to each country's page so your map has memories, not just pins. Tap any photo to leave it out.
        </Text>
        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 }}>
          {photoCodes.map((code) => (
            <View key={code} style={{ marginBottom: 14 }}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.navy, marginBottom: 8 }}>
                {flagEmoji(code)}  {countryName(code)}
              </Text>
              <View className="flex-row" style={{ gap: 8 }}>
                {(photos[code] ?? []).map((p) => {
                  const key = `${code}|${p.uri}`;
                  const on = photoSel.has(key);
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      onPress={() =>
                        setPhotoSel((s) => {
                          const next = new Set(s);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next;
                        })
                      }
                      style={{ flex: 1, aspectRatio: 1, borderRadius: 16, overflow: 'hidden', opacity: on ? 1 : 0.4 }}
                    >
                      <Image source={{ uri: p.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      {on ? (
                        <View className="items-center justify-center rounded-full" style={{ position: 'absolute', top: 6, right: 6, height: 22, width: 22, backgroundColor: COLORS.coral }}>
                          <Check size={13} color="#fff" strokeWidth={3} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <Pressable
            onPress={savePhotos}
            disabled={savingPhotos || photoSel.size === 0}
            className="items-center justify-center rounded-2xl"
            style={{ backgroundColor: COLORS.coral, paddingVertical: 15, opacity: savingPhotos || photoSel.size === 0 ? 0.5 : 1 }}
          >
            {savingPhotos ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>
                Add {photoSel.size} photo{photoSel.size === 1 ? '' : 's'}
              </Text>
            )}
          </Pressable>
          <Pressable onPress={onClose} disabled={savingPhotos} style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13.5, fontWeight: '600', color: COLORS.ink3 }}>Skip — just the countries</Text>
          </Pressable>
        </View>
      </SheetShell>
    );
  }

  return (
    <SheetShell visible={visible} title="Countries we found" onClose={onClose}>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, paddingHorizontal: 20, marginBottom: 6 }}>
        Scanned {scanned.toLocaleString()} item{scanned === 1 ? '' : 's'} ({located.toLocaleString()} with a location) · {fresh.length} new, {already.length} already on your map.
      </Text>

      <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 }}>
        {fresh.length > 0 ? (
          <View className="flex-row items-center justify-between" style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3 }}>
              NEW · TAP TO CHOOSE
            </Text>
            <Pressable onPress={toggleAll} hitSlop={8}>
              <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, fontWeight: '700', color: COLORS.coral }}>
                {allOn ? 'Clear all' : 'Select all'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {fresh.map((r) => {
          const on = selected.has(r.countryCode);
          return (
            <Pressable
              key={r.countryCode}
              onPress={() => toggle(r.countryCode)}
              className="flex-row items-center bg-white dark:bg-card rounded-2xl"
              style={{ padding: 12, marginBottom: 8, gap: 12 }}
            >
              <Text style={{ fontSize: 24 }}>{flagEmoji(r.countryCode)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: COLORS.navy }}>
                  {countryName(r.countryCode)}
                </Text>
                {r.firstYear ? (
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12.5, color: COLORS.ink3, marginTop: 1 }}>
                    First seen {r.firstYear}
                  </Text>
                ) : null}
              </View>
              <View
                className="items-center justify-center rounded-full"
                style={{
                  height: 26,
                  width: 26,
                  backgroundColor: on ? COLORS.coral : 'transparent',
                  borderWidth: on ? 0 : 1.5,
                  borderColor: 'rgba(20,33,61,0.18)',
                }}
              >
                {on ? <Check size={16} color="#fff" /> : null}
              </View>
            </Pressable>
          );
        })}

        {already.length > 0 ? (
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 11, fontWeight: '800', letterSpacing: 1, color: COLORS.ink3, marginTop: 10, marginBottom: 8 }}>
            ALREADY ON YOUR MAP
          </Text>
        ) : null}
        {already.map((r) => (
          <View
            key={r.countryCode}
            className="flex-row items-center rounded-2xl"
            style={{ padding: 12, marginBottom: 8, gap: 12, backgroundColor: 'rgba(20,33,61,0.035)' }}
          >
            <Text style={{ fontSize: 24, opacity: 0.55 }}>{flagEmoji(r.countryCode)}</Text>
            <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '600', color: COLORS.ink3 }}>
              {countryName(r.countryCode)}
            </Text>
            <Check size={16} color={COLORS.aqua} />
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Pressable
          onPress={confirm}
          disabled={busy || selected.size === 0}
          className="items-center justify-center rounded-2xl"
          style={{ backgroundColor: COLORS.coral, paddingVertical: 15, opacity: busy || selected.size === 0 ? 0.5 : 1 }}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700', color: '#fff' }}>
              {selected.size === 0 ? 'Select countries to add' : `Add ${selected.size} ${selected.size === 1 ? 'country' : 'countries'}`}
            </Text>
          )}
        </Pressable>
      </View>
    </SheetShell>
  );
}

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Plane, ListChecks, Images, Check } from 'lucide-react-native';
import { PageHero } from '../components/PageHero';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { useData } from '../src/store/data';
import { buildImportPlan } from '../src/lib/flightyImport';
import { parseCountryList } from '../src/lib/listImport';
import { scanPhotosForCountries } from '../src/lib/photoScan';
import { homeRanges } from '../src/lib/residence';

export default function ImportScreen() {
  const { importPlaces, importExpeditions, places } = useData();
  // Countries you live in — so imported trips aren't labelled as visits home.
  const homeCodes = new Set(
    places.filter((p) => p.relationships.some((r) => r === 'lived' || r === 'based')).map((p) => p.countryCode),
  );

  // Flighty
  const [csvBusy, setCsvBusy] = useState(false);
  const [csvMsg, setCsvMsg] = useState<string | null>(null);

  // List
  const [listText, setListText] = useState('');
  const [listBusy, setListBusy] = useState(false);
  const [listMsg, setListMsg] = useState<string | null>(null);

  // Photos
  const [scanBusy, setScanBusy] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMsg, setScanMsg] = useState<string | null>(null);

  async function importFlighty() {
    setCsvMsg(null);
    const res = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/comma-separated-values', 'public.comma-separated-values-text', '*/*'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    setCsvBusy(true);
    try {
      const text = await readAsStringAsync(res.assets[0].uri);
      const plan = buildImportPlan(text, homeCodes, homeRanges(places));
      if (plan.flightCount === 0) {
        setCsvMsg("Couldn't find flights in that file. Export your Flighty history as CSV and try again.");
        return;
      }
      const added = await importPlaces(plan.places);
      await importExpeditions(plan.expeditions);
      setCsvMsg(`Imported ${plan.flightCount} flights → ${added} new places and ${plan.expeditions.length} trips.`);
    } catch {
      setCsvMsg('Could not read that file.');
    } finally {
      setCsvBusy(false);
    }
  }

  async function importList() {
    setListMsg(null);
    const { rows, unmatched } = parseCountryList(listText);
    if (rows.length === 0) {
      setListMsg('No countries recognised. Put one per line, e.g. "Japan" or "Kyoto, Japan".');
      return;
    }
    setListBusy(true);
    try {
      const added = await importPlaces(rows);
      const extra = unmatched.length ? ` (${unmatched.length} not recognised)` : '';
      setListMsg(`Added ${added} new place${added === 1 ? '' : 's'}${extra}.`);
      setListText('');
    } finally {
      setListBusy(false);
    }
  }

  async function scanPhotos() {
    setScanMsg(null);
    setScanBusy(true);
    setScanProgress(0);
    try {
      const { rows, scanned, denied, limited, partial } = await scanPhotosForCountries((p) => setScanProgress(p.scanned), homeRanges(places));
      if (denied) {
        setScanMsg('Photo access is needed to detect where you’ve been.');
        return;
      }
      const limitedNote = limited
        ? ' Worldly only has access to selected photos — choose “All Photos” in Settings → Worldly → Photos for a full scan.'
        : '';
      const partialNote = partial ? ' (The scan stopped early — tap to run it again to finish.)' : '';
      if (rows.length === 0) {
        setScanMsg(`Scanned ${scanned} photos — none had usable location data.${limitedNote}${partialNote}`);
        return;
      }
      const added = await importPlaces(rows);
      setScanMsg(`Scanned ${scanned} photos → found ${rows.length} countries, added ${added} new.${limitedNote}${partialNote}`);
    } catch {
      setScanMsg('Could not scan your photos.');
    } finally {
      setScanBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 112 }}>
        <PageHero eyebrow="Bring your history in" title="Import travels" subtitle="Add the places you’ve already been, three quick ways." gradient={GRADIENTS.atlas} imageCode="WW" onBack={() => router.back()} />

        {/* Flighty */}
        <Card icon={Plane} title="Flighty CSV" body="Export your flight history from Flighty (Settings → Export) and pick the CSV. We’ll map every flight to countries, cities and trips.">
          <Pressable onPress={importFlighty} disabled={csvBusy} style={btn(csvBusy)}>
            {csvBusy ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>Choose CSV file</Text>}
          </Pressable>
          {csvMsg ? <Msg text={csvMsg} /> : null}
        </Card>

        {/* List */}
        <Card icon={ListChecks} title="Paste a list" body="One country per line. Add a city as “City, Country”. e.g. Japan / Kyoto, Japan / Brazil.">
          <View className="bg-white rounded-2xl" style={{ paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(20,33,61,0.08)' }}>
            <TextInput
              value={listText}
              onChangeText={setListText}
              placeholder={'Japan\nItaly\nKyoto, Japan'}
              placeholderTextColor={COLORS.ink3}
              multiline
              style={{ fontFamily: 'PlusJakarta', fontSize: 15, color: COLORS.ink, minHeight: 90, textAlignVertical: 'top' }}
            />
          </View>
          <Pressable onPress={importList} disabled={listBusy || !listText.trim()} style={btn(listBusy || !listText.trim())}>
            {listBusy ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>Import list</Text>}
          </Pressable>
          {listMsg ? <Msg text={listMsg} /> : null}
        </Card>

        {/* Photos */}
        <Card icon={Images} title="Scan your photos" body="We read each photo’s location tag and date (on your device only) to detect the countries you’ve visited, in the right year — and skip anywhere you lived at the time, so home doesn’t count as a trip. Scanning your whole library can take a minute.">
          <Pressable onPress={scanPhotos} disabled={scanBusy} style={btn(scanBusy)}>
            {scanBusy ? (
              <Text style={btnText}>Scanning… {scanProgress} photos</Text>
            ) : (
              <Text style={btnText}>Scan my photos</Text>
            )}
          </Pressable>
          {scanMsg ? <Msg text={scanMsg} /> : null}
        </Card>
      </ScrollView>
    </View>
  );
}

function Card({ icon: Icon, title, body, children }: { icon: React.ComponentType<{ size?: number; color?: string }>; title: string; body: string; children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-3xl" style={{ marginHorizontal: 20, marginTop: 16, padding: 18 }}>
      <View className="flex-row items-center" style={{ gap: 10, marginBottom: 8 }}>
        <View className="rounded-2xl items-center justify-center" style={{ height: 40, width: 40, backgroundColor: COLORS.warmwhite }}>
          <Icon size={20} color={COLORS.coral} />
        </View>
        <Text style={{ fontFamily: 'Fraunces', fontSize: 18, color: COLORS.navy }}>{title}</Text>
      </View>
      <Text style={{ fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink3, marginBottom: 14, lineHeight: 19 }}>{body}</Text>
      {children}
    </View>
  );
}

function Msg({ text }: { text: string }) {
  return (
    <View className="flex-row items-start" style={{ gap: 6, marginTop: 12 }}>
      <Check size={15} color={COLORS.aqua} style={{ marginTop: 2 }} />
      <Text style={{ flex: 1, fontFamily: 'PlusJakarta', fontSize: 13, color: COLORS.ink2 }}>{text}</Text>
    </View>
  );
}

const btn = (disabled: boolean) => ({
  backgroundColor: COLORS.coral,
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  opacity: disabled ? 0.5 : 1,
});
const btnText = { fontFamily: 'PlusJakarta', fontSize: 15, fontWeight: '700' as const, color: '#fff' };

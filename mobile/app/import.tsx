import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Plane, ListChecks, Images, Check, RefreshCw, CloudDownload, MapPin, Coffee, Route, CalendarClock } from 'lucide-react-native';
import { PageHero } from '../components/PageHero';
import { goBack } from '../src/lib/nav';
import { COLORS, GRADIENTS } from '../src/lib/theme';
import { useData } from '../src/store/data';
import { buildImportPlan, planFromFlights, flightsFromExpeditions } from '../src/lib/flightyImport';
import { parseTakeout } from '../src/lib/takeoutImport';
import { parseCheckins } from '../src/lib/checkinsImport';
import { parsePolarsteps, parsePolarstepsZip } from '../src/lib/polarstepsImport';
import { parseTripit } from '../src/lib/tripitImport';
import { parseCountryList } from '../src/lib/listImport';
import { scanPhotosForCountries } from '../src/lib/photoScan';
import { homeRanges } from '../src/lib/residence';
import { track } from '../src/lib/analytics';
import { ScanResultSheet } from '../components/ScanResultSheet';
import type { PlaceRow } from '../src/lib/flightyImport';

export default function ImportScreen() {
  const { importPlaces, importExpeditions, places, expeditions, removeExpedition, addDiscovery, discoveries } = useData();
  const [takeoutBusy, setTakeoutBusy] = useState(false);
  const [takeoutMsg, setTakeoutMsg] = useState<string | null>(null);
  const [takeoutProgress, setTakeoutProgress] = useState<{ done: number; total: number } | null>(null);

  // Foursquare / Swarm
  const [swarmBusy, setSwarmBusy] = useState(false);
  const [swarmMsg, setSwarmMsg] = useState<string | null>(null);
  const [swarmProgress, setSwarmProgress] = useState<{ done: number; total: number } | null>(null);

  // Polarsteps
  const [polarBusy, setPolarBusy] = useState(false);
  const [polarMsg, setPolarMsg] = useState<string | null>(null);

  // TripIt
  const [tripitBusy, setTripitBusy] = useState(false);
  const [tripitMsg, setTripitMsg] = useState<string | null>(null);

  /** Add a batch of parsed discovery rows, skipping any already logged (by
   *  name), reporting progress. Returns { added, skipped }. */
  async function addDiscoveryRows(
    rows: { name: string; category: import('../src/lib/takeoutImport').DiscoveryRow['category']; verdict?: import('../src/lib/takeoutImport').DiscoveryRow['verdict']; countryCode?: string; city?: string; note?: string }[],
    onProgress: (p: { done: number; total: number } | null) => void,
  ): Promise<{ added: number; skipped: number }> {
    const have = new Set(discoveries.map((d) => d.name.trim().toLowerCase()));
    const fresh = rows.filter((r) => !have.has(r.name.trim().toLowerCase()));
    let added = 0;
    onProgress({ done: 0, total: fresh.length });
    for (let i = 0; i < fresh.length; i++) {
      const r = fresh[i];
      try {
        await addDiscovery({ name: r.name, category: r.category, verdict: r.verdict, countryCode: r.countryCode, city: r.city, note: r.note });
        added += 1;
      } catch { /* skip a bad row, keep going */ }
      onProgress({ done: i + 1, total: fresh.length });
    }
    onProgress(null);
    return { added, skipped: rows.length - fresh.length };
  }

  async function importTakeout() {
    setTakeoutMsg(null);
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/csv', 'text/comma-separated-values', 'application/geo+json', '*/*'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    setTakeoutBusy(true);
    try {
      const text = await readAsStringAsync(res.assets[0].uri);
      const rows = parseTakeout(text);
      if (rows.length === 0) {
        setTakeoutMsg("Couldn't find places in that file. In Google Takeout, export “Maps (your places)” and pick a Reviews or saved-list file (.json or .csv).");
        return;
      }
      const { added, skipped } = await addDiscoveryRows(rows, setTakeoutProgress);
      setTakeoutMsg(`Imported ${added} discover${added === 1 ? 'y' : 'ies'} from Google Maps${skipped ? ` · ${skipped} already logged` : ''}. Refine any verdicts or categories any time.`);
      track('import_run', { source: 'google_maps', count: added });
    } catch {
      setTakeoutMsg('Could not read that file.');
    } finally {
      setTakeoutBusy(false);
      setTakeoutProgress(null);
    }
  }

  async function importSwarm() {
    setSwarmMsg(null);
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', '*/*'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    setSwarmBusy(true);
    try {
      const text = await readAsStringAsync(res.assets[0].uri);
      const rows = parseCheckins(text);
      if (rows.length === 0) {
        setSwarmMsg("Couldn't find check-ins in that file. Export your data from Foursquare/Swarm and pick the check-ins .json.");
        return;
      }
      const { added, skipped } = await addDiscoveryRows(rows, setSwarmProgress);
      setSwarmMsg(`Imported ${added} place${added === 1 ? '' : 's'} from your check-ins${skipped ? ` · ${skipped} already logged` : ''}.`);
      track('import_run', { source: 'swarm', count: added });
    } catch {
      setSwarmMsg('Could not read that file.');
    } finally {
      setSwarmBusy(false);
      setSwarmProgress(null);
    }
  }

  async function importPolarsteps() {
    setPolarMsg(null);
    const res = await DocumentPicker.getDocumentAsync({ type: ['application/zip', 'application/json', '*/*'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    setPolarBusy(true);
    try {
      const isZip = /\.zip$/i.test(asset.name ?? '') || asset.mimeType === 'application/zip';
      const result = isZip
        ? await parsePolarstepsZip(await readAsStringAsync(asset.uri, { encoding: 'base64' }))
        : parsePolarsteps(await readAsStringAsync(asset.uri));
      if (result.expeditions.length === 0 && result.places.length === 0) {
        setPolarMsg("Couldn't find trips in that file. Download your Polarsteps data (Account → Download data) and pick the .zip, or a trip.json inside it.");
        return;
      }
      const added = await importPlaces(result.places);
      await importExpeditions(result.expeditions);
      setPolarMsg(`Imported ${result.expeditions.length} trip${result.expeditions.length === 1 ? '' : 's'} → ${added} new place${added === 1 ? '' : 's'}.`);
      track('import_run', { source: 'polarsteps', count: result.expeditions.length });
    } catch {
      setPolarMsg('Could not read that Polarsteps export.');
    } finally {
      setPolarBusy(false);
    }
  }

  async function importTripit() {
    setTripitMsg(null);
    const res = await DocumentPicker.getDocumentAsync({ type: ['text/calendar', 'application/octet-stream', '*/*'], copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    setTripitBusy(true);
    try {
      const text = await readAsStringAsync(res.assets[0].uri);
      const { rows, events, matched } = parseTripit(text);
      if (rows.length === 0) {
        setTripitMsg(events === 0 ? "That doesn't look like a TripIt calendar (.ics). In TripIt, export or share your trips as a calendar file." : `Read ${events} item${events === 1 ? '' : 's'} but couldn't pin any to a country.`);
        return;
      }
      const added = await importPlaces(rows);
      setTripitMsg(`Imported ${added} new place${added === 1 ? '' : 's'} from ${matched} of ${events} itinerary item${events === 1 ? '' : 's'}.`);
      track('import_run', { source: 'tripit', count: added });
    } catch {
      setTripitMsg('Could not read that file.');
    } finally {
      setTripitBusy(false);
    }
  }
  // Countries you live in — so imported trips aren't labelled as visits home.
  const homeCodes = new Set(
    places.filter((p) => p.relationships.some((r) => r === 'lived' || r === 'based')).map((p) => p.countryCode),
  );
  const hasImported = expeditions.some((e) => e.journeys.some((j) => j.id?.startsWith('imp_')));

  // Flighty
  const [csvBusy, setCsvBusy] = useState(false);
  const [csvMsg, setCsvMsg] = useState<string | null>(null);
  const [reBusy, setReBusy] = useState(false);

  // List
  const [listText, setListText] = useState('');
  const [listBusy, setListBusy] = useState(false);
  const [listMsg, setListMsg] = useState<string | null>(null);

  // Photos
  const [scanBusy, setScanBusy] = useState(false);
  const [scanThorough, setScanThorough] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMsg, setScanMsg] = useState<string | null>(null);
  const [scanSheetOpen, setScanSheetOpen] = useState(false);
  const [scanRows, setScanRows] = useState<PlaceRow[]>([]);
  const [scanScanned, setScanScanned] = useState(0);
  const [scanLocated, setScanLocated] = useState(0);
  const [scanNote, setScanNote] = useState('');
  const [addBusy, setAddBusy] = useState(false);

  // Countries already on the map — used to mark scan results as new vs existing.
  const existingCountryCodes = new Set(
    places.filter((p) => p.kind === 'country' && p.countryCode).map((p) => p.countryCode),
  );

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
      track('import_run', { source: 'flights_csv', count: plan.flightCount });
    } catch {
      setCsvMsg('Could not read that file.');
    } finally {
      setCsvBusy(false);
    }
  }

  async function reevaluate() {
    setCsvMsg(null);
    const { flights, expeditionIds } = flightsFromExpeditions(expeditions);
    if (flights.length === 0) {
      setCsvMsg('No imported flights to re-evaluate.');
      return;
    }
    setReBusy(true);
    try {
      const plan = planFromFlights(flights, homeCodes, homeRanges(places));
      for (const id of expeditionIds) removeExpedition(id);
      const added = await importPlaces(plan.places);
      await importExpeditions(plan.expeditions);
      setCsvMsg(`Re-evaluated ${flights.length} flights → ${plan.expeditions.length} trips${added ? `, ${added} new places` : ''}.`);
    } catch {
      setCsvMsg('Could not re-evaluate your trips.');
    } finally {
      setReBusy(false);
    }
  }
  function confirmReevaluate() {
    Alert.alert(
      'Re-evaluate imported trips?',
      'Rebuilds your Flighty-imported trips from your current residence history, replacing the previously imported trips. Manual edits to imported trips will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Re-evaluate', onPress: reevaluate },
      ],
    );
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
      track('import_run', { source: 'list', count: added });
      setListText('');
    } finally {
      setListBusy(false);
    }
  }

  async function scanPhotos(thorough = false) {
    setScanMsg(null);
    setScanBusy(true);
    setScanThorough(thorough);
    setScanProgress(0);
    try {
      const { rows, scanned, located, denied, limited, partial } = await scanPhotosForCountries((p) => setScanProgress(p.scanned), homeRanges(places), { thorough });
      if (denied) {
        setScanMsg('Photo access is needed to detect where you’ve been.');
        return;
      }
      const limitedNote = limited
        ? ' Worldly only has access to selected photos — choose “All Photos” in Settings → Worldly → Photos for a full scan.'
        : '';
      const partialNote = partial ? ' (The scan stopped early — run it again to finish.)' : '';
      if (rows.length === 0) {
        const locHint =
          located === 0 && !thorough
            ? ' None of your photos had a location tag — try the thorough scan, which also checks photos stored in iCloud.'
            : located === 0
              ? ' None of your photos had a location tag (location may have been off when they were taken).'
              : '';
        setScanMsg(`Scanned ${scanned.toLocaleString()} items, ${located.toLocaleString()} with a location — found no new countries.${locHint}${limitedNote}${partialNote}`);
        return;
      }
      // Hand the detected countries to the review sheet — the user chooses
      // which to add rather than importing them silently.
      setScanScanned(scanned);
      setScanLocated(located);
      setScanRows(rows);
      setScanNote(`${limitedNote}${partialNote}`);
      setScanSheetOpen(true);
      track('import_run', { source: 'photo_scan', count: rows.length });
    } catch {
      setScanMsg('Could not scan your photos.');
    } finally {
      setScanBusy(false);
    }
  }

  async function addScanned(selected: PlaceRow[]) {
    setAddBusy(true);
    try {
      const added = await importPlaces(selected);
      setScanSheetOpen(false);
      setScanMsg(
        added > 0
          ? `Added ${added} ${added === 1 ? 'country' : 'countries'} to your map.${scanNote}`
          : `No new countries added.${scanNote}`,
      );
    } catch {
      setScanMsg('Could not add those countries.');
    } finally {
      setAddBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.warmwhite }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 112 }}>
        <PageHero eyebrow="Bring your history in" title="Import travels" subtitle="Pull in the places you’ve already been — from your flights, other travel apps, or your photos." gradient={GRADIENTS.atlas} imageCode="WW" onBack={goBack} />

        {/* Flight history CSV — Flighty, App in the Air, MyFlightradar24… */}
        <Card icon={Plane} title="Flight history (CSV)" body="Export your flights as CSV — from Flighty, App in the Air, MyFlightradar24 or FlightMemory — and pick the file. We’ll map every flight to countries, cities and trips.">
          <Pressable onPress={importFlighty} disabled={csvBusy || reBusy} style={btn(csvBusy || reBusy)}>
            {csvBusy ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>Choose CSV file</Text>}
          </Pressable>
          {hasImported ? (
            <Pressable onPress={confirmReevaluate} disabled={csvBusy || reBusy} className="flex-row items-center justify-center" style={ghostBtn(csvBusy || reBusy)}>
              {reBusy ? (
                <ActivityIndicator color={COLORS.ink2} />
              ) : (
                <>
                  <RefreshCw size={15} color={COLORS.ink2} />
                  <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2, marginLeft: 7 }}>Re-evaluate imported trips</Text>
                </>
              )}
            </Pressable>
          ) : null}
          {csvMsg ? <Msg text={csvMsg} /> : null}
        </Card>

        {/* Polarsteps */}
        <Card icon={Route} title="Polarsteps" body="Download your Polarsteps data (Profile → Settings → Download your data) and pick the .zip — we’ll turn each trip into a journey with its countries and dates.">
          <Pressable onPress={importPolarsteps} disabled={polarBusy} style={btn(polarBusy)}>
            {polarBusy ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>Choose Polarsteps file</Text>}
          </Pressable>
          {polarMsg ? <Msg text={polarMsg} /> : null}
        </Card>

        {/* TripIt */}
        <Card icon={CalendarClock} title="TripIt" body="Share or export your TripIt trips as a calendar (.ics) file and pick it here — we’ll add the countries you travelled to.">
          <Pressable onPress={importTripit} disabled={tripitBusy} style={btn(tripitBusy)}>
            {tripitBusy ? <ActivityIndicator color="#fff" /> : <Text style={btnText}>Choose calendar file</Text>}
          </Pressable>
          {tripitMsg ? <Msg text={tripitMsg} /> : null}
        </Card>

        {/* Google Maps (Takeout) */}
        <Card icon={MapPin} title="Google Maps reviews" body="Already rated places on Google Maps? In Google Takeout, export “Maps (your places)”, then pick your Reviews or saved-list file — we’ll turn each into a discovery with a verdict.">
          <Pressable onPress={importTakeout} disabled={takeoutBusy} style={btn(takeoutBusy)}>
            {takeoutBusy ? (
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <ActivityIndicator color="#fff" />
                {takeoutProgress ? <Text style={btnText}>Importing {takeoutProgress.done}/{takeoutProgress.total}…</Text> : null}
              </View>
            ) : (
              <Text style={btnText}>Choose Takeout file</Text>
            )}
          </Pressable>
          {takeoutMsg ? <Msg text={takeoutMsg} /> : null}
        </Card>

        {/* Foursquare / Swarm check-ins */}
        <Card icon={Coffee} title="Swarm / Foursquare" body="Download your Foursquare/Swarm data and pick the check-ins file — every venue you’ve checked into becomes a discovery, with its category filled in.">
          <Pressable onPress={importSwarm} disabled={swarmBusy} style={btn(swarmBusy)}>
            {swarmBusy ? (
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <ActivityIndicator color="#fff" />
                {swarmProgress ? <Text style={btnText}>Importing {swarmProgress.done}/{swarmProgress.total}…</Text> : null}
              </View>
            ) : (
              <Text style={btnText}>Choose check-ins file</Text>
            )}
          </Pressable>
          {swarmMsg ? <Msg text={swarmMsg} /> : null}
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
          <Pressable onPress={() => scanPhotos(false)} disabled={scanBusy} style={btn(scanBusy)}>
            {scanBusy && !scanThorough ? (
              <Text style={btnText}>Scanning… {scanProgress} photos</Text>
            ) : (
              <Text style={btnText}>Scan my photos</Text>
            )}
          </Pressable>
          <Pressable onPress={() => scanPhotos(true)} disabled={scanBusy} className="flex-row items-center justify-center" style={ghostBtn(scanBusy)}>
            {scanBusy && scanThorough ? (
              <>
                <ActivityIndicator color={COLORS.ink2} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2, marginLeft: 8 }}>Thorough scan… {scanProgress}</Text>
              </>
            ) : (
              <>
                <CloudDownload size={15} color={COLORS.ink2} />
                <Text style={{ fontFamily: 'PlusJakarta', fontSize: 14, fontWeight: '700', color: COLORS.ink2, marginLeft: 7 }}>Thorough scan (uses data)</Text>
              </>
            )}
          </Pressable>
          <Text style={{ fontFamily: 'PlusJakarta', fontSize: 12, color: COLORS.ink3, marginTop: 8, lineHeight: 17 }}>
            A thorough scan also checks photos stored in iCloud — it finds more countries but is slower and uses network data.
          </Text>
          {scanMsg ? <Msg text={scanMsg} /> : null}
        </Card>
      </ScrollView>

      <ScanResultSheet
        visible={scanSheetOpen}
        scanned={scanScanned}
        located={scanLocated}
        rows={scanRows}
        existingCodes={existingCountryCodes}
        busy={addBusy}
        onClose={() => setScanSheetOpen(false)}
        onConfirm={addScanned}
      />
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
const ghostBtn = (disabled: boolean) => ({
  borderRadius: 16,
  paddingVertical: 12,
  marginTop: 10,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  backgroundColor: 'rgba(20,33,61,0.05)',
  opacity: disabled ? 0.5 : 1,
});

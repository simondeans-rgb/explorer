import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import {
  Camera,
  Compass,
  Globe2,
  Images,
  MapPin,
  MapPinned,
  Plus,
  Users,
  X,
} from 'lucide-react';
import type { CountryAggregate, PassportStats } from '../../lib/stats';
import type { DiscoveryStats } from '../../lib/discoveryStats';
import { evaluateRecognitions, type Recognition } from '../../lib/recognitions';
import { flagEmoji } from '../../lib/flags';
import { useAuth } from '../../contexts/AuthContext';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import { COUNTRIES } from '../../data/countries';
import {
  CONTINENTS,
  RELATIONSHIP_META,
  VERDICT_META,
  type Discovery,
  type Expedition,
  type Place,
  type Relationship,
} from '../../types';
import type { FriendPresence } from '../../lib/friends';
import { placePeriods } from '../../lib/residences';
import { memberName } from '../../lib/memberName';
import { cn } from '../../lib/cn';
import { VERDICT_STYLE } from '../discoveries/verdictStyle';
import { CATEGORY_ICON } from '../discoveries/categoryIcons';
import {
  AddDiscoveryModal,
  type DiscoveryModalInitial,
} from '../discoveries/AddDiscoveryModal';
import { MapSkeleton } from '../map/MapSkeleton';
import { AddPlaceModal, type ModalInitial } from './AddPlaceModal';

// Lazy — pulls in d3-geo + the world atlas for offline reverse-geocoding, which
// shouldn't weigh down the initial Passport load.
const ImportPhotosModal = lazy(() =>
  import('./ImportPhotosModal').then((m) => ({ default: m.ImportPhotosModal })),
);
const ImportCountriesModal = lazy(() =>
  import('./ImportCountriesModal').then((m) => ({
    default: m.ImportCountriesModal,
  })),
);

const PassportMap = lazy(() =>
  import('../map/WorldMaps').then((m) => ({ default: m.PassportMap })),
);
import { DiscoveryRing } from './DiscoveryRing';
import { Stamp } from './Stamp';
import { RELATIONSHIP_ICON } from './relationshipIcons';

interface Props {
  userId: string;
  places: Place[];
  discoveries: Discovery[];
  expeditions: Expedition[];
  aggregates: CountryAggregate[];
  stats: PassportStats;
  discoveryStats: DiscoveryStats;
  expeditionCount: number;
  friendCountryMap: Map<string, FriendPresence[]>;
  /** One-shot: open an importer on mount (from the first-run welcome). */
  openImport?: 'countries' | 'photos' | null;
  onImportConsumed?: () => void;
  /** One-shot: scroll to a country card (and open a city), from a discovery. */
  focusPlace?: { code: string; city?: string } | null;
  onFocusConsumed?: () => void;
  loading: boolean;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
function formatMonth(iso: string): string {
  const [y, m] = iso.split('-');
  const mi = m ? Number(m) - 1 : -1;
  return mi >= 0 && mi < 12 ? `${MONTHS[mi]} ${y}` : y;
}

/** Resize/crop a chosen image to the passport photo aspect (68:84) and return
 *  a compact JPEG data URL small enough to store on the profile document. */
async function fileToPassportPhoto(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('image decode failed'));
    i.src = dataUrl;
  });
  const W = 204; // 68 × 3
  const H = 252; // 84 × 3 — same portrait ratio as the photo frame
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  const scale = Math.max(W / img.width, H / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  return canvas.toDataURL('image/jpeg', 0.82);
}


export function PassportView({
  userId,
  places,
  discoveries,
  expeditions,
  aggregates,
  stats,
  discoveryStats,
  expeditionCount,
  friendCountryMap,
  openImport,
  onImportConsumed,
  focusPlace,
  onFocusConsumed,
  loading,
}: Props) {
  const { user } = useAuth();
  const { photo, setPhoto } = useProfilePhoto(userId || undefined);
  const [modal, setModal] = useState<ModalInitial | null>(null);
  const [discoveryModal, setDiscoveryModal] =
    useState<DiscoveryModalInitial | null>(null);
  const [photoImport, setPhotoImport] = useState(false);
  const [countryImport, setCountryImport] = useState(false);

  // Open an importer when routed here from the first-run welcome.
  useEffect(() => {
    if (!openImport) return;
    if (openImport === 'countries') setCountryImport(true);
    else if (openImport === 'photos') setPhotoImport(true);
    onImportConsumed?.();
  }, [openImport, onImportConsumed]);

  // Country card refs + the place to focus when arriving from a discovery.
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const [focus, setFocus] = useState<{ code: string; city?: string } | null>(
    null,
  );
  useEffect(() => {
    if (!focusPlace) return;
    setFocus(focusPlace);
    onFocusConsumed?.();
    // Let the card render, then scroll it into view.
    const code = focusPlace.code;
    requestAnimationFrame(() => {
      cardRefs.current
        .get(code)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [focusPlace, onFocusConsumed]);

  const discovered = useMemo(
    () =>
      aggregates
        .filter((a) => a.discovered)
        .sort(
          (a, b) =>
            b.discoveryScore - a.discoveryScore || a.name.localeCompare(b.name),
        ),
    [aggregates],
  );
  const aspiring = useMemo(
    () => aggregates.filter((a) => a.aspiring),
    [aggregates],
  );
  // Recorded discoveries grouped by country, for cross-linking into the card.
  const discoveriesByCountry = useMemo(() => {
    const m = new Map<string, Discovery[]>();
    for (const d of discoveries) {
      if (!d.countryCode) continue;
      const list = m.get(d.countryCode) ?? [];
      list.push(d);
      m.set(d.countryCode, list);
    }
    return m;
  }, [discoveries]);
  const recognitions = useMemo(
    () => evaluateRecognitions(stats, discoveryStats),
    [stats, discoveryStats],
  );
  const earned = recognitions.filter((r) => r.earned);

  const memberSinceYear = useMemo(() => {
    let min = Infinity;
    for (const a of aggregates) {
      if (a.countryPlace) min = Math.min(min, a.countryPlace.createdAt);
      for (const c of a.cities) min = Math.min(min, c.createdAt);
    }
    return Number.isFinite(min) ? new Date(min).getFullYear() : null;
  }, [aggregates]);

  function editCountry(a: CountryAggregate) {
    setModal({
      id: a.countryPlace?.id,
      kind: 'country',
      countryCode: a.code,
      name: a.name,
      relationships: a.countryPlace?.relationships,
      firstYear: a.countryPlace?.firstYear,
      livedFrom: a.countryPlace?.livedFrom,
      livedTo: a.countryPlace?.livedTo,
      residencePeriods: a.countryPlace?.residencePeriods,
      note: a.countryPlace?.note,
      lockCountry: true,
    });
  }

  function addCity(a: CountryAggregate) {
    setModal({ kind: 'city', countryCode: a.code, lockKind: true, lockCountry: true });
  }

  function editCity(place: Place) {
    setModal({
      id: place.id,
      kind: 'city',
      countryCode: place.countryCode,
      name: place.name,
      relationships: place.relationships,
      firstYear: place.firstYear,
      livedFrom: place.livedFrom,
      livedTo: place.livedTo,
      residencePeriods: place.residencePeriods,
      note: place.note,
      lockKind: true,
      lockCountry: true,
    });
  }

  function editDiscovery(d: Discovery) {
    setDiscoveryModal({
      id: d.id,
      name: d.name,
      category: d.category,
      countryCode: d.countryCode,
      city: d.city,
      landmark: d.landmark,
      expeditionId: d.expeditionId,
      verdict: d.verdict,
      note: d.note,
    });
  }

  const isEmpty = !loading && aggregates.length === 0;

  return (
    <div className="animate-fade-in space-y-8">
      <BioPage
        name={memberName(user?.email ?? '')}
        sinceYear={memberSinceYear}
        stats={stats}
        discoveriesTotal={discoveryStats.total}
        expeditionCount={expeditionCount}
        photo={photo}
        onChangePhoto={setPhoto}
      />

      {discovered.length > 0 && (
        <div className="space-y-3">
          <SectionHeading>Your world</SectionHeading>
          <div className="overflow-hidden rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-2">
            <Suspense fallback={<MapSkeleton />}>
              <PassportMap aggregates={aggregates} />
            </Suspense>
          </div>
          {/* Quick actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCountryImport(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-semibold bg-white dark:bg-passport-carddark shadow-card text-passport-navy dark:text-white/85 hover:shadow-card-hover active:scale-[0.98] transition-all"
            >
              <Globe2 size={16} className="text-passport-gold" /> Import
            </button>
            <button
              type="button"
              onClick={() => setPhotoImport(true)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-semibold bg-white dark:bg-passport-carddark shadow-card text-passport-navy dark:text-white/85 hover:shadow-card-hover active:scale-[0.98] transition-all"
            >
              <Images size={16} className="text-passport-gold" /> Photos
            </button>
            <button
              type="button"
              onClick={() => setModal({ kind: 'country' })}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-semibold bg-passport-navy text-white dark:bg-white dark:text-passport-navy hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      )}

      {isEmpty && (
        <EmptyState
          onAdd={() => setModal({ kind: 'country' })}
          onImport={() => setCountryImport(true)}
        />
      )}

      {discovered.length > 0 && (
        <SectionHeading>Your places</SectionHeading>
      )}

      {earned.length > 0 && <RecognitionsStrip recognitions={earned} />}

      {stats.flagCodes.length > 0 && (
        <FlagWall
          codes={stats.flagCodes}
          onPick={(code) => {
            const a = discovered.find((d) => d.code === code);
            if (a) editCountry(a);
          }}
        />
      )}

      {discovered.length > 0 && (
        <div className="space-y-3">
          {discovered.map((a) => (
            <CountryCard
              key={a.code}
              agg={a}
              friendsHere={friendCountryMap.get(a.code) ?? []}
              discoveriesHere={discoveriesByCountry.get(a.code) ?? []}
              focusCity={focus?.code === a.code ? (focus.city ?? null) : null}
              cardRef={(el) => {
                if (el) cardRefs.current.set(a.code, el);
                else cardRefs.current.delete(a.code);
              }}
              onEdit={() => editCountry(a)}
              onAddCity={() => addCity(a)}
              onEditCity={editCity}
              onEditDiscovery={editDiscovery}
            />
          ))}
        </div>
      )}

      {aspiring.length > 0 && (
        <div className="space-y-3">
          <SectionHeading>Wishlist</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {aspiring.map((a) => (
              <button
                key={a.code}
                type="button"
                onClick={() => editCountry(a)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium bg-white dark:bg-passport-carddark shadow-card text-passport-ink2 dark:text-white/75 hover:shadow-card-hover active:scale-[0.98] transition-all"
              >
                <span className="text-base leading-none">{flagEmoji(a.code)}</span>
                {a.name}
              </button>
            ))}
          </div>

          {aspiring
            .filter((a) => (friendCountryMap.get(a.code)?.length ?? 0) > 0)
            .map((a) => (
              <div
                key={a.code}
                className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-4"
              >
                <div className="flex items-center gap-2 font-display text-lg font-semibold text-passport-navy dark:text-white/90">
                  <span className="text-2xl leading-none">
                    {flagEmoji(a.code)}
                  </span>
                  Planning {a.name}?
                </div>
                <FriendsHere friends={friendCountryMap.get(a.code) ?? []} />
              </div>
            ))}
        </div>
      )}

      {modal && (
        <AddPlaceModal
          userId={userId}
          initial={modal}
          onClose={() => setModal(null)}
        />
      )}

      {discoveryModal && (
        <AddDiscoveryModal
          userId={userId}
          initial={discoveryModal}
          expeditions={expeditions}
          onClose={() => setDiscoveryModal(null)}
        />
      )}

      {photoImport && (
        <Suspense fallback={null}>
          <ImportPhotosModal
            userId={userId}
            places={places}
            onClose={() => setPhotoImport(false)}
          />
        </Suspense>
      )}

      {countryImport && (
        <Suspense fallback={null}>
          <ImportCountriesModal
            userId={userId}
            places={places}
            onClose={() => setCountryImport(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

function SectionHeading({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
        {children}
      </h2>
      {action}
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function BioPage({
  name,
  sinceYear,
  stats,
  discoveriesTotal,
  expeditionCount,
  photo,
  onChangePhoto,
}: {
  name: string;
  sinceYear: number | null;
  stats: PassportStats;
  discoveriesTotal: number;
  expeditionCount: number;
  photo: string | null;
  onChangePhoto: (dataUrl: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      onChangePhoto(await fileToPassportPhoto(file));
    } catch {
      /* ignore unreadable / undecodable images */
    }
  }

  const totalCountries = COUNTRIES.length;
  const rawPct = totalCountries
    ? (stats.countriesDiscovered / totalCountries) * 100
    : 0;
  const worldSeen =
    rawPct === 0 ? '0' : rawPct < 1 ? rawPct.toFixed(1) : String(Math.round(rawPct));

  const figures: { label: string; value: string | number; total?: number }[] = [
    { label: 'Countries', value: stats.countriesDiscovered, total: totalCountries },
    { label: 'Cities', value: stats.citiesDiscovered },
    { label: 'Continents', value: stats.continentsDiscovered, total: CONTINENTS.length },
    { label: 'Discoveries', value: discoveriesTotal },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="px-1">
        <p className="text-sm font-medium text-passport-gold">{greeting()},</p>
        <h1 className="font-display text-[2rem] leading-tight font-semibold text-passport-navy dark:text-white capitalize">
          {name || 'Explorer'}
        </h1>
      </div>

      {/* Hero passport card */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white shadow-float">
        {/* decorative globe lines */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/20"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-2 top-6 h-32 w-32 rounded-full border border-white/15"
          aria-hidden="true"
        />

        <div className="relative p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label={photo ? 'Change photo' : 'Add photo'}
                className="group relative h-16 w-16 overflow-hidden rounded-2xl bg-white/20 ring-2 ring-white/40 flex items-center justify-center"
              >
                {photo ? (
                  <img
                    src={photo}
                    alt="Your portrait"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-display text-2xl font-semibold text-white">
                    {name[0]?.toUpperCase() ?? 'E'}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 bg-black/30 py-0.5 text-[8px] uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera size={9} /> {photo ? 'Change' : 'Add'}
                </span>
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={() => onChangePhoto(null)}
                  aria-label="Remove photo"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-passport-navy text-white shadow-card"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Worldly Passport
              </div>
              <div className="font-display text-xl font-semibold capitalize truncate">
                {name || 'Explorer'}
              </div>
              {sinceYear && (
                <div className="text-xs text-white/70 mt-0.5">
                  Collecting the world since {sinceYear}
                </div>
              )}
            </div>
          </div>

          {/* World-seen progress */}
          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium text-white/80">
                You&rsquo;ve seen{' '}
                <span className="font-bold text-white">{worldSeen}%</span> of the
                world
              </span>
              <span className="text-xs text-white/70">
                {stats.countriesDiscovered}/{totalCountries}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${Math.max(2, Math.min(100, rawPct))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stat strip — story-framed */}
      <div className="grid grid-cols-4 gap-2">
        {figures.map(({ label, value, total }) => (
          <div
            key={label}
            className="rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-2 py-3 text-center"
          >
            <div className="font-display text-2xl font-semibold text-passport-navy dark:text-white leading-none">
              {value}
              {total != null && (
                <span className="text-xs font-medium text-passport-ink3">
                  /{total}
                </span>
              )}
            </div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.08em] text-passport-ink3">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Journeys tally line */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-passport-ink3">
        <MapPinned size={13} className="text-passport-gold" />
        {expeditionCount === 0
          ? 'No journeys logged yet'
          : `${expeditionCount} ${expeditionCount === 1 ? 'journey' : 'journeys'} on record`}
      </div>
    </div>
  );
}

function RecognitionsStrip({ recognitions }: { recognitions: Recognition[] }) {
  return (
    <div className="space-y-3">
      <SectionHeading>Achievements</SectionHeading>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {recognitions.map((r) => (
          <div
            key={r.id}
            title={r.description}
            className="shrink-0 w-[120px] rounded-2xl bg-white dark:bg-passport-carddark shadow-card p-3 text-center"
          >
            <div className="mx-auto h-11 w-11 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-lg shadow-card">
              {r.symbol}
            </div>
            <div className="mt-2 text-xs font-semibold text-passport-navy dark:text-white leading-tight">
              {r.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlagWall({
  codes,
  onPick,
}: {
  codes: string[];
  onPick: (code: string) => void;
}) {
  return (
    <div className="space-y-3">
      <SectionHeading>Flags collected</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {codes.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => onPick(code)}
            className="text-3xl leading-none hover:scale-110 transition-transform"
            title={code}
          >
            {flagEmoji(code)}
          </button>
        ))}
      </div>
    </div>
  );
}

function CountryCard({
  agg,
  friendsHere,
  discoveriesHere,
  focusCity,
  cardRef,
  onEdit,
  onAddCity,
  onEditCity,
  onEditDiscovery,
}: {
  agg: CountryAggregate;
  friendsHere: FriendPresence[];
  discoveriesHere: Discovery[];
  focusCity?: string | null;
  cardRef?: (el: HTMLDivElement | null) => void;
  onEdit: () => void;
  onAddCity: () => void;
  onEditCity: (place: Place) => void;
  onEditDiscovery: (d: Discovery) => void;
}) {
  const [openCity, setOpenCity] = useState<string | null>(null);
  const norm = (s: string) => s.trim().toLowerCase();
  const discoveriesInCity = (city: string) =>
    discoveriesHere.filter((d) => d.city && norm(d.city) === norm(city));
  // Discoveries recorded for this country but not tied to one of its cities.
  const cityNames = new Set(agg.cities.map((c) => norm(c.name)));
  const countryLevelDiscoveries = discoveriesHere.filter(
    (d) => !d.city || !cityNames.has(norm(d.city)),
  );

  // Arriving from a discovery: open the matching city (highlight the card).
  useEffect(() => {
    if (focusCity == null) return;
    const match = agg.cities.find((c) => norm(c.name) === norm(focusCity));
    if (match) setOpenCity(match.id);
  }, [focusCity, agg.cities]);

  return (
    <div
      ref={cardRef}
      className={cn(
        'rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-4 transition-all',
        focusCity != null ? 'ring-2 ring-passport-gold/70' : '',
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="h-12 w-12 shrink-0 rounded-2xl bg-passport-cartridge dark:bg-white/5 flex items-center justify-center text-3xl leading-none hover:scale-105 transition-transform"
        >
          {flagEmoji(agg.code)}
        </button>
        <button type="button" onClick={onEdit} className="flex-1 min-w-0 text-left">
          <div className="font-display text-lg font-semibold text-passport-navy dark:text-white/90 truncate">
            {agg.name}
          </div>
          <div className="text-xs text-passport-ink3 dark:text-white/45">
            {agg.continent}
            {agg.firstYear ? ` · since ${agg.firstYear}` : ''}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {agg.relationships
              .filter((r): r is Relationship => r !== 'aspiring')
              .map((r) => {
                const Icon = RELATIONSHIP_ICON[r];
                return (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-passport-navy/[0.06] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/65"
                  >
                    <Icon size={11} />
                    {RELATIONSHIP_META[r].label}
                  </span>
                );
              })}
          </div>
          {(() => {
            const residences = [agg.countryPlace, ...agg.cities]
              .filter((p): p is Place => Boolean(p))
              .flatMap((p) => {
                const periods = placePeriods(p);
                return periods.map(
                  (period) =>
                    `${p.name} (${formatMonth(period.from)}–${period.to ? formatMonth(period.to) : 'now'})`,
                );
              });
            return residences.length ? (
              <div className="mt-1.5 text-[11px] text-passport-ink3 dark:text-white/45">
                Lived: {residences.join(', ')}
              </div>
            ) : null;
          })()}
        </button>
        <DiscoveryRing score={agg.discoveryScore} />
      </div>

      {agg.stamps.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {agg.stamps.map((s, i) => (
            <Stamp
              key={s}
              kind={s}
              code={agg.code}
              year={agg.firstYear}
              seed={i + agg.code.charCodeAt(0)}
            />
          ))}
        </div>
      )}

      {agg.note && (
        <p className="mt-4 font-display text-[15px] italic text-passport-ink2 dark:text-white/65 border-l-2 border-passport-gold/50 pl-3">
          {agg.note}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {agg.cities.map((c) => {
          const count = discoveriesInCity(c.name).length;
          const open = openCity === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setOpenCity(open ? null : c.id)}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs',
                open
                  ? 'bg-passport-navy/10 dark:bg-white/10 text-passport-navy dark:text-white/90'
                  : 'bg-passport-navy/5 dark:bg-white/5 text-passport-ink2 dark:text-white/70 hover:bg-passport-navy/10',
              )}
            >
              <MapPin size={11} />
              {c.name}
              {count > 0 && (
                <span className="ml-0.5 inline-flex items-center gap-0.5 text-passport-gold">
                  <Compass size={10} />
                  {count}
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onAddCity}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-black/15 dark:border-white/15 text-passport-ink3 dark:text-white/50 hover:border-passport-gold/60"
        >
          <Plus size={11} /> City
        </button>
      </div>

      {(() => {
        if (!openCity) return null;
        const city = agg.cities.find((c) => c.id === openCity);
        if (!city) return null;
        const recs = discoveriesInCity(city.name);
        return (
          <div className="mt-3 rounded-xl bg-passport-navy/[0.03] dark:bg-white/[0.04] p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel">
                <MapPin size={12} className="text-passport-gold" /> {city.name}
              </div>
              <button
                type="button"
                onClick={() => onEditCity(city)}
                className="text-[11px] text-passport-navy dark:text-passport-goldsoft hover:underline"
              >
                Edit city
              </button>
            </div>
            {recs.length > 0 ? (
              <DiscoveryList items={recs} onOpen={onEditDiscovery} />
            ) : (
              <p className="text-xs text-passport-ink3 dark:text-white/45">
                No discoveries recorded here yet.
              </p>
            )}
          </div>
        );
      })()}

      {countryLevelDiscoveries.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-passport-gold mb-2">
            <Compass size={12} /> Discoveries
          </div>
          <DiscoveryList
            items={countryLevelDiscoveries}
            onOpen={onEditDiscovery}
          />
        </div>
      )}

      {friendsHere.length > 0 && <FriendsHere friends={friendsHere} />}
    </div>
  );
}

function DiscoveryList({
  items,
  onOpen,
}: {
  items: Discovery[];
  onOpen: (d: Discovery) => void;
}) {
  return (
    <div className="space-y-1.5">
      {items
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((d) => {
          const Icon = CATEGORY_ICON[d.category];
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onOpen(d)}
              className="w-full flex items-center gap-2 text-left rounded-lg px-2 py-1.5 hover:bg-passport-navy/[0.05] dark:hover:bg-white/[0.06] transition-colors"
            >
              <Icon size={13} className="text-passport-gold shrink-0" />
              <span className="text-sm text-passport-ink dark:text-white/85 truncate min-w-0">
                {d.name}
              </span>
              {d.verdict && (
                <span
                  className={cn(
                    'ml-auto shrink-0 px-2 py-0.5 rounded-full text-[10px] border',
                    VERDICT_STYLE[d.verdict].chip,
                  )}
                >
                  {VERDICT_META[d.verdict].label}
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
}

function FriendsHere({ friends }: { friends: FriendPresence[] }) {
  return (
    <div className="mt-4 pt-3 border-t border-black/10 dark:border-white/10">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-passport-gold mb-2">
        <Users size={12} /> Friends who&rsquo;ve been here
      </div>
      <div className="space-y-2">
        {friends.map((f) => {
          const rels = f.relationships
            .map((r) => RELATIONSHIP_META[r].label)
            .join(' · ');
          return (
            <div key={f.uid} className="text-sm">
              <span className="font-medium text-passport-navy dark:text-white/90 capitalize">
                {f.name}
              </span>
              {rels && (
                <span className="text-passport-ink3 dark:text-white/45">
                  {' '}
                  — {rels.toLowerCase()}
                </span>
              )}
              {f.discoveries.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {f.discoveries.map((d, i) => (
                    <span
                      key={i}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border',
                        d.verdict
                          ? VERDICT_STYLE[d.verdict].chip
                          : 'bg-passport-navy/[0.04] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/65 border-black/10 dark:border-white/10',
                      )}
                    >
                      {d.name}
                      {d.verdict && (
                        <span className="opacity-70">
                          · {VERDICT_META[d.verdict].label}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({
  onAdd,
  onImport,
}: {
  onAdd: () => void;
  onImport: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-8 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-3xl bg-brand-gradient flex items-center justify-center shadow-card">
        <Globe2 size={28} className="text-white" />
      </div>
      <p className="font-display text-2xl font-semibold text-passport-navy dark:text-white mb-1.5">
        Start your world
      </p>
      <p className="text-sm text-passport-ink2 dark:text-white/60 mb-6 max-w-xs mx-auto">
        Add the first country you&rsquo;ve been to — or bring your travels across
        from another app in seconds.
      </p>
      <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
        <button
          type="button"
          onClick={onImport}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-brand-gradient text-white font-semibold shadow-card hover:opacity-95 active:scale-[0.99] transition-all"
        >
          <Globe2 size={17} /> Import your travels
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-passport-cartridge dark:bg-white/5 text-passport-navy dark:text-white/85 font-semibold hover:bg-passport-paged dark:hover:bg-white/10 active:scale-[0.99] transition-all"
        >
          <Plus size={17} /> Add a country
        </button>
      </div>
    </div>
  );
}

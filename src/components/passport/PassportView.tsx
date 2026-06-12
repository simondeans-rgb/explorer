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
  ChevronRight,
  Compass,
  Globe2,
  Images,
  Map as MapIcon,
  MapPin,
  Plus,
  Users,
} from 'lucide-react';
import type { CountryAggregate, PassportStats } from '../../lib/stats';
import type { DiscoveryStats } from '../../lib/discoveryStats';
import { evaluateRecognitions, type Recognition } from '../../lib/recognitions';
import { computeJourneyStats } from '../../lib/journeyStats';
import { computeExplorerLevel } from '../../lib/explorer';
import { flagEmoji } from '../../lib/flags';
import { useAuth } from '../../contexts/AuthContext';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import { COUNTRIES, countryName } from '../../data/countries';
import { hasRegions } from '../../data/regions';
import {
  RELATIONSHIP_META,
  VERDICT_META,
  type Capture,
  type Discovery,
  type Expedition,
  type Place,
  type Relationship,
  type Trip,
} from '../../types';
import type { FriendPresence } from '../../lib/friends';
import { placePeriods } from '../../lib/residences';
import { memberName } from '../../lib/memberName';
import { cn } from '../../lib/cn';
import { VERDICT_STYLE } from '../discoveries/verdictStyle';
import { DestinationImage } from '../DestinationImage';
import { CapturesRail, CapturesEmptyCta } from '../captures/CapturesRail';
import { buildHomeStory } from '../../lib/homeStory';
import { StoryHeader } from './story/StoryHeader';
import { ContinueJourneyRail } from './story/ContinueJourneyRail';
import { HighlightsRow, type FriendRec } from './story/HighlightsRow';
import { LatestMemoryCard, type LatestMemory } from './story/LatestMemoryCard';
import { SavedRail } from './story/SavedRail';
import { UpcomingTrips } from '../trips/UpcomingTrips';
import type { SavedItem, SavedInput } from '../../lib/saved';
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
  /** Recent photo captures (Story rail). */
  captures?: Capture[];
  onAddCapture?: () => void;
  /** Saved bookmarks (hearts/wishlist). */
  saved?: SavedItem[];
  isSaved?: (key: string) => boolean;
  onToggleSaved?: (input: SavedInput) => void;
  /** Promote a saved country into a tracked aspiring place (Atlas). */
  onAddAspiring?: (code: string) => void;
  /** Upcoming planned trips (Story countdown). */
  upcomingTrips?: Trip[];
  onOpenTrip?: (id: string) => void;
  onPlanTrip?: () => void;
  /** 'story' = content-first Home (default); 'atlas' = the collection surface
   *  (map, country cards, wishlist, stats) hosted inside the Atlas tab. */
  mode?: 'story' | 'atlas';
  /** One-shot: open an importer on mount (from the first-run welcome). */
  openImport?: 'countries' | 'photos' | null;
  onImportConsumed?: () => void;
  /** One-shot: scroll to a country card (and open a city), from a discovery. */
  focusPlace?: { code: string; city?: string } | null;
  onFocusConsumed?: () => void;
  /** One-shot: open the add-place modal (from the quick-add "+"). */
  openAdd?: boolean;
  onAddConsumed?: () => void;
  /** Navigate to another section (e.g. the search pill → Explore). */
  onExplore?: () => void;
  onOpenJourneys?: () => void;
  onOpenAtlas?: () => void;
  onOpenFriends?: () => void;
  onOpenProfile?: () => void;
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
  captures = [],
  onAddCapture,
  saved = [],
  isSaved,
  onToggleSaved,
  onAddAspiring,
  upcomingTrips = [],
  onOpenTrip,
  onPlanTrip,
  mode = 'story',
  openImport,
  onImportConsumed,
  focusPlace,
  onFocusConsumed,
  openAdd,
  onAddConsumed,
  onExplore,
  onOpenJourneys,
  onOpenAtlas,
  onOpenFriends,
  onOpenProfile,
  loading,
}: Props) {
  const atlas = mode === 'atlas';
  const { user } = useAuth();
  const { photo, setPhoto } = useProfilePhoto(userId || undefined);
  const [modal, setModal] = useState<ModalInitial | null>(null);
  const [discoveryModal, setDiscoveryModal] =
    useState<DiscoveryModalInitial | null>(null);
  const [photoImport, setPhotoImport] = useState(false);
  const [countryImport, setCountryImport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setPhoto(await fileToPassportPhoto(file));
    } catch {
      /* ignore unreadable / undecodable images */
    }
  }

  // Open an importer when routed here from the first-run welcome.
  useEffect(() => {
    if (!openImport) return;
    if (openImport === 'countries') setCountryImport(true);
    else if (openImport === 'photos') setPhotoImport(true);
    onImportConsumed?.();
  }, [openImport, onImportConsumed]);

  // Open the add-place modal when routed here from the quick-add "+".
  useEffect(() => {
    if (!openAdd) return;
    setModal({ kind: 'country' });
    onAddConsumed?.();
  }, [openAdd, onAddConsumed]);

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

  const explorerLevel = useMemo(
    () =>
      computeExplorerLevel(stats, discoveryStats, computeJourneyStats(expeditions)),
    [stats, discoveryStats, expeditions],
  );

  const storyCards = useMemo(
    () =>
      buildHomeStory({
        name: memberName(user?.email ?? ''),
        expeditions,
        discoveries,
        friendCountryMap,
      }),
    [user?.email, expeditions, discoveries, friendCountryMap],
  );

  // Your own recommendations — the heart of "favourite discoveries".
  const myRecommendations = useMemo(
    () =>
      discoveries
        .filter((d) => d.verdict === 'recommend' || d.verdict === 'hidden-gem')
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10),
    [discoveries],
  );

  // The hero image: the most emotionally relevant place we have a picture for.
  const heroCode = useMemo(
    () => storyCards.find((c) => c.code)?.code || discovered[0]?.code || '',
    [storyCards, discovered],
  );

  // Saved countries → wishlist shading on the map.
  const wishlistCodes = useMemo(
    () =>
      new Set(
        saved
          .map((s) => s.countryCode)
          .filter((c): c is string => !!c),
      ),
    [saved],
  );

  // Saved countries that aren't yet on the map — offer to add them as a tracked
  // aspiring goal (Atlas only).
  const savedToTrack = useMemo(() => {
    const have = new Set(aggregates.map((a) => a.code));
    const seen = new Set<string>();
    const out: { code: string; name: string }[] = [];
    for (const s of saved) {
      const code = s.countryCode;
      if (!code || have.has(code) || seen.has(code)) continue;
      seen.add(code);
      out.push({ code, name: countryName(code) });
    }
    return out;
  }, [saved, aggregates]);

  // A single featured friend recommendation for the highlights row.
  const friendRec = useMemo<FriendRec | undefined>(() => {
    for (const [code, presences] of friendCountryMap) {
      for (const p of presences) {
        const rec =
          p.discoveries.find((d) => d.verdict === 'recommend') ??
          p.discoveries.find((d) => d.verdict === 'hidden-gem') ??
          p.discoveries[0];
        if (rec) return { code, friend: p.name, name: rec.name };
      }
    }
    return undefined;
  }, [friendCountryMap]);

  // The latest memory card — newest capture, else a heartfelt discovery, else
  // the most recent journey.
  const latestMemory = useMemo<LatestMemory | undefined>(() => {
    const shortDate = (ms: number) =>
      new Date(ms).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    const cap = captures[0];
    if (cap) {
      const place = [cap.city, cap.countryCode ? countryName(cap.countryCode) : null]
        .filter(Boolean)
        .join(', ');
      return {
        image: cap.dataUrl,
        code: cap.countryCode ?? '',
        city: cap.city,
        title: cap.caption || 'A moment worth keeping',
        place: place || undefined,
        dateLabel: shortDate(cap.createdAt),
        eyebrow: 'Your latest capture',
        saveKey: `capture:${cap.id}`,
      };
    }
    const mem = storyCards.find((c) => c.kind === 'memory');
    if (mem) {
      return {
        code: mem.code,
        title: mem.title,
        place: mem.subtitle,
        eyebrow: 'A memory worth keeping',
        saveKey: `memory:${mem.id}`,
      };
    }
    const trip = storyCards.find((c) => c.kind === 'last' || c.kind === 'current');
    if (trip) {
      return {
        code: trip.code,
        title: trip.title,
        place: trip.subtitle,
        dateLabel: trip.meta,
        eyebrow: trip.eyebrow,
        saveKey: `trip:${trip.id}`,
      };
    }
    return undefined;
  }, [captures, storyCards]);
  function goToPlaceFocus(code: string) {
    const a = discovered.find((d) => d.code === code);
    if (a) {
      cardRefs.current.get(code)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (!cardRefs.current.get(code)) editCountry(a);
    }
  }

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

  function addRegion(a: CountryAggregate) {
    setModal({ kind: 'region', countryCode: a.code, lockKind: true, lockCountry: true });
  }

  function editRegion(place: Place) {
    setModal({
      id: place.id,
      kind: 'region',
      countryCode: place.countryCode,
      name: place.name,
      relationships: place.relationships,
      firstYear: place.firstYear,
      note: place.note,
      lockKind: true,
      lockCountry: true,
    });
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
      subcategory: d.subcategory,
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
    <div className="animate-fade-in -mt-1 space-y-9">
      {/* ── Story: a warm, personal opening that asks "what's next?" ───── */}
      {!atlas && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <StoryHeader
            name={memberName(user?.email ?? '')}
            photo={photo ?? null}
            heroCode={heroCode}
            onSearch={() => onExplore?.()}
            onOpenFriends={onOpenFriends}
            hasFriendActivity={friendCountryMap.size > 0}
            onPickPhoto={() => fileRef.current?.click()}
            firstRun={isEmpty}
            onStart={() => setModal({ kind: 'country' })}
          />
        </>
      )}

      {isEmpty && (
        <EmptyState
          onAdd={() => setModal({ kind: 'country' })}
          onImport={() => setCountryImport(true)}
        />
      )}

      {/* ── Counting down (upcoming trips) ────────────────────────────── */}
      {!atlas && onPlanTrip && (!isEmpty || upcomingTrips.length > 0) && (
        <UpcomingTrips
          trips={upcomingTrips}
          onOpen={(id) => onOpenTrip?.(id)}
          onPlan={onPlanTrip}
        />
      )}

      {/* ── Continue your journey (real progress from trip dates) ─────── */}
      {!atlas && expeditions.length > 0 && (
        <ContinueJourneyRail
          expeditions={expeditions}
          onOpen={() => onOpenJourneys?.()}
        />
      )}

      {/* ── Milestone + a friend's recommendation ─────────────────────── */}
      {!atlas && !isEmpty && (
        <HighlightsRow
          level={explorerLevel}
          onOpenProfile={() => onOpenProfile?.()}
          friendRec={friendRec}
          onOpenFriendRec={() => onExplore?.()}
          onInviteFriends={() => onOpenFriends?.()}
          saved={
            !!friendRec &&
            (isSaved?.(`rec:${friendRec.code}:${friendRec.name}`) ?? false)
          }
          onToggleSaved={() =>
            friendRec &&
            onToggleSaved?.({
              key: `rec:${friendRec.code}:${friendRec.name}`,
              kind: 'recommendation',
              name: friendRec.name,
              countryCode: friendRec.code,
            })
          }
        />
      )}

      {/* ── Latest memory ─────────────────────────────────────────────── */}
      {!atlas && latestMemory && (
        <LatestMemoryCard
          memory={latestMemory}
          onOpen={
            latestMemory.code
              ? () => goToPlaceFocus(latestMemory.code)
              : undefined
          }
          saved={isSaved?.(latestMemory.saveKey) ?? false}
          onToggleSaved={() =>
            onToggleSaved?.({
              key: latestMemory.saveKey,
              kind: 'memory',
              name: latestMemory.title,
              countryCode: latestMemory.code || undefined,
              city: latestMemory.city,
            })
          }
        />
      )}

      {/* ── Saved & wishlist ──────────────────────────────────────────── */}
      {!atlas && saved.length > 0 && (
        <SavedRail
          saved={saved}
          onRemove={(item) =>
            onToggleSaved?.({
              key: item.key,
              kind: item.kind,
              name: item.name,
              countryCode: item.countryCode,
              city: item.city,
            })
          }
        />
      )}

      {/* ── Recent captures (photo memories) ──────────────────────────── */}
      {!atlas && onAddCapture && !isEmpty && (
        <section className="space-y-3">
          <h2 className="font-display text-[1.35rem] font-semibold text-passport-navy dark:text-white tracking-tight">
            Recent captures
          </h2>
          {captures.length > 0 ? (
            <CapturesRail captures={captures.slice(0, 12)} onAdd={onAddCapture} />
          ) : (
            <CapturesEmptyCta onAdd={onAddCapture} />
          )}
        </section>
      )}

      {/* ── Your favourite discoveries ────────────────────────────────── */}
      {!atlas && myRecommendations.length > 0 && (
        <DiscoveryRail
          title="Places you loved"
          discoveries={myRecommendations}
          onOpen={editDiscovery}
        />
      )}

      {/* ── Friends' recommendations ──────────────────────────────────── */}
      {!atlas && (
        <FriendRecsRail
          friendCountryMap={friendCountryMap}
          onExplore={() => onExplore?.()}
        />
      )}

      {/* ── Achievements (collectible) ────────────────────────────────── */}
      {!atlas && earned.length > 0 && <RecognitionsStrip recognitions={earned} />}

      {/* ── Your world (map) ──────────────────────────────────────────── */}
      {discovered.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[1.35rem] font-semibold text-passport-navy dark:text-white tracking-tight">
              Your world
            </h2>
            {atlas ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCountryImport(true)}
                  aria-label="Import countries"
                  className="h-9 w-9 grid place-items-center rounded-full bg-white dark:bg-passport-carddark shadow-card text-passport-ink2 dark:text-white/80 active:scale-95 transition-transform"
                >
                  <Globe2 size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoImport(true)}
                  aria-label="Scan photos"
                  className="h-9 w-9 grid place-items-center rounded-full bg-white dark:bg-passport-carddark shadow-card text-passport-ink2 dark:text-white/80 active:scale-95 transition-transform"
                >
                  <Images size={17} />
                </button>
              </div>
            ) : (
              onOpenAtlas && (
                <button
                  type="button"
                  onClick={onOpenAtlas}
                  className="text-sm font-semibold text-passport-gold hover:underline inline-flex items-center gap-0.5"
                >
                  See all <ChevronRight size={15} />
                </button>
              )
            )}
          </div>
          <button
            type="button"
            onClick={!atlas ? onOpenAtlas : undefined}
            className="block w-full overflow-hidden rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-2 text-left"
          >
            <Suspense fallback={<MapSkeleton />}>
              <PassportMap aggregates={aggregates} wishlistCodes={wishlistCodes} />
            </Suspense>
          </button>
        </div>
      )}

      {/* ── A quiet stat line — numbers, finally, and small ───────────── */}
      {discovered.length > 0 && (
        <StatLine
          stats={stats}
          totalCountries={COUNTRIES.length}
          discoveriesTotal={discoveryStats.total}
          expeditionCount={expeditionCount}
        />
      )}

      {atlas && discovered.length > 0 && (
        <SectionHeading>Your places</SectionHeading>
      )}

      {atlas && discovered.length > 0 && (
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
              onAddRegion={() => addRegion(a)}
              onEditRegion={editRegion}
              onEditDiscovery={editDiscovery}
            />
          ))}
        </div>
      )}

      {atlas && (aspiring.length > 0 || savedToTrack.length > 0) && (
        <div className="space-y-3">
          <SectionHeading>Wishlist</SectionHeading>

          {aspiring.length > 0 && (
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
          )}

          {savedToTrack.length > 0 && onAddAspiring && (
            <div className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-4">
              <p className="text-xs font-semibold text-passport-ink3 mb-2.5">
                From your saved — add to your map as a goal
              </p>
              <div className="flex flex-wrap gap-2">
                {savedToTrack.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => onAddAspiring(s.code)}
                    className="inline-flex items-center gap-1.5 pl-3 pr-3.5 py-2 rounded-full text-sm font-medium bg-passport-goldpale dark:bg-white/10 text-passport-navy dark:text-white/85 hover:shadow-card active:scale-[0.98] transition-all"
                  >
                    <Plus size={14} className="text-coral" />
                    <span className="text-base leading-none">{flagEmoji(s.code)}</span>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

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

function RailHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between mb-3">
      <h2 className="font-display text-[1.5rem] font-semibold text-passport-navy dark:text-white tracking-tight">
        {title}
      </h2>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-semibold text-passport-gold hover:underline inline-flex items-center gap-0.5"
        >
          {action} <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

function DiscoveryRail({
  title,
  discoveries,
  onOpen,
}: {
  title: string;
  discoveries: Discovery[];
  onOpen: (d: Discovery) => void;
}) {
  return (
    <div>
      <RailHeading title={title} />
      <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {discoveries.map((d) => {
          const Icon = CATEGORY_ICON[d.category];
          const content = (
            <>
              <div className="absolute left-3 top-3 h-8 w-8 rounded-full glass grid place-items-center text-white">
                <Icon size={15} />
              </div>
              <div className="mt-auto p-3.5">
                <div className="font-display text-base font-semibold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] line-clamp-2">
                  {d.name}
                </div>
                {d.city && (
                  <div className="text-[11px] font-medium text-white/85 mt-0.5">
                    {d.city}
                  </div>
                )}
              </div>
            </>
          );
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onOpen(d)}
              className="shrink-0 w-[148px] rounded-[1.6rem] overflow-hidden shadow-float active:scale-[0.98] transition-transform"
            >
              {d.photo ? (
                <div className="relative h-48 flex flex-col text-white">
                  <img
                    src={d.photo}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover vivid-photo"
                  />
                  <div className="absolute inset-0 hero-scrim" />
                  {content}
                </div>
              ) : (
                <DestinationImage
                  code={d.countryCode ?? ''}
                  className="h-48 flex flex-col text-white"
                  scrim
                >
                  {content}
                </DestinationImage>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FriendRecsRail({
  friendCountryMap,
  onExplore,
}: {
  friendCountryMap: Map<string, FriendPresence[]>;
  onExplore: () => void;
}) {
  const recs: {
    code: string;
    friend: string;
    name: string;
    verdict?: string;
  }[] = [];
  for (const [code, presences] of friendCountryMap) {
    for (const p of presences) {
      for (const d of p.discoveries) {
        recs.push({ code, friend: p.name, name: d.name, verdict: d.verdict });
      }
    }
  }
  if (recs.length === 0) return null;

  return (
    <div>
      <RailHeading title="Loved by friends" action="Explore" onAction={onExplore} />
      <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {recs.slice(0, 10).map((r, i) => (
          <button
            key={`${r.code}-${i}`}
            type="button"
            onClick={onExplore}
            className="shrink-0 w-[148px] rounded-[1.6rem] overflow-hidden shadow-float active:scale-[0.98] transition-transform"
          >
            <DestinationImage
              code={r.code}
              className="h-48 flex flex-col text-white"
              scrim
            >
              <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] font-semibold text-white capitalize">
                {r.friend}
              </div>
              <div className="mt-auto p-3.5">
                <div className="font-display text-base font-semibold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] line-clamp-2">
                  {r.name}
                </div>
                <div className="text-[11px] font-medium text-white/85 mt-0.5">
                  {countryName(r.code)}
                </div>
              </div>
            </DestinationImage>
          </button>
        ))}
      </div>
    </div>
  );
}

function StatLine({
  stats,
  totalCountries,
  discoveriesTotal,
  expeditionCount,
}: {
  stats: PassportStats;
  totalCountries: number;
  discoveriesTotal: number;
  expeditionCount: number;
}) {
  const items: [string, number | string][] = [
    ['Countries', stats.countriesDiscovered],
    ['Cities', stats.citiesDiscovered],
    ['Journeys', expeditionCount],
    ['Discoveries', discoveriesTotal],
  ];
  const pct = totalCountries
    ? (stats.countriesDiscovered / totalCountries) * 100
    : 0;
  const worldSeen = pct === 0 ? '0' : pct < 1 ? pct.toFixed(1) : String(Math.round(pct));
  return (
    <div className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card px-5 py-4">
      <p className="text-xs text-passport-ink3 mb-3">
        A lifetime of travel ·{' '}
        <span className="font-bold text-coral">{worldSeen}%</span> of the world
        seen
      </p>
      <div className="flex items-center justify-between">
        {items.map(([label, value]) => (
          <div key={label} className="text-center">
            <div className="font-display text-2xl font-semibold text-passport-navy dark:text-white leading-none">
              {value}
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-passport-ink3">
              {label}
            </div>
          </div>
        ))}
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

function CountryCard({
  agg,
  friendsHere,
  discoveriesHere,
  focusCity,
  cardRef,
  onEdit,
  onAddCity,
  onEditCity,
  onAddRegion,
  onEditRegion,
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
  onAddRegion: () => void;
  onEditRegion: (place: Place) => void;
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

      {(agg.regions.length > 0 || hasRegions(agg.code)) && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {agg.regions.map((rg) => (
            <button
              key={rg.id}
              type="button"
              onClick={() => onEditRegion(rg)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-lavender/12 text-passport-ink2 dark:text-white/70 hover:bg-lavender/20"
            >
              <MapIcon size={11} className="text-lavender" />
              {rg.name}
            </button>
          ))}
          <button
            type="button"
            onClick={onAddRegion}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-black/15 dark:border-white/15 text-passport-ink3 dark:text-white/50 hover:border-passport-gold/60"
          >
            <Plus size={11} /> Region
          </button>
        </div>
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

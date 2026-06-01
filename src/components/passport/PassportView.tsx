import {
  lazy,
  Suspense,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { Camera, Globe2, Images, MapPin, Plus, Users, X } from 'lucide-react';
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
  type Place,
  type Relationship,
} from '../../types';
import type { FriendPresence } from '../../lib/friends';
import { memberName } from '../../lib/memberName';
import { cn } from '../../lib/cn';
import { VERDICT_STYLE } from '../discoveries/verdictStyle';
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
import { Crest } from './Crest';
import { RELATIONSHIP_ICON } from './relationshipIcons';

interface Props {
  userId: string;
  places: Place[];
  aggregates: CountryAggregate[];
  stats: PassportStats;
  discoveryStats: DiscoveryStats;
  expeditionCount: number;
  friendCountryMap: Map<string, FriendPresence[]>;
  loading: boolean;
}

function hashOf(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function memberNo(uid: string): string {
  return String(hashOf(uid || 'guest') % 1_000_000).padStart(6, '0');
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

function pad(s: string, n: number): string {
  return (s + '<'.repeat(n)).slice(0, n);
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

function mrzLines(name: string, no: string): [string, string] {
  const clean = name.toUpperCase().replace(/[^A-Z]+/g, '<');
  return [
    pad(`P<SOD<${clean}`, 36),
    pad(`SOD${no}<<EXP000000`, 36),
  ];
}

export function PassportView({
  userId,
  places,
  aggregates,
  stats,
  discoveryStats,
  expeditionCount,
  friendCountryMap,
  loading,
}: Props) {
  const { user } = useAuth();
  const { photo, setPhoto } = useProfilePhoto(userId || undefined);
  const [modal, setModal] = useState<ModalInitial | null>(null);
  const [photoImport, setPhotoImport] = useState(false);
  const [countryImport, setCountryImport] = useState(false);

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
      note: place.note,
      lockKind: true,
      lockCountry: true,
    });
  }

  const isEmpty = !loading && aggregates.length === 0;

  return (
    <div className="animate-fade-in space-y-8">
      <BioPage
        name={memberName(user?.email ?? '')}
        no={memberNo(userId)}
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
          <Suspense fallback={<MapSkeleton />}>
            <PassportMap aggregates={aggregates} />
          </Suspense>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <SectionHeading>Your Passport</SectionHeading>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCountryImport(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-passport-navy/20 dark:border-white/20 text-passport-navy dark:text-white/80 hover:bg-passport-navy/5 dark:hover:bg-white/10 active:scale-[0.98]"
          >
            <Globe2 size={15} /> Import
          </button>
          <button
            type="button"
            onClick={() => setPhotoImport(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-passport-navy/20 dark:border-white/20 text-passport-navy dark:text-white/80 hover:bg-passport-navy/5 dark:hover:bg-white/10 active:scale-[0.98]"
          >
            <Images size={15} /> Scan photos
          </button>
          <button
            type="button"
            onClick={() => setModal({ kind: 'country' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-passport-navy text-passport-parchment hover:opacity-90 active:scale-[0.98]"
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {isEmpty && <EmptyState onAdd={() => setModal({ kind: 'country' })} />}

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
              onEdit={() => editCountry(a)}
              onAddCity={() => addCity(a)}
              onEditCity={editCity}
            />
          ))}
        </div>
      )}

      {aspiring.length > 0 && (
        <div className="space-y-3">
          <SectionHeading>Aspiring — places to discover</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {aspiring.map((a) => (
              <button
                key={a.code}
                type="button"
                onClick={() => editCountry(a)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-dashed border-passport-gold/50 text-passport-ink2 dark:text-white/70 hover:bg-passport-gold/10"
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
                className="rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 shadow-page p-4"
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white/90">
        {children}
      </h2>
      <div className="gold-rule mt-1.5 w-24" />
    </div>
  );
}

const FIELD_LABEL =
  'text-[10px] font-medium uppercase tracking-[0.18em] text-passport-fieldlabel';

function BioPage({
  name,
  no,
  sinceYear,
  stats,
  discoveriesTotal,
  expeditionCount,
  photo,
  onChangePhoto,
}: {
  name: string;
  no: string;
  sinceYear: number | null;
  stats: PassportStats;
  discoveriesTotal: number;
  expeditionCount: number;
  photo: string | null;
  onChangePhoto: (dataUrl: string | null) => void;
}) {
  const [mrz1, mrz2] = mrzLines(name, no);
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

  const figures: {
    label: string;
    value: string | number;
    total?: number;
    suffix?: string;
  }[] = [
    { label: 'Countries', value: stats.countriesDiscovered, total: totalCountries },
    { label: 'Cities', value: stats.citiesDiscovered },
    { label: 'Discoveries', value: discoveriesTotal },
    { label: 'Journeys', value: expeditionCount },
    { label: 'Continents', value: stats.continentsDiscovered, total: CONTINENTS.length },
    { label: 'World Seen', value: worldSeen, suffix: '%' },
  ];

  return (
    <div className="rounded-xl overflow-hidden shadow-page border border-black/10 dark:border-white/10">
      {/* Header band — always navy with gold type (Brand Book §08). */}
      <div className="bg-passport-navy px-5 py-3 flex items-center justify-between">
        <div className="leading-tight">
          <div className="text-[9px] font-medium uppercase tracking-[0.22em] text-passport-gold">
            Explorer&rsquo;s Passport
          </div>
          <div className="text-[9px] uppercase tracking-[0.22em] text-passport-gold/60">
            Society of Discovery
          </div>
        </div>
        <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-passport-gold/80">
          Member Record
        </div>
      </div>
      <div className="h-px bg-passport-gold/40" />

      {/* Body — parchment. */}
      <div className="bg-passport-card text-passport-ink px-5 pt-4">
        <div className="page-divide pb-2 mb-4 flex items-center justify-between text-[9px] tracking-[0.14em] text-passport-fieldlabel uppercase">
          <span>Type · M&nbsp;&nbsp; Code · SOD&nbsp;&nbsp; No. {no}</span>
          <span>Page 1 / 1</span>
        </div>

        <div className="flex gap-4">
          <div className="relative w-[68px] h-[84px] shrink-0 rounded-sm bg-passport-paged border border-black/10 overflow-hidden">
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
              aria-label={photo ? 'Change passport photo' : 'Add passport photo'}
              className="group absolute inset-0 flex items-center justify-center"
            >
              {photo ? (
                <img
                  src={photo}
                  alt="Passport portrait"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-3xl font-semibold text-passport-fieldlabel">
                  {name[0]?.toUpperCase() ?? 'E'}
                </span>
              )}
              <span
                className={cn(
                  'absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 py-0.5',
                  'bg-passport-navy/80 text-passport-gold',
                  'text-[7px] uppercase tracking-[0.12em]',
                  photo ? 'opacity-0 group-hover:opacity-100 transition-opacity' : '',
                )}
              >
                <Camera size={8} />
                {photo ? 'Change' : 'Add photo'}
              </span>
            </button>
            {photo && (
              <button
                type="button"
                onClick={() => onChangePhoto(null)}
                aria-label="Remove passport photo"
                className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-passport-navy/80 text-passport-parchment hover:bg-passport-navy"
              >
                <X size={9} />
              </button>
            )}
            {!photo && (
              <>
                <Corner className="top-1 left-1 border-t border-l" />
                <Corner className="top-1 right-1 border-t border-r" />
                <Corner className="bottom-1 left-1 border-b border-l" />
                <Corner className="bottom-1 right-1 border-b border-r" />
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-2.5">
            <div>
              <div className={FIELD_LABEL}>Member</div>
              <div className="font-display text-2xl font-semibold leading-tight truncate text-passport-navy">
                {name}
              </div>
            </div>
            <div className="relative">
              <div className={FIELD_LABEL}>Nationality</div>
              <div className="font-display text-[15px] text-passport-ink">
                Member · Society of Discovery
              </div>
              <div className="absolute right-0 -top-1 border-[1.5px] border-passport-navy/30 rounded px-1.5 py-0.5 rotate-[-9deg]">
                <span className="text-[7px] font-medium uppercase tracking-[0.16em] text-passport-navy/40">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="page-divide grid grid-cols-2 gap-3 mt-4 pb-4">
          <div>
            <div className={FIELD_LABEL}>Member Since</div>
            <div className="text-sm font-medium uppercase tracking-wide">
              {sinceYear ?? '—'}
            </div>
          </div>
          <div>
            <div className={FIELD_LABEL}>Standing</div>
            <div className="font-display text-[15px]">Known to us</div>
          </div>
        </div>

        <div className="page-divide grid grid-cols-3 gap-y-3 gap-x-2 mt-4 pb-4">
          {figures.map(({ label, value, total, suffix }) => (
            <div key={label}>
              <div className={FIELD_LABEL}>{label}</div>
              <div className="font-display text-2xl font-semibold text-passport-navy leading-none">
                {value}
                {suffix}
                {total != null && (
                  <span className="text-sm font-normal text-passport-fieldlabel">
                    {' / '}
                    {total}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-end justify-between mt-4 pb-4">
          <div>
            <div className={`${FIELD_LABEL} mb-1.5`}>Signature of Bearer</div>
            <div className="font-display text-lg italic text-passport-ink">
              {name}
            </div>
            <div className="h-px bg-black/20 mt-1.5 w-36" />
          </div>
          <Crest />
        </div>
      </div>

      {/* MRZ strip — aged parchment, monospace (Brand Book §08). */}
      <div className="bg-passport-paged px-5 py-2 font-mono text-[8px] leading-relaxed tracking-[0.1em] text-passport-fieldtext/70 break-all">
        <div>{mrz1}</div>
        <div>{mrz2}</div>
      </div>
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      className={`absolute w-2 h-2 border-passport-fieldlabel/70 ${className}`}
    />
  );
}

function RecognitionsStrip({ recognitions }: { recognitions: Recognition[] }) {
  return (
    <div className="space-y-3">
      <SectionHeading>Recognitions</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {recognitions.map((r) => (
          <span
            key={r.id}
            title={r.description}
            className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full text-sm bg-passport-gold/10 text-passport-navy dark:text-passport-goldsoft border border-passport-gold/40"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-passport-gold/60 text-passport-gold text-xs">
              {r.symbol}
            </span>
            {r.title}
          </span>
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
  onEdit,
  onAddCity,
  onEditCity,
}: {
  agg: CountryAggregate;
  friendsHere: FriendPresence[];
  onEdit: () => void;
  onAddCity: () => void;
  onEditCity: (place: Place) => void;
}) {
  return (
    <div className="rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 shadow-page p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="text-4xl leading-none shrink-0 hover:scale-105 transition-transform"
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
              .filter((p): p is Place => Boolean(p?.livedFrom))
              .map(
                (p) =>
                  `${p.name} (${formatMonth(p.livedFrom!)}–${p.livedTo ? formatMonth(p.livedTo) : 'now'})`,
              );
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
        {agg.cities.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onEditCity(c)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-passport-navy/5 dark:bg-white/5 text-passport-ink2 dark:text-white/70 hover:bg-passport-navy/10"
          >
            <MapPin size={11} />
            {c.name}
          </button>
        ))}
        <button
          type="button"
          onClick={onAddCity}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-dashed border-black/15 dark:border-white/15 text-passport-ink3 dark:text-white/50 hover:border-passport-gold/60"
        >
          <Plus size={11} /> City
        </button>
      </div>

      {friendsHere.length > 0 && <FriendsHere friends={friendsHere} />}
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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-10 text-center">
      <p className="font-display text-2xl font-semibold text-passport-navy dark:text-white/90 mb-1">
        Your Passport is blank.
      </p>
      <p className="text-sm text-passport-ink2 dark:text-white/50 mb-5 max-w-sm mx-auto">
        Record the first country you have discovered. Its flag and stamps begin
        the archive.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-passport-navy text-passport-parchment font-medium hover:opacity-90"
      >
        <Plus size={16} /> Add a country
      </button>
    </div>
  );
}

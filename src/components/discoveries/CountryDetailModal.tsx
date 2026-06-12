import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Building2,
  Camera,
  Check,
  ChevronLeft,
  Coins,
  Compass,
  Landmark,
  MapPin,
  Maximize2,
  Plus,
  RotateCcw,
  Thermometer,
  Users,
  X,
} from 'lucide-react';
import { countryName } from '../../data/countries';
import { countryFacts } from '../../data/countryFacts';
import { flagEmoji } from '../../lib/flags';
import { createPlace } from '../../lib/places';
import { setCover, removeCover } from '../../lib/covers';
import { useCover } from '../../hooks/useCovers';
import { fileToCompactJpeg } from '../../lib/imageCompress';
import {
  friendRecommendationsInCountry,
  discoveryMatchesLandmark,
  type CountryPresence,
  type FriendInCountry,
} from '../../lib/explore';
import {
  RELATIONSHIP_META,
  VERDICT_META,
  type Discovery,
  type DiscoveryCategory,
  type Relationship,
} from '../../types';
import { cn } from '../../lib/cn';
import { DestinationImage } from '../DestinationImage';
import { CATEGORY_ICON } from './categoryIcons';
import { VERDICT_STYLE } from './verdictStyle';

interface Props {
  userId: string;
  code: string;
  presence?: CountryPresence;
  myDiscoveries: Discovery[];
  friendDiscoveries: Discovery[];
  onAddTrip: (code: string) => void;
  onOpenDiscovery: (id: string) => void;
  onRecordLandmark: (countryCode: string, landmark: string) => void;
  onClose: () => void;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} bn`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)} M`;
  return n.toLocaleString();
}

export function CountryDetailModal({
  userId,
  code,
  presence,
  myDiscoveries,
  friendDiscoveries,
  onAddTrip,
  onOpenDiscovery,
  onRecordLandmark,
  onClose,
}: Props) {
  const facts = countryFacts(code);
  const name = countryName(code);
  const [drill, setDrill] = useState<FriendInCountry | null>(null);
  const [wishBusy, setWishBusy] = useState(false);
  const [wished, setWished] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const [coverBusy, setCoverBusy] = useState(false);
  const hasCover = Boolean(useCover(code));

  async function handleCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setCoverBusy(true);
    try {
      const dataUrl = await fileToCompactJpeg(file, 1280, 0.8);
      await setCover(userId, code, dataUrl);
    } finally {
      setCoverBusy(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (drill) setDrill(null);
        else onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, drill]);

  const visited = (presence?.mine.length ?? 0) > 0;

  const friendNames = useMemo(
    () => new Map((presence?.friends ?? []).map((f) => [f.uid, f.name])),
    [presence],
  );

  async function addToWishlist() {
    if (wishBusy || visited || wished) return;
    setWishBusy(true);
    try {
      await createPlace(userId, {
        kind: 'country',
        countryCode: code,
        name,
        relationships: ['aspiring'],
      });
      setWished(true);
    } finally {
      setWishBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          'w-full sm:max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar',
          'rounded-t-3xl sm:rounded-3xl shadow-float animate-rise-in',
          'bg-passport-cartridge dark:bg-passport-carddark',
        )}
      >
        {/* Hero header — destination photo over gradient (gradient for drill) */}
        <DestinationImage
          code={drill ? 'XX' : code}
          width={800}
          className="text-white min-h-[180px] flex flex-col"
          scrim
        >
          <div className="flex items-start justify-between px-5 pt-5 pb-6">
            {drill ? (
              <button
                type="button"
                aria-label="Back"
                onClick={() => setDrill(null)}
                className="h-9 w-9 -ml-1 inline-flex items-center justify-center rounded-full glass text-white hover:bg-white/25"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <div className="h-14 w-14 rounded-2xl bg-white/25 ring-2 ring-white/40 flex items-center justify-center text-4xl leading-none backdrop-blur-sm">
                {flagEmoji(code)}
              </div>
            )}
            <div className="flex items-center gap-2">
              {!drill && (
                <>
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCover}
                  />
                  {hasCover && (
                    <button
                      type="button"
                      aria-label="Reset to standard photo"
                      onClick={() => userId && removeCover(userId, code)}
                      className="h-9 w-9 inline-flex items-center justify-center rounded-full glass text-white hover:bg-white/25"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={hasCover ? 'Change cover photo' : 'Add a cover photo'}
                    onClick={() => coverRef.current?.click()}
                    disabled={coverBusy}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-full glass text-white hover:bg-white/25 disabled:opacity-60"
                  >
                    <Camera size={16} />
                  </button>
                </>
              )}
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full glass text-white hover:bg-white/25"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="mt-auto px-5 pb-5">
            <h2 className="font-display text-2xl font-semibold leading-tight drop-shadow-sm">
              {drill ? drill.name : name}
            </h2>
            <p className="text-sm text-white/85 mt-0.5">
              {drill ? `Recommendations in ${name}` : facts?.capital ?? 'Explore'}
            </p>
          </div>
        </DestinationImage>

        {drill ? (
          <FriendDrillDown
            friend={drill}
            countryCode={code}
            friendDiscoveries={friendDiscoveries}
          />
        ) : (
          <div className="px-5 py-4 space-y-6">
            {/* Your status + cities */}
            <div className="flex flex-wrap items-center gap-2">
              {visited ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-passport-goldpale text-passport-gold">
                  <Check size={14} strokeWidth={3} /> You&rsquo;ve been here
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-passport-navy/[0.05] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/55">
                  <Compass size={14} /> Not yet discovered
                </span>
              )}
              {presence?.myCities.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white dark:bg-white/[0.06] shadow-card text-passport-ink2 dark:text-white/70"
                >
                  <MapPin size={11} /> {c}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onAddTrip(code)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-sm font-semibold bg-brand-gradient text-white shadow-card hover:opacity-95 active:scale-[0.98] transition-all"
              >
                <Plus size={16} /> Add a trip
              </button>
              {!visited && (
                <button
                  type="button"
                  onClick={addToWishlist}
                  disabled={wishBusy || wished}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-sm font-semibold bg-white dark:bg-white/5 shadow-card text-passport-navy dark:text-white/85 hover:shadow-card-hover active:scale-[0.98] disabled:opacity-60 transition-all"
                >
                  {wished ? <Check size={16} /> : <Compass size={16} />}
                  {wished ? 'On wishlist' : 'Wishlist'}
                </button>
              )}
            </div>

            {/* Facts */}
            {facts ? (
              <div className="grid grid-cols-2 gap-2.5">
                <Fact icon={Building2} label="Capital" value={facts.capital} />
                <Fact icon={Coins} label="Currency" value={facts.currency} />
                <Fact
                  icon={Users}
                  label="Population"
                  value={fmtNum(facts.population)}
                />
                <Fact
                  icon={Maximize2}
                  label="Area"
                  value={`${facts.areaKm2.toLocaleString()} km²`}
                />
              </div>
            ) : (
              <p className="text-sm text-passport-ink3">
                Detailed facts for {name} are coming soon. You can still track
                your visits, add it to your wishlist, and see who&rsquo;s been.
              </p>
            )}

            {/* Temperatures */}
            {facts?.temps && <TempChart temps={facts.temps} />}

            {/* Landmarks */}
            {facts?.landmarks && facts.landmarks.length > 0 && (
              <section className="space-y-2">
                <SubHeading icon={Landmark}>
                  Landmarks &amp; sights
                </SubHeading>
                <div className="space-y-2">
                  {facts.landmarks.map((l) => (
                    <LandmarkRow
                      key={l}
                      landmark={l}
                      countryCode={code}
                      myDiscoveries={myDiscoveries}
                      friendDiscoveries={friendDiscoveries}
                      friendNames={friendNames}
                      onOpenDiscovery={onOpenDiscovery}
                      onRecord={() => onRecordLandmark(code, l)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Friends who've visited */}
            <section className="space-y-2">
              <SubHeading icon={Users}>Friends who&rsquo;ve been</SubHeading>
              {presence && presence.friends.length > 0 ? (
                <div className="space-y-2">
                  {presence.friends.map((f) => (
                    <FriendRow
                      key={f.uid}
                      friend={f}
                      onOpen={() => setDrill(f)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-black/50 dark:text-white/50">
                  None of your friends have recorded a visit here yet.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-white/[0.06] shadow-card px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-passport-ink3">
        <Icon size={12} className="text-passport-gold" /> {label}
      </div>
      <div className="mt-1 text-[15px] font-semibold text-passport-navy dark:text-white break-words">
        {value}
      </div>
    </div>
  );
}

function SubHeading({
  icon: Icon,
  children,
}: {
  icon: typeof Building2;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel">
      <Icon size={13} className="text-passport-gold" /> {children}
    </div>
  );
}

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function TempChart({ temps }: { temps: number[] }) {
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = Math.max(1, max - min);
  return (
    <section className="space-y-2">
      <SubHeading icon={Thermometer}>Average temperature</SubHeading>
      <div className="flex items-end justify-between gap-1 h-24">
        {temps.map((t, i) => {
          const h = 12 + ((t - min) / span) * 76; // 12–88% of the track
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full gap-1"
              title={`${MONTHS[i]}: ${Math.round(t)}°C`}
            >
              <span className="text-[8px] text-passport-ink3 dark:text-white/45 tabular-nums">
                {Math.round(t)}°
              </span>
              <div
                className="w-full max-w-[14px] rounded-t bg-gradient-to-t from-passport-gold/40 to-passport-gold"
                style={{ height: `${h}%` }}
              />
              <span className="text-[8px] text-passport-ink3 dark:text-white/45">
                {MONTHS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FriendRow({
  friend: f,
  onOpen,
}: {
  friend: FriendInCountry;
  onOpen: () => void;
}) {
  const rels = f.relationships
    .filter((r): r is Relationship => r !== 'aspiring')
    .map((r) => RELATIONSHIP_META[r].label)
    .join(' · ');
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-2xl bg-white dark:bg-white/[0.04] shadow-card px-3.5 py-3 hover:shadow-card-hover active:scale-[0.99] transition-all"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-passport-navy/[0.06] dark:bg-white/[0.08] text-xs font-medium text-passport-navy dark:text-passport-goldsoft capitalize">
          {f.name[0] ?? '?'}
        </span>
        <span className="font-medium text-passport-navy dark:text-white/90 capitalize truncate">
          {f.name}
        </span>
        {f.recommendations.length > 0 && (
          <span className="ml-auto text-xs text-passport-ink3 dark:text-white/45 shrink-0">
            {f.recommendations.length} rec
            {f.recommendations.length === 1 ? '' : 's'} ›
          </span>
        )}
      </div>
      {(rels || f.cities.length > 0) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-9">
          {rels && (
            <span className="text-[11px] text-passport-ink3 dark:text-white/45 lowercase">
              {rels}
            </span>
          )}
          {f.cities.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-passport-navy/[0.05] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/70"
            >
              <MapPin size={10} /> {c}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

function LandmarkRow({
  landmark,
  countryCode,
  myDiscoveries,
  friendDiscoveries,
  friendNames,
  onOpenDiscovery,
  onRecord,
}: {
  landmark: string;
  countryCode: string;
  myDiscoveries: Discovery[];
  friendDiscoveries: Discovery[];
  friendNames: Map<string, string>;
  onOpenDiscovery: (id: string) => void;
  onRecord: () => void;
}) {
  const [openFriend, setOpenFriend] = useState<string | null>(null);

  const mine = useMemo(
    () => myDiscoveries.find((d) => discoveryMatchesLandmark(d, landmark, countryCode)),
    [myDiscoveries, landmark, countryCode],
  );
  const friendRecs = useMemo(
    () =>
      friendDiscoveries
        .filter((d) => discoveryMatchesLandmark(d, landmark, countryCode))
        .map((d) => ({
          id: d.id,
          name: friendNames.get(d.userId) ?? 'Member',
          verdict: d.verdict,
          note: d.note,
        })),
    [friendDiscoveries, landmark, countryCode, friendNames],
  );

  return (
    <div className="rounded-xl bg-passport-navy/[0.04] dark:bg-white/[0.05] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm text-passport-navy dark:text-white/90 min-w-0 truncate">
          {landmark}
        </span>
        {mine ? (
          <button
            type="button"
            onClick={() => onOpenDiscovery(mine.id)}
            className={cn(
              'shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border',
              mine.verdict
                ? VERDICT_STYLE[mine.verdict].chip
                : 'bg-passport-gold/15 text-passport-navy dark:text-passport-goldsoft border-passport-gold/40',
            )}
          >
            <Check size={11} />
            {mine.verdict ? VERDICT_META[mine.verdict].label : 'Your record'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onRecord}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border border-dashed border-black/20 dark:border-white/20 text-passport-ink3 dark:text-white/55 hover:border-passport-gold/60"
          >
            <Plus size={11} /> Record
          </button>
        )}
      </div>

      {friendRecs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {friendRecs.map((r) => {
            const open = openFriend === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setOpenFriend(open ? null : r.id)}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-colors',
                  r.verdict
                    ? VERDICT_STYLE[r.verdict].chip
                    : 'bg-passport-navy/[0.05] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/70 border-black/10 dark:border-white/10',
                )}
              >
                <Users size={10} />
                <span className="capitalize">{r.name}</span>
                {r.verdict && (
                  <span className="opacity-70">· {VERDICT_META[r.verdict].label}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {(() => {
        const open = friendRecs.find((r) => r.id === openFriend);
        if (!open) return null;
        return (
          <p className="mt-2 font-display text-sm italic text-passport-ink2 dark:text-white/65 border-l-2 border-passport-gold/50 pl-2.5">
            <span className="capitalize not-italic font-medium text-passport-navy dark:text-white/85">
              {open.name}:
            </span>{' '}
            {open.note || 'No note left.'}
          </p>
        );
      })()}
    </div>
  );
}

function FriendDrillDown({
  friend,
  countryCode,
  friendDiscoveries,
}: {
  friend: FriendInCountry;
  countryCode: string;
  friendDiscoveries: Discovery[];
}) {
  const byCity = useMemo(
    () => friendRecommendationsInCountry(friend.uid, countryCode, friendDiscoveries),
    [friend.uid, countryCode, friendDiscoveries],
  );
  const cities = [...byCity.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="px-5 py-4 space-y-5">
      {cities.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">
          {friend.name} has been here but hasn&rsquo;t recorded any specific
          recommendations yet.
        </p>
      ) : (
        cities.map(([city, recs]) => (
          <section key={city} className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-passport-fieldlabel">
              <MapPin size={13} className="text-passport-gold" /> {city}
            </div>
            <div className="space-y-2">
              {recs.map((r, i) => {
                const Icon = CATEGORY_ICON[r.category as DiscoveryCategory];
                return (
                  <div
                    key={i}
                    className="rounded-xl bg-passport-navy/[0.04] dark:bg-white/[0.05] px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {Icon && (
                          <Icon
                            size={15}
                            className="text-passport-gold shrink-0"
                          />
                        )}
                        <span className="font-medium text-passport-navy dark:text-white/90 truncate">
                          {r.name}
                        </span>
                      </div>
                      {r.verdict && (
                        <span
                          className={cn(
                            'shrink-0 px-2 py-0.5 rounded-full text-[11px] border',
                            VERDICT_STYLE[r.verdict].chip,
                          )}
                        >
                          {VERDICT_META[r.verdict].label}
                        </span>
                      )}
                    </div>
                    {r.note && (
                      <p className="mt-1.5 font-display text-sm italic text-passport-ink2 dark:text-white/65 border-l-2 border-passport-gold/50 pl-2.5">
                        {r.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Check,
  ChevronLeft,
  Coins,
  Compass,
  Landmark,
  MapPin,
  Maximize2,
  Plus,
  Thermometer,
  Users,
  X,
} from 'lucide-react';
import { countryName } from '../../data/countries';
import { countryFacts } from '../../data/countryFacts';
import { flagEmoji } from '../../lib/flags';
import { createPlace } from '../../lib/places';
import {
  friendRecommendationsInCountry,
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
import { CATEGORY_ICON } from './categoryIcons';
import { VERDICT_STYLE } from './verdictStyle';

interface Props {
  userId: string;
  code: string;
  presence?: CountryPresence;
  friendDiscoveries: Discovery[];
  onAddTrip: (code: string) => void;
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
  friendDiscoveries,
  onAddTrip,
  onClose,
}: Props) {
  const facts = countryFacts(code);
  const name = countryName(code);
  const [drill, setDrill] = useState<FriendInCountry | null>(null);
  const [wishBusy, setWishBusy] = useState(false);
  const [wished, setWished] = useState(false);

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
          'rounded-t-2xl sm:rounded-2xl shadow-page animate-rise-in',
          'bg-passport-card dark:bg-passport-carddark',
          'border border-black/5 dark:border-white/10',
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4 border-b border-black/5 dark:border-white/10 bg-passport-card dark:bg-passport-carddark">
          {drill ? (
            <button
              type="button"
              aria-label="Back"
              onClick={() => setDrill(null)}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/55 dark:text-white/55"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <span className="text-3xl leading-none">{flagEmoji(code)}</span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white/90 truncate">
              {drill ? drill.name : name}
            </h2>
            {drill && (
              <p className="text-xs text-passport-ink3 dark:text-white/45">
                Recommendations in {name}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black/50 dark:text-white/50"
          >
            <X size={18} />
          </button>
        </div>

        {drill ? (
          <FriendDrillDown
            friend={drill}
            countryCode={code}
            friendDiscoveries={friendDiscoveries}
          />
        ) : (
          <div className="px-5 py-4 space-y-6">
            {/* Your status + actions */}
            <div className="flex flex-wrap items-center gap-2">
              {visited ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-passport-gold/15 text-passport-navy dark:text-passport-goldsoft border border-passport-gold/40">
                  <Check size={14} /> You&rsquo;ve been here
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-black/[0.04] dark:bg-white/[0.06] text-black/55 dark:text-white/55">
                  <Compass size={14} /> Not yet discovered
                </span>
              )}
              {presence?.myCities.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-passport-navy/[0.06] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/70"
                >
                  <MapPin size={11} /> {c}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onAddTrip(code)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-passport-navy text-passport-parchment dark:bg-passport-gold dark:text-passport-ink hover:opacity-90"
              >
                <Plus size={15} /> Add a trip
              </button>
              {!visited && (
                <button
                  type="button"
                  onClick={addToWishlist}
                  disabled={wishBusy || wished}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-passport-gold/50 text-passport-navy dark:text-white/80 hover:bg-passport-gold/10 disabled:opacity-60"
                >
                  {wished ? <Check size={15} /> : <Compass size={15} />}
                  {wished ? 'On your wishlist' : 'Add to wishlist'}
                </button>
              )}
            </div>

            {/* Facts */}
            {facts ? (
              <div className="grid grid-cols-2 gap-2">
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
              <p className="text-sm text-black/50 dark:text-white/50">
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
                <div className="flex flex-wrap gap-2">
                  {facts.landmarks.map((l) => (
                    <span
                      key={l}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-passport-navy/[0.05] dark:bg-white/[0.06] text-passport-ink2 dark:text-white/75"
                    >
                      {l}
                    </span>
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
    <div className="rounded-xl bg-passport-navy/[0.04] dark:bg-white/[0.05] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-passport-fieldlabel">
        <Icon size={11} /> {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-passport-navy dark:text-white/90 break-words">
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
      className="w-full text-left rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 px-3 py-2.5 hover:border-passport-gold/50 transition-colors"
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

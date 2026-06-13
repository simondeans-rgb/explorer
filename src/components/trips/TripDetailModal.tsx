import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, MapPin, Pencil, Plane, Plus, Share2, Sparkles, Users, X } from 'lucide-react';
import { buildTripPosterSvg } from '../../lib/sharePosters';
import { shareOrDownloadSvg } from '../../lib/shareImage';
import type {
  DiscoveryCategory,
  ItineraryItem,
  RecommendationVerdict,
  Trip,
} from '../../types';
import { DISCOVERY_CATEGORY_META, subcategoryLabel, VERDICT_META } from '../../types';
import type { FriendPresence } from '../../lib/friends';
import { countryName } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import { daysUntil } from '../../hooks/useTrips';
import { DestinationImage } from '../DestinationImage';
import { CATEGORY_ICON } from '../discoveries/categoryIcons';
import { cn } from '../../lib/cn';
import { inputClass } from '../../lib/formClass';

/** "City · Café" style meta line from a discovery's place + type. */
function metaLine(
  city?: string,
  category?: DiscoveryCategory,
  subcategory?: string,
): string {
  const type = category
    ? (subcategoryLabel(category, subcategory) ?? DISCOVERY_CATEGORY_META[category].label)
    : undefined;
  return [city, type].filter(Boolean).join(' · ');
}

function newId(): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `it_${Math.random().toString(36).slice(2)}`;
}

function countdownLabel(trip: Trip): string {
  const d = daysUntil(trip.startDate);
  if (d > 1) return `${d} days to go`;
  if (d === 1) return 'Tomorrow!';
  if (d === 0) return 'Leaving today!';
  const end = trip.endDate ? daysUntil(trip.endDate) : d;
  return end >= 0 ? 'Happening now' : 'Trip complete';
}

export function TripDetailModal({
  trip,
  friends,
  ownRecs = [],
  started = false,
  onConvert,
  onAddItinerary,
  onRemoveItinerary,
  onEdit,
  onClose,
}: {
  trip: Trip;
  friends: FriendPresence[];
  /** The Member's own saved places in the destination country. */
  ownRecs?: { name: string; city?: string }[];
  /** Whether the trip has begun (enables "save as a journey"). */
  started?: boolean;
  onConvert?: () => void;
  onAddItinerary: (item: ItineraryItem) => void;
  onRemoveItinerary: (itemId: string) => void;
  onEdit: () => void;
  onClose: () => void;
}) {
  const [manual, setManual] = useState('');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Friends' recommendations in the destination country.
  const recs = useMemo(() => {
    const out: {
      name: string;
      friend: string;
      verdict?: RecommendationVerdict;
      city?: string;
      category?: DiscoveryCategory;
      subcategory?: string;
    }[] = [];
    for (const f of friends) {
      for (const d of f.discoveries) {
        out.push({
          name: d.name,
          friend: f.name,
          verdict: d.verdict,
          city: d.city,
          category: d.category,
          subcategory: d.subcategory,
        });
      }
    }
    return out;
  }, [friends]);

  const inItinerary = useMemo(
    () => new Set(trip.itinerary.map((i) => i.name.toLowerCase())),
    [trip.itinerary],
  );

  const dateLabel = useMemo(() => {
    const fmt = (iso?: string) =>
      iso
        ? new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
          })
        : '';
    return [fmt(trip.startDate), fmt(trip.endDate)].filter(Boolean).join(' – ');
  }, [trip.startDate, trip.endDate]);

  function addRec(r: {
    name: string;
    friend: string;
    verdict?: RecommendationVerdict;
    city?: string;
    category?: DiscoveryCategory;
  }) {
    if (inItinerary.has(r.name.toLowerCase())) return;
    onAddItinerary({
      id: newId(),
      name: r.name,
      fromFriend: r.friend,
      verdict: r.verdict,
      city: r.city,
      category: r.category,
    });
  }

  function addManual() {
    const n = manual.trim();
    if (!n || inItinerary.has(n.toLowerCase())) {
      setManual('');
      return;
    }
    onAddItinerary({ id: newId(), name: n });
    setManual('');
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
          'rounded-t-3xl sm:rounded-3xl shadow-float',
          'bg-passport-cartridge dark:bg-passport-carddark',
        )}
      >
        {/* Hero + countdown — the image is a shared element that morphs from
            the tapped countdown card; text/buttons overlay it. */}
        <div className="relative h-44">
          <motion.div
            layoutId={`trip-hero-${trip.id}`}
            className="absolute inset-0 overflow-hidden"
          >
            <DestinationImage code={trip.countryCode} className="h-full w-full" />
            <div className="absolute inset-0 hero-scrim" />
          </motion.div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 h-9 w-9 grid place-items-center rounded-full glass text-white"
          >
            <X size={18} />
          </button>
          <button
            type="button"
            aria-label="Edit trip"
            onClick={onEdit}
            className="absolute right-14 top-3 z-10 h-9 w-9 grid place-items-center rounded-full glass text-white"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="Share trip"
            onClick={() =>
              shareOrDownloadSvg(buildTripPosterSvg(trip), 'worldly-trip.png', {
                shareText: `${trip.title} — ${countdownLabel(trip)} ✈️`,
              })
            }
            className="absolute right-[6.25rem] top-3 z-10 h-9 w-9 grid place-items-center rounded-full glass text-white"
          >
            <Share2 size={16} />
          </button>
          <div className="absolute inset-x-0 bottom-0 z-10 p-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-coral shadow-card">
              <Sparkles size={12} /> {countdownLabel(trip)}
            </span>
            <h2 className="mt-2 font-display text-2xl font-semibold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-tight">
              {trip.title}
            </h2>
            <p className="text-sm font-medium text-white/90 mt-0.5">
              {flagEmoji(trip.countryCode)} {countryName(trip.countryCode)}
              {dateLabel && ` · ${dateLabel}`}
            </p>
          </div>
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* Friends who've been */}
          {friends.length > 0 && (
            <section>
              <h3 className="flex items-center gap-1.5 font-display text-[1.15rem] font-semibold text-passport-navy dark:text-white mb-2.5">
                <Users size={16} className="text-coral" />
                Friends who&rsquo;ve been to {countryName(trip.countryCode)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {friends.map((f) => (
                  <span
                    key={f.uid}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/10 shadow-card pl-1.5 pr-3 py-1"
                  >
                    <span className="h-6 w-6 rounded-full bg-brand-gradient grid place-items-center text-[11px] font-bold text-white capitalize">
                      {f.name[0] ?? '?'}
                    </span>
                    <span className="text-sm font-semibold text-passport-navy dark:text-white capitalize">
                      {f.name}
                    </span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Friends' recommendations */}
          {recs.length > 0 && (
            <section>
              <h3 className="font-display text-[1.15rem] font-semibold text-passport-navy dark:text-white mb-2.5">
                Recommended by your friends
              </h3>
              <div className="space-y-2">
                {recs.map((r, i) => {
                  const added = inItinerary.has(r.name.toLowerCase());
                  return (
                    <div
                      key={`${r.name}-${i}`}
                      className="flex items-center gap-3 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-3.5 py-3"
                    >
                      {r.category &&
                        (() => {
                          const Icon = CATEGORY_ICON[r.category];
                          return (
                            <span className="shrink-0 h-9 w-9 rounded-xl bg-passport-goldpale dark:bg-white/10 text-passport-gold grid place-items-center">
                              <Icon size={16} />
                            </span>
                          );
                        })()}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-passport-navy dark:text-white leading-tight truncate">
                          {r.name}
                        </p>
                        <p className="text-xs text-passport-ink3 mt-0.5">
                          <span className="capitalize">{r.friend}</span>
                          {r.verdict && ` · ${VERDICT_META[r.verdict].label}`}
                        </p>
                        {metaLine(r.city, r.category, r.subcategory) && (
                          <p className="text-[11px] text-passport-ink3/80 mt-0.5 truncate">
                            {metaLine(r.city, r.category, r.subcategory)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => addRec(r)}
                        disabled={added}
                        aria-label={added ? 'Added' : 'Add to itinerary'}
                        className={cn(
                          'shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95',
                          added
                            ? 'bg-aqua/15 text-aqua cursor-default'
                            : 'bg-brand-gradient text-white shadow-card',
                        )}
                      >
                        {added ? <Check size={14} /> : <Plus size={14} />}
                        {added ? 'Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Your own saved places here */}
          {ownRecs.length > 0 && (
            <section>
              <h3 className="font-display text-[1.15rem] font-semibold text-passport-navy dark:text-white mb-2.5">
                From your saved places
              </h3>
              <div className="space-y-2">
                {ownRecs.map((r, i) => {
                  const added = inItinerary.has(r.name.toLowerCase());
                  return (
                    <div
                      key={`${r.name}-${i}`}
                      className="flex items-center gap-3 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-3.5 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-passport-navy dark:text-white leading-tight truncate">
                          {r.name}
                        </p>
                        {r.city && (
                          <p className="text-xs text-passport-ink3 mt-0.5">{r.city}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          !added &&
                          onAddItinerary({ id: newId(), name: r.name, city: r.city })
                        }
                        disabled={added}
                        aria-label={added ? 'Added' : 'Add to itinerary'}
                        className={cn(
                          'shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95',
                          added
                            ? 'bg-aqua/15 text-aqua cursor-default'
                            : 'bg-brand-gradient text-white shadow-card',
                        )}
                      >
                        {added ? <Check size={14} /> : <Plus size={14} />}
                        {added ? 'Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {friends.length === 0 && ownRecs.length === 0 && (
            <p className="text-sm text-passport-ink2 dark:text-white/55 rounded-2xl bg-white dark:bg-white/5 shadow-card px-4 py-3">
              None of your friends have logged {countryName(trip.countryCode)}{' '}
              yet — add places to your itinerary below, and their tips will show
              up here as they travel.
            </p>
          )}

          {/* Itinerary */}
          <section>
            <h3 className="flex items-center gap-1.5 font-display text-[1.15rem] font-semibold text-passport-navy dark:text-white mb-2.5">
              <MapPin size={16} className="text-coral" />
              Your itinerary
              {trip.itinerary.length > 0 && (
                <span className="text-sm font-semibold text-passport-ink3">
                  · {trip.itinerary.length}
                </span>
              )}
            </h3>

            {trip.itinerary.length > 0 ? (
              <div className="space-y-2 mb-3">
                {trip.itinerary.map((it) => {
                  const Icon = it.category ? CATEGORY_ICON[it.category] : null;
                  const meta = metaLine(it.city, it.category);
                  return (
                  <div
                    key={it.id}
                    className="flex items-center gap-3 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-3.5 py-3"
                  >
                    {Icon && (
                      <span className="shrink-0 h-9 w-9 rounded-xl bg-passport-goldpale dark:bg-white/10 text-passport-gold grid place-items-center">
                        <Icon size={16} />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-passport-navy dark:text-white leading-tight truncate">
                        {it.name}
                      </p>
                      {(meta || it.fromFriend) && (
                        <p className="text-xs text-passport-ink3 mt-0.5 truncate">
                          {meta}
                          {meta && it.fromFriend && ' · '}
                          {it.fromFriend && (
                            <span className="capitalize">from {it.fromFriend}</span>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItinerary(it.id)}
                      aria-label="Remove"
                      className="shrink-0 h-8 w-8 grid place-items-center rounded-full text-passport-ink3 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-passport-ink3 mb-3">
                Nothing planned yet. Add your friends&rsquo; tips above, or a
                place of your own below.
              </p>
            )}

            <div className="flex gap-2">
              <input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManual()}
                placeholder="Add a place…"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addManual}
                disabled={!manual.trim()}
                className="shrink-0 inline-flex items-center gap-1 px-4 rounded-2xl bg-brand-gradient text-white font-semibold shadow-card disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>
          </section>

          {/* Once the trip has begun, retire it into a logged journey */}
          {started && onConvert && (
            <button
              type="button"
              onClick={onConvert}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-passport-navy dark:bg-white text-white dark:text-passport-navy font-semibold px-4 py-3.5 shadow-card active:scale-[0.99] transition-transform"
            >
              <Plane size={17} /> Save as a journey
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, MapPin, X } from 'lucide-react';
import type { Discovery, Place } from '../../types';
import { VERDICT_META, subcategoryLabel, DISCOVERY_CATEGORY_META } from '../../types';
import { aggregateByCountry } from '../../lib/stats';
import { flagEmoji } from '../../lib/flags';
import { CATEGORY_ICON } from '../discoveries/categoryIcons';
import { cn } from '../../lib/cn';

/** A friend's public profile — the countries & cities they've been to, opening
 *  to their discoveries in a country when tapped. */
export function FriendProfileModal({
  name,
  places,
  discoveries,
  onClose,
}: {
  name: string;
  places: Place[];
  discoveries: Discovery[];
  onClose: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const aggregates = useMemo(
    () => aggregateByCountry(places).filter((a) => a.discovered),
    [places],
  );
  const cityCount = useMemo(
    () => places.filter((p) => p.kind === 'city').length,
    [places],
  );
  const discByCountry = useMemo(() => {
    const m = new Map<string, Discovery[]>();
    for (const d of discoveries) {
      if (!d.countryCode) continue;
      const list = m.get(d.countryCode) ?? [];
      list.push(d);
      m.set(d.countryCode, list);
    }
    return m;
  }, [discoveries]);

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
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
        {/* Header */}
        <div className="relative bg-brand-gradient text-white p-5 pt-6">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 h-9 w-9 grid place-items-center rounded-full bg-white/15"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/20 ring-2 ring-white/40 grid place-items-center text-2xl font-bold capitalize">
              {name[0] ?? '?'}
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold capitalize leading-tight">
                {name}
              </h2>
              <p className="text-sm text-white/85 mt-0.5">
                {aggregates.length}{' '}
                {aggregates.length === 1 ? 'country' : 'countries'} · {cityCount}{' '}
                {cityCount === 1 ? 'city' : 'cities'}
              </p>
            </div>
          </div>
        </div>

        {/* Countries */}
        <div className="p-4 space-y-2.5">
          {aggregates.length === 0 && (
            <p className="text-sm text-passport-ink2 dark:text-white/55 text-center py-8">
              {name} hasn&rsquo;t shared any travels yet.
            </p>
          )}
          {aggregates.map((a) => {
            const here = discByCountry.get(a.code) ?? [];
            const isOpen = open === a.code;
            return (
              <div
                key={a.code}
                className="rounded-2xl overflow-hidden bg-white dark:bg-passport-carddark shadow-card"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : a.code)}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-left"
                >
                  <span className="text-2xl leading-none">{flagEmoji(a.code)}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-passport-navy dark:text-white truncate">
                      {a.name}
                    </span>
                    <span className="block text-xs text-passport-ink3">
                      {a.cities.length > 0
                        ? a.cities.map((c) => c.name).slice(0, 3).join(', ')
                        : a.continent}
                      {here.length > 0 &&
                        ` · ${here.length} ${here.length === 1 ? 'discovery' : 'discoveries'}`}
                    </span>
                  </span>
                  {here.length > 0 && (
                    <ChevronDown
                      size={18}
                      className={cn(
                        'text-passport-ink3 transition-transform shrink-0',
                        isOpen && 'rotate-180',
                      )}
                    />
                  )}
                </button>

                {isOpen && here.length > 0 && (
                  <div className="px-3.5 pb-3.5 space-y-2">
                    {here.map((d) => {
                      const Icon = CATEGORY_ICON[d.category];
                      return (
                        <div
                          key={d.id}
                          className="flex items-center gap-3 rounded-xl bg-passport-cartridge dark:bg-white/5 px-3 py-2.5"
                        >
                          {d.photo ? (
                            <img
                              src={d.photo}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover shrink-0 vivid-photo"
                            />
                          ) : (
                            <span className="h-9 w-9 rounded-lg bg-passport-goldpale dark:bg-white/10 text-passport-gold grid place-items-center shrink-0">
                              <Icon size={15} />
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-passport-navy dark:text-white truncate">
                              {d.name}
                            </p>
                            <p className="text-[11px] text-passport-ink3 truncate">
                              {[d.city, subcategoryLabel(d.category, d.subcategory) ?? DISCOVERY_CATEGORY_META[d.category].label]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                          {d.verdict && (
                            <span className="shrink-0 text-[11px] font-medium text-coral inline-flex items-center gap-1">
                              <MapPin size={11} />
                              {VERDICT_META[d.verdict].label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

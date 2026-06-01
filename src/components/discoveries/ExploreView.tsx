import { useMemo, useState } from 'react';
import { Check, ChevronDown, Compass, Search, Users } from 'lucide-react';
import { COUNTRIES } from '../../data/countries';
import { countryFacts } from '../../data/countryFacts';
import { flagEmoji } from '../../lib/flags';
import { CONTINENTS, type Continent, type Discovery } from '../../types';
import type { CountryPresence } from '../../lib/explore';
import { cn } from '../../lib/cn';
import { CountryDetailModal } from './CountryDetailModal';

interface Props {
  userId: string;
  presenceByCountry: Map<string, CountryPresence>;
  friendDiscoveries: Discovery[];
  onAddTrip: (code: string) => void;
}

export function ExploreView({
  userId,
  presenceByCountry,
  friendDiscoveries,
  onAddTrip,
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Continent | null>('Europe');
  const [detail, setDetail] = useState<string | null>(null);

  const byContinent = useMemo(() => {
    const m = new Map<Continent, typeof COUNTRIES>();
    const q = query.trim().toLowerCase();
    for (const c of COUNTRIES) {
      if (q && !c.name.toLowerCase().includes(q)) continue;
      const list = m.get(c.continent) ?? [];
      list.push(c);
      m.set(c.continent, list);
    }
    return m;
  }, [query]);

  const searching = query.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35 dark:text-white/35"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search countries…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 focus:outline-none focus:border-passport-gold/60 text-passport-ink dark:text-white/85 placeholder:text-black/35 dark:placeholder:text-white/35"
        />
      </div>

      <div className="space-y-3">
        {CONTINENTS.map((continent) => {
          const list = byContinent.get(continent);
          if (!list || list.length === 0) return null;
          const isOpen = searching || open === continent;
          return (
            <section
              key={continent}
              className="rounded-2xl bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10 shadow-page overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : continent)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <span className="font-display text-lg font-semibold text-passport-navy dark:text-white/90">
                  {continent}
                </span>
                <span className="flex items-center gap-2 text-xs text-passport-ink3 dark:text-white/45">
                  {list.length}
                  <ChevronDown
                    size={16}
                    className={cn(
                      'transition-transform',
                      isOpen ? 'rotate-180' : '',
                    )}
                  />
                </span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {list.map((c) => (
                    <CountryTile
                      key={c.code}
                      code={c.code}
                      name={c.name}
                      presence={presenceByCountry.get(c.code)}
                      onOpen={() => setDetail(c.code)}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {detail && (
        <CountryDetailModal
          userId={userId}
          code={detail}
          presence={presenceByCountry.get(detail)}
          friendDiscoveries={friendDiscoveries}
          onAddTrip={(code) => {
            setDetail(null);
            onAddTrip(code);
          }}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  );
}

function CountryTile({
  code,
  name,
  presence,
  onOpen,
}: {
  code: string;
  name: string;
  presence?: CountryPresence;
  onOpen: () => void;
}) {
  const visited = (presence?.mine.length ?? 0) > 0;
  const friendCount = presence?.friends.length ?? 0;
  const hasFacts = Boolean(countryFacts(code));
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group relative text-left rounded-xl p-3 border transition-all active:scale-[0.98]',
        'bg-passport-navy/[0.02] dark:bg-white/[0.03]',
        visited
          ? 'border-passport-gold/50'
          : 'border-black/10 dark:border-white/10 hover:border-passport-gold/40',
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-3xl leading-none">{flagEmoji(code)}</span>
        {visited && (
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-passport-gold/20 text-passport-navy dark:text-passport-goldsoft"
            title="You've been here"
          >
            <Check size={12} />
          </span>
        )}
      </div>
      <div className="mt-2 font-medium text-sm text-passport-navy dark:text-white/90 leading-tight line-clamp-2">
        {name}
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-passport-ink3 dark:text-white/45 min-h-[16px]">
        {friendCount > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <Users size={11} /> {friendCount}
          </span>
        )}
        {!hasFacts && !visited && friendCount === 0 && (
          <Compass size={11} className="opacity-50" />
        )}
      </div>
    </button>
  );
}

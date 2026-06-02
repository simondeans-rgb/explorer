import { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, Users } from 'lucide-react';
import { COUNTRIES } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import { CONTINENTS, type Continent, type Discovery } from '../../types';
import type { CountryPresence } from '../../lib/explore';
import { cn } from '../../lib/cn';
import { CountryDetailModal } from './CountryDetailModal';

interface Props {
  userId: string;
  presenceByCountry: Map<string, CountryPresence>;
  myDiscoveries: Discovery[];
  friendDiscoveries: Discovery[];
  onAddTrip: (code: string) => void;
  onOpenDiscovery: (id: string) => void;
  onRecordLandmark: (countryCode: string, landmark: string) => void;
}

export function ExploreView({
  userId,
  presenceByCountry,
  myDiscoveries,
  friendDiscoveries,
  onAddTrip,
  onOpenDiscovery,
  onRecordLandmark,
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
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-passport-ink3"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search countries…"
          className="w-full pl-11 pr-3 py-3 rounded-2xl text-sm bg-white dark:bg-passport-carddark shadow-card focus:outline-none focus:ring-2 focus:ring-passport-gold/40 text-passport-ink dark:text-white/85 placeholder:text-passport-ink3"
        />
      </div>

      <div className="space-y-4">
        {CONTINENTS.map((continent) => {
          const list = byContinent.get(continent);
          if (!list || list.length === 0) return null;
          const isOpen = searching || open === continent;
          return (
            <section key={continent}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : continent)}
                className="w-full flex items-center justify-between px-1 py-1.5"
              >
                <span className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
                  {continent}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-passport-ink3">
                  {list.length}
                  <ChevronDown
                    size={18}
                    className={cn(
                      'transition-transform',
                      isOpen ? 'rotate-180' : '',
                    )}
                  />
                </span>
              </button>
              {isOpen && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
          myDiscoveries={myDiscoveries}
          friendDiscoveries={friendDiscoveries}
          onAddTrip={(code) => {
            setDetail(null);
            onAddTrip(code);
          }}
          onOpenDiscovery={(id) => {
            setDetail(null);
            onOpenDiscovery(id);
          }}
          onRecordLandmark={(code, landmark) => {
            setDetail(null);
            onRecordLandmark(code, landmark);
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
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative text-left rounded-2xl overflow-hidden bg-white dark:bg-passport-carddark shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all"
    >
      {/* Flag "stamp" band */}
      <div className="relative h-16 flex items-center justify-center bg-passport-goldpale dark:bg-white/5 overflow-hidden">
        <span className="text-4xl leading-none drop-shadow-sm transition-transform group-hover:scale-110">
          {flagEmoji(code)}
        </span>
        {visited && (
          <span
            className="absolute top-1.5 right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-white shadow-card"
            title="You've been here"
          >
            <Check size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="p-2.5">
        <div className="font-semibold text-[13px] text-passport-navy dark:text-white leading-tight line-clamp-2">
          {name}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-passport-ink3 min-h-[16px]">
          {friendCount > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Users size={11} /> {friendCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

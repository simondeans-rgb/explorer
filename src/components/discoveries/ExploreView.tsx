import { useMemo, useState } from 'react';
import { Check, Search, Users } from 'lucide-react';
import { COUNTRIES } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import { DestinationImage } from '../DestinationImage';
import { CONTINENTS, type Continent, type Discovery } from '../../types';
import type { CountryPresence } from '../../lib/explore';
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

const CONTINENT_BLURB: Record<Continent, string> = {
  Europe: 'Old towns, coastlines and café culture',
  Asia: 'Temples, street food and neon nights',
  Africa: 'Wild horizons and ancient wonders',
  'North America': 'Big cities and bigger landscapes',
  'South America': 'Mountains, rainforest and rhythm',
  Oceania: 'Islands, reefs and open road',
  Antarctica: 'The last great wilderness',
};

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
  const visitedCount = useMemo(() => {
    let n = 0;
    for (const p of presenceByCountry.values()) if (p.mine.length > 0) n += 1;
    return n;
  }, [presenceByCountry]);

  return (
    <div className="space-y-6">
      {/* Story-first header */}
      <header className="pt-1">
        <p className="text-sm font-semibold text-coral">
          {visitedCount > 0
            ? `${visitedCount} ${visitedCount === 1 ? 'country' : 'countries'} explored`
            : 'The whole world, waiting'}
        </p>
        <h1 className="font-display text-[2.1rem] leading-[1.05] font-semibold text-passport-navy dark:text-white max-w-[18ch]">
          Where to next?
        </h1>
      </header>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-passport-ink3"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search countries…"
          className="w-full pl-11 pr-3 py-3.5 rounded-2xl text-sm bg-white dark:bg-passport-carddark shadow-card focus:outline-none focus:ring-2 focus:ring-coral/40 text-passport-ink dark:text-white/85 placeholder:text-passport-ink3"
        />
      </div>

      {/* Per-continent carousels */}
      <div className="space-y-7">
        {CONTINENTS.map((continent) => {
          const list = byContinent.get(continent);
          if (!list || list.length === 0) return null;
          return (
            <section key={continent}>
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-display text-[1.5rem] font-semibold text-passport-navy dark:text-white tracking-tight">
                    {continent}
                  </h2>
                  <span className="text-xs font-semibold text-passport-ink3">
                    {list.length}
                  </span>
                </div>
                {!searching && (
                  <p className="text-xs text-passport-ink3 mt-0.5">
                    {CONTINENT_BLURB[continent]}
                  </p>
                )}
              </div>
              <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                {list.map((c) => (
                  <CountryCard
                    key={c.code}
                    code={c.code}
                    name={c.name}
                    presence={presenceByCountry.get(c.code)}
                    onOpen={() => setDetail(c.code)}
                  />
                ))}
              </div>
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

function CountryCard({
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
      className="group shrink-0 w-[180px] rounded-[1.6rem] overflow-hidden shadow-float active:scale-[0.98] transition-transform"
    >
      <DestinationImage
        code={code}
        className="h-52 flex flex-col text-white"
        scrim
      >
        {/* flag badge */}
        <div className="absolute top-3 left-3 text-2xl leading-none drop-shadow-md">
          {flagEmoji(code)}
        </div>
        {visited && (
          <div
            className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-coral shadow-card"
            title="You've been here"
          >
            <Check size={13} strokeWidth={3} />
          </div>
        )}
        <div className="mt-auto p-3.5">
          <div className="font-display text-lg font-semibold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            {name}
          </div>
          {friendCount > 0 && (
            <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-white/85">
              <Users size={11} /> {friendCount} friend
              {friendCount === 1 ? '' : 's'} been
            </div>
          )}
        </div>
      </DestinationImage>
    </button>
  );
}

import { useMemo, useState, type ReactNode } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
} from 'react-simple-maps';
import { useTheme } from '../../contexts/ThemeContext';
import {
  centroidByAlpha2,
  geoAlpha2,
  MAP_FILL_UNVISITED_DARK,
  MAP_FILL_UNVISITED_LIGHT,
  MAP_FILL_VISITED,
  MAP_STROKE_DARK,
  MAP_STROKE_LIGHT,
  worldTopology,
} from '../../lib/worldGeo';
import type { CountryAggregate } from '../../lib/stats';
import { airportInfo } from '../../data/airports';
import {
  JOURNEY_MODE_META,
  type Expedition,
  type JourneyMode,
} from '../../types';
import { JOURNEY_ICON } from '../expeditions/journeyIcons';
import { cn } from '../../lib/cn';

const PROJECTION_CONFIG = { scale: 150, center: [10, 8] as [number, number] };

function WorldMapCanvas({
  isVisited,
  children,
}: {
  isVisited: (alpha2: string | undefined) => boolean;
  children?: ReactNode;
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const unvisited = dark ? MAP_FILL_UNVISITED_DARK : MAP_FILL_UNVISITED_LIGHT;
  const stroke = dark ? MAP_STROKE_DARK : MAP_STROKE_LIGHT;

  return (
    <div className="overflow-hidden rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/10 dark:border-white/10 shadow-page">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={PROJECTION_CONFIG}
        width={800}
        height={380}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <Geographies geography={worldTopology}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = geoAlpha2(
                (geo.properties as { name?: string }).name,
              );
              const fill = isVisited(code) ? MAP_FILL_VISITED : unvisited;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={0.35}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill },
                    pressed: { outline: 'none', fill },
                  }}
                />
              );
            })
          }
        </Geographies>
        {children}
      </ComposableMap>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
  icon: Icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: typeof JOURNEY_ICON[JourneyMode];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors whitespace-nowrap',
        active
          ? 'bg-passport-navy text-passport-parchment border-passport-navy dark:bg-passport-gold dark:text-passport-ink dark:border-passport-gold'
          : 'border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-passport-gold/60',
      )}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );
}

function ScopeChips({
  scope,
  years,
  onChange,
}: {
  scope: 'all' | number;
  years: number[];
  onChange: (s: 'all' | number) => void;
}) {
  if (years.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      <Chip label="All time" active={scope === 'all'} onClick={() => onChange('all')} />
      {years.map((y) => (
        <Chip
          key={y}
          label={String(y)}
          active={scope === y}
          onClick={() => onChange(y)}
        />
      ))}
    </div>
  );
}

function Legend({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-passport-ink3 dark:text-white/45">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={{ background: MAP_FILL_VISITED }}
      />
      {count} {count === 1 ? 'country' : 'countries'}
    </div>
  );
}

// ── Passport map — countries coloured by where you've been ─────────────────
export function PassportMap({ aggregates }: { aggregates: CountryAggregate[] }) {
  const [scope, setScope] = useState<'all' | number>('all');

  const discovered = useMemo(
    () => aggregates.filter((a) => a.discovered),
    [aggregates],
  );
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const a of discovered) {
      if (a.firstYear) set.add(a.firstYear);
      for (const c of a.cities) if (c.firstYear) set.add(c.firstYear);
    }
    return [...set].sort((x, y) => y - x);
  }, [discovered]);

  const current = useMemo(() => {
    if (scope === 'all') return new Set(discovered.map((a) => a.code));
    return new Set(
      discovered
        .filter(
          (a) =>
            a.firstYear === scope ||
            a.cities.some((c) => c.firstYear === scope),
        )
        .map((a) => a.code),
    );
  }, [discovered, scope]);

  if (discovered.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <ScopeChips scope={scope} years={years} onChange={setScope} />
      <WorldMapCanvas isVisited={(c) => !!c && current.has(c)} />
      <Legend count={current.size} />
    </div>
  );
}

// ── Expedition map — visited fill + route lines, filterable by year & mode ──
function resolveCountry(label: string | undefined): string | undefined {
  if (!label) return undefined;
  const m = label.match(/\(([A-Z]{3})\)/);
  if (!m) return undefined;
  return airportInfo(m[1])?.country;
}

export function ExpeditionMap({ expeditions }: { expeditions: Expedition[] }) {
  const [scope, setScope] = useState<'all' | number>('all');
  const [mode, setMode] = useState<'all' | JourneyMode>('all');

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const e of expeditions) {
      const y = e.startDate
        ? new Date(e.startDate).getFullYear()
        : new Date(e.createdAt).getFullYear();
      if (!Number.isNaN(y)) set.add(y);
    }
    return [...set].sort((x, y) => y - x);
  }, [expeditions]);

  const modesPresent = useMemo(() => {
    const set = new Set<JourneyMode>();
    for (const e of expeditions) for (const j of e.journeys) set.add(j.mode);
    return [...set];
  }, [expeditions]);

  const scoped = useMemo(() => {
    if (scope === 'all') return expeditions;
    return expeditions.filter((e) => {
      const y = e.startDate
        ? new Date(e.startDate).getFullYear()
        : new Date(e.createdAt).getFullYear();
      return y === scope;
    });
  }, [expeditions, scope]);

  const visited = useMemo(() => {
    const set = new Set<string>();
    for (const e of scoped) for (const c of e.countryCodes) set.add(c);
    return set;
  }, [scoped]);

  const routes = useMemo(() => {
    const seen = new Set<string>();
    const segments: { from: [number, number]; to: [number, number] }[] = [];
    for (const e of scoped) {
      for (const j of e.journeys) {
        if (mode !== 'all' && j.mode !== mode) continue;
        const a = resolveCountry(j.from);
        const b = resolveCountry(j.to);
        if (!a || !b || a === b) continue;
        const from = centroidByAlpha2[a];
        const to = centroidByAlpha2[b];
        if (!from || !to) continue;
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (seen.has(key)) continue;
        seen.add(key);
        segments.push({ from, to });
      }
    }
    return segments;
  }, [scoped, mode]);

  if (expeditions.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <ScopeChips scope={scope} years={years} onChange={setScope} />
      {modesPresent.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <Chip label="All journeys" active={mode === 'all'} onClick={() => setMode('all')} />
          {modesPresent.map((m) => (
            <Chip
              key={m}
              label={JOURNEY_MODE_META[m].label}
              icon={JOURNEY_ICON[m]}
              active={mode === m}
              onClick={() => setMode(m)}
            />
          ))}
        </div>
      )}
      <WorldMapCanvas isVisited={(c) => !!c && visited.has(c)}>
        {routes.map((r, i) => (
          <Line
            key={i}
            from={r.from}
            to={r.to}
            stroke="#C9A84C"
            strokeWidth={1}
            strokeLinecap="round"
            strokeOpacity={0.7}
            fill="none"
          />
        ))}
      </WorldMapCanvas>
      <div className="flex items-center justify-between gap-2">
        <Legend count={visited.size} />
        {routes.length > 0 && (
          <span className="text-[11px] text-passport-ink3 dark:text-white/45">
            {routes.length} {routes.length === 1 ? 'route' : 'routes'}
          </span>
        )}
      </div>
    </div>
  );
}

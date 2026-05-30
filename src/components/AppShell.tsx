import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookMarked,
  Compass,
  LogOut,
  type LucideIcon,
  MapPinned,
  Moon,
  ScrollText,
  Sun,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePlaces } from '../hooks/usePlaces';
import { aggregateByCountry, computeStats } from '../lib/stats';
import { cn } from '../lib/cn';
import { PassportView } from './passport/PassportView';
import { AlmanacView } from './almanac/AlmanacView';
import { ExpeditionsView } from './expeditions/ExpeditionsView';
import { DiscoveriesView } from './discoveries/DiscoveriesView';

type Section = 'passport' | 'expeditions' | 'discoveries' | 'almanac';

const SECTIONS: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: 'passport', label: 'Passport', icon: BookMarked },
  { id: 'expeditions', label: 'Expeditions', icon: MapPinned },
  { id: 'discoveries', label: 'Discoveries', icon: Compass },
  { id: 'almanac', label: 'Almanac', icon: ScrollText },
];

export function AppShell() {
  const { user } = useAuth();
  const { places, loading } = usePlaces(user?.uid);
  const [section, setSection] = useState<Section>('passport');

  const aggregates = useMemo(() => aggregateByCountry(places), [places]);
  const stats = useMemo(() => computeStats(aggregates), [aggregates]);

  return (
    <div className="passport-bg fixed inset-0 flex flex-col">
      <Header />
      <Nav section={section} onChange={setSection} />
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
          {section === 'passport' && (
            <PassportView
              userId={user?.uid ?? ''}
              aggregates={aggregates}
              stats={stats}
              loading={loading}
            />
          )}
          {section === 'expeditions' && <ExpeditionsView />}
          {section === 'discoveries' && <DiscoveriesView />}
          {section === 'almanac' && (
            <AlmanacView places={places} aggregates={aggregates} stats={stats} />
          )}
        </div>
      </main>
    </div>
  );
}

function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <header
      className={cn(
        'h-14 px-4 sm:px-6 flex items-center justify-between shrink-0',
        'bg-passport-navy text-passport-parchment',
        'border-b border-black/20',
      )}
    >
      <div className="flex items-center gap-2">
        <Compass size={18} className="text-passport-goldsoft" />
        <div className="leading-none">
          <div className="font-display font-semibold tracking-tight">
            Explorer&rsquo;s Passport
          </div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-passport-goldsoft/80">
            Society of Discovery
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggle}
          className="p-2 rounded-full hover:bg-white/10 text-passport-parchment/80"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Member menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="h-8 w-8 rounded-full text-sm font-medium bg-white/10 text-passport-parchment hover:bg-white/20"
          >
            {initial}
          </button>

          {menuOpen && (
            <div
              className={cn(
                'absolute right-0 mt-2 w-60 rounded-xl p-2 shadow-page z-50',
                'bg-white/95 dark:bg-passport-carddark/95 backdrop-blur',
                'border border-black/5 dark:border-white/10',
                'text-passport-ink dark:text-white/85',
              )}
            >
              <div className="px-3 py-2 text-xs text-black/55 dark:text-white/55">
                <div className="uppercase tracking-[0.2em] text-[10px] text-passport-gold mb-0.5">
                  Member
                </div>
                <div className="truncate">{user?.email ?? 'Signed in'}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
                className={cn(
                  'w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                  'hover:bg-black/5 dark:hover:bg-white/10',
                )}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Nav({
  section,
  onChange,
}: {
  section: Section;
  onChange: (s: Section) => void;
}) {
  return (
    <nav className="shrink-0 bg-passport-navy/95 border-b border-black/20">
      <div className="mx-auto w-full max-w-3xl px-2 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const active = id === section;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-2.5 text-sm whitespace-nowrap transition-colors',
                active
                  ? 'text-passport-goldsoft'
                  : 'text-passport-parchment/60 hover:text-passport-parchment/90',
              )}
            >
              <Icon size={15} />
              {label}
              {active && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-passport-gold" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

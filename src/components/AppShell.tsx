import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookMarked,
  Compass,
  Globe2,
  LogOut,
  type LucideIcon,
  MapPinned,
  Moon,
  ScrollText,
  Sun,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePlaces } from '../hooks/usePlaces';
import { useDiscoveries } from '../hooks/useDiscoveries';
import { useExpeditions } from '../hooks/useExpeditions';
import { useConnections } from '../hooks/useConnections';
import { useProfile } from '../hooks/useProfile';
import { useFriendsData } from '../hooks/useFriendsData';
import { aggregateByCountry, computeStats } from '../lib/stats';
import { computeDiscoveryStats } from '../lib/discoveryStats';
import { computeJourneyStats } from '../lib/journeyStats';
import { acceptedFriends, friendsByCountry } from '../lib/friends';
import { buildCountryPresence } from '../lib/explore';
import { memberName } from '../lib/memberName';
import { cn } from '../lib/cn';
import { PassportView } from './passport/PassportView';
import { AlmanacView } from './almanac/AlmanacView';
import { ExpeditionsView } from './expeditions/ExpeditionsView';
import { DiscoveriesView } from './discoveries/DiscoveriesView';
import { FriendsView } from './friends/FriendsView';
import { WelcomeModal, type WelcomeChoice } from './WelcomeModal';
import { WorldlyLogo } from './Brand';

type Section =
  | 'passport'
  | 'expeditions'
  | 'discoveries'
  | 'friends'
  | 'almanac';

const SECTIONS: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: 'passport', label: 'Home', icon: BookMarked },
  { id: 'expeditions', label: 'Journeys', icon: MapPinned },
  { id: 'discoveries', label: 'Explore', icon: Compass },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'almanac', label: 'Almanac', icon: ScrollText },
];

export function AppShell() {
  const { user, demo } = useAuth();
  const myName = memberName(user?.email ?? '');
  const { places, loading } = usePlaces(user?.uid);
  const { discoveries, loading: discoveriesLoading } = useDiscoveries(
    user?.uid,
  );
  const { expeditions, loading: expeditionsLoading } = useExpeditions(
    user?.uid,
  );
  const { connections } = useConnections(user?.uid);
  const profile = useProfile(user?.uid, myName);
  const [section, setSection] = useState<Section>('passport');

  const aggregates = useMemo(() => aggregateByCountry(places), [places]);
  const stats = useMemo(() => computeStats(aggregates), [aggregates]);
  const discoveryStats = useMemo(
    () => computeDiscoveryStats(discoveries),
    [discoveries],
  );
  const journeyStats = useMemo(
    () => computeJourneyStats(expeditions),
    [expeditions],
  );

  const friends = useMemo(
    () => acceptedFriends(connections, user?.uid ?? ''),
    [connections, user?.uid],
  );
  const friendUids = useMemo(() => friends.map((f) => f.uid), [friends]);
  const friendsData = useFriendsData(friendUids);
  const friendCountryMap = useMemo(
    () => friendsByCountry(friends, friendsData.places, friendsData.discoveries),
    [friends, friendsData],
  );
  const presenceByCountry = useMemo(
    () =>
      buildCountryPresence(
        user?.uid ?? '',
        friends,
        places,
        discoveries,
        friendsData.places,
        friendsData.discoveries,
      ),
    [user?.uid, friends, places, discoveries, friendsData],
  );

  // Set when "Add a trip" is tapped on a country in Explore; routes to the
  // Journeys section and opens a pre-filled new-journey form.
  const [tripCountry, setTripCountry] = useState<string | null>(null);
  function startTrip(code: string) {
    setTripCountry(code);
    setSection('expeditions');
  }

  // Set when a discovery's place is tapped; routes to the Passport and focuses
  // that country (opening the city, if given).
  const [focusPlace, setFocusPlace] = useState<{
    code: string;
    city?: string;
  } | null>(null);
  function goToPlace(code: string, city?: string) {
    setFocusPlace({ code, city });
    setSection('passport');
  }

  // First-run welcome: shown once per Member when their Passport is empty,
  // surfacing the import options. The choice opens the right importer by setting
  // a one-shot flag the relevant view consumes on mount.
  const welcomeKey = user?.uid ? `explorer:welcomed:${user.uid}` : null;
  const [showWelcome, setShowWelcome] = useState(false);
  const [openImport, setOpenImport] = useState<'countries' | 'photos' | null>(
    null,
  );
  const [openFlighty, setOpenFlighty] = useState(false);

  useEffect(() => {
    if (!welcomeKey || loading) return;
    const fresh =
      places.length === 0 &&
      discoveries.length === 0 &&
      expeditions.length === 0;
    if (fresh && !localStorage.getItem(welcomeKey)) setShowWelcome(true);
  }, [welcomeKey, loading, places.length, discoveries.length, expeditions.length]);

  function dismissWelcome() {
    if (welcomeKey) {
      try {
        localStorage.setItem(welcomeKey, '1');
      } catch {
        /* ignore */
      }
    }
    setShowWelcome(false);
  }

  function chooseWelcome(choice: WelcomeChoice) {
    dismissWelcome();
    if (choice === 'flighty') {
      setSection('expeditions');
      setOpenFlighty(true);
    } else if (choice === 'countries' || choice === 'photos') {
      setSection('passport');
      setOpenImport(choice);
    }
    // 'fresh' just closes the welcome.
  }

  return (
    <div className="passport-bg fixed inset-0 flex flex-col">
      <TopBar onImport={() => setShowWelcome(true)} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 pt-2 pb-32 min-w-0">
          {section === 'passport' && (
            <PassportView
              userId={user?.uid ?? ''}
              places={places}
              discoveries={discoveries}
              expeditions={expeditions}
              aggregates={aggregates}
              stats={stats}
              discoveryStats={discoveryStats}
              expeditionCount={expeditions.length}
              friendCountryMap={friendCountryMap}
              openImport={openImport}
              onImportConsumed={() => setOpenImport(null)}
              focusPlace={focusPlace}
              onFocusConsumed={() => setFocusPlace(null)}
              loading={loading}
            />
          )}
          {section === 'expeditions' && (
            <ExpeditionsView
              userId={user?.uid ?? ''}
              expeditions={expeditions}
              discoveries={discoveries}
              places={places}
              newTripCountry={tripCountry}
              onNewTripConsumed={() => setTripCountry(null)}
              openImport={openFlighty}
              onImportConsumed={() => setOpenFlighty(false)}
              loading={expeditionsLoading}
            />
          )}
          {section === 'discoveries' && (
            <DiscoveriesView
              userId={user?.uid ?? ''}
              discoveries={discoveries}
              expeditions={expeditions}
              presenceByCountry={presenceByCountry}
              friendDiscoveries={friendsData.discoveries}
              onAddTrip={startTrip}
              onGoToPlace={goToPlace}
              loading={discoveriesLoading}
            />
          )}
          {section === 'friends' && (
            <FriendsView
              userId={user?.uid ?? ''}
              myName={myName}
              code={profile?.code ?? null}
              connections={connections}
              friendCountryMap={friendCountryMap}
              demo={demo}
            />
          )}
          {section === 'almanac' && (
            <AlmanacView
              places={places}
              aggregates={aggregates}
              stats={stats}
              discoveries={discoveries}
              discoveryStats={discoveryStats}
              expeditions={expeditions}
              journeyStats={journeyStats}
              memberName={myName}
            />
          )}
        </div>
      </main>

      <BottomNav section={section} onChange={setSection} />

      {showWelcome && (
        <WelcomeModal onChoose={chooseWelcome} onClose={dismissWelcome} />
      )}
    </div>
  );
}

function TopBar({ onImport }: { onImport: () => void }) {
  const { user, signOut, demo } = useAuth();
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
    <header className="shrink-0 h-16 px-4 sm:px-6 flex items-center justify-between">
      <WorldlyLogo size={30} />

      <div className="flex items-center gap-1.5">
        {demo && (
          <span className="mr-1 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.16em] bg-passport-gold/12 text-passport-gold">
            Demo
          </span>
        )}
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggle}
          className="h-10 w-10 inline-flex items-center justify-center rounded-full text-passport-ink2 dark:text-white/70 hover:bg-passport-navy/[0.06] dark:hover:bg-white/10 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Member menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="h-10 w-10 rounded-full text-sm font-bold bg-brand-gradient text-white shadow-card hover:opacity-90 active:scale-95 transition-all"
          >
            {initial}
          </button>

          {menuOpen && (
            <div
              className={cn(
                'absolute right-0 mt-2 w-64 rounded-2xl p-2 shadow-float z-50 animate-scale-in origin-top-right',
                'glass border border-white/40 dark:border-white/10',
                'text-passport-ink dark:text-white/85',
              )}
            >
              <div className="px-3 py-2.5">
                <div className="uppercase tracking-[0.18em] text-[10px] font-semibold text-passport-gold mb-0.5">
                  Signed in
                </div>
                <div className="truncate text-sm font-medium">
                  {user?.email ?? 'Member'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onImport();
                }}
                className="w-full inline-flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-passport-navy/[0.06] dark:hover:bg-white/10"
              >
                <Globe2 size={16} className="text-passport-gold" />
                Import travels
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
                className="w-full inline-flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-passport-navy/[0.06] dark:hover:bg-white/10"
              >
                <LogOut size={16} className="text-passport-ink3" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function BottomNav({
  section,
  onChange,
}: {
  section: Section;
  onChange: (s: Section) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto glass border border-white/50 dark:border-white/10 shadow-float rounded-full px-1.5 py-1.5 flex items-center gap-0.5">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const active = id === section;
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              onClick={() => onChange(id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 rounded-full transition-all duration-200',
                'w-[58px] h-[52px]',
                active
                  ? 'text-white'
                  : 'text-passport-ink3 dark:text-white/50 hover:text-passport-ink dark:hover:text-white/80',
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-full bg-brand-gradient shadow-card" />
              )}
              <Icon
                size={20}
                className="relative z-10"
                strokeWidth={active ? 2.4 : 2}
              />
              <span className="relative z-10 text-[9.5px] font-semibold tracking-tight">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

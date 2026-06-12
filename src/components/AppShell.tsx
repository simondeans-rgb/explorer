import { useEffect, useMemo, useState } from 'react';
import {
  BookMarked,
  ChevronLeft,
  Compass,
  Globe2,
  type LucideIcon,
  Plus,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePlaces } from '../hooks/usePlaces';
import { useDiscoveries } from '../hooks/useDiscoveries';
import { useExpeditions } from '../hooks/useExpeditions';
import { useCaptures } from '../hooks/useCaptures';
import { useSaved } from '../hooks/useSaved';
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
import { AtlasView } from './atlas/AtlasView';
import { AlmanacView } from './almanac/AlmanacView';
import { DiscoveriesView } from './discoveries/DiscoveriesView';
import { FriendsView } from './friends/FriendsView';
import { ProfileView } from './profile/ProfileView';
import { WelcomeModal, type WelcomeChoice } from './WelcomeModal';
import { QuickAddSheet } from './QuickAddSheet';
import {
  AddCaptureModal,
  type CaptureModalInitial,
} from './captures/AddCaptureModal';

type Section =
  | 'passport'
  | 'atlas'
  | 'discoveries'
  | 'friends'
  | 'almanac'
  | 'profile';

// The four bottom-nav tabs (a center "+" FAB sits between the middle two).
const NAV_TABS: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: 'passport', label: 'Story', icon: BookMarked },
  { id: 'atlas', label: 'Atlas', icon: Globe2 },
  { id: 'discoveries', label: 'Explore', icon: Compass },
  { id: 'profile', label: 'You', icon: UserRound },
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
  const { captures } = useCaptures(user?.uid);
  const { saved, isSaved, toggle: toggleSaved } = useSaved(user?.uid);
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

  // Which Atlas sub-tab to land on when navigating there.
  const [atlasTab, setAtlasTab] = useState<'places' | 'journeys'>('places');

  // Set when "Add a trip" is tapped on a country in Explore; routes to Atlas →
  // Journeys and opens a pre-filled new-journey form.
  const [tripCountry, setTripCountry] = useState<string | null>(null);
  function startTrip(code: string) {
    setTripCountry(code);
    setAtlasTab('journeys');
    setSection('atlas');
  }

  // Set when a discovery's place is tapped; routes to Atlas → Places and focuses
  // that country (opening the city, if given).
  const [focusPlace, setFocusPlace] = useState<{
    code: string;
    city?: string;
  } | null>(null);
  function goToPlace(code: string, city?: string) {
    setFocusPlace({ code, city });
    setAtlasTab('places');
    setSection('atlas');
  }

  // Quick-add ("+") — one-shot flags the destination view opens on arrival.
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [openAddPlace, setOpenAddPlace] = useState(false);
  const [openAddJourney, setOpenAddJourney] = useState(false);
  const [openAddDiscovery, setOpenAddDiscovery] = useState(false);
  const [captureModal, setCaptureModal] = useState<CaptureModalInitial | null>(
    null,
  );
  function quickAdd(
    choice: 'place' | 'journey' | 'discovery' | 'capture' | 'import',
  ) {
    setShowQuickAdd(false);
    if (choice === 'place') {
      setAtlasTab('places');
      setSection('atlas');
      setOpenAddPlace(true);
    } else if (choice === 'journey') {
      setAtlasTab('journeys');
      setSection('atlas');
      setOpenAddJourney(true);
    } else if (choice === 'discovery') {
      setSection('discoveries');
      setOpenAddDiscovery(true);
    } else if (choice === 'capture') {
      setCaptureModal({});
    } else {
      setShowWelcome(true);
    }
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
      setAtlasTab('journeys');
      setSection('atlas');
      setOpenFlighty(true);
    } else if (choice === 'countries' || choice === 'photos') {
      setSection('passport');
      setOpenImport(choice);
    }
    // 'fresh' just closes the welcome.
  }

  // Friends & Almanac are sub-pages of "You" — show a back bar. The four primary
  // tabs each render their own in-view header, so no extra chrome there.
  const subPage =
    section === 'friends'
      ? 'Friends'
      : section === 'almanac'
        ? 'Almanac'
        : null;

  return (
    <div className="passport-bg fixed inset-0 flex flex-col">
      {subPage && (
        <header className="shrink-0 h-14 px-4 sm:px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSection('profile')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-passport-navy dark:text-white"
          >
            <ChevronLeft size={20} /> {subPage}
          </button>
        </header>
      )}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div
          className={cn(
            'mx-auto w-full max-w-2xl px-4 sm:px-6 pb-32 min-w-0',
            section === 'passport' ? 'pt-0' : 'pt-1',
          )}
        >
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
              captures={captures}
              onAddCapture={() => setCaptureModal({})}
              saved={saved}
              isSaved={isSaved}
              onToggleSaved={toggleSaved}
              openImport={openImport}
              onImportConsumed={() => setOpenImport(null)}
              openAdd={openAddPlace && section === 'passport'}
              onAddConsumed={() => setOpenAddPlace(false)}
              onExplore={() => setSection('discoveries')}
              onOpenJourneys={() => {
                setAtlasTab('journeys');
                setSection('atlas');
              }}
              onOpenAtlas={() => {
                setAtlasTab('places');
                setSection('atlas');
              }}
              onOpenFriends={() => setSection('friends')}
              onOpenProfile={() => setSection('profile')}
              loading={loading}
            />
          )}
          {section === 'atlas' && (
            <AtlasView
              userId={user?.uid ?? ''}
              places={places}
              discoveries={discoveries}
              expeditions={expeditions}
              aggregates={aggregates}
              stats={stats}
              discoveryStats={discoveryStats}
              friendCountryMap={friendCountryMap}
              initialTab={atlasTab}
              openImport={openImport}
              onImportConsumed={() => setOpenImport(null)}
              focusPlace={focusPlace}
              onFocusConsumed={() => setFocusPlace(null)}
              openAddPlace={openAddPlace}
              onAddPlaceConsumed={() => setOpenAddPlace(false)}
              onExplore={() => setSection('discoveries')}
              newTripCountry={tripCountry}
              onNewTripConsumed={() => setTripCountry(null)}
              openFlighty={openFlighty}
              onFlightyConsumed={() => setOpenFlighty(false)}
              openAddJourney={openAddJourney}
              onAddJourneyConsumed={() => setOpenAddJourney(false)}
              loading={loading}
              expeditionsLoading={expeditionsLoading}
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
              openAdd={openAddDiscovery}
              onAddConsumed={() => setOpenAddDiscovery(false)}
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
          {section === 'profile' && (
            <ProfileView
              userId={user?.uid ?? ''}
              friendCount={friends.length}
              stats={stats}
              discoveryStats={discoveryStats}
              journeyStats={journeyStats}
              onOpenFriends={() => setSection('friends')}
              onOpenAlmanac={() => setSection('almanac')}
              onImport={() => setShowWelcome(true)}
            />
          )}
        </div>
      </main>

      <BottomNav
        section={section}
        onChange={setSection}
        onAdd={() => setShowQuickAdd(true)}
      />

      {showQuickAdd && (
        <QuickAddSheet
          onChoose={quickAdd}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {showWelcome && (
        <WelcomeModal onChoose={chooseWelcome} onClose={dismissWelcome} />
      )}

      {captureModal && (
        <AddCaptureModal
          userId={user?.uid ?? ''}
          initial={captureModal}
          expeditions={expeditions}
          onClose={() => setCaptureModal(null)}
        />
      )}
    </div>
  );
}


function BottomNav({
  section,
  onChange,
  onAdd,
}: {
  section: Section;
  onChange: (s: Section) => void;
  onAdd: () => void;
}) {
  const left = NAV_TABS.slice(0, 2);
  const right = NAV_TABS.slice(2);

  const Tab = ({
    id,
    label,
    icon: Icon,
  }: {
    id: Section;
    label: string;
    icon: LucideIcon;
  }) => {
    const active = id === section;
    return (
      <button
        type="button"
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        onClick={() => onChange(id)}
        className={cn(
          'flex flex-col items-center justify-center gap-1 w-16 transition-colors',
          active
            ? 'text-passport-gold'
            : 'text-passport-ink3 dark:text-white/50 hover:text-passport-ink dark:hover:text-white/80',
        )}
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        <span className="text-[10px] font-semibold tracking-tight">{label}</span>
      </button>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div className="pointer-events-auto glass shadow-[0_-8px_30px_rgba(20,33,61,0.08)] px-3 pt-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-md flex items-center justify-between">
          {left.map((t) => (
            <Tab key={t.id} {...t} />
          ))}
          <div className="flex flex-col items-center w-16">
            <button
              type="button"
              aria-label="Add"
              onClick={onAdd}
              className="-mt-8 h-14 w-14 rounded-full bg-brand-gradient text-white shadow-float grid place-items-center ring-[5px] ring-warmwhite dark:ring-passport-night active:scale-90 transition-transform"
            >
              <Plus size={26} strokeWidth={2.8} />
            </button>
            <span className="mt-0.5 text-[10px] font-semibold text-passport-ink3">
              Add
            </span>
          </div>
          {right.map((t) => (
            <Tab key={t.id} {...t} />
          ))}
        </div>
      </div>
    </nav>
  );
}

import {
  ChevronRight,
  Globe2,
  LogOut,
  type LucideIcon,
  Moon,
  ScrollText,
  Sun,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useProfilePhoto } from '../../hooks/useProfilePhoto';
import { memberName } from '../../lib/memberName';
import { cn } from '../../lib/cn';
import type { PassportStats } from '../../lib/stats';
import type { DiscoveryStats } from '../../lib/discoveryStats';
import type { JourneyStats } from '../../lib/journeyStats';
import {
  computeExplorerLevel,
  computeBadges,
  type Badge,
} from '../../lib/explorer';
import { ExplorerLevelCard } from './ExplorerLevelCard';

interface Props {
  userId: string;
  friendCount: number;
  stats: PassportStats;
  discoveryStats: DiscoveryStats;
  journeyStats: JourneyStats;
  onOpenFriends: () => void;
  onOpenAlmanac: () => void;
  onImport: () => void;
}

export function ProfileView({
  userId,
  friendCount,
  stats,
  discoveryStats,
  journeyStats,
  onOpenFriends,
  onOpenAlmanac,
  onImport,
}: Props) {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { photo } = useProfilePhoto(userId || undefined);
  const name = memberName(user?.email ?? '');

  const level = computeExplorerLevel(stats, discoveryStats, journeyStats);
  const badges = computeBadges({
    stats,
    discovery: discoveryStats,
    journeys: journeyStats,
  });
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Identity hero */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white shadow-float p-6 text-center">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/15"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="mx-auto h-20 w-20 rounded-full ring-4 ring-white/40 overflow-hidden bg-white/20 flex items-center justify-center shadow-card">
            {photo ? (
              <img src={photo} alt="You" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-3xl font-semibold">
                {name[0]?.toUpperCase() ?? 'E'}
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold capitalize">
            {name || 'Explorer'}
          </h1>
          <p className="text-sm text-white/80 mt-0.5 truncate">
            {user?.email ?? 'Worldly member'}
          </p>
        </div>
      </div>

      {/* Explorer level */}
      <ExplorerLevelCard level={level} />

      {/* Achievements */}
      <div className="space-y-3">
        <div className="flex items-end justify-between px-1">
          <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
            Achievements
          </h2>
          <span className="text-xs font-medium text-passport-ink3">
            {earnedCount}/{badges.length} earned
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {badges.map((b) => (
            <BadgeTile key={b.id} badge={b} />
          ))}
        </div>
      </div>

      {/* Hub links */}
      <div className="space-y-2.5">
        <HubCard
          icon={Users}
          title="Friends"
          subtitle={
            friendCount > 0
              ? `${friendCount} connected · see their recommendations`
              : 'Connect and share recommendations'
          }
          badge="from-rose-400 to-pink-500"
          onClick={onOpenFriends}
        />
        <HubCard
          icon={ScrollText}
          title="The Almanac"
          subtitle="Your travel story, by year and lifetime"
          badge="from-violet-400 to-indigo-500"
          onClick={onOpenAlmanac}
        />
        <HubCard
          icon={Globe2}
          title="Import travels"
          subtitle="Bring your places across from another app"
          badge="from-emerald-400 to-teal-500"
          onClick={onImport}
        />
      </div>

      {/* Account */}
      <div className="space-y-2.5">
        <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight px-1">
          Account
        </h2>
        <button
          type="button"
          onClick={toggle}
          className="w-full flex items-center gap-3 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-4 py-3.5"
        >
          <span className="h-10 w-10 rounded-full bg-passport-cartridge dark:bg-white/10 flex items-center justify-center text-passport-ink2 dark:text-white/70">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </span>
          <span className="flex-1 text-left font-semibold text-passport-navy dark:text-white">
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
          <ChevronRight size={18} className="text-passport-ink3" />
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          className="w-full flex items-center gap-3 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-4 py-3.5"
        >
          <span className="h-10 w-10 rounded-full bg-passport-cartridge dark:bg-white/10 flex items-center justify-center text-passport-burgundy">
            <LogOut size={18} />
          </span>
          <span className="flex-1 text-left font-semibold text-passport-burgundy">
            Sign out
          </span>
        </button>
      </div>
    </div>
  );
}

function HubCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3.5 rounded-3xl bg-white dark:bg-passport-carddark shadow-card px-4 py-4 hover:shadow-card-hover active:scale-[0.99] transition-all"
    >
      <span
        className={cn(
          'h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-card bg-gradient-to-br shrink-0',
          badge,
        )}
      >
        <Icon size={22} strokeWidth={2.2} />
      </span>
      <span className="flex-1 min-w-0 text-left">
        <span className="block font-semibold text-passport-navy dark:text-white">
          {title}
        </span>
        <span className="block text-xs text-passport-ink3 mt-0.5 truncate">
          {subtitle}
        </span>
      </span>
      <ChevronRight size={18} className="text-passport-ink3 shrink-0" />
    </button>
  );
}

function BadgeTile({ badge }: { badge: Badge }) {
  const pct = Math.round(badge.progress * 100);
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl px-2.5 py-3 text-center shadow-card transition-all',
        badge.earned
          ? 'bg-white dark:bg-passport-carddark'
          : 'bg-passport-cartridge/60 dark:bg-white/5',
      )}
      title={badge.description}
    >
      <div
        className={cn(
          'mx-auto mb-1.5 flex h-11 w-11 items-center justify-center rounded-full text-2xl',
          badge.earned
            ? 'bg-brand-gradient shadow-card'
            : 'bg-black/5 dark:bg-white/10 grayscale opacity-50',
        )}
      >
        <span aria-hidden="true">{badge.emoji}</span>
      </div>
      <p
        className={cn(
          'text-[0.7rem] font-semibold leading-tight',
          badge.earned
            ? 'text-passport-navy dark:text-white'
            : 'text-passport-ink3',
        )}
      >
        {badge.title}
      </p>
      {!badge.earned && (
        <div className="mt-1.5 h-1 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-passport-gold/70"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

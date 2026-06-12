import { ArrowUpRight, Heart, Sparkles, UserPlus } from 'lucide-react';
import type { ExplorerLevel } from '../../../lib/explorer';
import { DestinationImage } from '../../DestinationImage';
import { WorldlyMark } from '../../Brand';
import { countryName } from '../../../data/countries';
import { cn } from '../../../lib/cn';

export interface FriendRec {
  code: string;
  friend: string;
  name: string;
}

export function HighlightsRow({
  level,
  onOpenProfile,
  friendRec,
  onOpenFriendRec,
  onInviteFriends,
  saved,
  onToggleSaved,
}: {
  level: ExplorerLevel;
  onOpenProfile: () => void;
  friendRec?: FriendRec;
  onOpenFriendRec: () => void;
  onInviteFriends: () => void;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3.5">
      <MilestoneCard level={level} onOpen={onOpenProfile} />
      {friendRec ? (
        <FriendRecommendCard
          rec={friendRec}
          onOpen={onOpenFriendRec}
          saved={saved}
          onToggleSaved={onToggleSaved}
        />
      ) : (
        <InviteFriendsCard onOpen={onInviteFriends} />
      )}
    </div>
  );
}

function MilestoneCard({
  level,
  onOpen,
}: {
  level: ExplorerLevel;
  onOpen: () => void;
}) {
  const pct = Math.round(level.progress * 100);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white shadow-float p-4 text-left active:scale-[0.98] transition-transform min-h-[172px] flex flex-col"
    >
      {/* faint globe + confetti accents */}
      <WorldlyMark
        size={120}
        className="pointer-events-none absolute -right-6 -bottom-6 opacity-20"
      />
      <span className="pointer-events-none absolute left-6 top-9 h-2 w-2 rounded-full bg-sunburst" />
      <span className="pointer-events-none absolute right-8 top-5 h-1.5 w-1.5 rounded-full bg-white/80" />
      <span className="pointer-events-none absolute right-14 top-12 h-2 w-2 rounded-sm rotate-12 bg-aqua" />

      <p className="relative flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">
        <Sparkles size={12} /> Milestone
      </p>
      <p className="relative mt-1 font-display text-[2.6rem] leading-none font-semibold">
        {level.level}
      </p>
      <p className="relative text-sm font-semibold leading-tight">{level.title}</p>

      <div className="relative mt-auto pt-3">
        <div className="h-1.5 w-full rounded-full bg-white/25 overflow-hidden">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${level.maxed ? 100 : pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-white/85">
          {level.maxed ? 'Max level reached' : 'See your achievements →'}
        </p>
      </div>
    </button>
  );
}

function FriendRecommendCard({
  rec,
  onOpen,
  saved,
  onToggleSaved,
}: {
  rec: FriendRec;
  onOpen: () => void;
  saved: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-passport-carddark shadow-card min-h-[172px] flex flex-col">
      <DestinationImage code={rec.code} className="h-20 flex">
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        {/* friend avatar */}
        <span className="absolute -bottom-4 left-3 h-9 w-9 rounded-full bg-brand-gradient ring-2 ring-white grid place-items-center text-xs font-bold text-white capitalize shadow-card">
          {rec.friend[0] ?? '?'}
        </span>
        <button
          type="button"
          onClick={onToggleSaved}
          aria-label={saved ? 'Saved' : 'Save'}
          aria-pressed={saved}
          className="absolute right-2.5 top-2.5 h-8 w-8 grid place-items-center rounded-full glass text-white active:scale-90 transition-transform"
        >
          <Heart size={15} className={cn(saved && 'fill-coral text-coral')} />
        </button>
      </DestinationImage>

      <button
        type="button"
        onClick={onOpen}
        className="flex-1 flex flex-col px-3.5 pt-5 pb-3.5 text-left active:opacity-90"
      >
        <p className="text-[11px] font-semibold text-passport-ink3 capitalize">
          {rec.friend} recommends
        </p>
        <h3 className="mt-0.5 font-display text-[1.05rem] font-semibold leading-tight text-passport-navy dark:text-white line-clamp-2">
          {rec.name}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-passport-ink3 line-clamp-1">
            {countryName(rec.code)}
          </span>
          <span className="h-7 w-7 grid place-items-center rounded-full bg-passport-cartridge dark:bg-white/10 text-coral shrink-0">
            <ArrowUpRight size={15} />
          </span>
        </div>
      </button>
    </div>
  );
}

function InviteFriendsCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative overflow-hidden rounded-3xl bg-white dark:bg-passport-carddark shadow-card min-h-[172px] flex flex-col items-start justify-between p-4 text-left active:scale-[0.98] transition-transform"
    >
      <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-aqua to-lavender grid place-items-center text-white shadow-card">
        <UserPlus size={20} />
      </span>
      <div>
        <h3 className="font-display text-[1.05rem] font-semibold leading-tight text-passport-navy dark:text-white">
          Travel together
        </h3>
        <p className="mt-1 text-xs font-medium text-passport-ink3">
          Connect with friends to see what they loved.
        </p>
      </div>
    </button>
  );
}

import { DestinationImage } from '../../DestinationImage';

export interface FriendActivityItem {
  id: string;
  uid: string;
  name: string;
  kind: 'place' | 'discovery';
  label: string;
  code: string;
  createdAt: number;
}

function relTime(ms: number): string {
  const d = Math.floor((Date.now() - ms) / 86_400_000);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/** "Fresh from your circle" — recent places & discoveries from friends, the
 *  social reason to come back. Tap a card to open that friend's profile. */
export function FriendActivityRail({
  items,
  onOpenFriend,
}: {
  items: FriendActivityItem[];
  onOpenFriend: (uid: string, name: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
        Fresh from your circle
      </h2>
      <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onOpenFriend(it.uid, it.name)}
            className="shrink-0 w-[152px] rounded-[1.6rem] overflow-hidden shadow-float active:scale-[0.98] transition-transform text-left"
          >
            <DestinationImage
              code={it.code}
              className="h-48 flex flex-col text-white"
              scrim
            >
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full glass pl-1 pr-2.5 py-0.5 text-[11px] font-semibold text-white capitalize">
                <span className="h-5 w-5 rounded-full bg-brand-gradient grid place-items-center text-[10px] font-bold">
                  {it.name[0] ?? '?'}
                </span>
                {it.name}
              </span>
              <div className="mt-auto p-3.5">
                <div className="text-[11px] font-medium text-white/80">
                  {it.kind === 'place' ? 'Visited' : 'Recommends'}
                </div>
                <div className="font-display text-base font-semibold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] line-clamp-2">
                  {it.label}
                </div>
                <div className="text-[11px] font-medium text-white/70 mt-0.5">
                  {relTime(it.createdAt)}
                </div>
              </div>
            </DestinationImage>
          </button>
        ))}
      </div>
    </section>
  );
}

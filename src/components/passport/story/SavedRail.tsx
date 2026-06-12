import { Bookmark } from 'lucide-react';
import type { SavedItem } from '../../../lib/saved';
import { DestinationImage } from '../../DestinationImage';
import { countryName } from '../../../data/countries';

/** Horizontal rail of the Member's saved bookmarks — recommendations and
 *  memories they want to return to. Tapping the bookmark removes it. */
export function SavedRail({
  saved,
  onRemove,
}: {
  saved: SavedItem[];
  onRemove: (item: SavedItem) => void;
}) {
  if (saved.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
        Saved &amp; wishlist
      </h2>
      <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {saved.slice(0, 12).map((s) => {
          const place = [s.city, s.countryCode ? countryName(s.countryCode) : null]
            .filter(Boolean)
            .join(', ');
          return (
            <div
              key={s.id}
              className="relative shrink-0 w-[150px] rounded-[1.6rem] overflow-hidden shadow-float"
            >
              <DestinationImage
                code={s.countryCode ?? ''}
                className="h-44 flex flex-col text-white"
                scrim
              >
                <button
                  type="button"
                  onClick={() => onRemove(s)}
                  aria-label="Remove from saved"
                  className="absolute right-2.5 top-2.5 h-8 w-8 grid place-items-center rounded-full glass text-white active:scale-90 transition-transform"
                >
                  <Bookmark size={15} className="fill-coral text-coral" />
                </button>
                <div className="mt-auto p-3.5">
                  <div className="font-display text-base font-semibold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] line-clamp-2">
                    {s.name}
                  </div>
                  {place && (
                    <div className="text-[11px] font-medium text-white/85 mt-0.5 line-clamp-1">
                      {place}
                    </div>
                  )}
                </div>
              </DestinationImage>
            </div>
          );
        })}
      </div>
    </section>
  );
}

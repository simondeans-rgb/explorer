import { Bookmark, Compass } from 'lucide-react';
import type { SavedItem, SavedKind } from '../../lib/saved';
import { DestinationImage } from '../DestinationImage';
import { PageHero } from '../PageHero';
import { countryName } from '../../data/countries';

const KIND_LABEL: Record<SavedKind, string> = {
  recommendation: 'Recommendation',
  memory: 'Memory',
  place: 'Place',
  discovery: 'Discovery',
};

/** The full "Saved & wishlist" collection — everything the Member bookmarked,
 *  reached from the You hub. */
export function SavedView({
  saved,
  onRemove,
  onBack,
  onExplore,
}: {
  saved: SavedItem[];
  onRemove: (item: SavedItem) => void;
  onBack?: () => void;
  onExplore?: () => void;
}) {
  const hero = (
    <PageHero
      eyebrow="Your collection"
      title="Saved & wishlist"
      subtitle={
        saved.length > 0
          ? `${saved.length} saved · tap a bookmark to remove`
          : 'Places and memories you want to keep'
      }
      icon={Bookmark}
      gradient="bg-[linear-gradient(135deg,#9B7CFF_0%,#FF6B9A_100%)]"
      onBack={onBack}
    />
  );

  if (saved.length === 0) {
    return (
      <div className="animate-fade-in space-y-5">
        {hero}
        <div className="rounded-3xl bg-white dark:bg-passport-carddark shadow-card p-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-3xl bg-brand-gradient flex items-center justify-center shadow-card">
            <Bookmark size={26} className="text-white" />
          </div>
          <p className="font-display text-xl font-semibold text-passport-navy dark:text-white mb-1.5">
            Nothing saved yet
          </p>
          <p className="text-sm text-passport-ink2 dark:text-white/60 max-w-xs mx-auto mb-6">
            Tap the heart on a friend&rsquo;s recommendation or the bookmark on a
            memory to keep it here — and watch it light up your map.
          </p>
          {onExplore && (
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-gradient text-white font-semibold shadow-card hover:opacity-95 active:scale-[0.99] transition-all"
            >
              <Compass size={17} /> Find places to save
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      {hero}
      <div className="grid grid-cols-2 gap-3.5">
        {saved.map((s) => {
          const place = [s.city, s.countryCode ? countryName(s.countryCode) : null]
            .filter(Boolean)
            .join(', ');
          return (
            <div
              key={s.id}
              className="overflow-hidden rounded-3xl bg-white dark:bg-passport-carddark shadow-card"
            >
              <DestinationImage code={s.countryCode ?? ''} className="h-28 flex">
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                <button
                  type="button"
                  onClick={() => onRemove(s)}
                  aria-label="Remove from saved"
                  className="absolute right-2.5 top-2.5 h-8 w-8 grid place-items-center rounded-full glass text-white active:scale-90 transition-transform"
                >
                  <Bookmark size={15} className="fill-coral text-coral" />
                </button>
              </DestinationImage>
              <div className="p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-coral">
                  {KIND_LABEL[s.kind]}
                </p>
                <h3 className="mt-0.5 font-display text-[1.05rem] font-semibold leading-tight text-passport-navy dark:text-white line-clamp-2">
                  {s.name}
                </h3>
                {place && (
                  <p className="mt-1 text-xs font-medium text-passport-ink3 line-clamp-1">
                    {place}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

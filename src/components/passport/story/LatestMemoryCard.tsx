import { useState } from 'react';
import { Bookmark, MapPin } from 'lucide-react';
import { DestinationImage } from '../../DestinationImage';
import { cn } from '../../../lib/cn';

export interface LatestMemory {
  /** Photo data URL (captures) — falls back to destination imagery by code. */
  image?: string;
  code: string;
  title: string;
  place?: string;
  dateLabel?: string;
  eyebrow: string;
}

export function LatestMemoryCard({
  memory,
  onOpen,
}: {
  memory: LatestMemory;
  onOpen?: () => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <section className="space-y-3">
      <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
        Latest memory
      </h2>
      <div className="relative flex overflow-hidden rounded-3xl bg-white dark:bg-passport-carddark shadow-card">
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 w-32 sm:w-40 self-stretch active:opacity-95"
          aria-label={memory.title}
        >
          {memory.image ? (
            <img
              src={memory.image}
              alt={memory.title}
              className="h-full w-full object-cover vivid-photo"
            />
          ) : (
            <DestinationImage code={memory.code} className="h-full min-h-[136px]" />
          )}
        </button>

        <div className="flex-1 min-w-0 p-4 flex flex-col">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-coral">
            {memory.eyebrow}
          </p>
          <button
            type="button"
            onClick={onOpen}
            className="text-left active:opacity-90"
          >
            <h3 className="mt-1 font-display text-[1.25rem] font-semibold leading-tight text-passport-navy dark:text-white line-clamp-2">
              {memory.title}
            </h3>
          </button>
          {memory.place && (
            <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-passport-ink2 dark:text-white/70">
              <MapPin size={14} className="text-coral shrink-0" />
              <span className="line-clamp-1">{memory.place}</span>
            </p>
          )}
          {memory.dateLabel && (
            <p className="mt-auto pt-2 text-xs font-medium text-passport-ink3">
              {memory.dateLabel}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          aria-label={saved ? 'Saved' : 'Save'}
          aria-pressed={saved}
          className="absolute right-3 top-3 h-9 w-9 grid place-items-center rounded-full bg-passport-cartridge dark:bg-white/10 text-passport-ink2 dark:text-white/70 active:scale-90 transition-transform"
        >
          <Bookmark size={16} className={cn(saved && 'fill-coral text-coral')} />
        </button>
      </div>
    </section>
  );
}

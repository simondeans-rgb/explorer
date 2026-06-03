import { useEffect, useState } from 'react';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';
import type { Capture } from '../../types';
import { deleteCapture } from '../../lib/captures';
import { countryName } from '../../data/countries';
import { flagEmoji } from '../../lib/flags';
import { cn } from '../../lib/cn';

/** Horizontal rail of photo captures with an "add" tile. Tapping a photo opens
 *  a lightbox with its caption/place and a remove action. */
export function CapturesRail({
  captures,
  onAdd,
  className,
}: {
  captures: Capture[];
  onAdd: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState<Capture | null>(null);

  return (
    <div className={className}>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 h-28 w-28 rounded-2xl bg-white dark:bg-white/5 shadow-card grid place-items-center text-passport-ink3 hover:shadow-card-hover active:scale-[0.98] transition-all"
        >
          <span className="flex flex-col items-center gap-1">
            <Plus size={22} />
            <span className="text-xs font-medium">Add photo</span>
          </span>
        </button>
        {captures.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setOpen(c)}
            className="relative shrink-0 h-28 w-28 overflow-hidden rounded-2xl shadow-card active:scale-[0.98] transition-all"
          >
            <img
              src={c.dataUrl}
              alt={c.caption ?? 'Captured moment'}
              loading="lazy"
              className="h-full w-full object-cover vivid-photo"
            />
            {c.countryCode && (
              <span className="absolute bottom-1 left-1 rounded-full bg-black/45 px-1.5 py-0.5 text-xs backdrop-blur-sm">
                {flagEmoji(c.countryCode)}
              </span>
            )}
          </button>
        ))}
      </div>

      {open && (
        <CaptureLightbox capture={open} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}

function CaptureLightbox({
  capture,
  onClose,
}: {
  capture: Capture;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleDelete() {
    if (busy) return;
    setBusy(true);
    try {
      await deleteCapture(capture.id);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  const place = [capture.city, capture.countryCode && countryName(capture.countryCode)]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg animate-rise-in"
      >
        <div className="relative overflow-hidden rounded-3xl shadow-float bg-black">
          <img
            src={capture.dataUrl}
            alt={capture.caption ?? 'Captured moment'}
            className="w-full max-h-[70vh] object-contain"
          />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3 px-1">
          <div className="min-w-0">
            {capture.caption && (
              <p className="font-display text-lg text-white leading-snug">
                {capture.caption}
              </p>
            )}
            {place && (
              <p className={cn('text-sm text-white/70', capture.caption && 'mt-0.5')}>
                {capture.countryCode && `${flagEmoji(capture.countryCode)} `}
                {place}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="inline-flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl text-sm text-white/90 bg-white/10 hover:bg-red-500/30 disabled:opacity-50"
          >
            <Trash2 size={15} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/** Empty-state CTA used when there are no captures yet. */
export function CapturesEmptyCta({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="w-full flex items-center gap-3 rounded-2xl bg-white dark:bg-white/5 shadow-card px-4 py-3.5 hover:shadow-card-hover active:scale-[0.99] transition-all"
    >
      <span className="h-10 w-10 rounded-full bg-brand-gradient grid place-items-center text-white shrink-0">
        <ImagePlus size={18} />
      </span>
      <span className="text-left">
        <span className="block font-semibold text-passport-navy dark:text-white">
          Capture a moment
        </span>
        <span className="block text-xs text-passport-ink3">
          Add a photo from your travels
        </span>
      </span>
    </button>
  );
}

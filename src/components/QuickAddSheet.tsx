import { useEffect } from 'react';
import {
  BookMarked,
  CalendarPlus,
  Camera,
  Compass,
  Globe2,
  type LucideIcon,
  MapPinned,
  X,
} from 'lucide-react';
import { cn } from '../lib/cn';

export type QuickAddChoice =
  | 'place'
  | 'journey'
  | 'discovery'
  | 'capture'
  | 'trip'
  | 'import';

const OPTIONS: {
  id: QuickAddChoice;
  icon: LucideIcon;
  title: string;
  blurb: string;
  badge: string;
}[] = [
  { id: 'place', icon: BookMarked, title: 'Add a place', blurb: 'A country or city you’ve been to', badge: 'from-emerald-400 to-teal-500' },
  { id: 'journey', icon: MapPinned, title: 'Log a journey', blurb: 'A trip, with how you travelled', badge: 'from-amber-400 to-orange-500' },
  { id: 'discovery', icon: Compass, title: 'Record a discovery', blurb: 'A place or experience worth keeping', badge: 'from-violet-400 to-indigo-500' },
  { id: 'capture', icon: Camera, title: 'Add a photo', blurb: 'A moment from your travels', badge: 'from-sky-400 to-blue-500' },
  { id: 'trip', icon: CalendarPlus, title: 'Plan a trip', blurb: 'An upcoming adventure, with a countdown', badge: 'from-coral to-sunburst' },
  { id: 'import', icon: Globe2, title: 'Import travels', blurb: 'Bring data from another app', badge: 'from-rose-400 to-pink-500' },
];

export function QuickAddSheet({
  onChoose,
  onClose,
}: {
  onChoose: (c: QuickAddChoice) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-float animate-rise-in bg-passport-cartridge dark:bg-passport-carddark p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between px-1 pb-3">
          <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white">
            Add to Worldly
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-white dark:bg-white/10 shadow-card text-passport-ink2 dark:text-white/70"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2.5">
          {OPTIONS.map(({ id, icon: Icon, title, blurb, badge }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChoose(id)}
              className="w-full flex items-center gap-3.5 rounded-2xl bg-white dark:bg-white/[0.04] shadow-card px-4 py-3.5 hover:shadow-card-hover active:scale-[0.99] transition-all"
            >
              <span
                className={cn(
                  'h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow-card bg-gradient-to-br shrink-0',
                  badge,
                )}
              >
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block font-semibold text-passport-navy dark:text-white">
                  {title}
                </span>
                <span className="block text-xs text-passport-ink3 mt-0.5">
                  {blurb}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

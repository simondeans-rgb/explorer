import { useEffect } from 'react';
import {
  Globe2,
  Images,
  type LucideIcon,
  Plane,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { WorldlyMark } from './Brand';

export type WelcomeChoice = 'countries' | 'flighty' | 'photos' | 'fresh';

interface Props {
  onChoose: (choice: WelcomeChoice) => void;
  onClose: () => void;
}

const OPTIONS: {
  id: WelcomeChoice;
  icon: LucideIcon;
  title: string;
  blurb: string;
}[] = [
  {
    id: 'countries',
    icon: Globe2,
    title: 'Paste your countries',
    blurb: 'Bring a list from Been or any tracker — your map fills in at once.',
  },
  {
    id: 'flighty',
    icon: Plane,
    title: 'Import flights from Flighty',
    blurb: 'Turn a Flighty CSV into journeys, countries and cities.',
  },
  {
    id: 'photos',
    icon: Images,
    title: 'Scan your photos',
    blurb: 'Read the places from your gallery’s photos — on your device.',
  },
];

export function WelcomeModal({ onChoose, onClose }: Props) {
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
        className={cn(
          'w-full sm:max-w-md max-h-[92vh] overflow-y-auto no-scrollbar',
          'rounded-t-3xl sm:rounded-3xl shadow-float animate-rise-in',
          'bg-passport-cartridge dark:bg-passport-carddark',
        )}
      >
        <div className="relative overflow-hidden bg-brand-gradient text-white px-6 py-7 text-center">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/20"
            aria-hidden="true"
          />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 h-9 w-9 inline-flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <X size={18} />
          </button>
          <WorldlyMark size={40} className="mx-auto mb-3" />
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75 mb-1">
            Welcome to Worldly
          </div>
          <h2 className="font-display text-2xl font-semibold">
            Bring your world with you
          </h2>
          <p className="text-sm text-white/80 mt-1.5 max-w-xs mx-auto">
            Already track your travels elsewhere? Bring them across in seconds.
          </p>
        </div>

        <div className="px-4 py-4 space-y-2.5">
          {OPTIONS.map(({ id, icon: Icon, title, blurb }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChoose(id)}
              className="group w-full flex items-center gap-3.5 text-left rounded-2xl bg-white dark:bg-white/[0.04] shadow-card px-4 py-3.5 hover:shadow-card-hover active:scale-[0.99] transition-all"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-passport-goldpale dark:bg-white/10 text-passport-gold shrink-0">
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-passport-navy dark:text-white">
                  {title}
                </span>
                <span className="block text-xs text-passport-ink3 dark:text-white/50 mt-0.5">
                  {blurb}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="px-5 pb-5 pt-1 text-center">
          <button
            type="button"
            onClick={() => onChoose('fresh')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-passport-navy dark:text-passport-goldsoft hover:underline"
          >
            <Plus size={15} /> Start fresh instead
          </button>
        </div>
      </div>
    </div>
  );
}

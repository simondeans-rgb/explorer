import { useEffect } from 'react';
import {
  Compass,
  Globe2,
  Images,
  type LucideIcon,
  Plane,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '../lib/cn';

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
          'rounded-t-2xl sm:rounded-2xl shadow-page animate-rise-in',
          'bg-passport-card dark:bg-passport-carddark',
          'border border-black/5 dark:border-white/10',
        )}
      >
        <div className="relative bg-passport-navy text-passport-parchment px-5 py-6 text-center">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-white/10 text-passport-parchment/70"
          >
            <X size={18} />
          </button>
          <Compass size={26} className="mx-auto text-passport-goldsoft mb-2" />
          <div className="text-[10px] uppercase tracking-[0.28em] text-passport-goldsoft mb-1">
            Welcome, Explorer
          </div>
          <h2 className="font-display text-2xl font-semibold">
            Begin your Passport
          </h2>
          <p className="text-sm text-passport-parchment/70 mt-1.5 max-w-xs mx-auto">
            Already track your travels elsewhere? Bring them across in seconds.
          </p>
        </div>

        <div className="px-5 py-4 space-y-2">
          {OPTIONS.map(({ id, icon: Icon, title, blurb }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChoose(id)}
              className="w-full flex items-center gap-3 text-left rounded-xl border border-black/10 dark:border-white/10 px-4 py-3 hover:border-passport-gold/60 hover:bg-passport-gold/[0.04] transition-colors"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-passport-navy/[0.06] dark:bg-white/[0.08] text-passport-navy dark:text-passport-goldsoft shrink-0">
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-passport-navy dark:text-white/90">
                  {title}
                </span>
                <span className="block text-xs text-passport-ink3 dark:text-white/50">
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

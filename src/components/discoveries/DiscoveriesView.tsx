import {
  Compass,
  Landmark,
  type LucideIcon,
  Mountain,
  Sparkles,
  Ticket,
  UtensilsCrossed,
} from 'lucide-react';

const CATEGORIES: { icon: LucideIcon; title: string; detail: string }[] = [
  { icon: UtensilsCrossed, title: 'Food & Drink', detail: 'Restaurants, cafés, bars, bakeries, wineries.' },
  { icon: Sparkles, title: 'Accommodation', detail: 'Hotels, resorts, apartments, cruise ships.' },
  { icon: Landmark, title: 'Culture', detail: 'Museums, galleries, historic sites, monuments.' },
  { icon: Ticket, title: 'Experiences', detail: 'Tours, activities, shows, concerts, festivals.' },
  { icon: Mountain, title: 'Nature', detail: 'Beaches, parks, viewpoints, national parks.' },
];

const VERDICTS: { label: string; detail: string }[] = [
  { label: 'Recommend', detail: 'Must visit.' },
  { label: 'Hidden Gem', detail: 'Underappreciated.' },
  { label: 'Worth Visiting', detail: 'A good option.' },
  { label: 'Overrated', detail: 'Not as good as expected.' },
  { label: 'Avoid', detail: "Wouldn't recommend." },
];

export function DiscoveriesView() {
  return (
    <div className="animate-fade-in space-y-6">
      <header className="text-center">
        <Compass size={26} className="mx-auto text-passport-gold mb-2" />
        <h1 className="font-display text-3xl text-passport-navy dark:text-white/90">
          Discoveries
        </h1>
        <p className="text-sm text-black/55 dark:text-white/55 mt-1 max-w-md mx-auto">
          A Discovery is any place or experience worth remembering — and your
          recommendations become the most valuable guide your friends will ever
          have.
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-passport-gold/40 bg-passport-card/60 dark:bg-passport-carddark/60 p-5 text-center">
        <span className="inline-block text-[11px] uppercase tracking-[0.24em] text-passport-gold mb-1">
          Coming soon
        </span>
        <p className="text-sm text-black/60 dark:text-white/60">
          Discoveries attach to the countries and cities already in your
          Passport, and to your Expeditions.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-passport-navy dark:text-white/90">
          Categories
        </h2>
        <div className="gold-rule w-24" />
        <div className="grid sm:grid-cols-2 gap-2">
          {CATEGORIES.map(({ icon: Icon, title, detail }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-xl bg-passport-card dark:bg-passport-carddark border border-black/5 dark:border-white/10 p-4 shadow-page"
            >
              <Icon size={18} className="text-passport-gold mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-passport-navy dark:text-white/90">
                  {title}
                </div>
                <div className="text-xs text-black/50 dark:text-white/50">
                  {detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl text-passport-navy dark:text-white/90">
          Recommendations
        </h2>
        <div className="gold-rule w-24" />
        <div className="flex flex-wrap gap-2">
          {VERDICTS.map((v) => (
            <span
              key={v.label}
              title={v.detail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-passport-gold/10 text-passport-navy dark:text-passport-goldsoft border border-passport-gold/30"
            >
              {v.label}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

import {
  Anchor,
  Car,
  type LucideIcon,
  MapPinned,
  Plane,
  Ship,
  TrainFront,
} from 'lucide-react';

const JOURNEYS: { icon: LucideIcon; title: string; detail: string }[] = [
  { icon: Plane, title: 'Flights', detail: 'Airline, flight number, airports, aircraft, cabin & seat.' },
  { icon: TrainFront, title: 'Rail', detail: 'Operator, route, stations and class.' },
  { icon: Ship, title: 'Cruises', detail: 'Cruise line, ship, itinerary, ports and cabin.' },
  { icon: Car, title: 'Road trips', detail: 'Start, end, stops and distance.' },
  { icon: Anchor, title: 'Ferries', detail: 'Routes and crossings.' },
];

export function ExpeditionsView() {
  return (
    <div className="animate-fade-in space-y-6">
      <header className="text-center">
        <MapPinned size={26} className="mx-auto text-passport-gold mb-2" />
        <h1 className="font-display text-3xl font-semibold text-passport-navy dark:text-white/90">
          Expeditions
        </h1>
        <p className="text-sm text-black/55 dark:text-white/55 mt-1 max-w-md mx-auto">
          Every trip — a weekend in Rome, a gap year across Asia — becomes an
          Expedition: a container for your journeys, discoveries, photos and
          notes.
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-passport-gold/40 bg-passport-card/60 dark:bg-passport-carddark/60 p-5 text-center">
        <span className="inline-block text-[11px] uppercase tracking-[0.24em] text-passport-gold mb-1">
          Coming soon
        </span>
        <p className="text-sm text-black/60 dark:text-white/60">
          Expeditions build on the same Passport foundation. Journeys captured
          within each trip will feed your travel statistics automatically.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold text-passport-navy dark:text-white/90">
          Journeys — how you travelled
        </h2>
        <div className="gold-rule w-24" />
        <div className="grid sm:grid-cols-2 gap-2">
          {JOURNEYS.map(({ icon: Icon, title, detail }) => (
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
    </div>
  );
}

import { useMemo } from 'react';
import {
  Clock,
  Globe2,
  type LucideIcon,
  MapPin,
  Moon,
  Plane,
  Rocket,
  Route,
  Ticket,
} from 'lucide-react';
import type { Expedition } from '../../types';
import { computeTravelStats } from '../../lib/travelStats';

function fmtKm(km: number): string {
  return `${Math.round(km).toLocaleString()} km`;
}

/** Pick a sensible precision so big counts stay tidy and tiny ones (Mars!)
 *  still show something rather than rounding to zero. */
function fmtMult(n: number): string {
  if (n <= 0) return '0';
  if (n >= 100) return Math.round(n).toLocaleString();
  if (n >= 10) return n.toFixed(0);
  if (n >= 1) return n.toFixed(1);
  if (n >= 0.01) return n.toFixed(2);
  return n.toFixed(4);
}

function fmtAir(hours: number): string {
  if (hours <= 0) return '0 hrs';
  if (hours >= 48) return `${(hours / 24).toFixed(1)} days`;
  return `${Math.round(hours)} hrs`;
}

export function TravelStatsPanel({ expeditions }: { expeditions: Expedition[] }) {
  const s = useMemo(() => computeTravelStats(expeditions), [expeditions]);
  if (s.legs === 0) return null;

  const cards: { icon: LucideIcon; value: string; label: string }[] = [
    { icon: Route, value: fmtKm(s.totalKm), label: 'Distance travelled' },
    { icon: Globe2, value: `${fmtMult(s.aroundWorld)}×`, label: 'Around the world' },
    { icon: Moon, value: `${fmtMult(s.toMoon)}×`, label: 'To the Moon & back' },
    { icon: Rocket, value: `${fmtMult(s.toMars)}×`, label: 'To Mars & back' },
    { icon: Clock, value: fmtAir(s.hoursInAir), label: 'Time in the air' },
    { icon: Ticket, value: String(s.operators), label: 'Travel companies' },
    { icon: Plane, value: String(s.airports), label: 'Airports visited' },
    { icon: MapPin, value: String(s.legs), label: 'Legs travelled' },
  ];

  return (
    <section className="space-y-3">
      <h2 className="font-display text-[1.4rem] font-semibold text-passport-navy dark:text-white tracking-tight">
        By the numbers
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {cards.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="min-w-0 rounded-2xl bg-white dark:bg-passport-carddark shadow-card px-3 py-4 text-center"
          >
            <div className="mx-auto mb-1.5 h-8 w-8 rounded-xl bg-passport-goldpale dark:bg-white/10 flex items-center justify-center">
              <Icon size={15} className="text-passport-gold" />
            </div>
            <div className="font-display text-xl font-semibold text-passport-navy dark:text-white leading-none break-words">
              {value}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-passport-ink3 mt-1 break-words">
              {label}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-passport-ink3 px-1">
        Distances are great-circle estimates from each leg&rsquo;s endpoints;
        time in the air assumes an ~800 km/h average.
      </p>
    </section>
  );
}

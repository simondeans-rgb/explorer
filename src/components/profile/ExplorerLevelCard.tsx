import { Sparkles } from 'lucide-react';
import type { ExplorerLevel } from '../../lib/explorer';

/** Gradient hero card showing the member's explorer level, title and XP
 *  progress toward the next level. Purely derived — no persistence. */
export function ExplorerLevelCard({ level }: { level: ExplorerLevel }) {
  const pct = Math.round(level.progress * 100);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white shadow-float p-5">
      <div
        className="pointer-events-none absolute -left-8 -bottom-10 h-40 w-40 rounded-full border border-white/15"
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-white/15 ring-2 ring-white/30 flex flex-col items-center justify-center shadow-card">
          <span className="text-[0.6rem] uppercase tracking-wide text-white/70 leading-none">
            Lvl
          </span>
          <span className="font-display text-2xl font-semibold leading-tight">
            {level.level}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-medium text-white/75">
            <Sparkles size={13} /> Explorer level
          </p>
          <h2 className="font-display text-xl font-semibold leading-tight truncate">
            {level.title}
          </h2>
          <p className="text-xs text-white/80 mt-0.5">
            {level.xp.toLocaleString()} XP
            {!level.maxed && (
              <> · {Math.max(0, level.nextLevelXp - level.xp).toLocaleString()} to next</>
            )}
          </p>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full rounded-full bg-white/90 transition-all duration-500"
            style={{ width: `${level.maxed ? 100 : pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-[0.7rem] text-white/75">
          {level.maxed
            ? 'Max level — Citizen of the World 🌍'
            : `${pct}% to level ${level.level + 1}`}
        </p>
      </div>
    </div>
  );
}

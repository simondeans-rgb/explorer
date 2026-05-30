/** Circular gauge for a country's Discovery Score (0–100): depth, not ticks. */
export function DiscoveryRing({
  score,
  size = 44,
}: {
  score: number;
  size?: number;
}) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const dash = (pct / 100) * c;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`Discovery Score ${pct}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-black/10 dark:stroke-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="stroke-passport-gold transition-[stroke-dasharray] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-passport-navy dark:text-passport-goldsoft">
        {pct}
      </span>
    </div>
  );
}

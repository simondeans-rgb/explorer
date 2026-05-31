// Lightweight placeholder shown while the (lazily-loaded) world map chunk
// downloads, so the map's heavy dependencies stay out of the initial bundle.
export function MapSkeleton() {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-passport-card dark:bg-passport-carddark shadow-page overflow-hidden">
      <div className="w-full aspect-[800/380] animate-pulse bg-black/[0.04] dark:bg-white/[0.04]" />
    </div>
  );
}

// Lightweight placeholder shown while the (lazily-loaded) world map chunk
// downloads, so the map's heavy dependencies stay out of the initial bundle.
export function MapSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="w-full aspect-[800/380] shimmer dark:bg-white/[0.04]" />
    </div>
  );
}

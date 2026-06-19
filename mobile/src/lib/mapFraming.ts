import { geoEqualEarth, geoCentroid, type GeoProjection, type GeoPermissibleObjects } from 'd3-geo';

// How far we'll let the map zoom into a concentrated region, relative to the
// whole-world scale, so a single country doesn't fill the entire frame.
const MAX_ZOOM = 4.5;

/** An Equal-Earth projection framed to `target` (the user's places/journeys for
 *  the current scope). With no target it frames the whole inhabited world; with
 *  a target it zooms to fit that region (clamped), so the map focuses on wherever
 *  the data actually is — and reframes whenever the data changes (e.g. per year). */
export function framedEqualEarth(W: number, H: number, target: GeoPermissibleObjects | null): GeoProjection {
  const proj = geoEqualEarth();
  if (!target) {
    proj.fitSize([W, H], { type: 'Sphere' });
    // A gentle zoom trims the empty polar ocean for a fuller world.
    proj.scale(proj.scale() * 1.16).translate([W / 2, H * 0.49]);
    return proj;
  }
  const worldScale = geoEqualEarth().fitSize([W, H], { type: 'Sphere' }).scale();
  const padX = W * 0.08;
  const padY = H * 0.12;
  proj.fitExtent(
    [
      [padX, padY],
      [W - padX, H - padY],
    ],
    target,
  );
  const max = worldScale * MAX_ZOOM;
  if (!Number.isFinite(proj.scale()) || proj.scale() > max) {
    proj.scale(max).translate([0, 0]);
    const pc = proj(geoCentroid(target));
    if (pc) proj.translate([W / 2 - pc[0], H / 2 - pc[1]]);
  }
  return proj;
}

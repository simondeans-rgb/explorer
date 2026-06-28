import { geoEqualEarth, geoCentroid, type GeoProjection, type GeoPermissibleObjects } from 'd3-geo';

// How far we'll let the map zoom into a concentrated region, relative to the
// whole-world scale, so a single country doesn't fill the entire frame.
const MAX_ZOOM = 4.5;

/** An Equal-Earth projection framed to `target` (the user's places/journeys for
 *  the current scope). With no target it frames the whole inhabited world; with
 *  a target it zooms to fit that region (clamped), so the map focuses on wherever
 *  the data actually is — and reframes whenever the data changes (e.g. per year). */
export function framedEqualEarth(
  W: number,
  H: number,
  target: GeoPermissibleObjects | null,
  opts: { yBias?: number } = {},
): GeoProjection {
  // yBias > 0 lifts the framing upward — used by the flat Places map, whose
  // target (visited countries) clusters in the north, so centring it left an
  // Arctic-ocean dead band on top. Defaults to 0 so other callers are unchanged.
  const yBias = opts.yBias ?? 0;
  const proj = geoEqualEarth();
  if (!target) {
    proj.fitSize([W, H], { type: 'Sphere' });
    // A gentle zoom trims the empty polar ocean for a fuller world.
    proj.scale(proj.scale() * 1.16).translate([W / 2, H * (0.49 - yBias)]);
    return proj;
  }
  const worldScale = geoEqualEarth().fitSize([W, H], { type: 'Sphere' }).scale();
  const padX = W * 0.08;
  // Asymmetric vertical padding: less on top, more on the bottom, so the
  // northern target rises toward the top edge and southern land fills below.
  const padTop = H * (0.12 - yBias);
  const padBottom = H * (0.12 + yBias);
  proj.fitExtent(
    [
      [padX, padTop],
      [W - padX, H - padBottom],
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

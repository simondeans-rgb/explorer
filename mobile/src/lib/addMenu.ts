// Tiny registry that lets deep links (e.g. the widget's "+" button, via the
// /add route) open the global add menu, whose open/closed state lives in the
// root layout.
let listener: (() => void) | null = null;

/** Root layout registers its "open the FAB menu" handler here. */
export function onOpenAddMenu(fn: () => void): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

/** Ask the root layout to open the add menu (no-op before registration). */
export function openAddMenu(): void {
  listener?.();
}

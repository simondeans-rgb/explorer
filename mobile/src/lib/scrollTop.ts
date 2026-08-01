// Lets the global tab bar tell the active tab's screen to scroll back to the
// top when its tab is tapped again (standard iOS behaviour). Screens subscribe
// via the useTabReselect hook; the tab bar calls emitScrollToTop(path).
type Listener = (path: string) => void;

const listeners = new Set<Listener>();

export function onScrollToTop(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function emitScrollToTop(path: string): void {
  listeners.forEach((fn) => fn(path));
}

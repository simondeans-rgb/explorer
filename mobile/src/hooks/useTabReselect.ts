import { useEffect, useRef } from 'react';
import { onScrollToTop } from '../lib/scrollTop';

/** Run `onReselect` when the user taps the already-active tab for `path`
 *  (typically to scroll the screen back to the top). Subscribes once; always
 *  calls the latest callback. */
export function useTabReselect(path: string, onReselect: () => void): void {
  const cb = useRef(onReselect);
  cb.current = onReselect;
  useEffect(() => onScrollToTop((p) => { if (p === path) cb.current(); }), [path]);
}

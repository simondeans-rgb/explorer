import { useEffect, useState } from 'react';
import { getCoverState } from '../lib/covers';
import { COVER_THEMES, type CoverTheme } from '../lib/coverThemes.gen';

const CLASSIC = COVER_THEMES.Classic;

/** The active Passport Cover's theme (accent, gradient, particle profile).
 *  Defaults to Classic until the native icon state resolves — and always on
 *  binaries without icon switching. */
export function useCoverTheme(): CoverTheme {
  const [theme, setTheme] = useState<CoverTheme>(CLASSIC);
  useEffect(() => {
    let mounted = true;
    getCoverState().then((s) => {
      if (!mounted) return;
      const icon = s?.current ?? 'Classic';
      setTheme(COVER_THEMES[icon] ?? CLASSIC);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return theme;
}

import { useWorldly } from '../src/hooks/useWorldly';
import { useData } from '../src/store/data';
import { useAuth } from '../src/store/auth';
import { useCelebration } from '../src/store/celebration';
import { useCoverUnlockWatch } from '../src/hooks/useCoverUnlockWatch';

/** Headless: celebrates when travel milestones unlock a new Passport Cover (R29). */
export function CoverUnlockWatcher() {
  const { stats, level } = useWorldly();
  const { loaded } = useData();
  const { user } = useAuth();
  const { celebrate } = useCelebration();
  useCoverUnlockWatch(user?.uid ?? null, loaded, stats.countriesDiscovered, level.level, celebrate);
  return null;
}

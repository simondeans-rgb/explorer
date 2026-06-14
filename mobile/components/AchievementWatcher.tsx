import { useWorldly } from '../src/hooks/useWorldly';
import { useData } from '../src/store/data';
import { useAuth } from '../src/store/auth';
import { useCelebration } from '../src/store/celebration';
import { useAchievementWatch } from '../src/hooks/useAchievementWatch';

/** Headless: bridges the live stats into the achievement watcher so level-ups
 *  and badge unlocks pop a celebration. */
export function AchievementWatcher() {
  const { level, badges } = useWorldly();
  const { loaded } = useData();
  const { user } = useAuth();
  const { celebrate } = useCelebration();
  useAchievementWatch(user?.uid ?? null, loaded, level, badges, celebrate);
  return null;
}

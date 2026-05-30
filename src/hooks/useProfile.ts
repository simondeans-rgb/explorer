import { useEffect, useState } from 'react';
import { ensureProfile, type MemberProfile } from '../lib/profile';

/** Ensures the signed-in Member has a profile + share code, returning it. */
export function useProfile(
  userId: string | undefined,
  name: string,
): MemberProfile | null {
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setProfile(null);
      return;
    }
    ensureProfile(userId, name)
      .then((p) => {
        if (active) setProfile(p);
      })
      .catch(() => {
        // e.g. Firestore rules not yet published — degrade quietly.
        if (active) setProfile(null);
      });
    return () => {
      active = false;
    };
  }, [userId, name]);

  return profile;
}

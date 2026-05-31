import { useCallback, useEffect, useState } from 'react';
import { loadProfilePhoto, saveProfilePhoto } from '../lib/profile';

/** The Member's passport photo, with a setter that persists it (Firestore when
 *  signed in, localStorage in demo mode) and updates optimistically. */
export function useProfilePhoto(userId: string | undefined) {
  const [photo, setPhotoState] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setPhotoState(null);
      return;
    }
    loadProfilePhoto(userId)
      .then((p) => {
        if (active) setPhotoState(p);
      })
      .catch(() => {
        /* degrade quietly */
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const setPhoto = useCallback(
    async (dataUrl: string | null) => {
      setPhotoState(dataUrl);
      if (!userId) return;
      try {
        await saveProfilePhoto(userId, dataUrl);
      } catch {
        /* keep the optimistic value; sync will retry on next change */
      }
    },
    [userId],
  );

  return { photo, setPhoto };
}

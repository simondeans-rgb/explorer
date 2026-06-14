import { useEffect, useMemo, useState } from 'react';
import {
  subscribeConnections,
  type Connection,
} from '../lib/connections';
import { ensureProfile, type MemberProfile } from '../lib/profile';
import { acceptedFriends, friendsByCountry } from '../lib/friends';
import { useFriendsData } from './useFriendsData';

/** Ties together the member's profile/code, their connections, and the live
 *  read-only feed of accepted friends' places & discoveries. */
export function useFriends(uid: string | undefined, name: string) {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      return;
    }
    let active = true;
    ensureProfile(uid, name)
      .then((p) => active && setProfile(p))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [uid, name]);

  useEffect(() => {
    if (!uid) {
      setConnections([]);
      return;
    }
    return subscribeConnections(uid, setConnections);
  }, [uid]);

  const friends = useMemo(
    () => acceptedFriends(connections, uid ?? ''),
    [connections, uid],
  );
  const friendUids = useMemo(() => friends.map((f) => f.uid), [friends]);
  const friendsData = useFriendsData(friendUids);
  const byCountry = useMemo(
    () => friendsByCountry(friends, friendsData.places, friendsData.discoveries),
    [friends, friendsData],
  );

  return { profile, connections, friends, friendsData, byCountry };
}

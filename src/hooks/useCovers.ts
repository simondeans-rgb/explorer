import { createContext, useContext, useEffect, useState } from 'react';
import { subscribeCovers } from '../lib/covers';

/** Map of countryCode → custom cover photo (data URL). */
export const CoversContext = createContext<Map<string, string>>(new Map());

export function useCoversMap(userId: string | undefined): Map<string, string> {
  const [map, setMap] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    if (!userId) {
      setMap(new Map());
      return;
    }
    return subscribeCovers(userId, setMap);
  }, [userId]);
  return map;
}

export function useCover(code: string | undefined): string | undefined {
  const covers = useContext(CoversContext);
  return code ? covers.get(code) : undefined;
}

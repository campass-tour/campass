import { useCallback, useEffect, useState } from 'react';
import { getUnlockedCollectibles, unlockCollectible } from '@/lib/storage';

export function useUnlockedCollectibles() {
  const [unlockedMap, setUnlockedMap] = useState<Record<string, boolean>>(() => getUnlockedCollectibles());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === 'unlocked_collectibles') {
        setUnlockedMap(getUnlockedCollectibles());
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const isUnlocked = useCallback((id: string) => !!unlockedMap[id], [unlockedMap]);

  const unlock = useCallback((id: string) => {
    unlockCollectible(id);
    setUnlockedMap(getUnlockedCollectibles());
  }, []);

  const unlockedIds = Object.keys(unlockedMap);

  return { unlockedMap, unlockedIds, isUnlocked, unlock } as const;
}

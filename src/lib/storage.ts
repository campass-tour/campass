const STORAGE_KEY = 'unlocked_collectibles';
const CLUE_UNLOCK_KEY = 'clue_unlock_levels';
const USER_ROLE_KEY = 'user_exploration_role';

export type UserRole = 'freshman' | 'senior' | 'visitor';

const safeRead = <T>(reader: () => T, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    return reader();
  } catch {
    return fallback;
  }
};

export function getUserRole(): UserRole | null {
  return safeRead(() => localStorage.getItem(USER_ROLE_KEY) as UserRole | null, null);
}

export function setUserRole(role: UserRole): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_ROLE_KEY, role);
  } catch (e) {
    console.error('Error saving user role to local storage', e);
  }
}

export function getUnlockedCollectibles(): Record<string, boolean> {
  return safeRead(() => JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, boolean>, {});
}

export function unlockCollectible(id: string): void {
  if (typeof window === 'undefined') return;
  const unlocked = getUnlockedCollectibles();
  unlocked[id] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  window.dispatchEvent(new CustomEvent('unlocked-collectibles-changed'));
}

export function isCollectibleUnlocked(id: string): boolean {
  const unlocked = getUnlockedCollectibles();
  return !!unlocked[id];
}

export function getUnlockedCount(): number {
  return Object.keys(getUnlockedCollectibles()).length;
}

export function getClueUnlockLevel(locationId: string): number {
  return safeRead(() => {
    const levels = JSON.parse(localStorage.getItem(CLUE_UNLOCK_KEY) || '{}') as Record<string, number>;
    return levels[locationId] || 1;
  }, 1);
}

export function setClueUnlockLevel(locationId: string, level: number): void {
  if (typeof window === 'undefined') return;
  try {
    const levels = JSON.parse(localStorage.getItem(CLUE_UNLOCK_KEY) || '{}') as Record<string, number>;
    levels[locationId] = level;
    localStorage.setItem(CLUE_UNLOCK_KEY, JSON.stringify(levels));
  } catch (e) {
    console.error('Error saving clue unlock level to local storage', e);
  }
}

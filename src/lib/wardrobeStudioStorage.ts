import type { WardrobeEquippedBySlot, WardrobeSlot } from '../types';

const WARDROBE_EQUIPPED_STORAGE_KEY = 'wardrobe_studio_equipped';
const WARDROBE_OWNED_STORAGE_KEY = 'wardrobe_studio_owned';

const isWardrobeSlot = (value: string): value is WardrobeSlot =>
  value === 'head' || value === 'face' || value === 'gear';

export function getWardrobeEquippedBySlot(): WardrobeEquippedBySlot {
  try {
    const raw = localStorage.getItem(WARDROBE_EQUIPPED_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const equipped: WardrobeEquippedBySlot = {};

    Object.entries(parsed ?? {}).forEach(([key, value]) => {
      if (isWardrobeSlot(key) && typeof value === 'string') {
        equipped[key] = value;
      }
    });

    return equipped;
  } catch (error) {
    console.error('Error reading wardrobe equipped state', error);
    return {};
  }
}

export function setWardrobeEquippedBySlot(nextState: WardrobeEquippedBySlot): void {
  try {
    localStorage.setItem(WARDROBE_EQUIPPED_STORAGE_KEY, JSON.stringify(nextState));
  } catch (error) {
    console.error('Error saving wardrobe equipped state', error);
  }
}

export function getWardrobeOwnedItemIds(defaultOwned: string[]): string[] {
  try {
    const raw = localStorage.getItem(WARDROBE_OWNED_STORAGE_KEY);
    if (!raw) return defaultOwned;

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return defaultOwned;

    return parsed.filter((value): value is string => typeof value === 'string');
  } catch (error) {
    console.error('Error reading wardrobe owned items', error);
    return defaultOwned;
  }
}

export function setWardrobeOwnedItemIds(nextOwned: string[]): void {
  try {
    localStorage.setItem(WARDROBE_OWNED_STORAGE_KEY, JSON.stringify(nextOwned));
  } catch (error) {
    console.error('Error saving wardrobe owned items', error);
  }
}

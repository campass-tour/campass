import { useEffect, useState } from 'react';
import { WARDROBE_DEFAULT_OWNED_ITEM_IDS, WARDROBE_ITEMS } from '../constants/wardrobeCatalog';
import { WARDROBE_BALANCE } from '../constants/wardrobeBalance';
import {
  getWardrobeEquippedBySlot,
  getWardrobeOwnedItemIds,
  setWardrobeEquippedBySlot,
  setWardrobeOwnedItemIds,
} from '../lib/wardrobeStudioStorage';
import type { WardrobeCategoryId, WardrobeEquippedBySlot, WardrobeItem, WardrobeSlot } from '../types';

type StudioAction = 'buy' | 'equip' | 'unequip' | 'idle';

const getItemById = (itemId: string | null) =>
  itemId ? WARDROBE_ITEMS.find((item) => item.id === itemId) ?? null : null;

export function useWardrobeStudio() {
  const [ownedItemIds, setOwnedItemIds] = useState<string[]>(WARDROBE_DEFAULT_OWNED_ITEM_IDS);
  const [equippedBySlot, setEquippedBySlot] = useState<WardrobeEquippedBySlot>({});
  const [selectedCategory, setSelectedCategory] = useState<WardrobeCategoryId>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [resetViewKey, setResetViewKey] = useState(0);

  useEffect(() => {
    setOwnedItemIds(getWardrobeOwnedItemIds(WARDROBE_DEFAULT_OWNED_ITEM_IDS));
    setEquippedBySlot(getWardrobeEquippedBySlot());
  }, []);

  useEffect(() => {
    setWardrobeOwnedItemIds(ownedItemIds);
  }, [ownedItemIds]);

  useEffect(() => {
    setWardrobeEquippedBySlot(equippedBySlot);
  }, [equippedBySlot]);

  const selectedItem = getItemById(selectedItemId);
  const filteredItems = WARDROBE_ITEMS.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const slotPriority: WardrobeSlot[] = ['head', 'face', 'gear'];
  const storedEquippedBySlot = getWardrobeEquippedBySlot();
  const previewEquippedBySlot: WardrobeEquippedBySlot = { ...storedEquippedBySlot };
  if (selectedItem) {
    previewEquippedBySlot[selectedItem.category] = selectedItem.id;
  }
  const previewItems = slotPriority
    .map((slot) => getItemById(previewEquippedBySlot[slot] ?? null))
    .filter((item): item is WardrobeItem => item !== null);
  const selectedOwned = !!selectedItem && ownedItemIds.includes(selectedItem.id);
  const selectedEquipped = !!selectedItem && equippedBySlot[selectedItem.category] === selectedItem.id;

  const canAfford = !!selectedItem && WARDROBE_BALANCE >= selectedItem.price;
  const action: StudioAction = !selectedItem
    ? 'idle'
    : selectedEquipped
      ? 'unequip'
      : selectedOwned
        ? 'equip'
        : 'buy';

  const actionDisabled = action === 'idle' || (action === 'buy' && !canAfford);

  const handleSelectItem = (item: WardrobeItem) => {
    setSelectedItemId(item.id);
  };

  const handlePrimaryAction = () => {
    if (!selectedItem) return;

    if (action === 'buy') {
      if (!canAfford) return;
      setOwnedItemIds((current) =>
        current.includes(selectedItem.id) ? current : [...current, selectedItem.id]
      );
      return;
    }

    if (!selectedOwned) return;

    if (selectedEquipped) {
      setEquippedBySlot((current) => {
        const nextEquippedBySlot = { ...current };
        delete nextEquippedBySlot[selectedItem.category];
        return nextEquippedBySlot;
      });
      setSelectedItemId(null);
      return;
    }

    setEquippedBySlot((current) => ({
      ...current,
      [selectedItem.category]: selectedItem.id,
    }));
  };

  const handleResetView = () => {
    setResetViewKey((value) => value + 1);
  };

  const equippedItems = Object.values(equippedBySlot)
    .map((itemId) => getItemById(itemId ?? null))
    .filter((item): item is WardrobeItem => item !== null);

  return {
    action,
    actionDisabled,
    canAfford,
    credits: WARDROBE_BALANCE,
    equippedItems,
    filteredItems,
    handlePrimaryAction,
    handleResetView,
    handleSelectItem,
    previewItems,
    resetViewKey,
    selectedCategory,
    selectedEquipped,
    selectedItem,
    selectedItemId,
    setSelectedCategory,
    ownedItemIds,
    equippedBySlot,
  };
}

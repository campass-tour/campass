import type { WardrobeEquippedBySlot, WardrobeItem } from '../../types';
import { Inbox } from 'lucide-react';
import WardrobeStudioItemCard from './WardrobeStudioItemCard';

type WardrobeStudioGridProps = {
  items: WardrobeItem[];
  selectedItemId: string | null;
  ownedItemIds: string[];
  equippedBySlot: WardrobeEquippedBySlot;
  onSelectItem: (item: WardrobeItem) => void;
};

export default function WardrobeStudioGrid({
  items,
  selectedItemId,
  ownedItemIds,
  equippedBySlot,
  onSelectItem,
}: WardrobeStudioGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--collection-capsule-border)] bg-[var(--color-surface)] text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--wall-select-icon-bg)] text-[var(--color-primary)]">
          <Inbox className="h-5 w-5" />
        </span>
        <p className="mt-4 text-sm font-semibold text-[var(--color-text-main)]">No wearable assets in this category yet</p>
        <p className="mt-2 max-w-xs text-sm text-[var(--collection-progress-copy)]">
          Add more entries to the wardrobe catalog JSON and they will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 pb-1 sm:grid-cols-3 md:grid-cols-2 md:gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => {
        const isSelected = selectedItemId === item.id;
        const isEquipped = equippedBySlot[item.category] === item.id;
        const isOwned = ownedItemIds.includes(item.id);
        const statusLabel = isEquipped ? 'Equipped' : isOwned ? 'Owned' : 'Locked';

        return (
          <WardrobeStudioItemCard
            key={item.id}
            item={item}
            isSelected={isSelected}
            statusLabel={statusLabel}
            onSelect={onSelectItem}
          />
        );
      })}
    </div>
  );
}

import type { WardrobeItem } from '../../types';

type WardrobeStudioActionBarProps = {
  action: 'buy' | 'equip' | 'unequip' | 'idle';
  disabled: boolean;
  canAfford: boolean;
  selectedItem: WardrobeItem | null;
  onPrimaryAction: () => void;
  className?: string;
};

const actionLabelMap = {
  buy: 'Buy',
  equip: 'Equip',
  unequip: 'Unequip',
  idle: 'Select an Item',
} as const;

export default function WardrobeStudioActionBar({
  action,
  disabled,
  canAfford,
  selectedItem,
  onPrimaryAction,
  className = '',
}: WardrobeStudioActionBarProps) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-[var(--radius-pill)] border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] px-4 py-3 shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl ${className}`}
    >
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-semibold text-[var(--color-text-main)]">
          {selectedItem ? selectedItem.name : 'Select an item'}
        </p>
        {action === 'buy' && selectedItem ? (
          <p className="mt-0.5 text-xs text-[var(--collection-progress-copy)]">
            {canAfford ? `${selectedItem.price} credits` : 'Insufficient credits'}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onPrimaryAction}
        disabled={disabled}
        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition sm:px-5 ${
          action === 'unequip'
            ? 'border-[var(--collection-capsule-border)] bg-transparent text-[var(--color-text-main)]'
            : 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-surface)]'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        {actionLabelMap[action]}
      </button>
    </div>
  );
}

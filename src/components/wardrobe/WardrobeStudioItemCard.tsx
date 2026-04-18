import type { WardrobeItem } from '../../types';
import { Coins } from 'lucide-react';
import { cn } from '../../lib/utils';
import { WardrobeStudioItemImage } from './WardrobeStudioIcons';

type WardrobeStudioItemCardProps = {
  item: WardrobeItem;
  isSelected: boolean;
  statusLabel?: string | null;
  onSelect: (item: WardrobeItem) => void;
  /** Keep description in data, but allow the UI to omit it for now. */
  showDescription?: boolean;
};

export default function WardrobeStudioItemCard({
  item,
  isSelected,
  statusLabel,
  onSelect,
}: WardrobeStudioItemCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={cn(
        'group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-card)] border px-2 py-3 text-left transition-all duration-300 gap-3',
        'hover:-translate-y-1 hover:shadow-[var(--shadow-card)]',
        isSelected
          ? 'border-[var(--color-primary)] bg-[var(--collection-progress-ring-center)] shadow-[var(--shadow-card)] ring-1 ring-[var(--color-primary)]'
          : 'border-[var(--collection-capsule-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
      )}
      aria-pressed={isSelected}
      aria-label={item.name}
    >
      {/* Top right tag (ONLY shown if Locked) */}
      {statusLabel === 'Locked' && (
        <span
          className="absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
          style={{
            background: 'var(--mascot-badge-locked-bg)',
            color: 'var(--mascot-badge-locked-text)',
          }}
        >
          {statusLabel}
        </span>
      )}

      {/* Image Area */}
      <div
        className="flex w-full flex-1 items-center justify-center rounded-xl p-3 transition-transform duration-300 group-hover:scale-[1.02] sm:p-4"
        style={{ background: 'var(--mascot-card-image-bg)' }}
      >
        <WardrobeStudioItemImage
          imageFile={item.icon}
          alt={item.name}
          className="h-full w-full object-contain drop-shadow-md"
        />
      </div>

      {/* Info Area */}
      <div className="mt-4 hidden w-full justify-center sm:flex">
        <div className="flex items-center gap-1.5"
             style={{ color: 'var(--color-primary)' }}>
          <Coins className="h-4 w-4" />
          <span className="text-sm font-bold tabular-nums leading-none">{item.price}</span>
        </div>
      </div>
    </button>
  );
}

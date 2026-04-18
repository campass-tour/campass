import { WARDROBE_CATEGORIES } from '../../constants/wardrobeCatalog';
import type { WardrobeCategoryId } from '../../types';
import { WardrobeStudioCategoryIcon } from './WardrobeStudioIcons';

type WardrobeStudioTabsProps = {
  selectedCategory: WardrobeCategoryId;
  onSelectCategory: (category: WardrobeCategoryId) => void;
};

export default function WardrobeStudioTabs({
  selectedCategory,
  onSelectCategory,
}: WardrobeStudioTabsProps) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {WARDROBE_CATEGORIES.map((category) => {
        const isActive = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-surface)]'
                : 'border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] text-[var(--color-text-main)]'
            }`}
            aria-pressed={isActive}
          >
            <WardrobeStudioCategoryIcon icon={category.icon} className="h-4 w-4" />
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}

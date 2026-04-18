'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import WardrobeStudioActionBar from '@/components/wardrobe/WardrobeStudioActionBar';
import WardrobeStudioGrid from '@/components/wardrobe/WardrobeStudioGrid';
import WardrobeStudioHeader from '@/components/wardrobe/WardrobeStudioHeader';
import WardrobeStudioStage from '@/components/wardrobe/WardrobeStudioStage';
import WardrobeStudioTabs from '@/components/wardrobe/WardrobeStudioTabs';
import { useWardrobeStudio } from '@/hooks/useWardrobeStudio';

export default function WardrobeStudioPage() {
  const {
    action,
    actionDisabled,
    canAfford,
    credits,
    equippedItems,
    filteredItems,
    handlePrimaryAction,
    handleResetView,
    handleSelectItem,
    previewItems,
    resetViewKey,
    selectedCategory,
    selectedItem,
    selectedItemId,
    setSelectedCategory,
    ownedItemIds,
    equippedBySlot,
  } = useWardrobeStudio();

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-col gap-3 overflow-x-hidden bg-[var(--wall-page-bg)] pb-0 pt-1 md:overflow-y-auto md:gap-6 md:px-6 md:pb-10 md:pt-8">
      <div className="flex items-center px-1 md:hidden">
        <Link
          href="/collection"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] p-0 text-[var(--color-text-main)] shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl"
          aria-label="Exit wardrobe studio"
        >
          <ArrowLeft className="h-5 w-5 text-[var(--color-primary)]" />
        </Link>
      </div>

      <div className="hidden flex-col gap-3 md:flex md:gap-4">
        <WardrobeStudioHeader equippedCount={equippedItems.length} />
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 px-1 lg:h-auto lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,1fr)] lg:grid-rows-1 lg:items-start lg:gap-6 lg:px-0">
        <div className="min-h-0 flex-1 lg:sticky lg:top-8 lg:self-start">
          <WardrobeStudioStage
            credits={credits}
            previewItems={previewItems}
            resetViewKey={resetViewKey}
            onResetView={handleResetView}
          />
        </div>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] p-3 shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl md:p-4 lg:h-[min(68svh,48rem)]">
          <div className="shrink-0">
            <WardrobeStudioTabs
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          <div className="mt-3 flex-1 overflow-y-auto pr-1 -mr-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:pb-0">
            <WardrobeStudioGrid
              items={filteredItems}
              selectedItemId={selectedItemId}
              ownedItemIds={ownedItemIds}
              equippedBySlot={equippedBySlot}
              onSelectItem={handleSelectItem}
            />
          </div>

          <div className="mt-3 hidden shrink-0 lg:block" data-wardrobe-action-bar="true">
            <WardrobeStudioActionBar
              action={action}
              disabled={actionDisabled}
              canAfford={canAfford}
              selectedItem={selectedItem}
              onPrimaryAction={handlePrimaryAction}
            />
          </div>
        </section>
      </div>

      <div
        className="pointer-events-none fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom)+0.5rem)] z-[var(--z-overlay)] px-4 lg:hidden"
        data-wardrobe-action-bar="true"
      >
        <WardrobeStudioActionBar
          action={action}
          disabled={actionDisabled}
          canAfford={canAfford}
          selectedItem={selectedItem}
          onPrimaryAction={handlePrimaryAction}
          className="pointer-events-auto mx-auto w-full max-w-7xl"
        />
      </div>
    </div>
  );
}

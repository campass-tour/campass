import React, { useState } from 'react';
import { MapPin, PenSquare, Plus } from 'lucide-react';
import { MessageDetailModal } from '../components/common/MessageDetailModal';
import { RoundedDropdown } from '../components/common/RoundedDropdown';
import { ComposeMessageModal } from '../components/wall/ComposeMessageModal';
import PolaroidCard from '../components/wall/PolaroidCard';
import { WallSearchBar } from '../components/wall/WallSearchBar';
import { WallDataProvider } from '../components/wall/WallDataProvider';
import { cn } from '../lib/utils';

export const WallPage: React.FC = () => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  return (
    <div className="mx-auto w-full max-w-7xl bg-[var(--wall-page-bg)] px-2 pb-32 md:px-6">
      <WallDataProvider>
        {({
          query,
          setQuery,
          clearQuery,
          selectedLocationFilter,
          setSelectedLocationFilter,
          unlockedLocations,
          filteredMessages,
          locationFilteredMessages,
          setSelectedMessage,
          selectedDanmakuItem,
        }) => {
          const selectedLocationName =
            selectedLocationFilter === null
              ? 'All locations'
              : unlockedLocations.find((location) => location.id === selectedLocationFilter)?.name ??
                'All locations';

          const filterOptions = [
            {
              value: 'all',
              label: 'All locations',
              meta: 'Browse the full wall across campus',
            },
            ...unlockedLocations.map((location) => ({
              value: location.id,
              label: location.name,
              meta: 'Only show whispers pinned to this spot',
            })),
          ];

          return (
            <>
              <section className="relative mb-8 pt-6 text-left md:mb-10 md:pt-10">
                <div className="relative max-w-3xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--wall-kicker)]">
                    XJTLU CAMPUS LORE
                  </p>
                  <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight text-[var(--color-text-main)] md:mt-1 md:text-4xl">
                    The Wall
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--wall-hero-copy)]">
                   
                    <span className="hidden h-1 w-1 rounded-full bg-[var(--wall-hero-meta)] sm:inline-block" />
                    <span className="font-medium text-[var(--wall-hero-meta)]">
                      {filteredMessages.length} whispers visible now
                    </span>
                    <span className="hidden h-1 w-1 rounded-full bg-[var(--wall-hero-meta)] sm:inline-block" />
                    <span className="font-medium text-[var(--wall-hero-meta)]">
                      Filter: {selectedLocationName}
                    </span>
                  </div>
                </div>

                <div className="relative mt-6 hidden sm:flex sm:items-center sm:gap-4">
                  <div className="flex w-full items-center gap-3 rounded-[32px] border border-[var(--wall-control-border)] bg-[var(--wall-control-surface)] p-2 shadow-[var(--wall-control-shadow)]">
                    <div className="min-w-0 flex-1">
                      <WallSearchBar
                        value={query}
                        onValueChange={setQuery}
                        onClear={clearQuery}
                        resultCount={filteredMessages.length}
                        totalCount={locationFilteredMessages.length}
                        showMeta={false}
                        className="rounded-full"
                        inputClassName="bg-transparent text-[var(--color-text-main)] placeholder:text-[var(--wall-control-muted)]"
                      />
                    </div>

                    <div className="h-9 w-px shrink-0 bg-[var(--wall-divider)]" />

                    <RoundedDropdown
                      label="Location"
                      value={selectedLocationFilter ?? 'all'}
                      options={filterOptions}
                      onChange={(value) => setSelectedLocationFilter(value === 'all' ? null : value)}
                      icon={<MapPin className="h-4 w-4" />}
                    />

                    <button
                      type="button"
                      onClick={() => setIsComposeOpen(true)}
                      className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[var(--wall-cta-bg)] px-6 text-sm font-semibold text-[var(--wall-cta-text)] shadow-[var(--wall-cta-shadow)] transition-transform duration-200 hover:scale-[1.03]"
                    >
                      <PenSquare className="h-4 w-4" />
                      <span>Write Whisper</span>
                    </button>
                  </div>
                </div>

                <div className="wall-mobile-sticky sm:hidden">
                  <div className="wall-mobile-sticky-inner -mx-2 mt-4 px-2 pb-3 pt-3">
                    <WallSearchBar
                      value={query}
                      onValueChange={setQuery}
                      onClear={clearQuery}
                      resultCount={filteredMessages.length}
                      totalCount={locationFilteredMessages.length}
                      showMeta={false}
                      className="rounded-full border border-[var(--wall-control-border)] bg-[var(--wall-control-surface)] px-1.5 py-1 shadow-[var(--wall-mobile-search-shadow)]"
                      inputClassName="h-12 bg-transparent text-[var(--color-text-main)] placeholder:text-[var(--wall-control-muted)]"
                    />

                    <div className="wall-scrollbar-hidden mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setSelectedLocationFilter(null)}
                        aria-pressed={selectedLocationFilter === null}
                        className={cn(
                          'inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
                          selectedLocationFilter === null
                            ? 'border-[var(--wall-pill-active-bg)] bg-[var(--wall-pill-active-bg)] text-[var(--wall-pill-active-text)]'
                            : 'border-[var(--wall-control-border)] bg-[var(--wall-mobile-pill-bg)] text-[var(--wall-pill-text)]'
                        )}
                      >
                        All
                      </button>
                      {unlockedLocations.map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => setSelectedLocationFilter(location.id)}
                          aria-pressed={selectedLocationFilter === location.id}
                          className={cn(
                            'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors',
                            selectedLocationFilter === location.id
                              ? 'border-[var(--wall-pill-active-bg)] bg-[var(--wall-pill-active-bg)] text-[var(--wall-pill-active-text)]'
                              : 'border-[var(--wall-control-border)] bg-[var(--wall-mobile-pill-bg)] text-[var(--wall-pill-text)]'
                          )}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{location.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="columns-1 gap-6 md:columns-2 lg:columns-3 xl:columns-4">
                {filteredMessages.map((msg, idx) => (
                  <PolaroidCard
                    key={msg.id}
                    message={msg}
                    index={idx}
                    onClick={() => setSelectedMessage(msg)}
                  />
                ))}
              </div>

              <MessageDetailModal
                item={selectedDanmakuItem}
                onClose={() => setSelectedMessage(null)}
                showDeleteIcon={selectedDanmakuItem?.originalMessage.author.username === 'silly bird'}
              />
            </>
          );
        }}
      </WallDataProvider>

      <button
        className="fixed right-5 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--wall-cta-bg)] text-[var(--wall-cta-text)] shadow-[var(--wall-fab-shadow)] transition-transform active:scale-95 sm:hidden"
        onClick={() => setIsComposeOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </button>

      <ComposeMessageModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  );
};

export default WallPage;

import { useEffect, useMemo, useRef, useState } from 'react';
import { Backpack, Sparkles } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCards, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';
import { LOCATIONS, getLocationData } from '../../constants/locations';
import { getUnlockedCollectibles } from '../../lib/storage';
import AssembledModelViewer from './AssembledModelViewer';

type CollectionSwiperModalProps = {
  open: boolean;
  onClose: () => void;
  initialCheckinId: string;
  onViewCollection?: () => void;
  onEnterAR?: (id: string, mascotName: string) => void;
};

export default function CollectionSwiperModal({
  open,
  onClose,
  initialCheckinId,
  onViewCollection,
  onEnterAR,
}: CollectionSwiperModalProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const idleTaskRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // We want to show all UNLOCKED items, plus maybe the clicked one if it isn't recorded as unlocked yet.
  const unlockedData = useMemo(() => getUnlockedCollectibles(), [open]);

  // Keep the designed order in LOCATIONS, but only for unlocked ones.
  const displayList = useMemo(() => {
    const filtered = LOCATIONS.filter(
      (loc) => unlockedData[loc.id] || loc.id === initialCheckinId
    )
      .map((loc) => getLocationData(loc.id))
      .filter(
        (item): item is NonNullable<ReturnType<typeof getLocationData>> => Boolean(item)
      );

    if (filtered.length === 0 && initialCheckinId) {
      const fallback = getLocationData(initialCheckinId);
      return fallback ? [fallback] : [];
    }

    return filtered;
  }, [initialCheckinId, unlockedData]);

  // Find index of clicked item to start the swiper at the right place.
  const safeInitialIndex = useMemo(() => {
    const initialIndex = displayList.findIndex((item) => item.id === initialCheckinId);
    return initialIndex >= 0 ? initialIndex : 0;
  }, [displayList, initialCheckinId]);

  const displayIds = useMemo(() => displayList.map((item) => item.id), [displayList]);
  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);
  const [enabledSet, setEnabledSet] = useState<Set<string>>(() => new Set());

  const clearPendingSchedule = () => {
    if (idleTaskRef.current !== null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
      (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleTaskRef.current);
      idleTaskRef.current = null;
    }
    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const scheduleNext = (callback: () => void) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleTaskRef.current = (
        window as Window & { requestIdleCallback: (cb: () => void, options?: { timeout: number }) => number }
      ).requestIdleCallback(callback, { timeout: 250 });
      return;
    }
    fallbackTimerRef.current = setTimeout(callback, 40);
  };

  useEffect(() => {
    if (swiperRef.current && open) {
      // Small timeout to allow DOM to render before sliding
      slideTimerRef.current = setTimeout(() => {
        swiperRef.current?.slideTo(safeInitialIndex, 0);
      }, 50);
    }

    return () => {
      if (slideTimerRef.current !== null) {
        clearTimeout(slideTimerRef.current);
        slideTimerRef.current = null;
      }
    };
  }, [open, safeInitialIndex]);

  useEffect(() => {
    if (!open) {
      clearPendingSchedule();
      setEnabledSet(new Set());
      return;
    }

    setActiveIndex(safeInitialIndex);
  }, [open, safeInitialIndex]);

  useEffect(() => {
    if (!open || displayIds.length === 0) return;

    clearPendingSchedule();
    let cancelled = false;
    const immediateIndexes = [activeIndex, activeIndex - 1, activeIndex + 1].filter(
      (index) => index >= 0 && index < displayIds.length
    );
    const immediateIdSet = new Set(immediateIndexes.map((index) => displayIds[index]));
    setEnabledSet((prev) => {
      const next = new Set(prev);
      immediateIdSet.forEach((id) => next.add(id));
      return next;
    });

    const remainingIndexes = Array.from({ length: displayIds.length }, (_, index) => index)
      .filter((index) => !immediateIndexes.includes(index))
      .sort((left, right) => {
        const leftDistance = Math.abs(left - activeIndex);
        const rightDistance = Math.abs(right - activeIndex);
        return leftDistance - rightDistance;
      });

    let pointer = 0;
    const prefetchNext = () => {
      if (cancelled) return;
      const index = remainingIndexes[pointer];
      pointer += 1;
      if (index === undefined) return;

      const id = displayIds[index];
      if (id) {
        setEnabledSet((prev) => {
          if (prev.has(id)) return prev;
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      }
      scheduleNext(prefetchNext);
    };

    scheduleNext(prefetchNext);

    return () => {
      cancelled = true;
      clearPendingSchedule();
    };
  }, [activeIndex, displayIds, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-300" style={{ zIndex: 'var(--z-overlay)' }}>
      <div className="absolute inset-0" onClick={onClose} />

      {/* Swiper Container */}
      <div className="w-full max-w-sm h-[600px] z-10 flex flex-col justify-center animate-in zoom-in-95 duration-500">
        <Swiper
          effect="cards"
          grabCursor={true}
          keyboard={{
            enabled: true,
          }}
          navigation={true}
          modules={[EffectCards, Navigation, Keyboard]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setActiveIndex(swiper.activeIndex);
          }}
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
          }}
          initialSlide={safeInitialIndex}
          className="w-full h-[520px]"
        >
          {displayList.map((item) => (
            <SwiperSlide key={item.id} className="flex items-center justify-center">
              <div className="w-full h-full overflow-hidden rounded-[24px] border border-[var(--color-primary)]/30 bg-[var(--color-surface)]/95 shadow-[var(--shadow-card)] backdrop-blur-xl flex flex-col">
                
                {/* Close button - only on the top card actually processes click easily, but we put it relative to the wrapping div to be higher z-index anyway */}
                <div className="flex-1 flex flex-col p-6">
                  <div className="relative mx-auto mb-6 flex h-64 w-full items-center justify-center rounded-2xl bg-[var(--color-primary)]/5 shadow-inner overflow-visible">
                    <div className="absolute bottom-4 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-[var(--color-primary)]/20 blur-xl animate-pulse" />
                    <div className="absolute bottom-6 left-1/2 h-2 w-1/2 -translate-x-1/2 rounded-full bg-[var(--color-accent)]/30 blur-sm" />

                    <div className="absolute inset-0 z-10" style={{ perspective: '800px' }}>
                      <AssembledModelViewer
                        buildingId={item.id}
                        buildingModelFile={item.model}
                        birdModelFile={item.birdModel}
                        buildingOffset={item.buildingOffset}
                        enabled={enabledSet.has(item.id)}
                        modelViewerProps={{
                          'auto-rotate': 'true',
                          'camera-controls': 'true',
                          'disable-zoom': 'true',
                          'rotation-per-second': '30deg',
                          'interaction-prompt': 'none',
                          exposure: '1.2',
                          'shadow-intensity': '1',
                        }}
                        style={{ width: '100%', height: '120%', transform: 'translateY(-10%)', outline: 'none' }}
                      />
                    </div>
                  </div>

                    <div className="text-center relative z-10 flex-1">
                      <p className="inline-block rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] shadow-sm">
                        Collection Profile
                      </p>

                      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--color-text-main)] drop-shadow-sm">
                        {item.mascotName}
                      </h2>

                      <p className="mt-2 text-[15px] font-medium text-[var(--color-text-secondary)]">
                        Located at <span className="font-bold text-[var(--color-accent)] drop-shadow-sm">{item.locationName}</span>
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 pb-2 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEnterAR?.(item.id, item.mascotName); }}
                        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] bg-[var(--color-primary)] px-4 py-3 font-bold text-white shadow-[var(--shadow-card)] transition-all hover:scale-[1.02] hover:opacity-90 cursor-pointer"
                      >
                        <Sparkles className="h-5 w-5 text-[var(--color-accent)]" />
                        <span className="tracking-wide">Summon in AR</span>
                      </button>

                      <div className="flex flex-row gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); onViewCollection?.(); }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-[var(--color-state-disabled)] bg-[var(--color-surface)] px-2 py-2 font-semibold text-[var(--color-text-main)] transition hover:bg-[var(--color-background)] hover:shadow-sm cursor-pointer"
                        >
                          <Backpack className="h-4 w-4 text-[var(--color-primary)]" />
                          <span className="text-sm">View All</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Global Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-2xl text-white transition hover:bg-white/30"
          style={{ zIndex: 'var(--z-modal)' }}
        >
          ×
        </button>
      </div>
      
      {/* CSS Overrides for Swiper UI */}
      <style>{`
        .swiper-button-next, .swiper-button-prev {
          color: white !important;
          background: rgba(40, 21, 89, 0.4);
          width: 40px !important;
          height: 40px !important;
          border-radius: 50%;
          backdrop-filter: blur(4px);
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 16px !important;
          font-weight: bold;
        }
        .swiper-button-next { right: -15px !important; }
        .swiper-button-prev { left: -15px !important; }
        
        @media (max-width: 450px) {
          .swiper-button-next { right: 5px !important; }
          .swiper-button-prev { left: 5px !important; }
        }
      `}</style>
    </div>
  );
}

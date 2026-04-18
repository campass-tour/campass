import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import type { WardrobeItem } from '../../types';
import WardrobeStudioCredits from './WardrobeStudioCredits';
import WardrobeStudioModelViewer from './WardrobeStudioModelViewer';

const birdModelUrl = '/model/bird.glb';

type WardrobeStudioStageProps = {
  credits: number;
  previewItems: WardrobeItem[];
  resetViewKey: number;
  onResetView: () => void;
};

export default function WardrobeStudioStage({
  credits,
  previewItems,
  resetViewKey,
  onResetView,
}: WardrobeStudioStageProps) {
  useEffect(() => {
    // Preload the bird model (model-viewer will also cache after first load).
    // This keeps perceived latency low on mobile.
    void birdModelUrl;
  }, []);

  return (
    <section className="relative h-full lg:h-[min(68svh,48rem)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
        <WardrobeStudioCredits
          credits={credits}
          className="pointer-events-auto max-w-[calc(100%-7.5rem)] sm:max-w-none"
        />

        <button
          type="button"
          onClick={onResetView}
          className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] px-3 text-sm font-semibold text-[var(--color-text-main)] shadow-[var(--collection-capsule-shadow)]"
          aria-label="Reset View"
        >
          <RotateCcw className="h-4 w-4 text-[var(--color-primary)]" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <div className="relative h-full min-h-0 lg:h-[min(68svh,48rem)]">
        <div className="absolute inset-x-[14%] bottom-[10%] h-20 rounded-full bg-[var(--collection-progress-track)] opacity-50 blur-3xl sm:h-24" />

        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          style={{ perspective: '800px' }}
        >
          <div className="pointer-events-auto relative h-[82%] w-[90%] sm:h-[90%] sm:w-[94%] lg:h-[96%] lg:w-full">
            <WardrobeStudioModelViewer
              birdUrl={birdModelUrl}
              previewItems={previewItems}
              resetViewKey={resetViewKey}
              modelViewerProps={{
                'camera-controls': 'true',
                'interaction-prompt': 'none',
                exposure: '1.2',
                'shadow-intensity': '1',
              }}
              style={{ width: '100%', height: '100%', transform: 'translateY(0)', outline: 'none' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

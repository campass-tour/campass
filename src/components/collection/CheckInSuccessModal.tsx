import { useEffect, useState } from 'react';
import { Backpack, Map as MapIcon } from 'lucide-react';
import LottieLib from 'lottie-react';
import { getLocationData } from '../../constants/locations';
import { SummonARButton } from '../photo/SummonARButton';
import AssembledModelViewer from './AssembledModelViewer';

type CheckInSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  checkinId: string;
  locationName: string;
  mascotName: string;
  current: number;
  total: number;
  onViewCollection?: () => void;
  onEnterAR?: (id: string, mascotName: string) => void;
};

export default function CheckInSuccessModal({
  open,
  onClose,
  checkinId,
  locationName,
  mascotName,
  current,
  total,
  onViewCollection,
  onEnterAR,
}: CheckInSuccessModalProps) {
  const [lottieData, setLottieData] = useState<unknown>(null);
  const [enableModel, setEnableModel] = useState(false);
  // For progress bar animation
  const [displayedCurrent, setDisplayedCurrent] = useState(current - 1 >= 0 ? current - 1 : 0);

  useEffect(() => {
    if (open) {
      fetch('https://assets2.lottiefiles.com/packages/lf20_u4yrau.json')
        .then((res) => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then((data) => setLottieData(data))
        .catch((err) => console.log('Lottie load failed, fallback will be used', err));
    }
  }, [open]);

  useEffect(() => {
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    if (!open) {
      setEnableModel(false);
      return;
    }

    // Defer heavy model assembly until idle to keep modal first paint smooth.
    const enableWhenIdle = () => {
      setEnableModel(true);
    };

    if ('requestIdleCallback' in window) {
      idleId = (
        window as Window & {
          requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        }
      ).requestIdleCallback(() => enableWhenIdle(), { timeout: 250 });
    } else {
      timerId = setTimeout(enableWhenIdle, 40);
    }

    return () => {
      if (idleId !== null && 'cancelIdleCallback' in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
      setEnableModel(false);
    };
  }, [open]);

  // Animate progress bar: show old value, then after short delay, animate to new value
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setDisplayedCurrent(current - 1 >= 0 ? current - 1 : 0);
      }, 0);
      const timer = setTimeout(() => {
        setDisplayedCurrent(current);
      }, 400); // 400ms delay before animating up
      return () => clearTimeout(timer);
    }
  }, [open, current]);

  if (!open) return null;

  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min((displayedCurrent / safeTotal) * 100, 100);

  const locData = getLocationData(checkinId);

  // Resolve lottie-react default vs named export at runtime
  const Lottie = (LottieLib as any)?.default || LottieLib;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-300" style={{ zIndex: 'var(--z-overlay)' }}>
      <div className="absolute inset-0" onClick={onClose} />

      {lottieData != null && (
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-70 mix-blend-screen">
              <Lottie animationData={lottieData as any} loop={true} style={{ width: '150%', height: '150%' }} />
            </div>
          )}

      <div className="relative z-10 w-full max-w-[95vw] sm:max-w-sm overflow-hidden rounded-[18px] sm:rounded-[24px] border border-[var(--color-primary)]/30 bg-[var(--color-surface)]/85 p-3 sm:p-6 shadow-[var(--shadow-card)] backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 sm:right-4 sm:top-4 z-20 flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[var(--color-text-main)]/5 text-2xl sm:text-xl text-[var(--color-text-secondary)] transition hover:bg-[var(--color-text-main)]/10 hover:text-[var(--color-text-main)]"
          style={{ touchAction: 'manipulation' }}
          aria-label="Close"
        >
          ×
        </button>

        <div className="relative mx-auto mb-4 sm:mb-6 flex h-40 sm:h-64 w-full items-center justify-center rounded-xl sm:rounded-2xl bg-[var(--color-primary)]/5 shadow-inner overflow-visible">
          <div className="absolute bottom-4 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-[var(--color-primary)]/20 blur-xl animate-pulse" />
          <div className="absolute bottom-6 left-1/2 h-2 w-1/2 -translate-x-1/2 rounded-full bg-[var(--color-accent)]/30 blur-sm" />

          <div className="absolute inset-0 z-10" style={{ perspective: '800px' }}>
            <AssembledModelViewer
              buildingId={checkinId}
              buildingModelFile={locData?.model}
              birdModelFile={locData?.birdModel}
              buildingOffset={locData?.buildingOffset}
              enabled={enableModel}
              includeWearables={false}
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

        <div className="text-center relative z-10">
          <p className="inline-block rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] shadow-sm">
            Discovery Unlocked
          </p>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--color-text-main)] drop-shadow-sm">
            {mascotName}
          </h2>

          <p className="mt-2 text-[15px] font-medium text-[var(--color-text-secondary)]">
            You investigated <span className="font-bold text-[var(--color-accent)] drop-shadow-sm">{locationName}</span> and unlocked a new campus mascot!
          </p>
        </div>

        <div className="mt-6 rounded-[16px] bg-[var(--color-background)] p-4 shadow-sm ring-1 ring-[var(--color-state-disabled)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--color-text-main)]">
              Collection Progress
            </span>
            <span className="rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-bold text-white shadow-sm">
              {displayedCurrent} / {total}
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-state-disabled)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <SummonARButton onClick={() => onEnterAR ? onEnterAR(checkinId, mascotName) : onClose()} />

          <div className="flex flex-row gap-3">
            <button
              onClick={onViewCollection || onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-[var(--color-state-disabled)] bg-[var(--color-surface)] px-2 py-3 font-semibold text-[var(--color-text-main)] transition hover:bg-[var(--color-background)] hover:shadow-sm cursor-pointer"
            >
              <Backpack className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-sm">View Collection</span>
            </button>
            <button
              onClick={onClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-[12px] border border-[var(--color-state-disabled)] bg-[var(--color-surface)] px-2 py-3 font-semibold text-[var(--color-text-main)] transition hover:bg-[var(--color-background)] hover:shadow-sm cursor-pointer"
            >
              <MapIcon className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-sm">Return to Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useState } from 'react';
import { CircleHelp, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WARDROBE_CREDITS_INFO } from '../../constants/wardrobeCreditsInfo';
import WardrobeStudioCreditsInfoDialog from './WardrobeStudioCreditsInfoDialog';

type WardrobeStudioCreditsProps = {
  credits: number;
  className?: string;
};

export default function WardrobeStudioCredits({
  credits,
  className = '',
}: WardrobeStudioCreditsProps) {
  const router = useRouter();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handlePrimaryAction = useCallback(() => {
    router.push(WARDROBE_CREDITS_INFO.primaryAction.route);
    setIsInfoOpen(false);
  }, [router]);

  return (
    <div className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] px-3 py-2 text-sm font-semibold text-[var(--color-text-main)] shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl">
        <Coins className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
        <span className="min-w-0 whitespace-nowrap text-[11px] font-semibold tabular-nums sm:text-sm">
          <span className="max-[359px]:hidden">{WARDROBE_CREDITS_INFO.creditsLabel} </span>
          <span className="hidden max-[359px]:inline">
            {WARDROBE_CREDITS_INFO.creditsCompactLabel}{' '}
          </span>
          {credits}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setIsInfoOpen(true)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] text-[var(--color-primary)] shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl"
        aria-label={WARDROBE_CREDITS_INFO.helpButtonAriaLabel}
      >
        <CircleHelp className="h-4 w-4" />
      </button>

      <WardrobeStudioCreditsInfoDialog
        isOpen={isInfoOpen}
        content={WARDROBE_CREDITS_INFO}
        onClose={() => setIsInfoOpen(false)}
        onPrimaryAction={handlePrimaryAction}
      />
    </div>
  );
}

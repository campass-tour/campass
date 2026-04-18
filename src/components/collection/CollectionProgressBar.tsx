type CollectionProgressBarProps = {
  current: number;
  total: number;
  title?: string;
};

export default function CollectionProgressBar({
  current,
  total,
  title = 'Collection Progress',
}: CollectionProgressBarProps) {
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min((current / safeTotal) * 100, 100);
  const percentageLabel = Math.round(percentage);

  return (
    <div className="collection-progress-capsule w-full rounded-[32px] border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] px-4 py-4 shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl sm:px-5">
      <div className="flex items-center gap-4 sm:gap-5">
        <div
          className="collection-progress-ring relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full sm:h-[72px] sm:w-[72px]"
          style={{
            background: `conic-gradient(var(--collection-progress-ring-fill) ${percentage}%, var(--collection-progress-ring-track) ${percentage}% 100%)`,
          }}
          aria-hidden="true"
        >
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[var(--collection-progress-ring-center)] sm:h-[56px] sm:w-[56px]">
            <span className="inline-flex items-baseline justify-center leading-none text-[22px] font-extrabold tracking-[-0.04em] text-[var(--collection-progress-ring-text)] sm:text-[24px]">
              {percentageLabel}
              <span className="ml-0.5 text-[11px] font-semibold tracking-[0.02em] text-[var(--collection-progress-ring-meta)] sm:text-[12px]">
                %
              </span>
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--collection-progress-kicker)]">
              {title}
            </p>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[var(--collection-progress-track)]">
            <div
              className="h-full rounded-full bg-[var(--collection-progress-fill)] transition-[width] duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--collection-progress-copy)] sm:text-sm">
            Keep exploring to unlock more campus birds.
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-[var(--collection-progress-badge-bg)] px-3 py-2 text-center text-[13px] font-semibold text-[var(--collection-progress-badge-text)] shadow-[var(--collection-progress-badge-shadow)] sm:min-w-[72px]">
          {current} / {total}
        </div>
      </div>
    </div>
  );
}

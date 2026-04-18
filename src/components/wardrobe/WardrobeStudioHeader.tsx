import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

type WardrobeStudioHeaderProps = {
  equippedCount: number;
};

export default function WardrobeStudioHeader({
  equippedCount: _equippedCount,
}: WardrobeStudioHeaderProps) {
  return (
    <header className="rounded-[var(--radius-card)] border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] p-5 text-left shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--wall-kicker)]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>WARDROBE STUDIO</span>
          </p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.04em] text-[var(--color-text-main)] md:text-5xl">
            Mascot Dressing Room
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start">

          <Link
            href="/collection"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] px-4 py-2 text-sm font-semibold text-[var(--color-text-main)] shadow-[var(--collection-capsule-shadow)]"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--color-primary)]" />
            <span>Back to Collection</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

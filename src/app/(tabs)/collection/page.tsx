'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import MascotCard from '@/components/collection/MascotCard';
import CollectionProgressBar from '@/components/collection/CollectionProgressBar';
import CollectionSwiperModal from '@/components/collection/CollectionSwiperModal';
import ARModelViewer from '@/components/photo/ARModelViewer';
import { LOCATIONS, getLocationData } from '@/constants/locations';
import { getUnlockedCollectibles, getUnlockedCount } from '@/lib/storage';

const defaultImageUrl = '/image/default-image.png';

const resolveImageUrl = (fileName?: string | null) => {
  if (!fileName) return defaultImageUrl;
  if (fileName.startsWith('/')) return fileName;
  return `/image/${fileName}`;
};

export default function CollectionPage() {
  const unlockedData = getUnlockedCollectibles();
  const unlockedCount = getUnlockedCount();
  const [selectedMascotId, setSelectedMascotId] = useState<string | null>(null);
  const [arTargetId, setArTargetId] = useState<string | null>(null);
  const [arTargetName, setArTargetName] = useState<string>('');

  const handleMascotClick = (id: string, isUnlocked: boolean) => {
    if (isUnlocked) {
      setSelectedMascotId(id);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 bg-[var(--wall-page-bg)] px-2 pb-32 md:px-6">
      <section className="relative pt-6 text-left md:pt-10">
        <div className="relative max-w-3xl">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--wall-kicker)]">
            XJTLU CAMPUS LORE
          </p>
          <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight text-[var(--color-text-main)] md:mt-1 md:text-4xl">
            My Collection
          </h1>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/collection/studio"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--collection-capsule-border)] bg-[var(--collection-capsule-bg)] px-4 py-3 text-sm font-semibold text-[var(--color-text-main)] shadow-[var(--collection-capsule-shadow)] backdrop-blur-xl transition hover:bg-[var(--color-surface)]"
          >
            <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
            <span>Open Dressing Room</span>
          </Link>
        </div>

        <div className="mt-6 flex justify-start">
          <CollectionProgressBar current={unlockedCount || 0} total={LOCATIONS.length} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {LOCATIONS.map((loc) => {
          const locData = getLocationData(loc.id);
          const isUnlocked = !!unlockedData[loc.id];
          const imageSrc = resolveImageUrl(locData?.image);

          return (
            <div
              key={loc.id}
              onClick={() => handleMascotClick(loc.id, isUnlocked)}
              className={isUnlocked ? 'cursor-pointer' : ''}
            >
              <MascotCard
                name={locData?.mascotName || loc.name}
                location={loc.name}
                status={isUnlocked ? 'unlocked' : 'locked'}
                image={isUnlocked ? imageSrc : undefined}
              />
            </div>
          );
        })}
      </div>

      <CollectionSwiperModal
        open={!!selectedMascotId}
        onClose={() => setSelectedMascotId(null)}
        initialCheckinId={selectedMascotId || ''}
        onViewCollection={() => setSelectedMascotId(null)}
        onEnterAR={(mascotId, mascotName) => {
          setSelectedMascotId(null);
          setArTargetId(mascotId);
          setArTargetName(mascotName);
        }}
      />

      <ARModelViewer
        open={!!arTargetId}
        onClose={() => setArTargetId(null)}
        checkinId={arTargetId || undefined}
        mascotName={arTargetName}
      />
    </div>
  );
}

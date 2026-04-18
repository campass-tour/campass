import {
  LayoutGrid,
  Package2,
  ScanFace,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { WardrobeCategory } from '../../types';

const categoryIcons: Record<WardrobeCategory['icon'], LucideIcon> = {
  LayoutGrid,
  Sparkles,
  ScanFace,
  Package2,
};

export function WardrobeStudioItemImage({
  imageFile,
  className,
  alt,
}: {
  /** Path relative to `/public/image/` (e.g. `clothes/sunglasses.png`). */
  imageFile: string;
  className?: string;
  alt: string;
}) {
  const src = imageFile.startsWith('/') ? imageFile : `/image/${imageFile}`;
  if (!imageFile) {
    return <span className={className} aria-label={alt} />;
  }

  return <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />;
}

export function WardrobeStudioCategoryIcon({
  icon,
  className,
}: {
  icon: WardrobeCategory['icon'];
  className?: string;
}) {
  const Icon = categoryIcons[icon] ?? LayoutGrid;
  return <Icon className={className} />;
}

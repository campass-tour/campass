import { useEffect, useMemo, useState } from 'react';
import type { WardrobeItem } from '../../types';
import { getAssembledWearablesModelBlob } from '../../lib/modelAssembly';

const ModelViewer = 'model-viewer' as any;

const normalizeModelViewerProps = (props?: Record<string, unknown>) => {
  if (!props) return {};

  const normalized: Record<string, unknown> = {};
  Object.entries(props).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      normalized[key] = value ? 'true' : 'false';
      return;
    }
    normalized[key] = value;
  });

  return normalized;
};

type WardrobeStudioModelViewerProps = {
  birdUrl: string;
  previewItems: WardrobeItem[];
  resetViewKey: number;
  modelViewerProps?: Record<string, unknown>;
  style?: React.CSSProperties;
};

export default function WardrobeStudioModelViewer({
  birdUrl,
  previewItems,
  resetViewKey,
  modelViewerProps,
  style,
}: WardrobeStudioModelViewerProps) {
  const normalizedModelViewerProps = useMemo(
    () => normalizeModelViewerProps(modelViewerProps),
    [modelViewerProps]
  );
  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({
      display: 'block',
      width: '100%',
      height: '100%',
      ...style,
    }),
    [style]
  );

  const wearables = useMemo(
    () =>
      previewItems
        .map((item) => {
          if (!item.modelFile) return null;
          const wearableUrl = item.modelFile.startsWith('/')
            ? item.modelFile
            : `/model/clothes/${item.modelFile}`;
          if (!wearableUrl) return null;
          return {
            id: item.id,
            wearableUrl,
            wearableOffset: item.previewOffset,
            wearableRotation: item.previewRotation,
            wearableScale: item.previewScale,
          };
        })
        .filter((wearable): wearable is NonNullable<typeof wearable> => wearable !== null),
    [previewItems]
  );

  const [assembledBlob, setAssembledBlob] = useState<Blob | null>(null);
  const [assembledSrc, setAssembledSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setAssembledBlob(null);

    if (wearables.length === 0) {
      return () => {
        active = false;
      };
    }

    getAssembledWearablesModelBlob({
      birdUrl,
      wearables,
      cacheKey: `wardrobe:${wearables.map((wearable) => wearable.id).join(',')}`,
    })
      .then((blob: Blob) => {
        if (active) setAssembledBlob(blob);
      })
      .catch(() => {
        if (active) setAssembledBlob(null);
      });

    return () => {
      active = false;
    };
  }, [birdUrl, wearables, resetViewKey]);

  useEffect(() => {
    if (!assembledBlob) {
      setAssembledSrc(null);
      return;
    }

    const objectUrl = URL.createObjectURL(assembledBlob);
    setAssembledSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [assembledBlob]);

  const src = wearables.length > 0 ? (assembledSrc || birdUrl) : birdUrl;

  return (
    <ModelViewer
      key={`wardrobe-mv-${resetViewKey}-${src}`}
      src={src}
      style={mergedStyle}
      loading="lazy"
      {...normalizedModelViewerProps}
    />
  );
}

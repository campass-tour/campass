import { useEffect, useMemo, useState } from 'react';
import { getAssembledModelBlob } from '../../lib/modelAssembly';
import { WARDROBE_ITEMS } from '../../constants/wardrobeCatalog';
import { getWardrobeEquippedBySlot } from '../../lib/wardrobeStudioStorage';

const FALLBACK_MODEL_URL = '/model/bird.glb';
const birdUrl = '/model/bird.glb';
const ModelViewer = 'model-viewer' as any;

const toPublicModelUrl = (fileName?: string | null) => {
  if (!fileName) return null;
  if (fileName.startsWith('/')) return fileName;
  return `/model/${fileName}`;
};

const resolveBuildingUrl = (buildingId: string, modelFile?: string | null) => {
  const configured = toPublicModelUrl(modelFile);
  if (configured) return configured;
  return `/model/${buildingId}.glb`;
};

const resolveBirdUrl = (birdModelFile?: string | null) => {
  const configured = toPublicModelUrl(birdModelFile);
  if (configured) return configured;
  return birdUrl;
};

type AssembledModelViewerProps = {
  buildingId: string;
  buildingModelFile?: string | null;
  birdModelFile?: string | null;
  buildingOffset?: [number, number, number] | null;
  className?: string;
  style?: React.CSSProperties;
  modelViewerProps?: Record<string, unknown>;
  enabled?: boolean;
};

export default function AssembledModelViewer({
  buildingId,
  buildingModelFile,
  birdModelFile,
  buildingOffset,
  className,
  style,
  modelViewerProps,
  enabled = true,
}: AssembledModelViewerProps) {
  const buildingUrl = useMemo(
    () => resolveBuildingUrl(buildingId, buildingModelFile),
    [buildingId, buildingModelFile]
  );
  const resolvedBirdUrl = useMemo(
    () => resolveBirdUrl(birdModelFile),
    [birdModelFile]
  );
  const [assembledBlob, setAssembledBlob] = useState<Blob | null>(null);
  const [assembledSrc, setAssembledSrc] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    import('@google/model-viewer')
      .then(() => {
        if (isMounted) setViewerReady(true);
      })
      .catch(() => {
        if (isMounted) setViewerReady(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setAssembledBlob(null);

    if (!enabled) return () => { active = false; };

    const equippedBySlot = getWardrobeEquippedBySlot();
    const slotPriority = ['head', 'face', 'gear'] as const;
    const wearables = slotPriority
      .map((slot) => equippedBySlot[slot])
      .map((itemId) => (itemId ? WARDROBE_ITEMS.find((item) => item.id === itemId) ?? null : null))
      .filter((item) => item?.modelFile)
      .map((item) => {
        const modelFile = item?.modelFile ?? null;
        const wearableUrl = modelFile
          ? `/model/clothes/${modelFile}`
          : null;
        if (!wearableUrl || !item) return null;
        return {
          wearableUrl,
          wearableOffset: item.previewOffset,
          wearableRotation: item.previewRotation,
          wearableScale: item.previewScale,
        };
      })
      .filter((value): value is NonNullable<typeof value> => value !== null);

    getAssembledModelBlob({
      birdUrl: resolvedBirdUrl,
      buildingUrl,
      buildingOffset,
      wearables,
      cacheKey: buildingId,
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
  }, [buildingId, buildingUrl, buildingOffset, resolvedBirdUrl, enabled]);

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

  const finalSrc = assembledSrc || buildingUrl || FALLBACK_MODEL_URL;

  if (!viewerReady) return null;

  return (
    <ModelViewer
      className={className}
      style={style}
      src={finalSrc}
      loading="lazy"
      {...modelViewerProps}
    />
  );
}

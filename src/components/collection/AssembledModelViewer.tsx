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
  return FALLBACK_MODEL_URL;
};

const resolveBirdUrl = (birdModelFile?: string | null) => {
  const configured = toPublicModelUrl(birdModelFile);
  if (configured) return configured;
  return birdUrl;
};

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

type AssembledModelViewerProps = {
  buildingId: string;
  buildingModelFile?: string | null;
  birdModelFile?: string | null;
  buildingOffset?: [number, number, number] | null;
  className?: string;
  style?: React.CSSProperties;
  modelViewerProps?: Record<string, unknown>;
  enabled?: boolean;
  includeWearables?: boolean;
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
  includeWearables = true,
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

  useEffect(() => {
    let active = true;
    setAssembledBlob(null);

    if (!enabled) return () => { active = false; };

    const wearables = includeWearables
      ? (() => {
          const equippedBySlot = getWardrobeEquippedBySlot();
          const slotPriority = ['head', 'face', 'gear'] as const;
          return slotPriority
            .map((slot) => equippedBySlot[slot])
            .map((itemId) => (itemId ? WARDROBE_ITEMS.find((item) => item.id === itemId) ?? null : null))
            .filter((item) => item?.modelFile)
            .map((item) => {
              const modelFile = item?.modelFile ?? null;
              const wearableUrl = modelFile ? `/model/clothes/${modelFile}` : null;
              if (!wearableUrl || !item) return null;
              return {
                wearableUrl,
                wearableOffset: item.previewOffset,
                wearableRotation: item.previewRotation,
                wearableScale: item.previewScale,
              };
            })
            .filter((value): value is NonNullable<typeof value> => value !== null);
        })()
      : [];

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
  }, [buildingId, buildingUrl, buildingOffset, resolvedBirdUrl, enabled, includeWearables]);

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

  return (
    <ModelViewer
      key={finalSrc}
      className={className}
      style={mergedStyle}
      src={finalSrc}
      loading="lazy"
      {...normalizedModelViewerProps}
    />
  );
}

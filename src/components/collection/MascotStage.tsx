import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

const FALLBACK_MODEL_URL = '/model/bird.glb';
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

type MascotStageProps = {
  buildingId: string;
  buildingModelFile?: string | null;
  anchorPoint?: [number, number, number] | null;
  className?: string;
  style?: CSSProperties;
};

export default function MascotStage({
  buildingId,
  buildingModelFile,
  className,
  style,
}: MascotStageProps) {
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

  const buildingUrl = useMemo(
    () => resolveBuildingUrl(buildingId, buildingModelFile) || FALLBACK_MODEL_URL,
    [buildingId, buildingModelFile]
  );

  if (!viewerReady) return null;

  return (
    <ModelViewer
      className={className}
      style={style}
      src={buildingUrl}
      loading="lazy"
      camera-controls="true"
      auto-rotate="true"
      disable-zoom="true"
      interaction-prompt="none"
      exposure="1.1"
    />
  );
}

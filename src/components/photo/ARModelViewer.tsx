'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import ARUnsupportedPrompt from './ARUnsupportedPrompt';
import { getLocationData } from '../../constants/locations';
import { getAssembledModelBlob } from '../../lib/modelAssembly';
import { WARDROBE_ITEMS } from '../../constants/wardrobeCatalog';
import { getWardrobeEquippedBySlot } from '../../lib/wardrobeStudioStorage';

const toModelUrl = (value?: string | null) => {
  if (!value) return null;
  if (/^(https?:|data:)/.test(value)) return value;
  const fileName = value.replace(/^.*[\\/]/, '');
  return `/model/${fileName}`;
};

const toClothingModelUrl = (value?: string | null) => {
  if (!value) return null;
  if (/^(https?:|data:)/.test(value)) return value;
  const fileName = value.replace(/^.*[\\/]/, '');
  return `/model/clothes/${fileName}`;
};

const getDefaultModelUrl = () => '/model/bird.glb';

type ARModelViewerProps = {
  open: boolean;
  onClose: () => void;
  checkinId?: string;
  mascotName?: string;
};

export default function ARModelViewer({
  open,
  onClose,
  checkinId,
  mascotName = 'Mascot',
}: ARModelViewerProps) {
  useEffect(() => {
    import('@google/model-viewer');
  }, []);

  const [isReady, setIsReady] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isAssembling, setIsAssembling] = useState(false);
  const [assembledBlob, setAssembledBlob] = useState<Blob | null>(null);
  const [assembledSrc, setAssembledSrc] = useState<string | null>(null);
  const modelViewerRef = useRef<any>(null);

  const locData = useMemo(
    () => (checkinId ? getLocationData(checkinId) : null),
    [checkinId]
  );

  const resolveBuildingUrl = (buildingId?: string, modelFile?: string | null) => {
    if (modelFile) {
      const configured = toModelUrl(modelFile);
      if (configured) return configured;
    }

    return getDefaultModelUrl();
  };

  const resolveBirdUrl = (birdModelFile?: string | null) => {
    if (birdModelFile) {
      const configured = toModelUrl(birdModelFile);
      if (configured) return configured;
    }
    return toModelUrl('bird.glb') || getDefaultModelUrl();
  };

  const fallbackModelSrc = useMemo(
    () => resolveBuildingUrl(checkinId, locData?.model),
    [checkinId, locData?.model]
  );

  useEffect(() => {
    if (!open) return;

    // A simple heuristic for supported AR environments
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /android/i.test(userAgent);
    const isMobile = isIOS || isAndroid;

    // Delay check slightly to let model-viewer initialize
    const timer = setTimeout(() => {
      // Use native model-viewer capability if possible
      const mv = modelViewerRef.current;
      const mvSupportsAR = mv && 'canActivateAR' in mv ? mv.canActivateAR : true;
      
      // Fallback check: Mobile required + WebXR or iOS
      const fallbackSupport = isMobile && (isIOS || 'xr' in navigator);
      
      setIsSupported(mvSupportsAR && fallbackSupport);
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    let active = true;
    setAssembledBlob(null);

    if (!open || !checkinId) {
      setIsAssembling(false);
      return () => {
        active = false;
      };
    }

    const buildingUrl = resolveBuildingUrl(checkinId, locData?.model);
    const birdUrl = resolveBirdUrl(locData?.birdModel);
    const equippedBySlot = getWardrobeEquippedBySlot();
    const slotPriority = ['head', 'face', 'gear'] as const;
    const wearables = slotPriority
      .map((slot) => equippedBySlot[slot])
      .map((itemId) => (itemId ? WARDROBE_ITEMS.find((item) => item.id === itemId) ?? null : null))
      .filter((item) => item?.modelFile)
      .map((item) => {
        const modelFile = item?.modelFile ?? null;
        const wearableUrl = modelFile ? toClothingModelUrl(modelFile) : null;
        if (!wearableUrl || !item) return null;
        return {
          wearableUrl,
          wearableOffset: item.previewOffset,
          wearableRotation: item.previewRotation,
          wearableScale: item.previewScale,
        };
      })
      .filter((value): value is NonNullable<typeof value> => value !== null);

    setIsAssembling(true);
    getAssembledModelBlob({
      birdUrl,
      buildingUrl,
      buildingOffset: locData?.buildingOffset,
      wearables,
      cacheKey: `ar:${checkinId}`,
    })
      .then((blob: Blob) => {
        if (!active) return;
        setAssembledBlob(blob);
        setIsAssembling(false);
      })
      .catch(() => {
        if (!active) return;
        setAssembledBlob(null);
        setIsAssembling(false);
      });

    return () => {
      active = false;
    };
  }, [open, checkinId, locData]);

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

  if (!open) return null;
  const modelSrc = assembledSrc || fallbackModelSrc || getDefaultModelUrl();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--color-background)] animate-in fade-in duration-300" style={{ zIndex: 'var(--z-overlay)' }}>
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 flex h-16 items-center justify-between px-4 bg-gradient-to-b from-black/50 to-transparent" style={{ zIndex: 'var(--z-overlay)' }}>
        <h2 className="text-lg font-bold text-white drop-shadow-md">
          {mascotName} AR
        </h2>
            <button
          onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white transition hover:bg-white/30 active:scale-95"
              style={{ zIndex: 'var(--z-overlay)' }}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {!isReady ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        </div>
      ) : !isSupported ? (
        <ARUnsupportedPrompt />
      ) : (
        <div className="relative w-full h-full flex-1">
          {isAssembling && (
            <div className="pointer-events-none absolute top-20 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Preparing mascot model...
            </div>
          )}
          {/* @ts-expect-error: model-viewer is a custom web component not recognized by TypeScript */}
          <model-viewer
            ref={modelViewerRef}
            src={modelSrc}
            loading="lazy"
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-background)' }}
            alt={`A 3D model of ${mascotName}`}
          >
            {/* Custom styled AR Button replacing the default one */}
            <button
              slot="ar-button"
              className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 font-bold text-white shadow-[var(--shadow-floating)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              style={{ zIndex: 'var(--z-overlay)' }}
            >
              <Camera className="h-5 w-5 text-[var(--color-accent)]" />
              <span>Start AR</span>
            </button>
          {/* @ts-expect-error: model-viewer is a custom web component not recognized by TypeScript */}
          </model-viewer>
        </div>
      )}
    </div>
  );
}

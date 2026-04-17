'use client';

import { useRef, useEffect, useCallback, useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { Plus, Minus, Maximize, LocateFixed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserPositionIndicator } from './UserPositionIndicator';
import { MapPin } from './MapPin';
import { MapOverlayLayer } from './MapOverlayLayer';
import MapFilter from './MapFilter';
const ARModelViewer = lazy(() => import('../photo/ARModelViewer'));
import { LOCATIONS } from '../../constants/locations';
import { userPosition as staticUserPosition } from '../../constants/userPositionData';
import { convertGpsToImageCoordinates } from '../../lib/mapConverter';
import EdgeDirectionIndicator from './EdgeDirectionIndicator';
import { ANCHOR_POINT_1, ANCHOR_POINT_2 } from '../../constants/mapConfig';
// import { getMarkerAndContainerCenters } from './getMarkerAndContainerCenters';
import { isCollectibleUnlocked } from '../../lib/storage';
import { centerMarkerInContainer } from '../../lib/mapUtils';
import type { TransformAnimationType } from '../../lib/mapUtils';
import { SideDrawer } from '../common/SideDrawer';
import WallContent from './WallContent';

interface MapViewerProps {
  className?: string;
  initialScale?: number;
}

export function MapViewer({ className, initialScale = 0.5 }: MapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const router = useRouter();

  const [arTarget, setArTarget] = useState<{ id: string, name: string } | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<number[] | null>(null);
  const [activeDrawerLocation, setActiveDrawerLocation] = useState<string | null>(null);
  const availableLevels = Array.from(new Set(LOCATIONS.map(l => l.lv || 1))).sort();
  const [isWideScreen, setIsWideScreen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 900 : true);

  // Real-time user image position derived from GPS (percent coordinates)
  const [userImagePosition, setUserImagePosition] = useState<{ x: number; y: number; heading: number } | null>(null);
  const [showUserImagePosition, setShowUserImagePosition] = useState<boolean>(false);
  const [showEdgeIndicator, setShowEdgeIndicator] = useState<boolean>(false);
  const [edgeBearing, setEdgeBearing] = useState<number>(0);
  const [edgeTargetName, setEdgeTargetName] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Watch browser geolocation and convert to image % coordinates.
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    // Bounding box (GPS): NW and SE corners provided by user
    const MIN_LON = 120.73598783189566;
    const MAX_LON = 120.7470627351817;
    const MIN_LAT = 31.268996839860193;
    const MAX_LAT = 31.27890548449692;

    let watchId: number | null = null;
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // If outside bounding box, hide blue dot and show edge indicator
          if (lon < MIN_LON || lon > MAX_LON || lat < MIN_LAT || lat > MAX_LAT) {
            setShowUserImagePosition(false);
            // find nearest location with GPS as the target; fallback to center between anchors
            let nearest: any = null;
            let minDist = Infinity;
            LOCATIONS.forEach((loc) => {
              if (loc.gps && typeof loc.gps.lat === 'number' && typeof loc.gps.lon === 'number') {
                const dLat = (loc.gps.lat - lat) * Math.PI / 180;
                const dLon = (loc.gps.lon - lon) * Math.PI / 180;
                const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat * Math.PI / 180) * Math.cos(loc.gps.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                const R = 6371000; // meters
                const dist = R * c;
                if (dist < minDist) {
                  minDist = dist;
                  nearest = loc;
                }
              }
            });

            let targetLat = (ANCHOR_POINT_1.gps.lat + ANCHOR_POINT_2.gps.lat) / 2;
            let targetLon = (ANCHOR_POINT_1.gps.lon + ANCHOR_POINT_2.gps.lon) / 2;
            if (nearest && nearest.gps) {
              targetLat = nearest.gps.lat;
              targetLon = nearest.gps.lon;
              setEdgeTargetName(nearest.name || nearest.id || 'Campus');
            } else {
              setEdgeTargetName('Campus');
            }

            // compute bearing from user -> target
            const toRad = Math.PI / 180;
            const y = Math.sin((targetLon - lon) * toRad) * Math.cos(targetLat * toRad);
            const x = Math.cos(lat * toRad) * Math.sin(targetLat * toRad) - Math.sin(lat * toRad) * Math.cos(targetLat * toRad) * Math.cos((targetLon - lon) * toRad);
            const brng = Math.atan2(y, x) * 180 / Math.PI; // degrees
            const bearing = (brng + 360) % 360;
            setEdgeBearing(bearing);
            setShowEdgeIndicator(true);
            return;
          }

          const imageCoords = convertGpsToImageCoordinates({ lat, lon });
          if (!imageCoords) {
            setShowUserImagePosition(false);
            setShowEdgeIndicator(false);
            return;
          }

          setUserImagePosition({ x: imageCoords.xPercent, y: imageCoords.yPercent, heading: pos.coords.heading ?? 0 });
          setShowUserImagePosition(true);
          setShowEdgeIndicator(false);
        },
        () => {
          // On error, hide the dynamic arrow (fallback to static if present)
          setShowUserImagePosition(false);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    } catch (e) {
      setShowUserImagePosition(false);
    }

    return () => {
      if (watchId !== null && 'geolocation' in navigator) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // (device orientation listener removed; component no longer uses deviceHeading)

  // 鐢ㄦ埛浣嶇疆鍜孭in鐐规暟鎹凡鎻愬彇鍒扮嫭绔嬫枃浠?

  const updateCSSVars = useCallback((scale: number) => {
    if (imgRef.current && containerRef.current) {
      const naturalWidth = imgRef.current.naturalWidth;
      const naturalHeight = imgRef.current.naturalHeight;
      const scaledWidth = naturalWidth * scale;
      const scaledHeight = naturalHeight * scale;
      const containerRect = containerRef.current.getBoundingClientRect();
      containerRef.current.style.setProperty('--image-width', scaledWidth + 'px');
      containerRef.current.style.setProperty('--image-height', scaledHeight + 'px');
      containerRef.current.style.setProperty('--container-width', containerRect.width + 'px');
      containerRef.current.style.setProperty('--container-height', containerRect.height + 'px');
      containerRef.current.style.setProperty('--map-inv-scale', String(1 / scale));
    }
  }, []);

  useEffect(() => {
    const imgElement = imgRef.current;
    const handleLoad = () => updateCSSVars(initialScale);
    if (imgElement?.complete) {
      handleLoad();
    } else {
      imgElement?.addEventListener('load', handleLoad);
    }
    return () => {
      imgElement?.removeEventListener('load', handleLoad);
    };
  }, [initialScale, updateCSSVars]);

  const centerOnUserMarker = useCallback(
    (
      positionX: number,
      positionY: number,
      scale: number,
      setTransform: (x: number, y: number, scale: number, animationTime?: number, animationType?: TransformAnimationType) => void,
      animationTime = 500
    ) => {
      return centerMarkerInContainer(
        'user-position-marker',
        containerRef.current,
        positionX,
        positionY,
        scale,
        setTransform,
        animationTime
      );
    },
    []
  );

  const centerUsingTransformRef = useCallback((animationTime = 500) => {
    const ref = transformRef.current;

    if (!ref) {
      return false;
    }

    if (!ref.state) return false;
    const { positionX, positionY, scale } = ref.state;

    return centerOnUserMarker(
      positionX,
      positionY,
      scale,
      ref.setTransform,
      animationTime,
    );
  }, [centerOnUserMarker]);

  const handleTransformInit = useCallback((ref: ReactZoomPanPinchRef) => {
    transformRef.current = ref;

    let attempts = 0;
    const maxAttempts = 10;
    const tryCenter = () => {
      const centered = centerUsingTransformRef(500);
      if (!centered && attempts < maxAttempts) {
        attempts += 1;
        setTimeout(tryCenter, 60);
      }
    };

    setTimeout(tryCenter, 0);
  }, [centerUsingTransformRef]);

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full min-h-0 w-full overflow-hidden', className)}
      style={{ background: 'var(--color-map-bg)' }}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={initialScale}
        minScale={0.15}
        maxScale={5}
        centerOnInit={true}
        limitToBounds={false}
        pinch={{ step: 5 }}
        wheel={{ step: 0.1 }}
        onInit={handleTransformInit}
        onTransform={(ref) => {
          updateCSSVars(ref.state.scale);
          // 鍦板浘鍙樻崲瀹屾垚鍚庯紝瑙﹀彂寮圭獥浣嶇疆鏇存柊
          window.dispatchEvent(new CustomEvent('map-transform'));
        }}
      >
        {({ zoomIn, zoomOut, resetTransform, setTransform }) => (
          <>
            <MapFilter
              availableLevels={availableLevels}
              selectedLevels={selectedLevels}
              onChange={(levels) => setSelectedLevels(levels)}
            />
            <div className="pointer-events-auto absolute bottom-4 right-4 left-auto z-50 flex flex-col overflow-hidden rounded-2xl bg-(--color-surface) shadow-(--shadow-card) border border-(--color-state-disabled)">
              <button 
                onClick={() => centerOnUserMarker(
                  transformRef.current?.state?.positionX ?? 0,
                  transformRef.current?.state?.positionY ?? 0,
                  transformRef.current?.state?.scale ?? initialScale,
                  setTransform,
                )} 
                className="flex h-12 w-12 items-center justify-center bg-primary/10 text-(--color-primary) transition-colors hover:bg-primary/15 focus:outline-none"
                aria-label="Locate me"
              >
                <LocateFixed size={22} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => zoomIn()} 
                className="flex h-12 w-12 items-center justify-center border-t border-(--color-state-disabled) text-(--color-text-main) transition-colors hover:bg-(--color-background) focus:outline-none"
                aria-label="Zoom in"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => zoomOut()} 
                className="flex h-12 w-12 items-center justify-center border-t border-(--color-state-disabled) text-(--color-text-main) transition-colors hover:bg-(--color-background) focus:outline-none"
                aria-label="Zoom out"
              >
                <Minus size={22} strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => resetTransform()} 
                className="flex h-12 w-12 items-center justify-center border-t border-(--color-state-disabled) text-(--color-text-main) transition-colors hover:bg-(--color-background) focus:outline-none"
                aria-label="Reset zoom"
              >
                <Maximize size={22} strokeWidth={2.5} />
              </button>
            </div>
            
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <div className="relative pointer-events-none" style={{ display: 'inline-flex' }}>
                <img
                  ref={imgRef}
                  src="/image/map.svg"
                  alt="Interactive Campus Map"
                  className="pointer-events-auto select-none max-w-none"
                  draggable={false}
                  onLoad={() => {
                    const scale = transformRef.current?.state?.scale ?? initialScale;
                    updateCSSVars(scale);
                    // 鍏堝眳涓敤鎴风澶达紝鍐嶅仛鍏跺畠閫昏緫
                    setTimeout(() => {
                      centerUsingTransformRef(500);
                    }, 0);
                  }}
                  style={{ display: 'block', willChange: 'transform' }}
                />
                {/* Render pins and markers onto an exact proportional overlay */}
                <MapOverlayLayer>
                  {showUserImagePosition && userImagePosition ? (
                    <UserPositionIndicator userPosition={{ x: userImagePosition.x, y: userImagePosition.y, heading: userImagePosition.heading }} />
                  ) : (
                    !showEdgeIndicator && staticUserPosition ? (
                      <UserPositionIndicator userPosition={{ x: staticUserPosition.x, y: staticUserPosition.y, heading: staticUserPosition.heading ?? 0 }} />
                    ) : null
                  )}
                  {LOCATIONS.filter(loc => {
                    if (selectedLevels === null) return true;
                    return selectedLevels.includes(loc.lv ?? 1);
                  }).map(location => {
                    const isUnlocked = isCollectibleUnlocked(location.id);
                    return (
                      <MapPin
                        key={location.id}
                        id={location.id}
                        x={location.x ?? 50}
                        y={location.y ?? 50}
                        status={isUnlocked ? 'unlocked' : 'locked'}
                        buildingName={location.name}
                        buildingIcon={
                          location.id === 'cb' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                              <rect x="3" y="4" width="18" height="16" rx="2"/>
                              <path d="M16 2v4"/>
                              <path d="M8 2v4"/>
                              <path d="M3 10h18"/>
                            </svg>
                          ) : undefined
                        }
                        hintText={isUnlocked ? undefined : `Find this ${location.name} to unlock its secrets!`}
                        onMessageWallClick={() => {
                          if (isWideScreen) {
                            setActiveDrawerLocation(location.id);
                          } else {
                            router.push(`/wall?location=${location.id}`);
                          }
                        }}
                        onPinClick={() => {
                          const needsToOpenDrawer = isWideScreen; // All desktop clicks should open the drawer now

                          requestAnimationFrame(() => {
                            const { positionX, positionY, scale } = transformRef.current?.state || {
                              positionX: 0,
                              positionY: 0,
                              scale: initialScale
                            };

                            // 浣跨敤 TransformWrapper 鍥炶皟涓彁渚涚殑 setTransform锛屽洜涓哄畠鏄渶鏂扮殑
                            const centerSuccess = centerMarkerInContainer(
                              `pin-${location.id}`,
                              containerRef.current,
                              positionX,
                              positionY,
                              scale,
                              setTransform, // 浣跨敤浠庡洖璋冧腑鑾峰緱鐨?setTransform
                              500
                            );

                            if (centerSuccess) {
                              // 灞呬腑鎴愬姛鍚庯紝璁″垝鍦ㄤ笅涓€涓姩鐢诲抚涓墦寮€鎶藉眽
                              // 杩欐牱纭繚鍙樻崲鍔ㄧ敾宸茬粡寮€濮嬶紝鍗充娇灏氭湭瀹屾垚
                              requestAnimationFrame(() => {
                                if (needsToOpenDrawer) {
                                  // 涓哄綋鍓峫ocation鎵撳紑鎶藉眽
                                  setActiveDrawerLocation(location.id);
                                  // 瑙﹀彂涓€涓嚜瀹氫箟浜嬩欢閫氱煡鎵€鏈夊脊绐楁洿鏂颁綅缃?
                                  window.dispatchEvent(new CustomEvent('map-transform'));
                                }
                              });
                            } else if (needsToOpenDrawer) {
                              // 濡傛灉灞呬腑澶辫触浣嗕粛闇€鎵撳紑鎶藉眽
                              setActiveDrawerLocation(location.id);
                              // 瑙﹀彂涓€涓嚜瀹氫箟浜嬩欢閫氱煡鎵€鏈夊脊绐楁洿鏂颁綅缃?
                              window.dispatchEvent(new CustomEvent('map-transform'));
                            }
                          });

                          // 鍦ㄦ闈㈢杩斿洖true锛岄樆姝apPin鍐呴儴鐨勯粯璁ゆ墦寮€琛屼负
                          // 杩欐牱鎴戜滑鍙互鎺у埗浣曟椂鎵撳紑寮圭獥
                          return needsToOpenDrawer;
                        }}
                        onEnterAR={(id, name) => setArTarget({ id, name })}
                        isSidebarOpen={activeDrawerLocation !== null}
                      />
                    );
                  })}
                </MapOverlayLayer>
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
      
      <Suspense fallback={null}>
        <ARModelViewer
          open={!!arTarget}
          onClose={() => setArTarget(null)}
          checkinId={arTarget?.id}
          mascotName={arTarget?.name || 'Mascot'}
        />
      </Suspense>
      
      {isWideScreen && (
        <SideDrawer
          isOpen={activeDrawerLocation !== null}
          onClose={() => setActiveDrawerLocation(null)}
        >
          {/* 淇濇寔鍘熸湁鍐呭閫昏緫 */}
          {activeDrawerLocation && (
            <WallContent locationId={activeDrawerLocation} onClose={() => setActiveDrawerLocation(null)} />
          )}
        </SideDrawer>
      )}

      {showEdgeIndicator && (
        <EdgeDirectionIndicator visible={showEdgeIndicator} bearing={edgeBearing} targetName={edgeTargetName} />
      )}
    </div>
  );
}


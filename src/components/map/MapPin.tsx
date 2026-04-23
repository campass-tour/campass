'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Danmaku } from '../wall/Danmaku';
import { getLoreById } from '../../constants/lores';
import { getLocationData } from '../../constants/locations';
import { MESSAGES } from '../../constants/messages';
import { UnlockedContent } from './UnlockedContent';
import { LockedContent } from './LockedContent';

const toPublicAssetUrl = (folder: 'image' | 'icon', input?: string | null) => {
  if (!input) return null;
  if (/^(https?:|data:)/.test(input)) return input;
  const fileName = input.replace(/^.*[\\/]/, '');
  return `/${folder}/${fileName}`;
};

interface MapPinProps {
  id: string; // The location ID for fetching messages
  x: number; // Percentage horizontal position (0-100)
  y: number; // Percentage vertical position (0-100)
  status: 'locked' | 'unlocked';
  buildingName?: string;
  buildingIcon?: React.ReactNode;
  hintImage?: string;
  hintText?: string;
  onMessageWallClick?: () => void;
  onEnterAR?: (id: string, name: string) => void;
  onPinClick?: () => boolean | void; // Return true to prevent default open/close behavior
  isSidebarOpen?: boolean;
}

export const MapPin: React.FC<MapPinProps> = ({
  id,
  x,
  y,
  status,
  buildingIcon,
  buildingName,
  hintImage,
  hintText,
  onMessageWallClick,
  onEnterAR,
  onPinClick
  ,
  isSidebarOpen
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktopUA] = useState(() => 
    typeof navigator !== 'undefined' ? !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false
  );
  const [isDanmakuActive, setIsDanmakuActive] = useState(false);
  const [drawerOffset, setDrawerOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pinRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState<{ left: number; top: number } | null>(null);
  const startY = useRef(0);
  const startOffset = useRef(0);

  // Handle click outside to close popups/drawers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;

      if (target.closest('[data-role-selection-modal="true"]') || document.querySelector('[data-role-selection-modal="true"]')) {
        return;
      }
      
      // Ignore clicks on danmaku or its modal or image viewer
      if (target.closest('.danmaku-item') || target.closest('.danmaku-modal-overlay') || target.closest('.image-viewer-overlay')) {
        return;
      }

      if (isOpen && 
          pinRef.current && !pinRef.current.contains(event.target as Node) &&
          popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Check viewport width to switch between popover and bottom sheet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    
    // Initial check
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate popup position in viewport when opening desktop popover
  useEffect(() => {
    if (!isOpen || isMobile) {
      setPopupPos(null);
      return;
    }

    const updatePos = () => {
      const el = pinRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPopupPos({ left: rect.left + rect.width / 2, top: rect.top });
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);

    // 涓轰簡浣垮脊绐楄窡闅忓湴鍥惧彉鎹紝鎴戜滑鐩戝惉鍦板浘瀹瑰櫒鐨勫彉鍖?
    // 鍒涘缓涓€涓嚜瀹氫箟浜嬩欢鐩戝惉鍣?
    const handleMapTransform = () => {
      // 鍦板浘鍙樻崲鍚庯紝鏇存柊寮圭獥浣嶇疆
      setTimeout(updatePos, 0); // 浣跨敤timeout纭繚DOM宸叉洿鏂?
    };

    window.addEventListener('map-transform', handleMapTransform);

    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('map-transform', handleMapTransform);
    };
  }, [isOpen, isMobile, x, y, /* include sidebar toggle so popover repositions */ isSidebarOpen]);

  // Manage Danmaku delayed closing
  useEffect(() => {
    let timer: number;
    if (isOpen && status === 'unlocked') {
      setIsDanmakuActive(true);
    } else {
      // Delay closing danmaku by 1.5 seconds if drawer closes
      timer = window.setTimeout(() => setIsDanmakuActive(false), 1500);
    }
    return () => clearTimeout(timer);
  }, [isOpen, status]);

  const isLocked = status === 'locked';
  const lore = getLoreById(id);
  const locationData = getLocationData(id);
  const realBuildingName = locationData?.locationName || buildingName || 'Mysterious Spot';
  const level = locationData?.lv || 1;


  const getPinClasses = () => {
    const baseClasses = 'cursor-pointer flex items-center justify-center rounded-[var(--radius-pill)] w-12 h-12 transition-all duration-300 box-border';
    const colorClass = level === 2 ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-primary)]';

    if (isLocked) {
      return `${baseClasses} relative backdrop-blur-md text-white shadow-lg animate-bounce overflow-hidden`;
    } else {
      return `${baseClasses} ${colorClass} text-white shadow-[var(--shadow-card)]`;
    }
  };

  // Get image src from locationData.image (provided by constants/getLocationData)
  let imageSrc = '/image/default-image.png';
  if (locationData?.image) {
    imageSrc = toPublicAssetUrl('image', locationData.image) || imageSrc;
  }

  // Calculate actual message count for this location
  const whisperCount = MESSAGES.filter(msg => msg.locationId === id).length;

  // Get icon src from locationData.icon
  const getIconSrc = () => {
    if (!locationData?.icon) return null;
    return toPublicAssetUrl('icon', locationData.icon);
  };

  const renderContent = () => (
    isLocked ? (
      <LockedContent
        id={id}
        realBuildingName={isLocked ? 'Mysterious Spot' : realBuildingName}
        hintImage={hintImage}
        hintText={hintText}
      />
    ) : (
      <UnlockedContent
        id={id}
        realBuildingName={realBuildingName}
        imageSrc={imageSrc}
        whisperCount={whisperCount}
        lore={lore}
        onMessageWallClick={onMessageWallClick}
        onEnterAR={onEnterAR}
        isDesktopUA={isDesktopUA}
      />
    )
  );

  return (
    <>
      <div
        className="absolute z-10 pointer-events-auto"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: "translate(-50%, -50%) scale(var(--map-inv-scale, 1))",
          transition: "left 300ms ease-out, top 300ms ease-out"
        }}
      >
        {/* The Map Pin Indicator */}
        <div
          id={`pin-${id}`}  // 娣诲姞ID灞炴€т互渚垮湪鍦板浘涓婂畾浣?
          ref={pinRef}
          onClick={(e) => {
            e.stopPropagation();
            if (onPinClick) {
              const preventDefault = onPinClick();
              if (preventDefault) return;
            }
            setIsOpen(!isOpen);
            if (!isOpen) {
              setDrawerOffset(0);
            }
          }}
          className={getPinClasses()}
        >
          {isLocked ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <span
                className="absolute inset-0 rounded-[var(--radius-pill)]"
                style={{
                  backgroundColor: level === 2 ? 'var(--color-accent)' : 'var(--color-primary)',
                  opacity: 0.6
                }}
              />
              <span className="relative z-10 text-[var(--font-size-h2)] font-[var(--font-weight-bold)]">?</span>
            </div>
          ) : (
            <span className="w-6 h-6 flex items-center justify-center">
              {(() => {
                const customIconSrc = getIconSrc();
                if (customIconSrc) {
                  return <img src={customIconSrc} alt={`${realBuildingName} icon`} className="w-full h-full object-contain" />;
                }
                return buildingIcon || (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18"></path>
                    <path d="M9 8h1"></path>
                    <path d="M9 12h1"></path>
                    <path d="M9 16h1"></path>
                    <path d="M14 8h1"></path>
                    <path d="M14 12h1"></path>
                    <path d="M14 16h1"></path>
                    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
                  </svg>
                );
              })()}
            </span>
          )}
        </div>

        {/* Desktop Popover: render into document.body so it escapes map transform stacking context */}
        {isOpen && !isMobile && popupPos && createPortal(
          <div
            ref={popupRef}
            className="w-[420px] bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-[var(--spacing-4)] animate-in fade-in zoom-in-95 border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: popupPos.left,
              top: popupPos.top,
              transform: 'translate(-50%, -100%)',
              zIndex: 'var(--z-map-pin)',
            }}
          >
            {renderContent()}
            {/* Popover Arrow (single SVG to avoid double-triangle rendering) */}
            <div style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)', lineHeight: 0 }}>
              <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden>
                <path d="M1 1 L11 11 L21 1 Z" fill="var(--color-surface)" stroke="var(--border)" strokeWidth="1" />
              </svg>
            </div>
          </div>,
          document.body
        )}
      </div>

      {/* Mobile Bottom Sheet (Attached to window bottom) */}
      {isOpen && isMobile && createPortal(
        <div 
          ref={popupRef}
          className="fixed inset-x-0 bottom-0 bg-[var(--color-surface)] text-[var(--color-text-main)] animate-in slide-in-from-bottom flex flex-col"
          style={{ 
            zIndex: 'var(--z-modal)',
            borderTopLeftRadius: 'var(--radius-card)', 
            borderTopRightRadius: 'var(--radius-card)',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
            transform: `translateY(${drawerOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle identifier */}
          <div 
            className="w-full flex justify-center pt-[var(--spacing-2)] pb-[var(--spacing-2)] cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            onTouchStart={(e) => {
              if (e.touches.length > 1) return; // 鍙厑璁稿崟鎸?
              setIsDragging(true);
              startY.current = e.touches[0].clientY;
              startOffset.current = drawerOffset;
            }}
            onTouchMove={(e) => {
              if (!isDragging) return;
              if (e.touches.length > 1) return; // 鍙厑璁稿崟鎸?
              const deltaY = e.touches[0].clientY - startY.current;
              const newOffset = Math.max(0, startOffset.current + deltaY);
              setDrawerOffset(newOffset);
            }}
            onTouchEnd={() => {
              if (drawerOffset > window.innerHeight * 0.8) {
                setIsOpen(false);
              }
              setIsDragging(false);
            }}
            onMouseDown={(e) => {
              setIsDragging(true);
              startY.current = e.clientY;
              startOffset.current = drawerOffset;
            }}
            onMouseMove={(e) => {
              if (!isDragging) return;
              const deltaY = e.clientY - startY.current;
              const newOffset = Math.max(0, startOffset.current + deltaY);
              setDrawerOffset(newOffset);
            }}
            onMouseUp={() => {
              if (drawerOffset > window.innerHeight * 0.8) {
                setIsOpen(false);
              }
              setIsDragging(false);
            }}
          >
            <div className="w-12 h-1.5 bg-[var(--color-state-disabled)] rounded-[var(--radius-pill)]"></div>
          </div>
          
          <div className="p-[var(--spacing-4)] pt-0 pb-[calc(var(--spacing-5)+var(--spacing-3))] overflow-y-auto max-h-[85vh]">
            {renderContent()}
          </div>
        </div>,
        document.body
      )}
      <Danmaku isActive={isDanmakuActive} locationId={id} />
    </>
  );
};



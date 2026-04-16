import React, { useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { createPortal } from 'react-dom';
import { X, MapPin } from 'lucide-react';
import type { DanmakuItem } from './Danmaku';
import { getLocationData } from '../../constants/locations';
import { isCollectibleUnlocked } from '../../lib/storage';

interface DanmakuDetailModalProps {
  item: DanmakuItem | null;
  onClose: () => void;
}

export const DanmakuDetailModal: React.FC<DanmakuDetailModalProps> = ({ item, onClose }) => {
  // 判断是否为移动端
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  if (!item) return null;

  const locationData = getLocationData(item.originalMessage.locationId);
  const isUnlocked = isCollectibleUnlocked(item.originalMessage.locationId);
  const locationName = isUnlocked && locationData ? locationData.locationName : 'Mysterious Location';

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 danmaku-modal-overlay"
      style={isMobile ? { pointerEvents: 'none', zIndex: 'var(--z-modal)' } : { zIndex: 'var(--z-modal)' }}
    >
      {/* 遮罩不再可点击关闭，仅作遮罩用 */}
      <div className="absolute inset-0 cursor-default select-none" />

      <div
        className="w-full max-w-sm bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-5 relative flex flex-col gap-4 animate-in zoom-in-95 duration-200 cursor-default"
        style={isMobile ? { pointerEvents: 'auto' } : {}}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors focus:outline-none bg-[var(--color-background)] rounded-full p-1"
        >
          <X size={20} />
        </button>

        {/* User Info header */}
        <div className="flex items-center gap-3 pr-8">
          {item.avatar ? (
            <LazyLoadImage
              src={item.avatar}
              alt="avatar"
              className="w-12 h-12 rounded-[var(--radius-pill)] object-cover flex-shrink-0 bg-gray-200"
              effect="blur"
            />
          ) : (
            <div className="w-12 h-12 rounded-[var(--radius-pill)] bg-[var(--color-primary)] flex flex-shrink-0 items-center justify-center text-white font-[var(--font-weight-bold)] text-[16px]">
              {item.originalMessage.author.username?.substring(0, 1).toUpperCase() || 'A'}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-[var(--font-weight-bold)] text-[var(--color-text-main)] text-[var(--font-size-body)]">
              {item.originalMessage.author.username || (item.avatar ? "Random Visitor" : "Anonymous")}
            </span>
            <span className="text-[var(--color-text-secondary)] text-[var(--font-size-caption)]">
              {new Date(item.originalMessage.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Text Payload */}
        <div className="text-[var(--color-text-main)] font-[var(--font-weight-regular)] text-[var(--font-size-body)] whitespace-pre-wrap leading-relaxed py-2">
          {item.text}
        </div>

        {/* Location Badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full px-2 py-1 w-max">
          <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
          {locationName}
        </div>

        {/* Likes */}
        <div className="flex items-center gap-2 mt-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-background)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            <span className="text-sm font-medium">{item.originalMessage.likes}</span>
          </button>
        </div>

        {/* Optional Image */}
        {item.rightImage && (
          <div className="w-full h-48 rounded-[var(--radius-button)] overflow-hidden bg-gray-100 mt-1 shadow-sm">
            <LazyLoadImage
              src={item.rightImage}
              alt="attachment"
              className="w-full h-full object-cover"
              effect="blur"
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
import React, { useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { createPortal } from 'react-dom';

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ images, initialIndex = 0, isOpen, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (import.meta.env.DEV) console.log('ImageViewer: isOpen=', isOpen, 'initialIndex=', initialIndex, 'images length=', images?.length);
    if (isOpen) {
      try { document.body.style.overflow = 'hidden'; } catch (e) { if (import.meta.env.DEV) console.error('ImageViewer: failed to set body overflow', e); }
    } else {
      try { document.body.style.overflow = ''; } catch (e) { }
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
    return () => { try { document.body.style.overflow = ''; } catch (e) { } };
  }, [isOpen]);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const prev = () => { setIndex(i => (i - 1 + images.length) % images.length); setScale(1); setTranslate({ x: 0, y: 0 }); };
  const next = () => { setIndex(i => (i + 1) % images.length); setScale(1); setTranslate({ x: 0, y: 0 }); };

  const onWheel = (e: React.WheelEvent) => {
    if (!isOpen) return;
    if (e.ctrlKey) return; // let browser handle pinch zoom
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.1 : 0.9;
    setScale(s => Math.min(5, Math.max(1, s * factor)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !lastPos.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTranslate(t => ({ x: t.x + dx, y: t.y + dy }));
  };
  const onPointerUp = () => {
    dragging.current = false;
    lastPos.current = null;
  };

  if (!isOpen) return null;

  const node = (
    <div
      className="image-viewer-overlay fixed inset-0 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 'var(--z-overlay)' }}
      onWheel={onWheel}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close image viewer"
          className="absolute right-4 top-4 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-md transition-all"
          style={{ zIndex: 'var(--z-overlay)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full w-12 h-12 flex items-center justify-center transition-all"
            style={{ zIndex: 'var(--z-overlay)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        <div className="w-full flex-1 overflow-hidden touch-none" ref={containerRef}>
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="w-full h-full flex items-center justify-center p-4 md:p-12"
          >
            <LazyLoadImage
              src={images[index]}
              alt={`Image ${index + 1}`}
              draggable={false}
              style={{
                transform: `scale(${scale}) translate(${translate.x / Math.max(1, scale)}px, ${translate.y / Math.max(1, scale)}px)`,
                transition: dragging.current ? 'none' : 'transform 150ms cubic-bezier(0.2, 0, 0, 1)'
              }}
              className="select-none pointer-events-auto rounded-[var(--radius-card)] shadow-2xl object-contain max-w-full max-h-full"
              effect="blur"
            />
          </div>
        </div>

        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full w-12 h-12 flex items-center justify-center transition-all"
            style={{ zIndex: 'var(--z-overlay)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}

        {/* Bottom Glassmorphism Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full border border-white/20 shadow-xl" style={{ zIndex: 11010 }}>
          <div className="flex gap-2 items-center border-r border-white/20 pr-4">
            <button onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(1, s - 0.5)); }} className="text-white hover:text-[var(--color-primary-light)] transition-colors p-1" aria-label="Zoom out">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setScale(1); }} className="text-white hover:text-[var(--color-primary-light)] transition-colors font-bold text-sm px-1 min-w-[32px]">
              {Math.round(scale * 100)}%
            </button>
            <button onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(5, s + 0.5)); }} className="text-white hover:text-[var(--color-primary-light)] transition-colors p-1" aria-label="Zoom in">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
          </div>
          
          <div className="text-white font-medium text-sm tracking-widest pl-2">
            {index + 1} <span className="opacity-50">/</span> {images.length}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
};

export default ImageViewer;

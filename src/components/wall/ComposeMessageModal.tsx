import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Image as ImageIcon, MapPin, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { LOCATIONS } from '../../constants/locations';
import { isCollectibleUnlocked } from '../../lib/storage';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset state when closed
      setContent('');
      setSelectedLocation('');
      setDragOffset(0);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const unlockedLocations = LOCATIONS.filter(loc => isCollectibleUnlocked(loc.id));

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    if (!selectedLocation) {
      alert("Please select a location for your post!");
      return;
    }
    // Simulate posting (no actual backend)
    console.log("Posting message:", { content, selectedLocation });
    onClose();
  };

  const renderForm = () => (
    <div className="flex flex-col gap-[var(--spacing-4)] w-full h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--font-size-h2)] font-[var(--font-weight-bold)] text-[var(--color-text-main)]">
          Write a Whisper
        </h2>
        {!isMobile && (
          <button 
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] transition-colors bg-[var(--color-background)] justify-center flex items-center rounded-full p-1"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-[var(--spacing-2)]">
        <p className="text-[var(--font-size-caption)] text-[var(--color-text-secondary)] font-[var(--font-weight-semibold)]">
          Where is this memory from?
        </p>
        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1">
          {unlockedLocations.length === 0 && (
            <span className="text-sm text-[var(--color-text-secondary)] italic">
              Explore the campus to unlock locations first!
            </span>
          )}
          {unlockedLocations.map(loc => (
            <Button
              key={loc.id}
              variant={selectedLocation === loc.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLocation(loc.id)}
              className="rounded-[var(--radius-pill)]"
            >
              <MapPin className="w-3 h-3 mr-1" />
              {loc.name}
            </Button>
          ))}
        </div>
      </div>

      <textarea
        className="w-full min-h-[120px] flex-1 resize-none bg-[var(--color-background)] border border-[var(--border)] rounded-[var(--radius-button)] p-[var(--spacing-3)] text-[var(--color-text-main)] placeholder:text-[var(--color-text-secondary)] outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--font-size-body)] font-[var(--font-family-zh)]"
        placeholder="Share your thoughts, secrets, or memories here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex items-center justify-between mt-auto pt-[var(--spacing-2)]">
        <Button variant="ghost" size="icon" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
          <ImageIcon size={20} />
        </Button>
        <Button onClick={handleSubmit} disabled={!content.trim() || !selectedLocation} className="gap-2 px-6 rounded-[var(--radius-pill)] bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary)]/90">
          <Send size={16} />
          <span>Post</span>
        </Button>
      </div>
    </div>
  );

  return createPortal(
    <>
      {/* Overlay (put below modal content) */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={onClose}
      />

      {/* Desktop Modal */}
      {!isMobile && (
        <div 
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 'var(--z-overlay)' }}
        >
          <div 
            onClick={handleContentClick}
            className="w-full max-w-lg bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-[var(--spacing-5)] relative flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200 border border-[var(--border)]"
          >
            {renderForm()}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && (
        <div 
          className="fixed inset-x-0 bottom-0 bg-[var(--color-surface)] animate-in slide-in-from-bottom duration-300 flex flex-col"
          onClick={handleContentClick}
          style={{ 
            zIndex: 'var(--z-overlay)',
            borderTopLeftRadius: 'var(--radius-card)', 
            borderTopRightRadius: 'var(--radius-card)',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
            transform: `translateY(${dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            height: '80vh' // Takes up most of the screen
          }}
        >
          {/* Handle */}
          <div 
            className="w-full flex justify-center py-[var(--spacing-3)] cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'none' }}
            onTouchStart={(e) => {
              if (e.touches.length > 1) return;
              setIsDragging(true);
              startY.current = e.touches[0].clientY;
            }}
            onTouchMove={(e) => {
              if (!isDragging || e.touches.length > 1) return;
              e.preventDefault();
              const delta = e.touches[0].clientY - startY.current;
              requestAnimationFrame(() => setDragOffset(Math.max(0, delta)));
            }}
            onTouchEnd={() => {
              if (dragOffset > 100) {
                onClose();
              }
              setDragOffset(0);
              setIsDragging(false);
            }}
            onMouseDown={(e) => {
              setIsDragging(true);
              startY.current = e.clientY;
            }}
            onMouseMove={(e) => {
              if (!isDragging) return;
              const delta = e.clientY - startY.current;
              requestAnimationFrame(() => setDragOffset(Math.max(0, delta)));
            }}
            onMouseUp={() => {
              if (dragOffset > 100) {
                onClose();
              }
              setDragOffset(0);
              setIsDragging(false);
            }}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-[var(--radius-pill)]" />
          </div>

          <div className="flex-1 overflow-y-auto px-[var(--spacing-5)] pb-[var(--spacing-5)]">
            {renderForm()}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
import { useState, useRef, useEffect } from 'react';
import { SmartphoneNfc, X, MapPin } from 'lucide-react';
import { LOCATIONS } from '../../constants/locations';

export function NfcSimulatorFab() {
  const [position, setPosition] = useState({ x: 20, y: 80 }); // Top-Left by default to avoid bottom nav
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, moved: false });
  const fabRef = useRef<HTMLDivElement>(null);

  // Load last position if exists and clamp to viewport
  useEffect(() => {
    const savedPos = localStorage.getItem('nfc_fab_pos');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        
        // Clamp position within window bounds to ensure it stays visible on screen resize/mobile
        const clampedX = Math.max(0, Math.min(parsed.x, window.innerWidth - 60));
        const clampedY = Math.max(0, Math.min(parsed.y, window.innerHeight - 60));
        
        setPosition({ x: clampedX, y: clampedY });
      } catch (e) {}
    }

    // Optional: add window resize listener to keep it on screen
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, window.innerWidth - 60)),
        y: Math.max(0, Math.min(prev.y, window.innerHeight - 60))
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      moved: false,
    };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    // Mark as moved if distance is > 3px (prevent dead clicks)
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.moved = true;
    }

    // Clamp specifically so it can't be dragged off screen
    const newX = Math.max(0, Math.min(dragRef.current.initialX + dx, window.innerWidth - 60));
    const newY = Math.max(0, Math.min(dragRef.current.initialY + dy, window.innerHeight - 60));

    setPosition({
      x: newX,
      y: newY,
    });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    
    // Save new pos
    localStorage.setItem('nfc_fab_pos', JSON.stringify(position));

    if (!dragRef.current.moved) {
      // It was a clean click
      setIsOpen(!isOpen);
    }
  };

  const simulateCheckIn = (id: string) => {
    setIsOpen(false);
    window.location.href = `${import.meta.env.BASE_URL}?checkin=${id}`;
  };

  // Close menu if click outside when open
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={fabRef}
      className="fixed z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none' // Prevent pull-to-refresh while dragging on mobile
      }}
    >
      {/* Target Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-64 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-3 shadow-2xl border border-[var(--color-state-disabled)] animate-in fade-in zoom-in-95 duration-200">
          <div className="mb-2 text-sm font-semibold text-[var(--color-text-secondary)] px-2">
            Simulate NFC Scan
          </div>
          <div className="flex flex-col gap-1">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => simulateCheckIn(loc.id)}
                className="flex w-full items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm text-[var(--color-text-main)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-primary)] cursor-pointer text-left"
              >
                <MapPin className="h-4 w-4 opacity-70" />
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`group flex h-14 w-14 cursor-grab active:cursor-grabbing items-center justify-center rounded-full shadow-[var(--shadow-card)] transition-colors
          ${isOpen ? 'bg-[var(--color-background)] text-[var(--color-text-main)] border border-[var(--color-state-disabled)]' : 'bg-[var(--color-primary)] text-white hover:bg-purple-900'}
        `}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <SmartphoneNfc className="h-6 w-6" />
            <div className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--color-accent)] animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
}
import React from 'react';
import { X } from 'lucide-react';

export interface SideDrawerProps {
  isOpen: boolean;
  width?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  width = 'w-[520px] max-w-[60vw]',
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-0 right-0 h-full ${width} z-100 flex flex-col overflow-hidden rounded-l-[24px] border-l border-[var(--border)] bg-[var(--color-surface)] shadow-[-20px_0_50px_rgba(0,0,0,0.12)]`}
      style={{
        animation: 'sidebar-spring-in-right 420ms cubic-bezier(0.16, 1, 0.3, 1)',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0)) , var(--color-surface)',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close drawer"
        className="absolute right-4 top-4 p-2 rounded-full bg-[var(--color-surface)] text-(--color-text-secondary) backdrop-blur transition-all shadow-[0_6px_18px_rgba(0,0,0,0.12)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.16)] hover:brightness-110 active:scale-95"
        style={{
          background:
            'color-mix(in srgb, var(--color-surface) 75%, rgba(255,255,255,0.6))',
        }}
      >
        <X size={18} />
      </button>
      {children}
    </div>
  );
};

export default SideDrawer;

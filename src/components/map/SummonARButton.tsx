import React from 'react';
import { Sparkles } from 'lucide-react';

interface SummonARButtonProps {
  onClick: () => void;
  label?: string;
  className?: string; // allow overrides for margins/padding if needed
}

export const SummonARButton: React.FC<SummonARButtonProps> = ({ 
  onClick, 
  label = 'Summon in AR',
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] bg-[var(--color-primary)] px-4 py-4 font-bold text-white shadow-[var(--shadow-card)] transition-all hover:scale-[1.02] hover:opacity-90 cursor-pointer ${className}`}
    >
      <div className="absolute inset-0 bg-white/20 blur-md pointer-events-none rounded-full top-0 scale-x-150 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Sparkles className="h-5 w-5 animate-pulse text-[var(--color-accent)]" />
      <span className="tracking-wide">{label}</span>
    </button>
  );
};
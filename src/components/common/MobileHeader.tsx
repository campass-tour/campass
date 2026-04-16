import { Sun, Moon, CircleUserRound } from 'lucide-react';

interface MobileHeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function MobileHeader({ isDarkMode, toggleDarkMode }: MobileHeaderProps) {
  return (
    <header className="md:hidden bg-[var(--color-surface)] shadow-sm z-10 shrink-0 border-b border-[var(--color-state-disabled)]">
      <div className="mx-auto flex w-full max-w-[calc(100vw-1rem)] items-center justify-between px-2 py-1.5">
        <h1 className="campass-logo font-extrabold text-lg tracking-tight flex">
          <span className="text-[var(--color-logo-cam)]">Cam</span>
          <span className="text-[var(--color-logo-pass)]">pass</span>
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleDarkMode}
            className="p-1 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="p-1 rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-background)] transition-colors">
            <CircleUserRound size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}

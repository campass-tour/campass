import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { TabId } from './MainLayout';

interface MobileBottomNavProps {
  tabs: { id: TabId; label: string; icon: LucideIcon }[];
  activeTab: TabId;
}

export function MobileBottomNav({ tabs, activeTab }: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex justify-between items-center px-6 py-3 pb-safe z-20 rounded-t-3xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <Link
            key={tab.id}
            to={`/${tab.id}`}
            className={cn(
              "flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 ease-in-out focus:outline-none",
              isActive ? "px-5 py-2.5 mx-1" : "px-3 py-2.5 mx-1 bg-transparent"
            )}
            style={{
              backgroundColor: isActive ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'transparent'
            }}
          >
            <Icon 
              size={24} 
              className={isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]"} 
              strokeWidth={isActive ? 2.5 : 2}
            />
            <span 
              className={cn(
                "font-bold overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out text-sm",
                isActive 
                  ? "max-w-[200px] ml-2.5 text-[var(--color-primary)]" 
                  : "max-w-0 ml-0 text-[var(--color-text-secondary)]"
              )}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  );
}

'use client';

import { Sun, Moon } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import type { MainLayoutTab, TabId } from './MainLayout';
// import { SideDrawer } from './SideDrawer';

interface DesktopSidebarProps {
  tabs: MainLayoutTab[];
  activeTab: TabId;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogoClick?: () => void;
}

export function DesktopSidebar({ tabs, activeTab, isDarkMode, toggleDarkMode, onLogoClick }: DesktopSidebarProps) {
  const handleLogoKeyDown = (e: KeyboardEvent<HTMLHeadingElement>) => {
    if (!onLogoClick) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onLogoClick();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-(--color-surface) shadow-[2px_0_12px_rgba(0,0,0,0.03)] z-20 shrink-0 h-full border-r border-(--color-state-disabled) relative">
      <button 
        onClick={toggleDarkMode}
        className="absolute left-4 top-4 p-2 rounded-full text-(--color-text-secondary) hover:bg-(--color-background) transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
      <div className="p-8 pb-4 flex items-center justify-center">
        <h1
          onClick={onLogoClick}
          onKeyDown={handleLogoKeyDown}
          tabIndex={0}
          role="button"
          className="campass-logo flex select-none text-4xl font-extrabold tracking-tight"
          aria-label="Campass"
        >
          <span className="text-(--color-logo-cam)">Cam</span>
          <span className="text-(--color-logo-pass)">pass</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-3 mt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "flex items-center space-x-4 w-full px-5 py-4 rounded-xl transition-all duration-200 font-semibold text-base",
                isActive 
                  ? "bg-(--color-primary) text-white shadow-md shadow-(--color-primary)/20"
                  : "text-(--color-text-secondary) hover:bg-(--color-background) hover:text-(--color-text-main)"
              )}
            >
              <Icon size={22} className={isActive ? "text-white" : ""} strokeWidth={isActive ? 2.5 : 2} />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  );
}

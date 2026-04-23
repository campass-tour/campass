'use client';

import React, { useState } from 'react';
import { Map, Backpack, MessageSquare, User } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';

export type TabId = 'explore' | 'collection' | 'wall' | 'profile';
export interface MainLayoutTab {
  id: TabId;
  label: string;
  href: string;
  icon: typeof Map;
}

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  onLogoClick?: () => void;
}

export function MainLayout({ children, activeTab, onLogoClick }: MainLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (document.documentElement.classList.contains('dark')) return true;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      return true;
    }
    return false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const tabs: MainLayoutTab[] = [
    { id: 'explore', label: 'Explore', href: '/', icon: Map },
    { id: 'wall', label: 'Wall', href: '/wall', icon: MessageSquare },
    { id: 'collection', label: 'Collection', href: '/collection', icon: Backpack },
    { id: 'profile', label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="flex md:flex-row flex-col h-screen w-full bg-[var(--color-background)] text-[var(--color-text-main)] font-sans">
      
      <MobileHeader
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogoClick={onLogoClick}
      />

      <DesktopSidebar
        tabs={tabs}
        activeTab={activeTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onLogoClick={onLogoClick}
      />

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Inner container scales to full height and width */}
          <div className="w-full h-full p-4 md:p-8 pb-[max(6rem,env(safe-area-inset-bottom))] md:pb-8 flex flex-col">
            {children}
          </div>
        </main>
      </div>

      <MobileBottomNav tabs={tabs} activeTab={activeTab} />

    </div>
  );
}

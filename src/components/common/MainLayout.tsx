import React, { useState, useEffect } from 'react';
import { Map, Backpack, MessageSquare, User } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';

export type TabId = 'explore' | 'collection' | 'wall' | 'profile';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
}

export function MainLayout({ children, activeTab }: MainLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial user preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const tabs = [
    { id: 'explore' as TabId, label: 'Explore', icon: Map },
    { id: 'wall' as TabId, label: 'Wall', icon: MessageSquare },
    { id: 'collection' as TabId, label: 'Collection', icon: Backpack },
    { id: 'profile' as TabId, label: 'Profile', icon: User },
  ];

  return (
    <div className="flex md:flex-row flex-col h-screen w-full bg-[var(--color-background)] text-[var(--color-text-main)] font-sans">
      
      <MobileHeader isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />

      <DesktopSidebar
        tabs={tabs}
        activeTab={activeTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
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

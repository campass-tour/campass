
'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';

export type TabId = 'explore' | 'collection' | 'wall' | 'profile';

interface MainLayoutProps {
  children: ReactNode;
  activeTab: TabId;
}

export function MainLayout({ children, activeTab }: MainLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setIsDarkMode(true);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
      document.documentElement.classList.add('dark');
      } else {
      document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const tabs = [
    { id: 'explore' as const, label: 'Explore', href: '/' },
    { id: 'collection' as const, label: 'Collection', href: '/collection' },
    { id: 'wall' as const, label: 'Wall', href: '/wall' },
    { id: 'profile' as const, label: 'Profile', href: '/profile' },
  ];

  return (
    <div className="flex h-dvh w-full bg-[var(--color-background)] text-[var(--color-text-main)]">
      <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-black/10 bg-[var(--color-surface)]/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="font-semibold tracking-tight">Campass</div>
        <button
          type="button"
          onClick={toggleDarkMode}
          className="rounded-full border border-black/10 bg-[var(--color-surface)] px-3 py-1 text-sm"
          aria-pressed={isDarkMode}
        >
          {isDarkMode ? 'Dark' : 'Light'}
        </button>
      </header>

      <aside className="hidden w-64 shrink-0 border-r border-black/10 bg-[var(--color-surface)] md:flex md:flex-col">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="font-semibold tracking-tight">Campass</div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="rounded-full border border-black/10 bg-[var(--color-surface)] px-3 py-1 text-sm"
            aria-pressed={isDarkMode}
          >
            {isDarkMode ? 'Dark' : 'Light'}
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={[
                  'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-main)] hover:bg-black/5',
                ].join(' ')}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(6rem,env(safe-area-inset-bottom))] pt-16 md:px-8 md:pb-8 md:pt-8">
          {children}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-black/10 bg-[var(--color-surface)]/90 px-2 py-2 backdrop-blur md:hidden">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={[
                  'mx-1 rounded-xl px-2 py-2 text-center text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-black/5 hover:text-[var(--color-text-main)]',
                ].join(' ')}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

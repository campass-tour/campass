'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { MainLayout, type TabId } from '@/components/layout/MainLayout';

function tabFromPathname(pathname: string): TabId {
  if (pathname === '/' || pathname.startsWith('/map')) return 'explore';
  if (pathname.startsWith('/collection')) return 'collection';
  if (pathname.startsWith('/wall')) return 'wall';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'explore';
}

export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const activeTab = tabFromPathname(pathname);

  return <MainLayout activeTab={activeTab}>{children}</MainLayout>;
}


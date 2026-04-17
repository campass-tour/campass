'use client';

import React from 'react';
import { MyMemories } from '@/components/profile/MyMemories';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { StatsDashboard } from '@/components/profile/StatsDashboard';
import { UtilitiesSettings } from '@/components/profile/UtilitiesSettings';

const ProfilePage: React.FC = () => {
  return (
    <div className="w-full bg-[var(--color-background)] min-h-[100svh] pb-32">
      <ProfileHeader />

      <div className="mx-auto flex w-full max-w-7xl flex-col px-2 md:px-6">
        <div className="w-full -mt-1 md:-mt-2 relative z-10">
          <StatsDashboard />

          <div className="mt-7 border-t border-[var(--profile-content-divider)] pt-7">
            <MyMemories />
          </div>

          <div className="mt-8">
            <UtilitiesSettings />
          </div>
        </div>
      </div>
      <div className="md:hidden" style={{ height: 'calc(80px + env(safe-area-inset-bottom))' }} />
    </div>
  );
};

export default ProfilePage;

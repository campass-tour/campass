'use client';

import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Pencil } from 'lucide-react';
import EditProfileDrawer from './EditProfileDrawer';

export const ProfileHeader: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <section className="relative -mx-4 -mt-4 overflow-hidden md:-mx-8 md:-mt-8">
      <div className="relative h-48 w-full overflow-hidden bg-[linear-gradient(120deg,var(--profile-hero-gradient-start)_0%,var(--profile-hero-gradient-end)_100%)] md:h-60">
        <LazyLoadImage
          src="https://www.xjtlu.edu.cn/wp-content/uploads/2025/02/1044-sc-25-1.jpg"
          alt="Cover"
          className="h-full w-full object-cover opacity-62 mix-blend-overlay"
          effect="blur"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_bottom,transparent,var(--color-background))]" />
      </div>

      <div className="relative z-10 -mt-10 px-4 pb-5 md:-mt-12 md:px-8 md:pb-7">
        <div className="flex flex-col items-center text-center md:flex-row md:items-center md:text-left">
          <div className="relative mb-3 inline-block md:mb-0 md:mr-6">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[var(--profile-avatar-border)] bg-[var(--profile-avatar-ring-bg)] p-1.5 shadow-[var(--profile-avatar-shadow)] md:h-32 md:w-32">
              <LazyLoadImage
                src="https://p.sda1.dev/32/b4ea84ad54daf342c6979fafe2e2f544/profile.png"
                alt="Avatar"
                className="h-full w-full rounded-full object-cover"
                effect="blur"
              />
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="absolute bottom-1 right-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--profile-edit-border)] bg-[var(--profile-edit-bg)] text-[var(--profile-edit-icon)] shadow-sm transition-colors hover:bg-[var(--profile-edit-hover)]"
              aria-label="Edit Profile"
            >
              <Pencil size={15} />
            </button>
          </div>

          <div className="flex flex-col items-center md:flex-1 md:items-start">
            <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-[-0.03em] text-[var(--color-text-main)] md:text-4xl">
              silly bird
            </h1>
            <div className="mt-2 inline-flex items-center rounded-full border border-[var(--profile-role-border)] bg-[var(--profile-role-bg)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--profile-role-text)]">
              Campus Rookie
            </div>
          </div>
        </div>
      </div>

      <EditProfileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </section>
  );
};


export default ProfileHeader;

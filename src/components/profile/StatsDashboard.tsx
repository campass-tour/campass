'use client';

import React from 'react';
import { Compass, MessageSquare, Heart } from 'lucide-react';

export const StatsDashboard: React.FC = () => {
  return (
    <section className="w-full py-2">
      <div className="grid grid-cols-3">
        <div className="flex flex-col items-center px-2 text-center">
          <div className="mb-2 rounded-full bg-[var(--profile-stat-icon-bg)] p-2.5 text-[var(--profile-stat-icon-explore)]">
            <Compass size={22} />
          </div>
          <span className="text-xl md:text-2xl font-bold text-[var(--color-text-main)] mt-1">
            5 <span className="text-sm md:text-base text-[var(--color-text-secondary)] font-normal">/ 12</span>
          </span>
          <span className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-1 whitespace-nowrap font-medium">
            Exploration
          </span>
        </div>

        <div className="flex flex-col items-center px-2 text-center border-x border-[var(--profile-stat-divider)]">
          <div className="mb-2 rounded-full bg-[var(--profile-stat-icon-bg)] p-2.5 text-[var(--profile-stat-icon-echoes)]">
            <MessageSquare size={22} />
          </div>
          <span className="text-xl md:text-2xl font-bold text-[var(--color-text-main)] mt-1">
            12
          </span>
          <span className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-1 whitespace-nowrap font-medium">
            Echoes Sent
          </span>
        </div>

        <div className="flex flex-col items-center px-2 text-center">
          <div className="mb-2 rounded-full bg-[var(--profile-stat-icon-bg)] p-2.5 text-[var(--profile-stat-icon-likes)]">
            <Heart size={22} />
          </div>
          <span className="text-xl md:text-2xl font-bold text-[var(--color-text-main)] mt-1">
            128
          </span>
          <span className="text-xs md:text-sm text-[var(--color-text-secondary)] mt-1 whitespace-nowrap font-medium">
            Likes
          </span>
        </div>
      </div>
    </section>
  );
};

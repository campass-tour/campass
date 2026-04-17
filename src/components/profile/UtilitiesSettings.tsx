'use client';

import React from 'react';
import { Info, LogOut, ChevronRight } from 'lucide-react';

export const UtilitiesSettings: React.FC = () => {
  return (
    <section className="w-full px-[var(--profile-memory-pad-x)] py-[var(--profile-memory-pad-y)]">
      <div className="mb-3 border-t border-[var(--profile-content-divider)] pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--wall-kicker)]">
          Utilities
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <button className="group w-full rounded-2xl border border-[var(--profile-utility-border)] bg-[var(--profile-utility-bg)] px-5 py-4 transition-colors hover:bg-[var(--profile-utility-hover)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[var(--color-text-main)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--profile-utility-icon-bg)] text-[var(--profile-utility-icon)] transition-colors">
                <Info size={18} />
              </div>
              <span className="font-semibold text-[15px] md:text-base">About Campass</span>
            </div>
            <ChevronRight size={18} className="text-[var(--color-text-secondary)] transition-colors group-hover:text-[var(--color-text-main)]" />
          </div>
        </button>

        <button className="group w-full rounded-2xl border border-[var(--profile-utility-border)] bg-[var(--profile-utility-bg)] px-5 py-4 transition-colors hover:bg-[var(--profile-utility-hover)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[var(--profile-danger-text)] transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--profile-danger-icon-bg)] text-[var(--profile-danger-icon)] transition-colors">
                <LogOut size={18} />
              </div>
              <span className="font-semibold text-[15px] md:text-base">Log Out</span>
            </div>
            <ChevronRight size={18} className="text-[var(--profile-danger-icon)]/70 transition-colors group-hover:text-[var(--profile-danger-icon)]" />
          </div>
        </button>
      </div>
    </section>
  );
};

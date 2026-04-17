'use client';

import React, { useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { SummonARButton } from './SummonARButton';
import { getLocationData } from '../../constants/locations';

interface UnlockedContentProps {
  id: string;
  realBuildingName: string;
  imageSrc: string;
  whisperCount: number;
  lore: any; // 从 getLoreById 返回的类型
  onMessageWallClick?: () => void;
  onEnterAR?: (id: string, name: string) => void;
  isDesktopUA: boolean;
  hideViewWhispersButton?: boolean;
  hideTitle?: boolean;
}

export const UnlockedContent: React.FC<UnlockedContentProps> = ({
  id,
  realBuildingName,
  imageSrc,
  whisperCount,
  lore,
  onMessageWallClick,
  onEnterAR,
  isDesktopUA,
  hideViewWhispersButton = false,
  hideTitle = false,
}) => {
  const [isLoreExpanded, setIsLoreExpanded] = useState(false);

  return (
    <>
      {!hideTitle && (
        <h2 className="font-bold mb-[var(--spacing-3)] text-2xl leading-tight text-[var(--color-text-main)]">
          {realBuildingName}
        </h2>
      )}
      <div className="flex flex-col gap-4">
        {/* Visual Center: Mascot Preview */}
        <div className="flex items-center gap-4 bg-[var(--color-background)] p-3 rounded-xl border border-[var(--border)]">
          <div className="w-20 h-20 shrink-0 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
            <LazyLoadImage src={imageSrc} alt="Mascot Preview" className="w-[85%] h-[85%] object-contain drop-shadow-sm" effect="blur" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-accent)] tracking-wider uppercase mb-1">Mascot Found</span>
            <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
              This bird lives in {realBuildingName}.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-1">
          <SummonARButton
            onClick={() => onEnterAR?.(id, getLocationData(id)?.mascotName || realBuildingName)}
            label="Summon in AR"
            className="py-3 px-4"
          />

          {!hideViewWhispersButton && (
            <button
              onClick={onMessageWallClick}
              className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold py-[10px] px-4 rounded-xl hover:bg-[var(--color-primary)] hover:text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>View Whispers <span className="text-[0.9em] opacity-90">({whisperCount})</span> </span>
            </button>
          )}
        </div>

        {/* Cultural Lore Section (Expandable/Flippable) */}
        {lore && (
          <div
            className="group w-full mt-2 border border-[#eaeaea] rounded-xl overflow-hidden cursor-pointer"
            onClick={() => setIsLoreExpanded(!isLoreExpanded)}
          >
            <div className="bg-[#fdfaf5] px-4 py-3 flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="flex gap-2 items-center flex-1 relative z-10">
                <span className="text-xl">📜</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-orange-800/60 font-bold uppercase tracking-widest leading-none mb-0.5">Location Lore</span>
                  <span className="text-sm font-semibold text-orange-950 truncate max-w-[200px]" style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive, sans-serif' }}>
                    {lore.title}
                  </span>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-orange-950/50 transition-transform duration-300 relative z-10 ${isLoreExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
              {/* Vintage overlay artifact */}
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-orange-100/50 to-transparent pointer-events-none" />
            </div>
            <div
              className={`transition-all duration-300 ease-in-out bg-white text-orange-950/80 px-4 leading-relaxed ${isLoreExpanded ? 'py-4 opacity-100' : 'max-h-0 py-0 opacity-0 overflow-hidden'}`}
              style={{ fontFamily: '"Caveat", "Comic Sans MS", cursive, sans-serif' }}
            >
              <p className="text-sm sm:text-base m-0 italic">"{lore.content}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop user agent tip */}
      {isDesktopUA && (
        <div className="mt-4 pt-3 border-t border-[var(--border)] border-dashed">
          <p className="text-[11px] text-[var(--color-primary)] text-center font-medium opacity-80 leading-tight">
             💡 Switch to a mobile device to use the AR camera and discover secrets!
          </p>
        </div>
      )}
    </>
  );
};

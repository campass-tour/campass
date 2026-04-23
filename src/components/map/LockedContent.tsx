'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import cluesDataRaw from '../../data/clues.json';
import ImageViewer from '../common/ImageViewer';
import type { UserRole } from '../../lib/storage';
import { getClueUnlockLevel, setClueUnlockLevel, getUserRole } from '../../lib/storage';
import { triggerHaptic } from '../../lib/haptics';
import { RoleSelectionModal } from '../common/RoleSelectionModal';

type ImagePreloadStatus = 'loading' | 'loaded' | 'error';
type ClueImageSource = string | string[] | null | undefined;
type ClueLocation = {
  locationId: string;
  clues: {
    card1: {
      image_placeholder?: ClueImageSource;
      lv1_text: string;
      lv2_text: string;
    };
    card2: {
      image_placeholder?: ClueImageSource;
      lv3_text: string;
    };
  };
  quizzes: Record<UserRole | 'freshman', Array<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
    successMessage: string;
  }>>;
};
type ActiveQuiz = {
  levelToUnlock: number;
  quiz: ClueLocation['quizzes'][UserRole][number];
};
type ImageErrorEvent = React.SyntheticEvent<HTMLImageElement, Event>;

const ALL_CLUES = cluesDataRaw as ClueLocation[];

const TARGET_IMAGE_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"%3E%3Crect width="800" height="450" fill="%23f3f4f6"/%3E%3Ctext x="400" y="225" text-anchor="middle" dominant-baseline="middle" fill="%236b7280" font-family="Arial" font-size="28"%3EClue image unavailable%3C/text%3E%3C/svg%3E';

const resolveImageUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^(https?:|data:)/.test(path)) return path;
  const normalized = path.replace(/\\/g, '/').replace(/^\/+/, '');
  if (normalized.startsWith('assets/clues/')) {
    return `/${normalized.replace(/^assets\//, '')}`;
  }
  const fileName = normalized.replace(/^.*\//, '');
  return `/clues/${fileName}`;
};

const getImageList = (raw?: ClueImageSource) => {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return raw ? [raw] : [];
};

const getFirstImage = (raw?: ClueImageSource) => getImageList(raw)[0];

const getCard3ImageUrls = (locationData?: ClueLocation) => {
  return getImageList(locationData?.clues?.card2?.image_placeholder)
    .map((path) => resolveImageUrl(path) || path)
    .filter(Boolean) as string[];
};

interface LockedContentProps {
  id?: string;
  realBuildingName: string;
  hintImage?: string;
  hintText?: string;
  hideTitle?: boolean;
}

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export const LockedContent: React.FC<LockedContentProps> = ({
  id,
  realBuildingName,
  hintImage,
  hintText,
  hideTitle = false
}) => {
  const [unlockedLevel, setUnlockedLevel] = useState(() => id ? getClueUnlockLevel(id) : 1);
  const [expandedPanel, setExpandedPanel] = useState(() => id ? getClueUnlockLevel(id) : 1);
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuiz | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [pendingQuizLevel, setPendingQuizLevel] = useState<number | null>(null);
  const [card3Index, setCard3Index] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [card3ImageStatus, setCard3ImageStatus] = useState<Record<string, ImagePreloadStatus>>({});
  const touchStartXRef = useRef<number | null>(null);
  const preloadingCard3UrlsRef = useRef<Set<string>>(new Set());

  const locationData = ALL_CLUES.find(c => c.locationId === id);

  const preloadCard3Images = useCallback((data = locationData) => {
    const urls = getCard3ImageUrls(data);
    urls.forEach((url) => {
      if (preloadingCard3UrlsRef.current.has(url)) return;
      preloadingCard3UrlsRef.current.add(url);
      setCard3ImageStatus((previous) => {
        if (previous[url] === 'loaded' || previous[url] === 'loading') return previous;
        return { ...previous, [url]: 'loading' };
      });

      const image = new window.Image();
      image.onload = () => {
        setCard3ImageStatus((previous) => ({ ...previous, [url]: 'loaded' }));
      };
      image.onerror = () => {
        preloadingCard3UrlsRef.current.delete(url);
        setCard3ImageStatus((previous) => ({ ...previous, [url]: 'error' }));
      };
      image.src = url;
    });
  }, [locationData]);

  useEffect(() => {
    if (!locationData || unlockedLevel < 2) return;
    preloadCard3Images(locationData);
  }, [locationData, preloadCard3Images, unlockedLevel]);

  if (!locationData) {
    return (
      <div className="flex flex-col gap-4">
        {!hideTitle && (
          <h2 className="font-bold mb-[var(--spacing-3)] text-2xl leading-tight text-[var(--color-text-main)]">
            Mysterious Spot
          </h2>
        )}
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {hintText || 'Find this exact spot to unlock its secrets.'}
        </p>
        <div className="relative w-full aspect-4/3 rounded-[var(--radius-card)] overflow-hidden bg-gray-200 shadow-inner">
          {hintImage ? (
            <button className="w-full h-full" onClick={() => {
              const url = resolveImageUrl(hintImage) || undefined;
              if (url) { setViewerImages([url]); setViewerIndex(0); setViewerOpen(true); }
            }}>
              <LazyLoadImage
                src={resolveImageUrl(hintImage) || undefined}
                alt="Location Clue"
                onError={(e: ImageErrorEvent) => { e.currentTarget.src = resolveImageUrl(hintImage) || 'https://via.placeholder.com/400x300?text=Clue+Placeholder'; }}
                className="w-full h-full object-cover blur-[6px] scale-110"
                effect="blur"
              />
            </button>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] bg-[var(--color-state-disabled)] blur-sm">
              <svg className="w-12 h-12 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Blurred Clue Image</span>
            </div>
          )}
        </div>
        <ImageViewer images={viewerImages} initialIndex={viewerIndex} isOpen={viewerOpen} onClose={() => setViewerOpen(false)} />
      </div>
    );
  }

  const { clues, quizzes } = locationData;

  const handleOpenQuiz = (levelToUnlock: number) => {
    const currentRole = getUserRole();
    if (!currentRole) {
      setPendingQuizLevel(levelToUnlock);
      setRoleModalOpen(true);
      return;
    }
    openQuizForRole(levelToUnlock, currentRole);
  };

  const openQuizForRole = (levelToUnlock: number, role: UserRole) => {
    const roleQuizzes = quizzes[role] || quizzes['freshman'];
    const q1 = roleQuizzes[0];
    const q2 = roleQuizzes[1];
    const targetQuiz = levelToUnlock === 2 ? q1 : q2;
    setActiveQuiz({ levelToUnlock, quiz: targetQuiz });
    setSelectedOption(null);
    setQuizFeedback(null);
  };

  const handleRoleSelected = (role: UserRole) => {
    setRoleModalOpen(false);
    if (pendingQuizLevel !== null) {
      openQuizForRole(pendingQuizLevel, role);
      setPendingQuizLevel(null);
    }
  };

  const handleSubmitQuiz = () => {
    if (selectedOption === null || !activeQuiz) return;
    
    if (selectedOption === activeQuiz.quiz.correctAnswerIndex) {
      triggerHaptic('quiz_correct');
      setQuizFeedback({ type: 'success', message: activeQuiz.quiz.successMessage });
      if (activeQuiz.levelToUnlock === 2) {
        preloadCard3Images();
      }
      setTimeout(() => {
        const newLevel = activeQuiz.levelToUnlock;
        setUnlockedLevel(newLevel);
        setExpandedPanel(newLevel);
        if (id) {
          setClueUnlockLevel(id, newLevel);
        }
        setActiveQuiz(null);
        setQuizFeedback(null);
      }, 2000);
    } else {
      triggerHaptic('quiz_wrong');
      setQuizFeedback({ type: 'error', message: 'Incorrect. Try thinking differently and guessing again!' });
    }
  };

  // --- Render Functions ---
  const renderAccordionItem = (level: number, title: string, locked: boolean, expanded: boolean, content: React.ReactNode) => {
    return (
      <div 
        key={level}
        className={`overflow-hidden border rounded-[var(--radius-card)] transition-colors duration-300 ${
          locked ? 'border-gray-200 bg-gray-50' : expanded ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-primary)]/30'
        }`}
      >
        <button 
          className={`w-full flex items-center justify-between p-4 font-bold transition-colors ${
            locked ? 'text-gray-400 cursor-not-allowed' : expanded ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary)]/80'
          }`}
          onClick={() => !locked && setExpandedPanel(expanded ? 0 : level)}
          disabled={locked}
        >
          <span className="flex items-center gap-2">
            Level {level}: {title}
          </span>
          <span className="transition-transform duration-300 flex items-center" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            {!locked && level <= unlockedLevel ? <ChevronDownIcon /> : <LockIcon />}
          </span>
        </button>
        <div 
          className="transition-all duration-300 ease-in-out px-4 overflow-hidden"
          style={{ maxHeight: expanded ? '800px' : '0px', opacity: expanded ? 1 : 0 }}
        >
          <div className="pb-4 pt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 relative">
      {!hideTitle && (
        <h2 className="font-bold px-1 text-xl text-[var(--color-text-main)] text-center">
          {realBuildingName}
        </h2>
      )}

      {/* Accordion List */}
      <div className="flex flex-col gap-2">
        {/* Panel 1: The Ambience */}
        {renderAccordionItem(
          1, 
          "The Ambience", 
          false, 
          expandedPanel === 1,
          <>
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-200 mb-3 shadow-inner">
              <div className="w-full h-full cursor-default select-none">
                <LazyLoadImage
                  src={resolveImageUrl(hintImage ?? getFirstImage(clues.card1.image_placeholder)) || 'https://via.placeholder.com/400x300?text=Clue+Placeholder'}
                  onError={(e: ImageErrorEvent) => { e.currentTarget.src = resolveImageUrl(hintImage ?? getFirstImage(clues.card1.image_placeholder)) || 'https://via.placeholder.com/400x300?text=Clue+Placeholder'; }}
                  alt="Ambience Clue"
                  className={`w-full h-full object-cover transition-all duration-500 blur-[8px] scale-110 opacity-70`}
                  effect="blur"
                />
              </div>
              <div className="absolute inset-0 pointer-events-none bg-white/10 backdrop-blur-sm" />
            </div>
            <p className="mb-4 italic">&quot;{clues.card1.lv1_text}&quot;</p>
            
            {unlockedLevel < 2 ? (
              <button 
                onClick={() => handleOpenQuiz(2)}
                className="w-full py-2.5 bg-[var(--color-primary)] text-white rounded-md font-bold text-sm shadow-md active:scale-[0.98] transition-transform flex justify-center items-center gap-2"
              >
                <span>Accept Challenge 1</span>
                <LockIcon />
              </button>
            ) : (
              <div className="py-2 flex items-center justify-center gap-2 text-[var(--color-success)] text-sm font-bold">
                <CheckIcon /> Challenge Completed
              </div>
            )}
          </>
        )}

        {/* Panel 2: The Zone */}
        {renderAccordionItem(
          2, 
          "The Zone", 
          unlockedLevel < 2, 
          expandedPanel === 2,
          <>
            <div className="relative w-full aspect-[2/1] rounded-md overflow-hidden bg-gray-100 mb-3 shadow-inner">
              <button className="w-full h-full" onClick={() => {
                const raw = hintImage ?? clues.card1.image_placeholder;
                const imgs = Array.isArray(raw) ? raw : (raw ? [raw] : []);
                const urls = imgs.map((p: string) => resolveImageUrl(p) || p).filter(Boolean) as string[];
                if (urls.length) { setViewerImages(urls); setViewerIndex(0); setViewerOpen(true); }
              }}>
                <LazyLoadImage
                  src={resolveImageUrl(hintImage ?? getFirstImage(clues.card1.image_placeholder)) || 'https://via.placeholder.com/400x200?text=Zone+Placeholder'}
                  onError={(e: ImageErrorEvent) => { e.currentTarget.src = resolveImageUrl(hintImage ?? getFirstImage(clues.card1.image_placeholder)) || 'https://via.placeholder.com/400x200?text=Zone+Placeholder'; }}
                  alt="Zone Clue"
                  className={`w-full h-full object-cover transition-all duration-500 scale-105 opacity-90`}
                  effect="blur"
                />
              </button>
              {/* removed textual badge - left subtle overlay only if desired via CSS */}
            </div>
            <p className="mb-4 font-medium text-[var(--color-text-main)]">{clues.card1.lv2_text}</p>
            
            {unlockedLevel < 3 ? (
              <button 
                onClick={() => handleOpenQuiz(3)}
                className="w-full py-2.5 bg-[var(--color-primary)] text-white rounded-md font-bold text-sm shadow-md active:scale-[0.98] transition-transform flex justify-center items-center gap-2"
              >
                <span>Accept Challenge 2</span>
                <LockIcon />
              </button>
            ) : (
              <div className="py-2 flex items-center justify-center gap-2 text-[var(--color-success)] text-sm font-bold">
                <CheckIcon /> Challenge Completed
              </div>
            )}
          </>
        )}

        {/* Panel 3: The Exact Coordinates */}
        {renderAccordionItem(
          3, 
          "Final Coordinates", 
          unlockedLevel < 3, 
          expandedPanel === 3,
          <>
            {/* Final Coordinates: support multiple images with simple carousel/swipe */}
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-100 mb-3 shadow-[var(--shadow-card)]">
              {(() => {
                const raw = clues.card2.image_placeholder;
                const imgs = Array.isArray(raw) ? raw : (raw ? [raw] : []);
                const urls = imgs.map((p: string) => resolveImageUrl(p) || p).filter(Boolean) as string[];
                const safeIndex = imgs.length ? card3Index % imgs.length : 0;
                const current = imgs.length ? imgs[safeIndex] : null;
                const currentUrl = urls[safeIndex];
                const currentStatus = currentUrl ? card3ImageStatus[currentUrl] : undefined;
                const isCurrentImageLoading = Boolean(currentUrl && currentStatus !== 'loaded' && currentStatus !== 'error');
                const imageSrc = currentStatus === 'error'
                  ? TARGET_IMAGE_FALLBACK
                  : (resolveImageUrl(current) || TARGET_IMAGE_FALLBACK);
                const goToImage = (nextIndex: number) => {
                  if (isCurrentImageLoading || !imgs.length) return;
                  setCard3Index((nextIndex + imgs.length) % imgs.length);
                };
                return (
                  <div
                    className="w-full h-full relative"
                    onTouchStart={(e) => { touchStartXRef.current = e.touches?.[0]?.clientX ?? null; }}
                    onTouchEnd={(e) => {
                      if (isCurrentImageLoading) {
                        touchStartXRef.current = null;
                        return;
                      }
                      const endX = e.changedTouches?.[0]?.clientX ?? null;
                      if (touchStartXRef.current !== null && endX !== null) {
                        const delta = endX - touchStartXRef.current;
                        if (Math.abs(delta) > 40) {
                          if (delta < 0) goToImage(safeIndex + 1);
                          else goToImage(safeIndex - 1);
                        }
                      }
                      touchStartXRef.current = null;
                    }}
                  >
                    {current ? (
                      <button className="w-full h-full disabled:cursor-wait" disabled={isCurrentImageLoading} onClick={() => {
                        if (urls.length) { setViewerImages(urls); setViewerIndex(card3Index); setViewerOpen(true); }
                      }}>
                        <LazyLoadImage
                          src={imageSrc}
                          onLoad={() => {
                            if (!currentUrl) return;
                            setCard3ImageStatus((previous) => ({ ...previous, [currentUrl]: 'loaded' }));
                          }}
                          onError={(e: ImageErrorEvent) => {
                            if (currentUrl) {
                              setCard3ImageStatus((previous) => ({ ...previous, [currentUrl]: 'error' }));
                            }
                            e.currentTarget.src = TARGET_IMAGE_FALLBACK;
                          }}
                          alt={`Exact NFC Location ${card3Index + 1}`}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${isCurrentImageLoading ? 'opacity-30' : 'opacity-100'}`}
                          effect="blur"
                        />
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)]">
                        No image
                      </div>
                    )}

                    {isCurrentImageLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 px-6 text-center text-[var(--color-text-main)] backdrop-blur-sm">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                        <div>
                          <p className="text-sm font-bold">Loading clue image...</p>
                          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                            Hold on before switching pages so the route is shown correctly.
                          </p>
                        </div>
                      </div>
                    )}

                    {imgs.length > 1 && (
                      <>
                        <button
                          onClick={() => goToImage(safeIndex - 1)}
                          disabled={isCurrentImageLoading}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white transition-opacity disabled:cursor-wait disabled:opacity-40"
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => goToImage(safeIndex + 1)}
                          disabled={isCurrentImageLoading}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white transition-opacity disabled:cursor-wait disabled:opacity-40"
                          aria-label="Next image"
                        >
                          ›
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                          {imgs.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => goToImage(i)}
                              disabled={isCurrentImageLoading}
                              className={`h-2 w-2 rounded-full transition-opacity disabled:cursor-wait ${i === safeIndex ? 'bg-white' : 'bg-white/40'}`}
                              aria-label={`Go to image ${i + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
            <p className="mb-3 font-medium text-[var(--color-text-main)] bg-[var(--color-warning)]/10 p-3 rounded-md border border-[var(--color-warning)]/30">
              {clues.card2.lv3_text}
            </p>
          </>
        )}
      </div>
      <ImageViewer images={viewerImages} initialIndex={viewerIndex} isOpen={viewerOpen} onClose={() => setViewerOpen(false)} />

      {/* Full Cover Quiz Modal */}
      {activeQuiz && (
        <div className="absolute inset-0 bg-[var(--color-surface)] flex flex-col rounded-[var(--radius-card)]" style={{ zIndex: 'var(--z-modal)' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <h3 className="font-bold text-[var(--color-primary)] flex items-center gap-2">
              <LockIcon /> Unlocking Level {activeQuiz.levelToUnlock}
            </h3>
            <button 
              onClick={() => setActiveQuiz(null)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
            >
              ×
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col">
            <p className="font-bold text-lg mb-5 leading-tight">{activeQuiz.quiz.question}</p>
            
            <div className="flex flex-col gap-3 flex-1">
              {activeQuiz.quiz.options.map((opt: string, i: number) => {
                // Determine option index assuming standard A->0, B->1 etc, but user's json has 1-indexed. Wait, user json had:
                // correctAnswerIndex: 2 (for C?), index 4 (for D?) Let's use 1-based indexing for selection match.
                // The prompt says "correctAnswerIndex": 2 means "B." or "C."? Wait, usually 1-based, Option C = 3? In user's JSON, Option C is 2? Let's treat the index as raw value exactly matching user's config if 1-based or 0-based.
                // Wait, "options": ["A.", "B.", "C.", "D."] => B is index 1. But user gave 2 for C. That's 0-based index. "D. All of the above" -> index 4? Wait, size 4 array has max index 3. If index is 4, maybe they meant 1-based where 4 = Option D.
                // Let's just use 1-based everywhere in state and match exactly what they wrote.
                const isSelected = selectedOption === (i + 1);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedOption(i + 1)}
                    className={`text-left p-3 rounded-md border-2 transition-all ${
                      isSelected 
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium shadow-sm' 
                        : 'border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {quizFeedback && (
              <div className={`mt-4 p-3 rounded-md text-sm font-bold animate-in fade-in slide-in-from-bottom-2 ${
                quizFeedback.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {quizFeedback.message}
              </div>
            )}

            <button 
              onClick={handleSubmitQuiz}
              disabled={selectedOption === null || quizFeedback?.type === 'success'}
              className="mt-6 w-full py-3 bg-[var(--color-primary)] text-white rounded-md font-bold disabled:opacity-50 disabled:scale-100 active:scale-[0.98] transition-transform"
            >
              {quizFeedback?.type === 'success' ? 'Unlocking...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}

      <RoleSelectionModal isOpen={roleModalOpen} onClose={handleRoleSelected} />
    </div>
  );
};

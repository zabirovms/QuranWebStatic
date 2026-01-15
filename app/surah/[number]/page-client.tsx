'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getSurahByNumberClient } from '@/lib/data/surah-data-client';
import { getVersesBySurahClient } from '@/lib/data/verse-data-client';
import { Surah, Verse } from '@/lib/types';
import SurahAppBar from '@/components/SurahAppBar';
import VerseItem from '@/components/VerseItem';
import SurahDisplaySettings, { SurahDisplaySettings as SurahDisplaySettingsType } from '@/components/SurahDisplaySettings';
import BookmarksDrawer from '@/components/BookmarksDrawer';
import { BookmarkService } from '@/lib/services/bookmark-service';
import { SettingsService } from '@/lib/services/settings-service';
import { getAudioService, PlaybackState } from '@/lib/services/audio-service';
import { supportsVerseByVerse } from '@/lib/utils/audio-helper';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { PlayArrowIcon, PauseIcon } from '@/components/Icons';
import CanonicalHead from '@/components/CanonicalHead';
import StructuredData from '@/components/StructuredData';
import { getSurahName } from '@/lib/utils/surah-names';

interface SurahPageClientProps {
  params: {
    number: string;
  };
  initialSurah: Surah | null;
  initialVerses: Verse[];
}

function SurahPageContent({ params, initialSurah, initialVerses }: SurahPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isVisible: isTopBarVisible } = useTopBar();
  const surahNumber = parseInt(params.number);
  const [surah, setSurah] = useState<Surah | null>(initialSurah);
  const [verses, setVerses] = useState<Verse[]>(initialVerses);
  const [isLoading, setIsLoading] = useState(!initialSurah || initialVerses.length === 0);
  const [hasAnyBookmarks, setHasAnyBookmarks] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  const [currentJuz, setCurrentJuz] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);
  const [scrollProgress, setScrollProgress] = useState(0);
  // Load settings from SettingsService on mount
  const settingsService = SettingsService.getInstance();
  const initialSettings = settingsService.getSettings();
  const [surahSettings, setSurahSettings] = useState<SurahDisplaySettingsType>({
    showTransliteration: initialSettings.showTransliteration,
    showTranslation: initialSettings.showTranslation,
    showOnlyArabic: initialSettings.showOnlyArabic,
    isWordByWordMode: initialSettings.wordByWordMode,
    showVerseActions: true, // Always true - actions visible by default, toggle removed from settings
    plainCardsMode: true, // Always true - default/main mode
    translationLanguage: initialSettings.translationLanguage,
    audioEdition: initialSettings.audioEdition,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  // Audio playback state
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const audioService = getAudioService();
  const lastAutoScrolledVerseRef = useRef<number | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  
  // Get initial verse from URL params (safely handle searchParams)
  let initialVerse: number | null = null;
  try {
    const verseParam = searchParams?.get('verse');
    if (verseParam) {
      const parsed = parseInt(verseParam, 10);
      if (!isNaN(parsed) && parsed > 0) {
        initialVerse = parsed;
      }
    }
  } catch (error) {
    // searchParams might not be available during navigation
    console.warn('Error reading verse parameter:', error);
  }
  
  // Track previous initialVerse to detect changes
  const prevInitialVerseRef = useRef<number | null>(null);
  const prevSurahNumberRef = useRef<number>(surahNumber);

  useEffect(() => {
    // Only load if we don't have initial data
    if (initialSurah && initialVerses.length > 0) {
      setIsLoading(false);
      // Check for bookmarks
      const bookmarkService = BookmarkService.getInstance();
      setHasAnyBookmarks(bookmarkService.hasAnyBookmarks());
      
      // Highlight initial verse if provided
      if (initialVerse) {
        setHighlightedVerse(initialVerse);
        // Keep highlight longer for better visibility
        setTimeout(() => {
          setHighlightedVerse(null);
        }, 3000);
      }
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [surahData, versesData] = await Promise.all([
          getSurahByNumberClient(surahNumber),
          getVersesBySurahClient(surahNumber),
        ]);

        if (!surahData) {
          notFound();
          return;
        }

        setSurah(surahData);
        setVerses(versesData);
        
        // Check for bookmarks
        const bookmarkService = BookmarkService.getInstance();
        setHasAnyBookmarks(bookmarkService.hasAnyBookmarks());
        
        // Highlight initial verse if provided
        if (initialVerse) {
          setHighlightedVerse(initialVerse);
          // Keep highlight longer for better visibility
          setTimeout(() => {
            setHighlightedVerse(null);
          }, 3000);
        }
      } catch (error) {
        console.error('Error loading surah:', error);
        const errorMessage = error instanceof Error ? error.message : 'Хатоги дар боргирии маълумот';
        setLoadError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [surahNumber, initialVerse, initialSurah, initialVerses]);

  // Swipe gestures for navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 100;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0 && surahNumber < 114) {
        // Swipe left - next surah
        router.push(`/surah/${surahNumber + 1}`);
      } else if (diff < 0 && surahNumber > 1) {
        // Swipe right - previous surah
        router.push(`/surah/${surahNumber - 1}`);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Reset refs when surah changes
  useEffect(() => {
    if (prevSurahNumberRef.current !== surahNumber) {
      prevSurahNumberRef.current = surahNumber;
      prevInitialVerseRef.current = null;
    }
  }, [surahNumber]);

  // Scroll to verse when initialVerse changes (matching Flutter behavior)
  useEffect(() => {
    // Only scroll if initialVerse changed or is newly set
    const shouldScroll = initialVerse && 
                         initialVerse !== prevInitialVerseRef.current &&
                         verses.length > 0 && 
                         !isLoading && 
                         surah &&
                         prevSurahNumberRef.current === surahNumber; // Ensure surah hasn't changed
    
    if (shouldScroll) {
      // Update ref to track current verse
      prevInitialVerseRef.current = initialVerse;
      
      let scrollAttempts = 0;
      const maxAttempts = 20; // Increased attempts for slower connections
      
      const scrollToVerse = () => {
        // Check if component is still mounted
        if (prevSurahNumberRef.current !== surahNumber) return;
        
        const verseElement = document.getElementById(`verse-${initialVerse}`);
        if (verseElement && verseElement.parentNode) {
          // Get the exact position of the verse element
          const elementRect = verseElement.getBoundingClientRect();
          
          // Check if element is fully rendered (has height)
          if (elementRect.height === 0 && scrollAttempts < maxAttempts) {
            scrollAttempts++;
            // Element not fully rendered yet, try again after a short delay
            setTimeout(() => {
              // Check again before retrying
              if (prevSurahNumberRef.current === surahNumber) {
                requestAnimationFrame(scrollToVerse);
              }
            }, 50);
            return;
          }
          
          // Element is rendered, calculate scroll position
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          
          // Calculate viewport height
          const viewportHeight = window.innerHeight;
          
          // Position verse slightly above center (matching Flutter alignment: 0.2)
          // alignment: 0.0 = top, 0.5 = center, 1.0 = bottom
          // Using 0.2 means position at 20% of viewport from top (slightly above center)
          const targetPosition = absoluteElementTop - (viewportHeight * 0.2);
          
          // Smooth scroll to the calculated position
          window.scrollTo({
            top: Math.max(0, targetPosition), // Ensure not negative
            behavior: 'smooth',
          });
        } else if (scrollAttempts < maxAttempts) {
          // Element not found yet, try again
          scrollAttempts++;
          setTimeout(() => {
            // Check if component is still mounted before retrying
            if (prevSurahNumberRef.current === surahNumber) {
              requestAnimationFrame(scrollToVerse);
            }
          }, 50);
        }
      };

      // Wait for layout to complete - use setTimeout to ensure DOM is ready
      // This matches Flutter's Future.delayed approach
      const timeoutId = setTimeout(() => {
        // Check if component is still mounted
        if (prevSurahNumberRef.current !== surahNumber) return;
        
        requestAnimationFrame(() => {
          // Check again before each frame
          if (prevSurahNumberRef.current !== surahNumber) return;
          
          requestAnimationFrame(() => {
            if (prevSurahNumberRef.current !== surahNumber) return;
            
            requestAnimationFrame(() => {
              if (prevSurahNumberRef.current !== surahNumber) return;
              scrollToVerse();
            });
          });
        });
      }, 100); // Initial delay to ensure page is rendered
      
      // Store timeout ID for cleanup
      timeoutIdsRef.current.push(timeoutId);
      
      // Return cleanup function
      return () => {
        clearTimeout(timeoutId);
        // Remove from ref array
        timeoutIdsRef.current = timeoutIdsRef.current.filter(id => id !== timeoutId);
      };
    } else if (initialVerse === null) {
      // Reset ref when verse is cleared
      prevInitialVerseRef.current = null;
    }
  }, [initialVerse, verses.length, isLoading, surah, surahNumber]);

  // Subscribe to audio service state changes
  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setPlaybackState(state);
      
      // If playing this surah and a specific verse, highlight and scroll to it
      if (state.currentSurahNumber === surahNumber && 
          state.currentVerseNumber !== null && 
          state.isPlaying) {
        const verseNumber = state.currentVerseNumber;
        
        // Highlight the verse
        setHighlightedVerse((prev) => {
          // Only update if different to avoid unnecessary re-renders
          return prev !== verseNumber ? verseNumber : prev;
        });
        
        // Auto-scroll to the verse if it's different from last scrolled
        if (verseNumber !== lastAutoScrolledVerseRef.current) {
          lastAutoScrolledVerseRef.current = verseNumber;
          
          // Small delay to ensure DOM is ready
          const timeoutId = setTimeout(() => {
            // Check if component is still mounted by verifying surahNumber matches
            if (prevSurahNumberRef.current !== surahNumber) return;
            
            const verseElement = document.getElementById(`verse-${verseNumber}`);
            if (verseElement && verseElement.parentNode) {
              const elementRect = verseElement.getBoundingClientRect();
              
              // Check if element is fully rendered
              if (elementRect.height === 0) {
                // Element not rendered yet, try again
                const retryTimeoutId = setTimeout(() => {
                  // Check if component is still mounted
                  if (prevSurahNumberRef.current !== surahNumber) return;
                  
                  const retryElement = document.getElementById(`verse-${verseNumber}`);
                  if (retryElement && retryElement.parentNode) {
                    const retryRect = retryElement.getBoundingClientRect();
                    if (retryRect.height > 0) {
                      const absoluteElementTop = retryRect.top + window.pageYOffset;
                      const viewportHeight = window.innerHeight;
                      const targetPosition = absoluteElementTop - (viewportHeight * 0.2);
                      
                      window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth',
                      });
                    }
                  }
                }, 100);
                
                // Store timeout ID for cleanup
                timeoutIdsRef.current.push(retryTimeoutId);
                return;
              }
              
              // Only scroll if element is not visible in viewport
              const isVisible = elementRect.top >= 0 && 
                               elementRect.bottom <= window.innerHeight;
              
              if (!isVisible) {
                const absoluteElementTop = elementRect.top + window.pageYOffset;
                const viewportHeight = window.innerHeight;
                const targetPosition = absoluteElementTop - (viewportHeight * 0.2);
                
                window.scrollTo({
                  top: Math.max(0, targetPosition),
                  behavior: 'smooth',
                });
              }
            }
          }, 100);
          
          // Store timeout ID for cleanup
          timeoutIdsRef.current.push(timeoutId);
        }
      } else if (state.currentSurahNumber !== surahNumber || 
                 (state.currentSurahNumber === surahNumber && !state.isPlaying)) {
        // Clear highlight if not playing this surah or if playback stopped
        // Only clear if the highlight was from audio playback (not from initial verse navigation)
        setHighlightedVerse((prev) => {
          // Only clear if it matches the last auto-scrolled verse (audio playback)
          if (prev && lastAutoScrolledVerseRef.current === prev) {
            return null;
          }
          return prev;
        });
        if (state.currentSurahNumber !== surahNumber) {
          lastAutoScrolledVerseRef.current = null;
        }
      }
    });
    
    unsubscribeRef.current = unsubscribe;
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      // Clear all pending timeouts
      timeoutIdsRef.current.forEach(id => clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, [surahNumber, verses.length]);

  // Track scroll position to update juz, page, and progress
  useEffect(() => {
    const handleScroll = () => {
      if (verses.length === 0) return;

      const scrollPosition = window.scrollY + window.innerHeight / 2;
      const verseElements = document.querySelectorAll('[data-verse-number]');
      
      let currentVerse: Verse | null = null;
      let closestDistance = Infinity;

      verseElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const elementCenter = rect.top + window.scrollY + rect.height / 2;
        const distance = Math.abs(scrollPosition - elementCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          const verseNumber = parseInt(el.getAttribute('data-verse-number') || '0');
          const foundVerse = verses.find(v => v.verseNumber === verseNumber);
          if (foundVerse) {
            currentVerse = foundVerse;
          }
        }
      });

      if (currentVerse) {
        const verse: Verse = currentVerse;
        setCurrentJuz(verse.juz ?? undefined);
        setCurrentPage(verse.page ?? undefined);
        
        // Calculate progress (0 to 1)
        const progress = verse.verseNumber / verses.length;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [verses]);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)',
      }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (loadError || !surah) {
    // Create a minimal surah object for the error case
    const fallbackSurah: Surah = {
      id: surahNumber,
      number: surahNumber,
      nameArabic: '',
      nameTajik: `Сураи ${surahNumber}`,
      nameEnglish: `Surah ${surahNumber}`,
      revelationType: 'unknown',
      versesCount: 0,
    };

    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <SurahAppBar 
          surah={fallbackSurah}
          hasAnyBookmarks={hasAnyBookmarks}
        />
        <ErrorDisplay
          message={loadError || 'Сура ёфт нашуд'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const hasBismillah = surahNumber !== 1 && surahNumber !== 9;
  const svgPath = `/surah-names-svg/${String(surahNumber).padStart(3, '0')}.svg`;
  const surahName = getSurahName(surahNumber);

  return (
    <>
      <CanonicalHead />
      <StructuredData
        type="surah"
        surahNumber={surahNumber}
        surahName={surahName}
      />
      <div 
      ref={containerRef}
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <SurahAppBar 
        surah={surah}
        hasAnyBookmarks={hasAnyBookmarks}
        onSettingsClick={() => setShowSettingsDialog(true)}
        onBookmarksClick={() => setShowBookmarksDrawer(true)}
        currentJuz={currentJuz}
        currentPage={currentPage}
        progress={scrollProgress}
      />
      
      <main style={{ 
        padding: 'var(--spacing-lg) 4px',
        paddingTop: isTopBarVisible ? 'calc(112px + var(--spacing-lg))' : 'calc(56px + var(--spacing-lg))',
        maxWidth: '900px', 
        margin: '0 auto' 
      }}>
        {/* Surah Header */}
        <div style={{
          marginBottom: 'var(--spacing-xl)',
          textAlign: 'center',
          backgroundColor: 'var(--color-surface-variant)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-outline)',
          padding: 'var(--spacing-md)',
        }}>
          {/* Arabic Name SVG */}
          <div style={{
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)',
          }}>
            <Image
              src={svgPath}
              alt={surah.nameArabic}
              width={200}
              height={50}
              className="surah-name-svg"
              style={{
                objectFit: 'contain',
              }}
              onError={(e) => {
                // Fallback to text if SVG fails
                const target = e.target as HTMLImageElement;
                if (!target || !target.parentElement) return; // Safety check
                target.style.display = 'none';
                const parent = target.parentElement;
                // Double-check parent is still in DOM
                if (parent && parent.parentNode && document.body.contains(parent)) {
                  const fallback = document.createElement('div');
                  fallback.style.cssText = 'font-size: 1.5rem; font-weight: bold; color: var(--color-primary); direction: rtl; text-align: center; font-family: Amiri, serif;';
                  fallback.textContent = surah.nameArabic;
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>

          {/* Surah Info */}
          <h1 className="headline-large" style={{ marginBottom: 'var(--spacing-xs)' }}>
            {surah.nameTajik}
          </h1>
          <p className="body-medium" style={{ 
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-md)',
          }}>
            {surah.versesCount} оят • {surah.revelationType}
          </p>

          {/* Play button and Description Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-sm)',
            marginBottom: isDescriptionExpanded ? 'var(--spacing-sm)' : 0,
          }}>
            {/* Play button */}
            <button
              onClick={async () => {
                const isPlayingThisSurah = playbackState?.currentSurahNumber === surahNumber && playbackState?.isPlaying;
                if (isPlayingThisSurah) {
                  await audioService.pause();
                } else {
                  try {
                    const edition = surahSettings.audioEdition || 'ar.alafasy';
                    await audioService.playSurahVerseByVerse(surahNumber, edition);
                  } catch (error) {
                    console.error('Error playing surah:', error);
                    alert(`Хатоги дар пахш кардани оятҳо: ${error instanceof Error ? error.message : 'Хатогӣ'}`);
                  }
                }
              }}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
              }}
              title={playbackState?.currentSurahNumber === surahNumber && playbackState?.isPlaying ? 'Ист кардан' : 'Пахш кардани сура'}
            >
              {playbackState?.currentSurahNumber === surahNumber && playbackState?.isPlaying ? (
                <PauseIcon size={20} color="var(--color-primary)" />
              ) : (
                <PlayArrowIcon size={20} color="var(--color-text-primary)" />
              )}
            </button>

            {/* Description Toggle */}
            {surah.description && surah.description.trim() && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: 'var(--color-primary-container-low-opacity)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-primary)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer',
                }}
              >
                <span>ℹ️</span>
                <span>Маълумот</span>
                <span>{isDescriptionExpanded ? '▲' : '▼'}</span>
              </button>
            )}
          </div>

          {/* Description Expanded Content */}
          {isDescriptionExpanded && surah.description && surah.description.trim() && (
            <div
              onClick={() => setIsDescriptionExpanded(false)}
              style={{
                margin: 'var(--spacing-sm) var(--spacing-md)',
                padding: 'var(--spacing-sm)',
                backgroundColor: 'var(--color-surface-variant)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-base)',
                lineHeight: '1.4',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {surah.description.trim()}
            </div>
          )}
        </div>

        {/* Bismillah */}
        {hasBismillah && (
          <div style={{
            margin: 'var(--spacing-md) var(--spacing-lg)',
            textAlign: 'center',
          }}>
            <div style={{
              height: '80px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-variant)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-outline)',
              padding: 'var(--spacing-xs)',
            }}>
              <Image
                src="/images/bismillah.svg"
                alt="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
                width={200}
                height={80}
                className="surah-name-svg"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}

        {/* Verses */}
        <div>
          {verses.map((verse) => (
            <div 
              key={verse.verseNumber} 
              id={`verse-${verse.verseNumber}`}
              data-verse-number={verse.verseNumber}
            >
              <VerseItem
                verse={verse}
                surahNumber={surahNumber}
                highlight={highlightedVerse === verse.verseNumber}
                scrollIntoView={false}
                isPlaying={playbackState?.currentSurahNumber === surahNumber && 
                          playbackState?.currentVerseNumber === verse.verseNumber && 
                          playbackState?.isPlaying || false}
                showExtraActions={surahSettings.showVerseActions}
                plainCardsMode={surahSettings.plainCardsMode}
                showTransliteration={surahSettings.showTransliteration}
                showTranslation={surahSettings.showTranslation}
                showOnlyArabic={surahSettings.showOnlyArabic}
                isWordByWordMode={surahSettings.isWordByWordMode}
                translationLanguage={surahSettings.translationLanguage}
                onPlayAudio={async () => {
                  const edition = surahSettings.audioEdition || 'ar.alafasy';
                  const isPlayingThisVerse = playbackState?.currentSurahNumber === surahNumber && 
                                            playbackState?.currentVerseNumber === verse.verseNumber && 
                                            playbackState?.isPlaying;
                  if (isPlayingThisVerse) {
                    await audioService.pause();
                  } else {
                    try {
                      await audioService.playVerse(surahNumber, verse.verseNumber, edition);
                    } catch (error) {
                      console.error('Error playing verse:', error);
                      alert(`Хатоги дар пахш кардан: ${error instanceof Error ? error.message : 'Хатогӣ'}`);
                    }
                  }
                }}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Display Settings Dialog */}
      <SurahDisplaySettings
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        onSettingsChange={(settings) => setSurahSettings(settings)}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={showBookmarksDrawer}
        onClose={() => setShowBookmarksDrawer(false)}
      />
      </div>
    </>
  );
}

export default function SurahPageClient({ params, initialSurah, initialVerses }: SurahPageClientProps) {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner size="large" />
      </div>
    }>
      <SurahPageContent params={params} initialSurah={initialSurah} initialVerses={initialVerses} />
    </Suspense>
  );
}

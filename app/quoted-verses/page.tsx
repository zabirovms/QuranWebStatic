'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllQuotedVerses } from '@/lib/data/quoted-verse-data-client';
import { QuotedVerse } from '@/lib/types';
import { BackgroundService } from '@/lib/services/background-service';
import { ArrowBackIcon, RefreshIcon, ShuffleIcon, ShareIcon, PlayArrowIcon, PauseIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { getAudioService, PlaybackState } from '@/lib/services/audio-service';
import { SettingsService } from '@/lib/services/settings-service';

type Tab = 'simple' | 'styled';

// Helper functions for parsing ref
const getSurahNumber = (ref: string): number => {
  const parts = ref.split(':');
  return parts.length > 0 ? parseInt(parts[0], 10) || 1 : 1;
};

const getVerseNumber = (ref: string): number => {
  const parts = ref.split(':');
  return parts.length > 1 ? parseInt(parts[1], 10) || 1 : 1;
};

function QuotedVersesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isVisible: isTopBarVisible } = useTopBar();
  const [verses, setVerses] = useState<QuotedVerse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('simple');
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [isLoadingBackgrounds, setIsLoadingBackgrounds] = useState(false);
  const highlightRef = searchParams.get('ref');
  const [selectedRef, setSelectedRef] = useState<string | null>(highlightRef);
  const simpleScrollRef = useRef<HTMLDivElement>(null);
  const styledScrollRef = useRef<HTMLDivElement>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const audioService = getAudioService();
  const settingsService = SettingsService.getInstance();

  // Load verses
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getAllQuotedVerses();
        // Shuffle verses on load (matching Flutter)
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setVerses(shuffled);
      } catch (error) {
        console.error('Error loading quoted verses:', error);
        setLoadError(error instanceof Error ? error.message : 'Хатоги дар боргирии маълумот');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Load background images for styled tab
  useEffect(() => {
    if (activeTab === 'styled' && backgroundImages.length === 0 && !isLoadingBackgrounds) {
      loadBackgroundImages();
    }
  }, [activeTab]);

  // Handle ref query parameter
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setSelectedRef(ref);
      // Remove highlight after 3 seconds (matching Flutter)
      const timer = setTimeout(() => {
        setSelectedRef(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Auto-scroll to selected verse
  useEffect(() => {
    if (selectedRef && verses.length > 0) {
      const index = verses.findIndex(v => v.ref === selectedRef);
      if (index !== -1) {
        setTimeout(() => {
          scrollToVerse(index);
        }, 100);
      }
    }
  }, [selectedRef, verses.length]);

  // Subscribe to audio playback state
  useEffect(() => {
    const unsubscribe = audioService.subscribe((state) => {
      setPlaybackState(state);
    });
    return () => {
      unsubscribe();
    };
  }, [audioService]);

  const loadBackgroundImages = async () => {
    setIsLoadingBackgrounds(true);
    try {
      const backgroundService = new BackgroundService();
      const urls = await backgroundService.fetchBackgroundUrls();
      // Shuffle backgrounds (matching Flutter)
      const shuffled = [...urls].sort(() => Math.random() - 0.5);
      setBackgroundImages(shuffled);
    } catch (error) {
      console.error('Error loading background images:', error);
      setBackgroundImages([]);
    } finally {
      setIsLoadingBackgrounds(false);
    }
  };

  const scrollToVerse = (index: number) => {
    const scrollContainer = activeTab === 'simple' ? simpleScrollRef.current : styledScrollRef.current;
    if (scrollContainer) {
      // Estimate item height (matching Flutter: 220 for simple, 420 for styled)
      const estimatedItemHeight = activeTab === 'simple' ? 220 : 420;
      const targetScroll = index * estimatedItemHeight;
      scrollContainer.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  };

  const handleShuffle = () => {
    const shuffled = [...verses].sort(() => Math.random() - 0.5);
    setVerses(shuffled);
  };

  const handleRefreshBackgrounds = () => {
    const backgroundService = new BackgroundService();
    backgroundService.clearCache();
    setBackgroundImages([]);
    loadBackgroundImages();
  };

  const handleShare = async (verse: QuotedVerse, asImage = false) => {
    try {
      if (asImage) {
        // For styled cards, we'd need to capture the card as an image
        // This requires html2canvas or similar library
        // For now, fall back to text sharing
        await shareAsText(verse);
      } else {
        await shareAsText(verse);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Хатоги дар мубодила кардан');
    }
  };

  const shareAsText = async (verse: QuotedVerse) => {
    const shareText = [
      verse.quotedArabic,
      '',
      verse.tajik,
      verse.transliteration ? `\n${verse.transliteration}` : '',
      '',
      `(Қуръон ${verse.ref})`,
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
          title: 'Иқтибос аз Қуръон',
        });
      } catch (error) {
        // Share cancelled or failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Иқтибос ба ҳофиза нусхабардорӣ карда шуд');
    }
  };

  const handlePlayVerse = async (verse: QuotedVerse) => {
    const surahNum = getSurahNumber(verse.ref);
    const verseNum = getVerseNumber(verse.ref);
    const edition = settingsService.getSettings().audioEdition || 'ar.alafasy';
    const isPlayingThisVerse = playbackState?.currentSurahNumber === surahNum && 
                              playbackState?.currentVerseNumber === verseNum && 
                              playbackState?.isPlaying;
    if (isPlayingThisVerse) {
      await audioService.pause();
    } else {
      try {
        await audioService.playVerse(surahNum, verseNum, edition);
      } catch (error) {
        console.error('Error playing verse:', error);
        alert(`Хатоги дар пахш кардан: ${error instanceof Error ? error.message : 'Хатогӣ'}`);
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      width: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}>
        {/* Tabs - Fixed below Global TopBar */}
        <div style={{
          position: 'fixed',
          top: isTopBarVisible ? '56px' : '0px',
          left: 0,
          right: 0,
          display: 'flex',
          borderBottom: '1px solid var(--color-outline)',
          backgroundColor: 'var(--color-background)',
          zIndex: 1019,
          height: '48px',
          transition: 'top 0.4s ease-out',
        }}>
          {(['simple', 'styled'] as Tab[]).map((tab) => (
          <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                backgroundColor: 'transparent',
                position: 'relative',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-primary)',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer',
              }}
            >
              {tab === 'simple' ? 'Корти матнӣ' : 'Бо замина'}
              {activeTab === tab && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '40%',
                  height: '2px',
                  backgroundColor: 'var(--color-primary)',
                }} />
              )}
          </button>
          ))}
          {activeTab === 'styled' && (
            <button
              onClick={handleRefreshBackgrounds}
              className="btn btn-icon"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
              }}
              title="Навсозии заминаҳо"
            >
              <RefreshIcon size={24} color="var(--color-primary)" />
            </button>
          )}
      </div>

      {/* Content */}
      <div style={{
        padding: 'var(--spacing-lg) 4px',
        paddingTop: isTopBarVisible ? 'calc(56px + 48px - 12px)' : 'calc(48px - 12px)',
        transition: 'padding-top 0.4s ease-out',
        paddingBottom: 'calc(80px)',
        marginTop: '0',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}>
      {isLoading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <LoadingSpinner />
        </div>
      ) : loadError ? (
        <div style={{ padding: '32px' }}>
          <ErrorDisplay message={loadError} onRetry={() => window.location.reload()} />
        </div>
      ) : verses.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <div>Иқтибосҳо ёфт нашуд</div>
        </div>
      ) : (
        <>
          {/* Simple Cards Tab */}
          {activeTab === 'simple' && (
            <div
              ref={simpleScrollRef}
              className="scrollable-container-vertical"
              style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '0',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {verses.map((verse, index) => {
                const isSelected = verse.ref === selectedRef;
                const surahNum = getSurahNumber(verse.ref);
                const verseNum = getVerseNumber(verse.ref);
                const isPlaying = playbackState?.currentSurahNumber === surahNum && 
                                 playbackState?.currentVerseNumber === verseNum && 
                                 playbackState?.isPlaying || false;
                return (
                  <SimpleQuotedVerseCard
                    key={index}
                    verse={verse}
                    isSelected={isSelected}
                    isPlaying={isPlaying}
                    onShare={() => handleShare(verse)}
                    onOpen={() => {
                      router.push(`/surah/${surahNum}?verse=${verseNum}`);
                    }}
                    onPlay={() => handlePlayVerse(verse)}
                  />
                );
              })}
            </div>
          )}

          {/* Styled Cards Tab */}
          {activeTab === 'styled' && (
            <div
              ref={styledScrollRef}
              className="scrollable-container-vertical"
              style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '0',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {verses.map((verse, index) => {
                const isSelected = verse.ref === selectedRef;
                const surahNum = getSurahNumber(verse.ref);
                const verseNum = getVerseNumber(verse.ref);
                const isPlaying = playbackState?.currentSurahNumber === surahNum && 
                                 playbackState?.currentVerseNumber === verseNum && 
                                 playbackState?.isPlaying || false;
                return (
                  <div key={`${verse.ref}-${index}`}>
                    <StyledQuotedVerseCard
                      verse={verse}
                      isSelected={isSelected}
                      index={index}
                      backgroundUrl={backgroundImages.length > 0 
                        ? backgroundImages[index % backgroundImages.length] 
                        : ''}
                      isPlaying={isPlaying}
                      onShare={() => handleShare(verse, true)}
                      onOpen={() => {
                        router.push(`/surah/${surahNum}?verse=${verseNum}`);
                      }}
                      onPlay={() => handlePlayVerse(verse)}
                    />
                  </div>
                );
              })}
            </div>
          )}

        </>
      )}
      </div>

      {/* Shuffle FloatingActionButton */}
      {verses.length > 0 && activeTab === 'simple' && (
        <button
          onClick={handleShuffle}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#f0f0f0',
            border: 'none',
            margin: 0,
            padding: 0,
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            pointerEvents: 'auto',
            lineHeight: 1,
            minWidth: '56px',
            minHeight: '56px',
            maxWidth: '56px',
            maxHeight: '56px',
          }}
          title="Ҷобаҷо кардан"
        >
          <ShuffleIcon size={24} color="var(--color-text-primary)" />
        </button>
      )}

    </div>
  );
}

// Simple Quoted Verse Card Component
function SimpleQuotedVerseCard({
  verse,
  isSelected,
  isPlaying,
  onShare,
  onOpen,
  onPlay,
}: {
  verse: QuotedVerse;
  isSelected: boolean;
  isPlaying: boolean;
  onShare: () => void;
  onOpen: () => void;
  onPlay: () => void;
}) {
  return (
    <div
      style={{
        marginBottom: 'var(--spacing-md)',
        marginLeft: 'var(--spacing-md)',
        marginRight: 'var(--spacing-md)',
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-outline)'}`,
        boxShadow: isSelected ? 'var(--elevation-2)' : 'none',
      }}
    >
      {/* Tajik Translation */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 'var(--font-size-lg)',
          marginBottom: 'var(--spacing-md)',
          lineHeight: '1.6',
        }}
      >
        «{verse.tajik.trim()}»
      </div>

      {/* Reference */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          fontWeight: 'var(--font-weight-semibold)',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        Қуръон {getSurahNumber(verse.ref)}:{getVerseNumber(verse.ref)}
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-evenly',
          gap: 'var(--spacing-md)',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onShare}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-bold)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Мубодила
        </button>
        <button
          onClick={onPlay}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          title={isPlaying ? 'Пауза' : 'Пахш кардан'}
        >
          {isPlaying ? (
            <PauseIcon size={24} color="var(--color-primary)" />
          ) : (
            <PlayArrowIcon size={24} color="var(--color-primary)" />
          )}
        </button>
        <button
          onClick={onOpen}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-bold)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          Ба сура
        </button>
      </div>
    </div>
  );
}

// Styled Quoted Verse Card Component
function StyledQuotedVerseCard({
  verse,
  isSelected,
  index,
  backgroundUrl,
  isPlaying,
  onShare,
  onOpen,
  onPlay,
}: {
  verse: QuotedVerse;
  isSelected: boolean;
  index: number;
  backgroundUrl: string;
  isPlaying: boolean;
  onShare: () => void;
  onOpen: () => void;
  onPlay: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div style={{ 
      marginBottom: 'var(--spacing-lg)',
      marginLeft: 'var(--spacing-md)',
      marginRight: 'var(--spacing-md)',
    }}>
      {/* Card */}
      <div
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: isSelected ? '2px solid var(--color-primary)' : 'none',
          boxShadow: isSelected ? 'var(--elevation-4)' : 'var(--elevation-2)',
          aspectRatio: '3/4',
        }}
        onClick={onOpen}
      >
        {/* Background Image or Gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          {backgroundUrl && !imageError ? (
            <>
              {!imageLoaded && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0.05) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LoadingSpinner />
                </div>
              )}
              <img
                src={backgroundUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: imageLoaded ? 'block' : 'none',
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
            </>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0.05) 100%)',
              }}
            />
          )}
        </div>

        {/* Dark Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.25) 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Expanded content area (centered) */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  color: '#fff',
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  lineHeight: '1.6',
                  marginBottom: 'var(--spacing-sm)',
                  textShadow: '1px 1px 4px rgba(0, 0, 0, 0.54)',
                }}
              >
                «{verse.tajik.trim()}»
              </div>
              <div
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.54)',
                }}
              >
                Қуръон {getSurahNumber(verse.ref)}:{getVerseNumber(verse.ref)}
              </div>
            </div>
          </div>

          {/* Website Label at bottom */}
          <div
            style={{
              marginTop: '6px',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '0.5px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.54)',
              textAlign: 'center',
            }}
          >
            www.quran.tj
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-md) 0',
          alignItems: 'center',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
          }}
        >
          <ShareIcon size={18} color="var(--color-primary)" />
          Мубодила
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          title={isPlaying ? 'Пауза' : 'Пахш кардан'}
        >
          {isPlaying ? (
            <PauseIcon size={24} color="var(--color-primary)" />
          ) : (
            <PlayArrowIcon size={24} color="var(--color-primary)" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-primary)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
          }}
        >
          Ба сура →
        </button>
      </div>
    </div>
  );
}

export default function QuotedVersesPage() {
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
      <QuotedVersesPageContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getQaidaModuleClient } from '@/lib/data/qaida-data-client';
import { QaidaModule, QaidaLetter, QaidaSyllableExample } from '@/lib/types/qaida';
import { ArrowBackIcon, PlayArrowIcon, VolumeUpIcon, ArrowForwardIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useTopBar } from '@/lib/contexts/TopBarContext';

interface QaidaDrillPageProps {
  lessonNumber: number;
  letter?: string; // Deprecated - use syllableId instead
  letterId?: string;
  syllableId?: string; // New: syllable ID for lessons 2,3,4,6,7,8
  drillType: 'alphabet' | 'pronunciation' | 'vowels' | 'tanween' | 'letterForms' | 'shadda' | 'sukun' | 'madd';
}

const lessonTitles: Record<number, string> = {
  1: 'Алифбо',
  2: 'Талаффуз',
  3: 'Харокатҳо',
  4: 'Танвин',
  5: 'Шаклҳои ҳарф',
  6: 'Шадда',
  7: 'Сукун',
  8: 'Мадд',
};

export default function QaidaDrillPage({
  lessonNumber,
  letter,
  letterId,
  syllableId,
  drillType,
}: QaidaDrillPageProps) {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const [module, setModule] = useState<QaidaModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getQaidaModuleClient();
        setModule(data);
        
        // Find start index based on letter/letterId
        if (drillType === 'alphabet' || drillType === 'letterForms') {
          const targetLesson = data.lessons.find((l) => l.id === lessonNumber) || data.lessons[0];
          const lettersBlock = targetLesson.content.find(
            (b) => b.subtype === (drillType === 'alphabet' ? 'letters_chart' : 'letters_forms_chart')
          );
          const letters = lettersBlock?.letters || [];
          const startIndex = letters.findIndex((l) => l.id === (letterId || letter));
          if (startIndex !== -1) {
            setCurrentIndex(startIndex);
          }
        } else if (drillType === 'vowels' || drillType === 'tanween' || drillType === 'shadda' || drillType === 'sukun' || drillType === 'madd' || drillType === 'pronunciation') {
          const targetLesson = data.lessons.find((l) => l.id === lessonNumber) || data.lessons[0];
          const syllablesBlock = targetLesson.content.find(
            (b) => b.subtype === 'syllables_examples'
          );
          const allSyllables = syllablesBlock?.examples || [];
          
          // Filter by vowel if pronunciation (lesson 2)
          let filteredSyllables = allSyllables;
          if (drillType === 'pronunciation') {
            filteredSyllables = allSyllables.filter((s) => s.vowel === 'َ');
          }
          
          // Group by letter
          const letterGroups: { [key: string]: QaidaSyllableExample[] } = {};
          for (const syllable of filteredSyllables) {
            const groupKey = syllable.letter;
            if (!letterGroups[groupKey]) {
              letterGroups[groupKey] = [];
            }
            letterGroups[groupKey].push(syllable);
          }
          
          const uniqueLetters = Object.keys(letterGroups);
          
          // If syllableId is provided, find the letter from that syllable
          if (syllableId) {
            const syllable = allSyllables.find((s) => s.id === syllableId);
            if (syllable) {
              const startIndex = uniqueLetters.indexOf(syllable.letter);
              if (startIndex !== -1) {
                setCurrentIndex(startIndex);
              }
            }
          } else if (letter) {
            // Fallback for backward compatibility
            const startIndex = uniqueLetters.indexOf(letter);
            if (startIndex !== -1) {
              setCurrentIndex(startIndex);
            }
          }
        }
      } catch (err) {
        console.error('Error loading Qaida drill:', err);
        setError(err instanceof Error ? err.message : 'Дарс бор нашуд');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [lessonNumber, letter, letterId, syllableId, drillType]);

  const handleBack = () => {
    router.back();
  };

  const handlePlayAudio = () => {
    // Placeholder for audio playback
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}>
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (error || !module) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <ErrorDisplay
          message={error || 'Дарс бор нашуд'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Render based on drill type
  if (drillType === 'alphabet') {
    return <AlphabetDrill
      module={module}
      lessonNumber={lessonNumber}
      letterId={letterId || letter || ''}
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
      onBack={handleBack}
      onPlay={handlePlayAudio}
      isPlaying={isPlaying}
    />;
  }

  if (drillType === 'letterForms') {
    return <LetterFormsDrill
      module={module}
      lessonNumber={lessonNumber}
      letterId={letterId || letter || ''}
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
      onBack={handleBack}
      onPlay={handlePlayAudio}
      isPlaying={isPlaying}
    />;
  }

  if (drillType === 'pronunciation' || drillType === 'vowels' || drillType === 'tanween' || drillType === 'shadda' || drillType === 'sukun' || drillType === 'madd') {
    return <VowelsDrill
      module={module}
      lessonNumber={lessonNumber}
      letter={letter || ''}
      drillType={drillType}
      currentIndex={currentIndex}
      onIndexChange={setCurrentIndex}
      onBack={handleBack}
      onPlay={handlePlayAudio}
      isPlaying={isPlaying}
    />;
  }

  return null;
}

// Alphabet Drill (Lesson 1)
function AlphabetDrill({
  module,
  lessonNumber,
  letterId,
  currentIndex,
  onIndexChange,
  onBack,
  onPlay,
  isPlaying,
}: {
  module: QaidaModule;
  lessonNumber: number;
  letterId: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onBack: () => void;
  onPlay: () => void;
  isPlaying: boolean;
}) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  const targetLesson = module.lessons.find((l) => l.id === lessonNumber) || module.lessons[0];
  const lettersBlock = targetLesson.content.find(
    (b) => b.subtype === 'letters_chart'
  );
  const letters = lettersBlock?.letters || [];

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentIndex < letters.length - 1) {
        // Swipe left - next
        onIndexChange(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous
        onIndexChange(currentIndex - 1);
      }
    }
  };

  if (letters.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <main style={{
          padding: 'var(--spacing-lg) 4px',
          paddingTop: 'var(--spacing-md)',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-primary)' }}>
            Ҳарфҳо ёфт нашуд
          </div>
        </main>
      </div>
    );
  }

  const current = letters[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < letters.length - 1;
  const progress = ((currentIndex + 1) / letters.length) * 100;

  const topBarHeight = isTopBarVisible ? 56 : 0;
  const headerHeight = 52; // Increased to accommodate text
  const progressHeight = 32; // Slightly increased for better visibility
  const controlsHeight = 64;
  const availableHeight = `calc(100vh - ${topBarHeight + headerHeight + progressHeight + controlsHeight}px)`;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header with Back Button */}
      <div style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        paddingTop: 'var(--spacing-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-outline)',
        boxShadow: 'var(--elevation-1)',
        minHeight: `${headerHeight}px`,
        flexShrink: 0,
        position: 'sticky',
        top: isTopBarVisible ? '56px' : '0',
        zIndex: 1018,
      }}>
        <button
          onClick={onBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-outline)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
          }}
          title="Бозгашт"
        >
          <ArrowBackIcon size={20} color="var(--color-primary)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
            marginBottom: '2px',
          }}>
            {lessonTitles[lessonNumber]}
          </div>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.2,
          }}>
            Ҳарфи {currentIndex + 1} аз {letters.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        minHeight: `${progressHeight}px`,
        padding: 'var(--spacing-sm) var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-outline)',
        flexShrink: 0,
        position: 'sticky',
        top: isTopBarVisible ? `calc(56px + ${headerHeight}px)` : `${headerHeight}px`,
        zIndex: 1017,
      }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--color-outline-variant)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-base)',
          }} />
        </div>
      </div>

      {/* Main Content - Card Style */}
      <div 
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 'var(--spacing-md)',
          paddingTop: 'var(--spacing-lg)',
          overflow: 'auto',
          flexGrow: 1,
          flexShrink: 1,
          minHeight: 0,
        }}
      >
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(16px, 4vw, 32px)',
          boxShadow: 'var(--elevation-2)',
          border: '1px solid var(--color-outline)',
          textAlign: 'center',
          width: '100%',
          maxWidth: '600px',
          transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
        }}>
          {/* Letter */}
          <div style={{
            fontSize: 'clamp(56px, 14vw, 96px)',
            fontFamily: 'Noto_Naskh_Arabic, serif',
            direction: 'rtl',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-xs)',
            lineHeight: 1.1,
            minHeight: 'clamp(56px, 14vw, 96px)',
          }}>
            {current.letter}
          </div>

          {/* Name */}
          {current.name && (
            <div style={{
              fontSize: 'clamp(16px, 3.5vw, 24px)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: '2px',
            }}>
              {current.name}
            </div>
          )}

          {/* Pronunciation */}
          {current.pronunciation && (
            <div style={{
              fontSize: 'clamp(14px, 3vw, 20px)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-secondary)',
              marginTop: '2px',
            }}>
              {current.pronunciation}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls - Larger Touch Targets */}
      <div style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        paddingBottom: 'max(var(--spacing-sm), env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-outline)',
        boxShadow: 'var(--elevation-1)',
        minHeight: `${controlsHeight}px`,
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        zIndex: 1018,
      }}>
        <button
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={!canGoPrev}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-primary)',
            backgroundColor: canGoPrev ? 'transparent' : 'var(--color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            opacity: canGoPrev ? 1 : 0.5,
            transition: 'all var(--transition-base)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            if (canGoPrev) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Қаблӣ"
        >
          <ArrowBackIcon size={24} color="var(--color-primary)" />
        </button>
        <button
          onClick={onPlay}
          disabled={isPlaying}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.7 : 1,
            transition: 'all var(--transition-base)',
            boxShadow: 'var(--elevation-2)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            if (!isPlaying) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = 'var(--elevation-4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'var(--elevation-2)';
          }}
          title="Пахш кардан"
        >
          {isPlaying ? (
            <VolumeUpIcon size={28} color="var(--color-on-primary)" />
          ) : (
            <PlayArrowIcon size={28} color="var(--color-on-primary)" />
          )}
        </button>
        <button
          onClick={() => onIndexChange(currentIndex + 1)}
          disabled={!canGoNext}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-primary)',
            backgroundColor: canGoNext ? 'transparent' : 'var(--color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.5,
            transition: 'all var(--transition-base)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            if (canGoNext) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Баъдӣ"
        >
          <ArrowForwardIcon size={24} color="var(--color-primary)" />
        </button>
      </div>
    </div>
  );
}

// Letter Forms Drill (Lesson 5)
function LetterFormsDrill({
  module,
  lessonNumber,
  letterId,
  currentIndex,
  onIndexChange,
  onBack,
  onPlay,
  isPlaying,
}: {
  module: QaidaModule;
  lessonNumber: number;
  letterId: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onBack: () => void;
  onPlay: () => void;
  isPlaying: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const { isVisible: isTopBarVisible } = useTopBar();
  
  const targetLesson = module.lessons.find((l) => l.id === lessonNumber) || module.lessons[0];
  const lettersBlock = targetLesson.content.find(
    (b) => b.subtype === 'letters_forms_chart'
  );
  const letters = lettersBlock?.letters || [];

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentIndex < letters.length - 1) {
        onIndexChange(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      }
    }
  };

  if (letters.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <main style={{
          padding: 'var(--spacing-lg) 4px',
          paddingTop: 'var(--spacing-md)',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-primary)' }}>
            Ҳарфҳо ёфт нашуд
          </div>
        </main>
      </div>
    );
  }

  const current = letters[currentIndex];
  const forms = current.forms || {};
  const examples = current.examples || {};
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < letters.length - 1;
  const progress = ((currentIndex + 1) / letters.length) * 100;

  const topBarHeight = isTopBarVisible ? 56 : 0;
  const headerHeight = 52; // Increased to accommodate text
  const progressHeight = 32; // Slightly increased for better visibility
  const controlsHeight = 64;
  const availableHeight = `calc(100vh - ${topBarHeight + headerHeight + progressHeight + controlsHeight}px)`;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header with Back Button */}
      <div style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        paddingTop: 'var(--spacing-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-outline)',
        boxShadow: 'var(--elevation-1)',
        minHeight: `${headerHeight}px`,
        flexShrink: 0,
        position: 'sticky',
        top: isTopBarVisible ? '56px' : '0',
        zIndex: 1018,
      }}>
        <button
          onClick={onBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-outline)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
          }}
          title="Бозгашт"
        >
          <ArrowBackIcon size={20} color="var(--color-primary)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
            marginBottom: '2px',
          }}>
            {lessonTitles[lessonNumber]}
          </div>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.2,
          }}>
            Ҳарфи {currentIndex + 1} аз {letters.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        minHeight: `${progressHeight}px`,
        padding: 'var(--spacing-sm) var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-outline)',
        flexShrink: 0,
        position: 'sticky',
        top: isTopBarVisible ? `calc(56px + ${headerHeight}px)` : `${headerHeight}px`,
        zIndex: 1017,
      }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--color-outline-variant)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-base)',
          }} />
        </div>
      </div>

      {/* Main Content - Card Style */}
      <div 
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 'var(--spacing-md)',
          paddingTop: 'var(--spacing-lg)',
          overflow: 'auto',
          flexGrow: 0,
          flexShrink: 1,
        }}
      >
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(12px, 3vw, 24px)',
          boxShadow: 'var(--elevation-2)',
          border: '1px solid var(--color-outline)',
          width: '100%',
          maxWidth: '600px',
          transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            width: '100%',
          }}>
            {/* Main Letter */}
            <div style={{
              fontSize: 'clamp(48px, 12vw, 96px)',
              fontFamily: 'Noto_Naskh_Arabic, serif',
              direction: 'rtl',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
              minHeight: 'clamp(48px, 12vw, 96px)',
            }}>
              {current.letter}
            </div>

            {/* Name */}
            {current.name && (
              <div style={{
                fontSize: 'clamp(16px, 3.5vw, 24px)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
              }}>
                {current.name}
              </div>
            )}

            {/* Forms */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--spacing-sm)',
              direction: 'rtl',
              width: '100%',
            }}>
              {['initial', 'medial', 'final'].map((formKey) => {
                const form = forms[formKey];
                if (!form) return null;
                return (
                  <div key={formKey} style={{
                    textAlign: 'center',
                    padding: 'var(--spacing-sm)',
                    backgroundColor: 'var(--color-primary-container-low-opacity)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-outline)',
                  }}>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '4px',
                    }}>
                      {formKey === 'initial' ? 'Аввал' : formKey === 'medial' ? 'Байн' : 'Охир'}
                    </div>
                    <div style={{
                      fontSize: 'clamp(24px, 6vw, 40px)',
                      fontFamily: 'Noto_Naskh_Arabic, serif',
                      direction: 'rtl',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.1,
                    }}>
                      {form}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Examples */}
            {Object.keys(examples).length > 0 && (
              <div style={{
                width: '100%',
                marginTop: 'var(--spacing-xs)',
              }}>
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--spacing-sm)',
                  textAlign: 'center',
                }}>
                  Мисолҳо:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--spacing-sm)',
                  direction: 'rtl',
                }}>
                  {['initial', 'medial', 'final'].map((formKey) => {
                    const example = examples[formKey];
                    if (!example) return null;
                    return (
                      <div key={formKey} style={{
                        fontSize: 'clamp(16px, 3.5vw, 24px)',
                        fontFamily: 'Noto_Naskh_Arabic, serif',
                        direction: 'rtl',
                        color: 'var(--color-text-primary)',
                        textAlign: 'center',
                        padding: 'var(--spacing-xs)',
                        backgroundColor: 'var(--color-surface-variant)',
                        borderRadius: 'var(--radius-md)',
                        lineHeight: 1.1,
                      }}>
                        {example}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls - Larger Touch Targets */}
      <div style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        paddingBottom: 'max(var(--spacing-sm), env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-outline)',
        boxShadow: 'var(--elevation-1)',
        minHeight: `${controlsHeight}px`,
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        zIndex: 1018,
      }}>
        <button
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={!canGoPrev}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-primary)',
            backgroundColor: canGoPrev ? 'transparent' : 'var(--color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            opacity: canGoPrev ? 1 : 0.5,
            transition: 'all var(--transition-base)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            if (canGoPrev) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Қаблӣ"
        >
          <ArrowBackIcon size={22} color="var(--color-primary)" />
        </button>
        <button
          onClick={onPlay}
          disabled={isPlaying}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.7 : 1,
            transition: 'all var(--transition-base)',
            boxShadow: 'var(--elevation-2)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            if (!isPlaying) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = 'var(--elevation-4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'var(--elevation-2)';
          }}
          title="Пахш кардан"
        >
          {isPlaying ? (
            <VolumeUpIcon size={26} color="var(--color-on-primary)" />
          ) : (
            <PlayArrowIcon size={26} color="var(--color-on-primary)" />
          )}
        </button>
        <button
          onClick={() => onIndexChange(currentIndex + 1)}
          disabled={!canGoNext}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-primary)',
            backgroundColor: canGoNext ? 'transparent' : 'var(--color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.5,
            transition: 'all var(--transition-base)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            if (canGoNext) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Баъдӣ"
        >
          <ArrowForwardIcon size={22} color="var(--color-primary)" />
        </button>
      </div>
    </div>
  );
}

// Vowels Drill (Lessons 2, 3, 4, 6, 7, 8)
function VowelsDrill({
  module,
  lessonNumber,
  letter,
  drillType,
  currentIndex,
  onIndexChange,
  onBack,
  onPlay,
  isPlaying,
}: {
  module: QaidaModule;
  lessonNumber: number;
  letter: string;
  drillType: 'pronunciation' | 'vowels' | 'tanween' | 'shadda' | 'sukun' | 'madd';
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onBack: () => void;
  onPlay: () => void;
  isPlaying: boolean;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const { isVisible: isTopBarVisible } = useTopBar();
  
  const targetLesson = module.lessons.find((l) => l.id === lessonNumber) || module.lessons[0];
  const syllablesBlock = targetLesson.content.find(
    (b) => b.subtype === 'syllables_examples'
  );
  const allSyllables = syllablesBlock?.examples || [];

  // Filter by vowel if pronunciation (lesson 2)
  let filteredSyllables = allSyllables;
  if (drillType === 'pronunciation') {
    filteredSyllables = allSyllables.filter((s) => s.vowel === 'َ');
  }

  // Group by letter
  const letterGroups: { [key: string]: QaidaSyllableExample[] } = {};
  for (const syllable of filteredSyllables) {
    const groupKey = syllable.letter;
    if (!letterGroups[groupKey]) {
      letterGroups[groupKey] = [];
    }
    letterGroups[groupKey].push(syllable);
  }

  // Sort syllables within each group
  for (const group of Object.values(letterGroups)) {
    if (lessonNumber === 4) {
      // Tanween order
      const tanweenOrder: { [key: string]: number } = { 'ً': 0, 'ٍ': 1, 'ٌ': 2 };
      group.sort((a, b) => (tanweenOrder[a.vowel] || 0) - (tanweenOrder[b.vowel] || 0));
    } else if (lessonNumber !== 6 && lessonNumber !== 7) {
      // Regular harakats order
      const vowelOrder: { [key: string]: number } = { 'َ': 0, 'ِ': 1, 'ُ': 2 };
      group.sort((a, b) => (vowelOrder[a.vowel] || 0) - (vowelOrder[b.vowel] || 0));
    }
  }

  const uniqueLetters = Object.keys(letterGroups);
  const currentLetter = uniqueLetters[currentIndex] || '';
  const currentSyllables = letterGroups[currentLetter] || [];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < uniqueLetters.length - 1;
  const progress = ((currentIndex + 1) / uniqueLetters.length) * 100;

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && canGoNext) {
        // Swipe left - next
        onIndexChange(currentIndex + 1);
      } else if (diff < 0 && canGoPrev) {
        // Swipe right - previous
        onIndexChange(currentIndex - 1);
      }
    }
  };

  const topBarHeight = isTopBarVisible ? 56 : 0;
  const headerHeight = 52; // Increased to accommodate text
  const progressHeight = 32; // Slightly increased for better visibility
  const controlsHeight = 64;
  const availableHeight = `calc(100vh - ${topBarHeight + headerHeight + progressHeight + controlsHeight}px)`;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header with Back Button */}
      <div style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        paddingTop: 'var(--spacing-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-outline)',
        boxShadow: 'var(--elevation-1)',
        minHeight: `${headerHeight}px`,
        flexShrink: 0,
        position: 'sticky',
        top: isTopBarVisible ? '56px' : '0',
        zIndex: 1018,
      }}>
        <button
          onClick={onBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-outline)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface)';
          }}
          title="Бозгашт"
        >
          <ArrowBackIcon size={20} color="var(--color-primary)" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
            marginBottom: '2px',
          }}>
            {lessonTitles[lessonNumber]}
          </div>
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.2,
          }}>
            {currentIndex + 1} / {uniqueLetters.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        minHeight: `${progressHeight}px`,
        padding: 'var(--spacing-sm) var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-outline)',
        flexShrink: 0,
        position: 'sticky',
        top: isTopBarVisible ? `calc(56px + ${headerHeight}px)` : `${headerHeight}px`,
        zIndex: 1017,
      }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--color-outline-variant)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'var(--color-primary)',
            borderRadius: 'var(--radius-full)',
            transition: 'width var(--transition-base)',
          }} />
        </div>
      </div>

      {/* Main Content - Card Style with Swipe Support */}
      <div 
        ref={contentRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 'var(--spacing-md)',
          paddingTop: 'var(--spacing-lg)',
          overflow: 'hidden',
          flexGrow: 0,
          flexShrink: 1,
        }}
      >
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(16px, 4vw, 32px)',
          boxShadow: 'var(--elevation-2)',
          border: '1px solid var(--color-outline)',
          width: '100%',
          maxWidth: '600px',
          transition: 'transform var(--transition-base), box-shadow var(--transition-base)',
        }}>
          {renderVowelContent(lessonNumber, currentLetter, currentSyllables, drillType)}
        </div>
      </div>

      {/* Bottom Controls - Larger Touch Targets */}
      <div style={{
        padding: 'var(--spacing-sm) var(--spacing-md)',
        paddingBottom: 'max(var(--spacing-sm), env(safe-area-inset-bottom))',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-outline)',
        boxShadow: 'var(--elevation-1)',
        minHeight: `${controlsHeight}px`,
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        zIndex: 1018,
      }}>
        <button
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={!canGoPrev}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-primary)',
            backgroundColor: canGoPrev ? 'transparent' : 'var(--color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            opacity: canGoPrev ? 1 : 0.5,
            transition: 'all var(--transition-base)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            if (canGoPrev) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Қаблӣ"
        >
          <ArrowBackIcon size={22} color="var(--color-primary)" />
        </button>
        <button
          onClick={onPlay}
          disabled={isPlaying}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.7 : 1,
            transition: 'all var(--transition-base)',
            boxShadow: 'var(--elevation-2)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            if (!isPlaying) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = 'var(--elevation-4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'var(--elevation-2)';
          }}
          title="Пахш кардан"
        >
          {isPlaying ? (
            <VolumeUpIcon size={26} color="var(--color-on-primary)" />
          ) : (
            <PlayArrowIcon size={26} color="var(--color-on-primary)" />
          )}
        </button>
        <button
          onClick={() => onIndexChange(currentIndex + 1)}
          disabled={!canGoNext}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-primary)',
            backgroundColor: canGoNext ? 'transparent' : 'var(--color-outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.5,
            transition: 'all var(--transition-base)',
            touchAction: 'manipulation',
          }}
          onMouseEnter={(e) => {
            if (canGoNext) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Баъдӣ"
        >
          <ArrowForwardIcon size={22} color="var(--color-primary)" />
        </button>
      </div>
    </div>
  );
}

function renderVowelContent(
  lessonNumber: number,
  letter: string,
  syllables: QaidaSyllableExample[],
  drillType: string
) {
  // Lesson 2 (pronunciation) - single syllable with fatha
  if (drillType === 'pronunciation' && syllables.length > 0) {
    const syllable = syllables[0];
    return (
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{
          fontSize: 'clamp(56px, 14vw, 96px)',
          fontFamily: 'Noto_Naskh_Arabic, serif',
          direction: 'rtl',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-xs)',
          lineHeight: 1.1,
          minHeight: 'clamp(56px, 14vw, 96px)',
        }}>
          {`${syllable.letter}${syllable.vowel}`}
        </div>
        <div style={{
          fontSize: 'clamp(18px, 4vw, 28px)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
        }}>
          {syllable.syllable}
        </div>
      </div>
    );
  }

  // Lesson 6 (shadda) - combined form
  if (lessonNumber === 6 && syllables.length > 0) {
    const syllable = syllables[0];
    const displayText = (syllable.letter === 'لا' && syllable.vowel === 'ء')
      ? 'لاء'
      : `${syllable.letter}َ` + 'لَّ' + 'ا';
    return (
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{
          fontSize: 'clamp(56px, 14vw, 96px)',
          fontFamily: 'Noto_Naskh_Arabic, serif',
          direction: 'rtl',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-xs)',
          lineHeight: 1.1,
          minHeight: 'clamp(56px, 14vw, 96px)',
        }}>
          {displayText}
        </div>
        <div style={{
          fontSize: 'clamp(18px, 4vw, 28px)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
        }}>
          {syllable.syllable}
        </div>
      </div>
    );
  }

  // Lesson 7 (sukun) - combined form
  if (lessonNumber === 7 && syllables.length > 0) {
    const syllable = syllables[0];
    const displayText = (syllable.letter === 'لا' && syllable.vowel === 'ء')
      ? 'لاء'
      : `${syllable.letter}ِ` + 'نِّ' + 'يْ';
    return (
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{
          fontSize: 'clamp(56px, 14vw, 96px)',
          fontFamily: 'Noto_Naskh_Arabic, serif',
          direction: 'rtl',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-xs)',
          lineHeight: 1.1,
          minHeight: 'clamp(56px, 14vw, 96px)',
        }}>
          {displayText}
        </div>
        <div style={{
          fontSize: 'clamp(18px, 4vw, 28px)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
        }}>
          {syllable.syllable}
        </div>
      </div>
    );
  }

  // Lesson 8 (madd) - horizontal layout, Arabic only
  if (lessonNumber === 8 && syllables.length > 0) {
    return (
      <div style={{
        display: 'flex',
        direction: 'rtl',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}>
        {syllables.map((syllable, index) => (
          <div
            key={index}
            style={{
              fontSize: 'clamp(36px, 9vw, 64px)',
              fontFamily: 'Noto_Naskh_Arabic, serif',
              direction: 'rtl',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.1,
            }}
          >
            {`${syllable.letter}${syllable.vowel}`}
          </div>
        ))}
      </div>
    );
  }

  // Lesson 3, 4 (vowels/tanween) - letter with all harakats horizontally
  if (syllables.length > 0) {
    return (
      <div style={{ textAlign: 'center', width: '100%' }}>
        {/* Letter */}
        <div style={{
          fontSize: 'clamp(56px, 14vw, 96px)',
          fontFamily: 'Noto_Naskh_Arabic, serif',
          direction: 'rtl',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-sm)',
          lineHeight: 1.1,
          minHeight: 'clamp(56px, 14vw, 96px)',
        }}>
          {letter}
        </div>

        {/* All harakats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(syllables.length, 3)}, 1fr)`,
          gap: 'var(--spacing-sm)',
          direction: 'rtl',
        }}>
          {syllables.map((syllable, index) => (
            <div key={index} style={{
              textAlign: 'center',
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--color-primary-container-low-opacity)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-outline)',
            }}>
              <div style={{
                fontSize: 'clamp(36px, 9vw, 64px)',
                fontFamily: 'Noto_Naskh_Arabic, serif',
                direction: 'rtl',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
                lineHeight: 1.1,
              }}>
                {`${syllable.letter}${syllable.vowel}`}
              </div>
              <div style={{
                fontSize: 'clamp(14px, 3vw, 20px)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
              }}>
                {syllable.syllable}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getQaidaModuleClient } from '@/lib/data/qaida-data-client';
import { QaidaModule, QaidaLetter, QaidaSyllableExample } from '@/lib/types/qaida';
import { ArrowBackIcon, PlayArrowIcon, VolumeUpIcon, ArrowForwardIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useTopBar } from '@/lib/contexts/TopBarContext';

interface QaidaDrillPageProps {
  lessonNumber: number;
  letter?: string;
  letterId?: string;
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
        } else if (drillType === 'vowels' || drillType === 'tanween' || drillType === 'shadda' || drillType === 'sukun' || drillType === 'madd') {
          const targetLesson = data.lessons.find((l) => l.id === lessonNumber) || data.lessons[0];
          const syllablesBlock = targetLesson.content.find(
            (b) => b.subtype === 'syllables_examples'
          );
          const allSyllables = syllablesBlock?.examples || [];
          
          // Group by letter
          const letterGroups: { [key: string]: QaidaSyllableExample[] } = {};
          for (const syllable of allSyllables) {
            const groupKey = syllable.letter;
            if (!letterGroups[groupKey]) {
              letterGroups[groupKey] = [];
            }
            letterGroups[groupKey].push(syllable);
          }
          
          const uniqueLetters = Object.keys(letterGroups);
          const startIndex = uniqueLetters.indexOf(letter || '');
          if (startIndex !== -1) {
            setCurrentIndex(startIndex);
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
  }, [lessonNumber, letter, letterId, drillType]);

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
        <div 
          className="app-bar"
          style={{
            top: isTopBarVisible ? '56px' : '0px',
          }}
        >
          <div className="app-bar-content">
            <h1 className="app-bar-title" style={{ fontSize: 'var(--font-size-md)' }}>
              {lessonTitles[lessonNumber]}
            </h1>
          </div>
        </div>
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
        <div 
          className="app-bar"
          style={{
            top: isTopBarVisible ? '56px' : '0px',
          }}
        >
          <div className="app-bar-content">
            <h1 className="app-bar-title" style={{ fontSize: 'var(--font-size-md)' }}>
              {lessonTitles[lessonNumber]}
            </h1>
          </div>
        </div>
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
  const targetLesson = module.lessons.find((l) => l.id === lessonNumber) || module.lessons[0];
  const lettersBlock = targetLesson.content.find(
    (b) => b.subtype === 'letters_chart'
  );
  const letters = lettersBlock?.letters || [];

  if (letters.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div 
          className="app-bar"
          style={{
            top: isTopBarVisible ? '56px' : '0px',
          }}
        >
          <div className="app-bar-content">
            <h1 className="app-bar-title" style={{ fontSize: 'var(--font-size-md)' }}>
              {lessonTitles[lessonNumber]}
            </h1>
          </div>
        </div>
        <main style={{
          padding: 'var(--spacing-lg) 4px',
          paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
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

  const appBarHeight = isTopBarVisible ? 112 : 56; // 56px app-bar + 56px top-bar if visible
  const progressHeight = 32;
  const controlsHeight = 60;
  const availableHeight = `calc(100vh - ${appBarHeight + progressHeight + controlsHeight}px)`;

  return (
    <div style={{
      height: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* AppBar */}
      <div 
        className="app-bar"
        style={{
          top: isTopBarVisible ? '56px' : '0px',
        }}
      >
        <div className="app-bar-content">
          <h1 className="app-bar-title" style={{ fontSize: 'var(--font-size-md)' }}>
            {lessonTitles[lessonNumber]}
          </h1>
        </div>
      </div>

      {/* Progress Text */}
      <div style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-xs))' : 'var(--spacing-xs)',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-xs)',
        height: `${progressHeight}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        Ҳарфи {currentIndex + 1} аз {letters.length}
      </div>

      {/* Main Content */}
      <div style={{
        height: availableHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xs)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          textAlign: 'center',
          width: '100%',
        }}>
          {/* Letter */}
          <div style={{
            fontSize: 'clamp(48px, 12vw, 72px)',
            fontFamily: 'Noto_Naskh_Arabic, serif',
            direction: 'rtl',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: '2px',
            lineHeight: 1.1,
          }}>
            {current.letter}
          </div>

          {/* Name */}
          {current.name && (
            <div style={{
              fontSize: 'clamp(14px, 3vw, 18px)',
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
              fontSize: 'clamp(12px, 2.5vw, 16px)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              opacity: 0.9,
            }}>
              {current.pronunciation}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        height: `${controlsHeight}px`,
        flexShrink: 0,
      }}>
        <button
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={!canGoPrev}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-primary)',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            opacity: canGoPrev ? 1 : 0.5,
            flexShrink: 0,
          }}
          title="Қаблӣ"
        >
          <ArrowBackIcon size={20} color="var(--color-primary)" />
        </button>
        <button
          onClick={onPlay}
          disabled={isPlaying}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.7 : 1,
            flexShrink: 0,
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
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-primary)',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.5,
            flexShrink: 0,
          }}
          title="Баъдӣ"
        >
          <ArrowForwardIcon size={20} color="var(--color-primary)" />
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
  const targetLesson = module.lessons.find((l) => l.id === lessonNumber) || module.lessons[0];
  const lettersBlock = targetLesson.content.find(
    (b) => b.subtype === 'letters_forms_chart'
  );
  const letters = lettersBlock?.letters || [];

  const { isVisible: isTopBarVisible } = useTopBar();

  if (letters.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div 
          className="app-bar"
          style={{
            top: isTopBarVisible ? '56px' : '0px',
          }}
        >
          <div className="app-bar-content">
            <h1 className="app-bar-title" style={{ fontSize: 'var(--font-size-md)' }}>
              {lessonTitles[lessonNumber]}
            </h1>
          </div>
        </div>
        <main style={{
          padding: 'var(--spacing-lg) 4px',
          paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
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

  const appBarHeight = isTopBarVisible ? 112 : 56;
  const progressHeight = 24;
  const controlsHeight = 60;
  const availableHeight = `calc(100vh - ${appBarHeight + progressHeight + controlsHeight}px)`;

  return (
    <div style={{
      height: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* AppBar */}
      <div 
        className="app-bar"
        style={{
          top: isTopBarVisible ? '56px' : '0px',
        }}
      >
        <div className="app-bar-content">
          <h1 className="app-bar-title" style={{ fontSize: 'var(--font-size-md)' }}>
            {lessonTitles[lessonNumber]}
          </h1>
        </div>
      </div>

      {/* Progress Text */}
      <div style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-xs))' : 'var(--spacing-xs)',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-xs)',
        height: `${progressHeight}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        Ҳарфи {currentIndex + 1} аз {letters.length}
      </div>

      {/* Main Content */}
      <div style={{
        height: availableHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xs)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
        }}>
          {/* Main Letter */}
          <div style={{
            fontSize: 'clamp(48px, 12vw, 72px)',
            fontFamily: 'Noto_Naskh_Arabic, serif',
            direction: 'rtl',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            lineHeight: 1.1,
          }}>
            {current.letter}
          </div>

          {/* Name */}
          {current.name && (
            <div style={{
              fontSize: 'clamp(14px, 3vw, 18px)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
            }}>
              {current.name}
            </div>
          )}

          {/* Forms */}
          <div style={{
            display: 'flex',
            direction: 'rtl',
            gap: 'var(--spacing-xs)',
            width: '100%',
            justifyContent: 'space-evenly',
            flexWrap: 'wrap',
            marginTop: '4px',
          }}>
            {['initial', 'medial', 'final'].map((formKey) => {
              const form = forms[formKey];
              if (!form) return null;
              return (
                <div key={formKey} style={{
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: '2px',
                  }}>
                    {formKey === 'initial' ? 'Аввал' : formKey === 'medial' ? 'Байн' : 'Охир'}
                  </div>
                  <div style={{
                    fontSize: 'clamp(20px, 5vw, 28px)',
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
            <>
              <div style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginTop: '4px',
              }}>
                Мисолҳо:
              </div>
              <div style={{
                display: 'flex',
                direction: 'rtl',
                gap: 'var(--spacing-xs)',
                width: '100%',
                justifyContent: 'space-evenly',
                flexWrap: 'wrap',
              }}>
                {['initial', 'medial', 'final'].map((formKey) => {
                  const example = examples[formKey];
                  if (!example) return null;
                  return (
                    <div key={formKey} style={{
                      fontSize: 'clamp(14px, 3vw, 20px)',
                      fontFamily: 'Noto_Naskh_Arabic, serif',
                      direction: 'rtl',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.1,
                    }}>
                      {example}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        height: `${controlsHeight}px`,
        flexShrink: 0,
      }}>
        <button
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={!canGoPrev}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-primary)',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            opacity: canGoPrev ? 1 : 0.5,
            flexShrink: 0,
          }}
          title="Қаблӣ"
        >
          <ArrowBackIcon size={20} color="var(--color-primary)" />
        </button>
        <button
          onClick={onPlay}
          disabled={isPlaying}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.7 : 1,
            flexShrink: 0,
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
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-primary)',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.5,
            flexShrink: 0,
          }}
          title="Баъдӣ"
        >
          <ArrowForwardIcon size={20} color="var(--color-primary)" />
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
  const { isVisible: isTopBarVisible } = useTopBar();

  const appBarHeight = isTopBarVisible ? 112 : 56;
  const progressHeight = 24;
  const controlsHeight = 60;
  const availableHeight = `calc(100vh - ${appBarHeight + progressHeight + controlsHeight}px)`;

  return (
    <div style={{
      height: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* AppBar */}
      <div 
        className="app-bar"
        style={{
          top: isTopBarVisible ? '56px' : '0px',
        }}
      >
        <div className="app-bar-content">
          <h1 className="app-bar-title" style={{ fontSize: 'var(--font-size-md)' }}>
            {targetLesson.title}
          </h1>
        </div>
      </div>

      {/* Progress Text */}
      <div style={{
        padding: '4px var(--spacing-md)',
        paddingTop: isTopBarVisible ? 'calc(56px + 4px)' : '4px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-xs)',
        height: `${progressHeight}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {currentIndex + 1} / {uniqueLetters.length}
      </div>

      {/* Main Content */}
      <div style={{
        height: availableHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xs)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {renderVowelContent(lessonNumber, currentLetter, currentSyllables, drillType)}
      </div>

      {/* Bottom Controls */}
      <div style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        height: `${controlsHeight}px`,
        flexShrink: 0,
      }}>
        <button
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={!canGoPrev}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-primary)',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            opacity: canGoPrev ? 1 : 0.5,
            flexShrink: 0,
          }}
          title="Қаблӣ"
        >
          <ArrowBackIcon size={20} color="var(--color-primary)" />
        </button>
        <button
          onClick={onPlay}
          disabled={isPlaying}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isPlaying ? 'not-allowed' : 'pointer',
            opacity: isPlaying ? 0.7 : 1,
            flexShrink: 0,
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
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1.5px solid var(--color-primary)',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.5,
            flexShrink: 0,
          }}
          title="Баъдӣ"
        >
          <ArrowForwardIcon size={20} color="var(--color-primary)" />
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
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 'clamp(48px, 12vw, 72px)',
          fontFamily: 'Noto_Naskh_Arabic, serif',
          direction: 'rtl',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: '2px',
          lineHeight: 1.1,
        }}>
          {`${syllable.letter}${syllable.vowel}`}
        </div>
        <div style={{
          fontSize: 'clamp(14px, 3vw, 18px)',
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
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 'clamp(48px, 12vw, 72px)',
          fontFamily: 'Noto_Naskh_Arabic, serif',
          direction: 'rtl',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: '2px',
          lineHeight: 1.1,
        }}>
          {displayText}
        </div>
        <div style={{
          fontSize: 'clamp(14px, 3vw, 18px)',
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
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 'clamp(48px, 12vw, 72px)',
          fontFamily: 'Noto_Naskh_Arabic, serif',
          direction: 'rtl',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: '2px',
          lineHeight: 1.1,
        }}>
          {displayText}
        </div>
        <div style={{
          fontSize: 'clamp(14px, 3vw, 18px)',
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
        gap: 'var(--spacing-xs)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {syllables.map((syllable, index) => (
          <div
            key={index}
            style={{
              fontSize: 'clamp(32px, 8vw, 48px)',
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
          fontSize: 'clamp(48px, 12vw, 72px)',
          fontFamily: 'Noto_Naskh_Arabic, serif',
          direction: 'rtl',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
          lineHeight: 1.1,
        }}>
          {letter}
        </div>

        {/* All harakats */}
        <div style={{
          display: 'flex',
          direction: 'rtl',
          justifyContent: 'center',
          gap: '4px',
          flexWrap: 'wrap',
        }}>
          {syllables.map((syllable, index) => (
            <div key={index} style={{
              flex: 1,
              minWidth: '60px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 'clamp(32px, 8vw, 48px)',
                fontFamily: 'Noto_Naskh_Arabic, serif',
                direction: 'rtl',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: '2px',
                lineHeight: 1.1,
              }}>
                {`${syllable.letter}${syllable.vowel}`}
              </div>
              <div style={{
                fontSize: 'clamp(12px, 2.5vw, 16px)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
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

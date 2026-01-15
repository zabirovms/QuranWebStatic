'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getVocabularyLessonClient } from '@/lib/data/vocabulary-data-client';
import { VocabularyLesson, VocabularyWord } from '@/lib/types/vocabulary';
import { vocabularyBookmarkService } from '@/lib/services/vocabulary-bookmark-service';
import { vocabularyProgressService } from '@/lib/services/vocabulary-progress-service';
import { ArrowBackIcon, ArrowForwardIcon, PlayArrowIcon, QuizIcon, BookmarkIcon, SearchIcon, InfoIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { getAllSurahs } from '@/lib/data/surah-data-client';

export default function VocabularyWordDetailPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const params = useParams();
  const lessonId = parseInt(params.lessonId as string, 10);
  const wordIndex = parseInt(params.wordIndex as string, 10);
  
  const [lesson, setLesson] = useState<VocabularyLesson | null>(null);
  const [word, setWord] = useState<VocabularyWord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [surahs, setSurahs] = useState<any[]>([]);

  useEffect(() => {
    const loadWord = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [lessonData, surahsData] = await Promise.all([
          getVocabularyLessonClient(lessonId),
          getAllSurahs(),
        ]);
        setSurahs(surahsData);
        if (lessonData && wordIndex >= 0 && wordIndex < lessonData.words.length) {
          setLesson(lessonData);
          setWord(lessonData.words[wordIndex]);
          setIsBookmarked(vocabularyBookmarkService.isWordBookmarked(lessonId, lessonData.words[wordIndex].arabic));
        } else {
          setError('Калима ёфт нашуд');
        }
      } catch (err) {
        console.error('Error loading vocabulary word:', err);
        setError(err instanceof Error ? err.message : 'Хатогӣ');
      } finally {
        setIsLoading(false);
      }
    };

    loadWord();
  }, [lessonId, wordIndex, refreshKey]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/vocabulary/lesson/${lessonId}`);
    }
  };

  const handleToggleBookmark = () => {
    if (word) {
      if (isBookmarked) {
        vocabularyBookmarkService.unbookmarkWord(lessonId, word.arabic);
      } else {
        vocabularyBookmarkService.bookmarkWord(lessonId, word.arabic);
      }
      setIsBookmarked(!isBookmarked);
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleSearch = () => {
    if (word) {
      router.push(`/search?query=${encodeURIComponent(word.arabic)}`);
    }
  };

  const handlePrevious = () => {
    if (wordIndex > 0) {
      router.push(`/vocabulary/lesson/${lessonId}/word/${wordIndex - 1}`);
    }
  };

  const handleNext = () => {
    if (lesson && wordIndex < lesson.words.length - 1) {
      router.push(`/vocabulary/lesson/${lessonId}/word/${wordIndex + 1}`);
    } else if (lesson && wordIndex === lesson.words.length - 1) {
      router.push(`/vocabulary/lesson/${lessonId}/quiz`);
    }
  };

  const handlePlayAudio = () => {
    // Placeholder for audio playback
    console.log('Play audio for:', word?.arabic);
  };

  const buildHighlightedArabicText = (exampleText: string, wordToHighlight: string) => {
    const wordPattern = new RegExp(wordToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const matches = Array.from(exampleText.matchAll(new RegExp(wordPattern, 'g')));
    
    if (matches.length === 0) {
      return (
        <div 
          lang="ar"
          style={{
            fontSize: 'clamp(14px, 3.5vw, 18px)',
            fontFamily: 'Noto_Naskh_Arabic, serif',
            lineHeight: 1.5,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            direction: 'rtl',
          }}>
          {exampleText}
        </div>
      );
    }

    const parts: Array<{ text: string; highlighted: boolean }> = [];
    let lastIndex = 0;

    for (const match of matches) {
      if (match.index !== undefined) {
        if (match.index > lastIndex) {
          parts.push({
            text: exampleText.substring(lastIndex, match.index),
            highlighted: false,
          });
        }
        parts.push({
          text: match[0],
          highlighted: true,
        });
        lastIndex = match.index + match[0].length;
      }
    }

    if (lastIndex < exampleText.length) {
      parts.push({
        text: exampleText.substring(lastIndex),
        highlighted: false,
      });
    }

    return (
      <div 
        lang="ar"
        style={{
          fontSize: 'clamp(14px, 3.5vw, 18px)',
          fontFamily: 'Noto_Naskh_Arabic, serif',
          lineHeight: 1.5,
          textAlign: 'center',
          direction: 'rtl',
        }}>
        {parts.map((part, idx) => (
          <span
            key={idx}
            style={{
              color: part.highlighted ? 'var(--color-primary)' : 'var(--color-text-primary)',
              fontWeight: part.highlighted ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
            }}
          >
            {part.text}
          </span>
        ))}
      </div>
    );
  };

  const parseVerseReference = (reference: string): { surahNumber: number; verseNumber: number } | null => {
    // Parse format like "Аъроф, 73" or "Оли Имрон, 138" or "Бақара, 2"
    const match = reference.match(/^(.+?),\s*(\d+)$/);
    if (!match) return null;
    
    const surahName = match[1].trim();
    const verseNumber = parseInt(match[2], 10);
    if (isNaN(verseNumber)) return null;
    
    // Find surah by Tajik name (case-insensitive, flexible matching)
    try {
      const surah = surahs.find((s) => {
        const nameTajik = s.nameTajik.toLowerCase();
        const searchName = surahName.toLowerCase();
        // Exact match or match without "Ал-" prefix
        return nameTajik === searchName || 
               nameTajik === `ал-${searchName}` ||
               nameTajik.replaceAll('ал-', '') === searchName.replaceAll('ал-', '');
      });
      
      if (surah) {
        return { surahNumber: surah.number, verseNumber };
      }
    } catch (e) {
      // Surah not found
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !lesson || !word) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
          <div className="app-bar-content">
            <button
              onClick={handleBack}
              className="btn btn-icon"
              style={{ marginRight: 'var(--spacing-sm)' }}
              title="Баргаштан"
            >
              <span style={{ fontSize: '24px', color: 'var(--color-primary)' }}>←</span>
            </button>
            <h1 className="app-bar-title">Калима</h1>
          </div>
        </div>
        <ErrorDisplay
          message={error || 'Калима ёфт нашуд'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const currentIndex = wordIndex;
  const totalWords = lesson.words.length;
  const isLastWord = currentIndex === totalWords - 1;

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
        className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}
        style={{
          top: isTopBarVisible ? '56px' : '0px',
          flexShrink: 0,
        }}
      >
        <div className="app-bar-content">
          <button
            onClick={handleBack}
            className="btn btn-icon"
            style={{ marginRight: 'var(--spacing-sm)' }}
            title="Баргаштан"
          >
            <ArrowBackIcon size={24} color="var(--color-primary)" />
          </button>
          <h1 className="app-bar-title">
            Калима {currentIndex + 1} аз {totalWords}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'var(--spacing-md)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-sm))' : 'var(--spacing-sm)',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {/* Arabic word (large, centered) */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-sm)',
          }}>
            <div style={{
              fontSize: 'clamp(32px, 8vw, 48px)',
              fontFamily: 'Noto_Naskh_Arabic, serif',
              direction: 'rtl',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}>
              {word.arabic}
            </div>
          </div>

          {/* Tajik translation */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-xs)',
          }}>
            <div style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary)',
            }}>
              {word.tajik}
            </div>
          </div>

          {/* Note if available */}
          {word.note && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginBottom: 'var(--spacing-xs)',
              gap: '4px',
            }}>
              <InfoIcon size={16} color="var(--color-text-secondary)" />
              <div style={{
                fontSize: 'clamp(12px, 3vw, 14px)',
                color: 'var(--color-text-secondary)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                {word.note}
              </div>
            </div>
          )}

          {/* Example if available */}
          {word.exampleArabic && (
            <div style={{
              marginTop: 'var(--spacing-xs)',
            }}>
              <h3 style={{
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                marginBottom: '4px',
              }}>
                Намуна:
              </h3>
              {/* Arabic example (highlighted) */}
              <div 
                lang="ar"
                style={{
                  padding: '8px',
                  backgroundColor: 'var(--color-primary-container-low-opacity)',
                  borderRadius: '8px',
                  marginBottom: '4px',
                }}>
                {buildHighlightedArabicText(word.exampleArabic, word.arabic)}
              </div>
              {/* Tajik example */}
              <div style={{
                textAlign: 'center',
                marginBottom: '4px',
              }}>
                <div style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.4,
                }}>
                  {word.exampleTajik}
                </div>
              </div>
              {/* Reference */}
              {word.reference && (
                <div style={{
                  textAlign: 'center',
                }}>
                  <button
                    onClick={() => {
                      const parsed = parseVerseReference(word.reference);
                      if (parsed) {
                        router.push(`/surah/${parsed.surahNumber}?verse=${parsed.verseNumber}`);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      color: parseVerseReference(word.reference) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      textDecoration: parseVerseReference(word.reference) ? 'underline' : 'none',
                      cursor: parseVerseReference(word.reference) ? 'pointer' : 'default',
                      padding: '2px 4px',
                    }}
                  >
                    {word.reference}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search button */}
      <div style={{
        padding: 'var(--spacing-xs) var(--spacing-md)',
        borderTop: '1px solid var(--color-outline)',
        flexShrink: 0,
      }}>
        <button
          onClick={handleSearch}
          className="btn btn-outline"
          style={{
            width: '100%',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-xs)',
            fontSize: '14px',
          }}
        >
          <SearchIcon size={18} color="var(--color-primary)" />
          Ҷустуҷӯ дар Қуръон
        </button>
      </div>

      {/* Circular navigation buttons */}
      <div style={{
        padding: 'var(--spacing-sm)',
        borderTop: '1px solid var(--color-outline)',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}>
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1.5px solid var(--color-primary)',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.5 : 1,
              flexShrink: 0,
            }}
            title="Қаблӣ"
          >
            <ArrowBackIcon size={20} color="var(--color-primary)" />
          </button>

          {/* Play button (center, larger) */}
          <button
            onClick={handlePlayAudio}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Пахш кардан"
          >
            <PlayArrowIcon size={26} color="var(--color-on-primary)" />
          </button>

          {/* Next/Quiz button */}
          <button
            onClick={handleNext}
            disabled={!isLastWord && currentIndex >= totalWords - 1}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1.5px solid var(--color-primary)',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!isLastWord && currentIndex >= totalWords - 1) ? 'not-allowed' : 'pointer',
              opacity: (!isLastWord && currentIndex >= totalWords - 1) ? 0.5 : 1,
              flexShrink: 0,
            }}
            title={isLastWord ? 'Санҷиш' : 'Баъдӣ'}
          >
            {isLastWord ? (
              <QuizIcon size={20} color="var(--color-primary)" />
            ) : (
              <ArrowForwardIcon size={20} color="var(--color-primary)" />
            )}
          </button>
        </div>

        {/* Bookmark button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
        }}>
          <button
            onClick={handleToggleBookmark}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={isBookmarked ? 'Хатбаракро нест кардан' : 'Хатбарак кардан'}
          >
            <BookmarkIcon
              size={24}
              color={isBookmarked ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
              filled={isBookmarked}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getVocabularyLessonClient } from '@/lib/data/vocabulary-data-client';
import { VocabularyLesson, VocabularyWord } from '@/lib/types/vocabulary';
import { vocabularyProgressService } from '@/lib/services/vocabulary-progress-service';
import { vocabularyBookmarkService } from '@/lib/services/vocabulary-bookmark-service';
import { QuizIcon, PlayArrowIcon, PauseIcon, DeleteOutlineIcon, CheckCircleIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useTopBar } from '@/lib/contexts/TopBarContext';

export default function VocabularyLessonPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const params = useParams();
  const lessonId = parseInt(params.lessonId as string, 10);
  
  const [lesson, setLesson] = useState<VocabularyLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedStatus, setCompletedStatus] = useState<Map<string, boolean>>(new Map());
  const [bookmarkStatus, setBookmarkStatus] = useState<Map<string, boolean>>(new Map());
  const [refreshKey, setRefreshKey] = useState(0);
  const [playingWordIndex, setPlayingWordIndex] = useState<number | null>(null);
  const [audioElements, setAudioElements] = useState<Map<number, HTMLAudioElement>>(new Map());

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const lessonData = await getVocabularyLessonClient(lessonId);
        if (lessonData) {
          setLesson(lessonData);
          
          // Load completed and bookmark status
          const completed = new Map<string, boolean>();
          const bookmarks = new Map<string, boolean>();
          
          for (const word of lessonData.words) {
            const key = `${lessonData.lessonId}_${word.arabic}`;
            completed.set(key, vocabularyProgressService.isWordCompleted(lessonData.lessonId, word.arabic));
            bookmarks.set(key, vocabularyBookmarkService.isWordBookmarked(lessonData.lessonId, word.arabic));
          }
          
          setCompletedStatus(completed);
          setBookmarkStatus(bookmarks);
        } else {
          setError('Дарс ёфт нашуд');
        }
      } catch (err) {
        console.error('Error loading vocabulary lesson:', err);
        setError(err instanceof Error ? err.message : 'Дарс бор нашуд');
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, refreshKey]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/vocabulary');
    }
  };

  const handleWordClick = async (wordIndex: number) => {
    await router.push(`/vocabulary/lesson/${lessonId}/word/${wordIndex}`);
    // Refresh status when returning
    setTimeout(() => setRefreshKey(prev => prev + 1), 500);
  };

  const handlePlayWordAudio = async (wordIndex: number, audioPath: string) => {
    try {
      // If this word is already playing, pause it
      if (playingWordIndex === wordIndex) {
        const audio = audioElements.get(wordIndex);
        if (audio) {
          audio.pause();
          setPlayingWordIndex(null);
        }
        return;
      }

      // Stop any currently playing audio
      if (playingWordIndex !== null) {
        const currentAudio = audioElements.get(playingWordIndex);
        if (currentAudio) {
          currentAudio.pause();
        }
      }

      // Get or create audio element for this word
      let audio = audioElements.get(wordIndex);
      if (!audio) {
        audio = new Audio();
        audio.addEventListener('ended', () => {
          setPlayingWordIndex(null);
        });
        audio.addEventListener('error', () => {
          console.error('Error playing audio for word:', wordIndex);
          setPlayingWordIndex(null);
        });
        setAudioElements(prev => new Map(prev).set(wordIndex, audio!));
      }

      // Play the audio
      audio.src = audioPath;
      await audio.play();
      setPlayingWordIndex(wordIndex);
    } catch (error) {
      console.error('Failed to play word audio:', error);
      setPlayingWordIndex(null);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioElements.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [audioElements]);

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

  if (error || !lesson) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
          <div className="app-bar-content">
            <h1 className="app-bar-title">Дарси калимаҳо</h1>
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
          <ErrorDisplay
            message={error || 'Дарс бор нашуд'}
            onRetry={() => window.location.reload()}
          />
        </main>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* AppBar */}
      <div 
        className="app-bar"
        style={{
          top: isTopBarVisible ? '56px' : '0px',
        }}
      >
        <div className="app-bar-content">
          <h1 className="app-bar-title">{lesson.title}</h1>
        </div>
      </div>

      {/* Content */}
      <main style={{
        padding: 'var(--spacing-lg)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'auto',
      }}>
        {/* Start lesson button */}
        <button
          onClick={() => {
            if (lesson.words.length > 0) {
              router.push(`/vocabulary/lesson/${lessonId}/word/0`);
            }
          }}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-xs)',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <PlayArrowIcon size={20} color="var(--color-on-primary)" />
          Оғози дарс
        </button>

        {/* Progress section with clear icon */}
        {(() => {
          const lessonWords = lesson.words.map((w) => w.arabic);
          const completedCount = vocabularyProgressService.getLessonCompletedCountForWords(
            lesson.lessonId,
            lessonWords
          );
          const totalWords = lesson.words.length;
          const progress = totalWords > 0 ? completedCount / totalWords : 0.0;
          const percentage = Math.round(progress * 100);

          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 'var(--spacing-md)',
              gap: '8px',
            }}>
              {/* Progress bar */}
              <div style={{
                flex: 1,
                height: '8px',
                backgroundColor: 'var(--color-surface-variant)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${progress * 100}%`,
                  height: '100%',
                  backgroundColor: 'var(--color-primary)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              {/* Percentage text */}
              <span style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-primary)',
                minWidth: '40px',
              }}>
                {percentage}%
              </span>
              {/* Clear icon button */}
              <button
                onClick={async () => {
                  const confirmed = window.confirm('Оё шумо мутмаин ҳастед, ки мехоҳед пешрафти ин дарсро тоза кунед?');
                  if (confirmed) {
                    vocabularyProgressService.resetLessonProgress(lesson.lessonId);
                    setRefreshKey(prev => prev + 1);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-secondary)',
                }}
                title="Тоза кардани пешрафт"
              >
                <DeleteOutlineIcon size={20} color="var(--color-text-secondary)" />
              </button>
            </div>
          );
        })()}

        {/* Header */}
        <div style={{
          marginBottom: 'var(--spacing-md)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
          }}>
            Калимаҳо ({lesson.words.length})
          </h2>
        </div>

        {/* Words table */}
        <div style={{
          flex: 1,
          overflow: 'auto',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <colgroup>
              <col style={{ width: 'auto' }} />
              <col style={{ width: 'auto' }} />
            </colgroup>
            <tbody>
              {lesson.words.map((word, index) => {
                const key = `${lesson.lessonId}_${word.arabic}`;
                const isCompleted = completedStatus.get(key) || false;
                
                return (
                  <tr
                    key={index}
                    style={{
                      borderBottom: index < lesson.words.length - 1
                        ? '0.5px solid var(--color-outline)'
                        : 'none',
                    }}
                  >
                    {/* Tajik translation */}
                    <td style={{
                      padding: '12px 4px',
                      verticalAlign: 'middle',
                    }}>
                      <div
                        onClick={() => handleWordClick(index)}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '18px',
                          fontWeight: 'normal',
                        }}>
                          {word.tajik}
                        </div>
                      </div>
                    </td>
                    {/* Arabic word */}
                    <td style={{
                      padding: '12px 4px',
                      verticalAlign: 'middle',
                      textAlign: 'right',
                    }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '8px',
                        }}
                      >
                        <div
                          onClick={() => handleWordClick(index)}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            flex: 1,
                          }}
                        >
                          <div style={{
                            fontSize: '26px',
                            fontFamily: 'Noto_Naskh_Arabic, serif',
                            direction: 'rtl',
                            fontWeight: 'bold',
                            color: 'var(--color-primary)',
                            lineHeight: 1.5,
                            textAlign: 'right',
                          }}>
                            {word.arabic}
                          </div>
                        </div>
                        {/* Play button for words with audio */}
                        {word.audioPath && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayWordAudio(index, word.audioPath!);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: playingWordIndex === index ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            }}
                            title={playingWordIndex === index ? 'Ист кардан' : 'Пахш кардан'}
                          >
                            {playingWordIndex === index ? (
                              <PauseIcon size={18} color="var(--color-primary)" />
                            ) : (
                              <PlayArrowIcon size={18} color="var(--color-text-secondary)" />
                            )}
                          </button>
                        )}
                        {/* Tick icon on the right */}
                        {isCompleted && (
                          <>
                            <div style={{ width: '8px' }} />
                            <CheckCircleIcon size={20} color="#4CAF50" />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Quiz button */}
        <div style={{
          marginTop: 'var(--spacing-md)',
        }}>
          <button
            onClick={() => router.push(`/vocabulary/lesson/${lessonId}/quiz`)}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-xs)',
            }}
          >
            <QuizIcon size={20} color="var(--color-on-primary)" />
            Санҷиш
          </button>
        </div>
      </main>
    </div>
  );
}

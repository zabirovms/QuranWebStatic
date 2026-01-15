'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VocabularyData } from '@/lib/types/vocabulary';
import { vocabularyBookmarkService } from '@/lib/services/vocabulary-bookmark-service';
import { MenuBookIcon, BookmarkIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';

interface VocabularyQuizTabProps {
  vocabularyData: VocabularyData;
}

export default function VocabularyQuizTab({ vocabularyData }: VocabularyQuizTabProps) {
  const router = useRouter();
  const [quizMode, setQuizMode] = useState<'lessons' | 'bookmarks'>('lessons');
  const [selectedLessons, setSelectedLessons] = useState<Set<number>>(new Set());
  const [selectAllLessons, setSelectAllLessons] = useState(false);
  const [bookmarkedWordsCount, setBookmarkedWordsCount] = useState(0);

  useEffect(() => {
    setBookmarkedWordsCount(vocabularyBookmarkService.getBookmarkedWordsCount());
  }, [vocabularyData]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAllLessons(checked);
    if (checked) {
      setSelectedLessons(new Set(vocabularyData.lessons.map(l => l.lessonId)));
    } else {
      setSelectedLessons(new Set());
    }
  };

  const handleLessonToggle = (lessonId: number, checked: boolean) => {
    const newSelected = new Set(selectedLessons);
    if (checked) {
      newSelected.add(lessonId);
    } else {
      newSelected.delete(lessonId);
      setSelectAllLessons(false);
    }
    setSelectedLessons(newSelected);
  };

  const handleStartQuiz = () => {
    if (quizMode === 'lessons') {
      if (selectedLessons.size === 0 && !selectAllLessons) {
        return; // No lessons selected
      }
      
      // Collect all words from selected lessons
      const selectedLessonIds = selectAllLessons
        ? vocabularyData.lessons.map((l) => l.lessonId)
        : Array.from(selectedLessons);
      
      // Collect all words from selected lessons
      const allWords: typeof vocabularyData.lessons[0]['words'] = [];
      for (const lessonId of selectedLessonIds) {
        const lesson = vocabularyData.lessons.find((l) => l.lessonId === lessonId);
        if (lesson) {
          allWords.push(...lesson.words);
        }
      }
      
      if (allWords.length === 0) {
        alert('Ҳеҷ калимае барои санҷиш нест');
        return;
      }
      
      // Navigate to quiz with combined words
      // Use first lesson ID for routing, but quiz will use all words
      const firstLessonId = selectedLessonIds[0];
      const lessonsParam = selectedLessonIds.join(',');
      router.push(`/vocabulary/lesson/${firstLessonId}/quiz?lessons=${lessonsParam}`);
    } else {
      // Bookmarks quiz
      const bookmarkedWords = vocabularyBookmarkService.getAllBookmarkedWords(vocabularyData);
      
      if (bookmarkedWords.length === 0) {
        alert('Ҳеҷ калимаи захирашуда нест');
        return;
      }
      
      // Extract words and create a map from word key to lessonId
      const words = bookmarkedWords.map((item) => item.word);
      const wordToLessonIdMap: Record<string, number> = {};
      for (const item of bookmarkedWords) {
        // Use "lessonId|arabic" as key (using | as separator to avoid conflicts with arabic text)
        const wordKey = `${item.lessonId}|${item.word.arabic}`;
        wordToLessonIdMap[wordKey] = item.lessonId;
      }
      
      // Use first lesson ID for routing, but quiz will use bookmarked words
      const firstLessonId = bookmarkedWords[0].lessonId;
      router.push(`/vocabulary/lesson/${firstLessonId}/quiz?bookmarks=true`);
    }
  };

  return (
    <div style={{
      margin: '0 auto',
      width: '100%',
    }}>
      <h2 style={{
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        Санҷиш
      </h2>

      {/* Quiz mode selection */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h3 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-md)',
        }}>
          Намуди санҷиш
        </h3>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
        }}>
          <button
            onClick={() => setQuizMode('lessons')}
            style={{
              flex: 1,
              padding: 'var(--spacing-md)',
              borderRadius: '12px',
              border: `2px solid ${quizMode === 'lessons' ? 'var(--color-primary)' : 'transparent'}`,
              backgroundColor: quizMode === 'lessons'
                ? 'var(--color-primary-container-low-opacity)'
                : 'var(--color-surface-variant)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <MenuBookIcon
              size={32}
              color={quizMode === 'lessons' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
            />
            <span style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: quizMode === 'lessons' ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
              color: quizMode === 'lessons' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}>
              Дарсҳо
            </span>
          </button>
          <button
            onClick={() => setQuizMode('bookmarks')}
            style={{
              flex: 1,
              padding: 'var(--spacing-md)',
              borderRadius: '12px',
              border: `2px solid ${quizMode === 'bookmarks' ? 'var(--color-primary)' : 'transparent'}`,
              backgroundColor: quizMode === 'bookmarks'
                ? 'var(--color-primary-container-low-opacity)'
                : 'var(--color-surface-variant)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <BookmarkIcon
              size={32}
              color={quizMode === 'bookmarks' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
            />
            <span style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: quizMode === 'bookmarks' ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
              color: quizMode === 'bookmarks' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}>
              Хатбаракҳо
            </span>
          </button>
        </div>
      </div>

      {/* Content based on mode */}
      {quizMode === 'lessons' ? (
        <div>
          <h3 style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}>
            Дарсҳоро интихоб кунед
          </h3>
          {/* Select All checkbox */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--spacing-sm)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={selectAllLessons}
              onChange={(e) => handleSelectAll(e.target.checked)}
              style={{
                marginRight: 'var(--spacing-sm)',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
              }}
            />
            <span style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-primary)',
            }}>
              Ҳамаи дарсҳо
            </span>
          </label>
          <div style={{
            height: '1px',
            backgroundColor: 'var(--color-outline)',
            margin: 'var(--spacing-sm) 0',
          }} />
          {/* Individual lesson checkboxes */}
          {vocabularyData.lessons.map((lesson) => (
            <label
              key={lesson.lessonId}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--spacing-sm)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={selectedLessons.has(lesson.lessonId)}
                onChange={(e) => handleLessonToggle(lesson.lessonId, e.target.checked)}
                style={{
                  marginRight: 'var(--spacing-sm)',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)',
                }}>
                  {lesson.title}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {lesson.words.length} калима
                </div>
              </div>
            </label>
          ))}
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <button
              onClick={handleStartQuiz}
              disabled={selectedLessons.size === 0 && !selectAllLessons}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: 'var(--spacing-md)',
                opacity: (selectedLessons.size === 0 && !selectAllLessons) ? 0.5 : 1,
                cursor: (selectedLessons.size === 0 && !selectAllLessons) ? 'not-allowed' : 'pointer',
              }}
            >
              <span style={{ marginRight: 'var(--spacing-xs)' }}>▶</span>
              Санҷишро оғоз кунед
            </button>
          </div>
        </div>
      ) : (
        <div>
          {bookmarkedWordsCount === 0 ? (
            <div className="card" style={{
              padding: 'var(--spacing-xl)',
              textAlign: 'center',
            }}>
              <div style={{ opacity: 0.4 }}>
                <BookmarkIcon size={48} color="var(--color-text-secondary)" />
              </div>
              <h3 style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-sm)',
              }}>
                Хатбаракҳо нестанд
              </h3>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                Барои санҷиш кардани калимаҳои хатбаракшуда, аввал калимаҳоро хатбарак кунед
              </p>
            </div>
          ) : (
            <div>
              <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-md)',
                }}>
                  <BookmarkIcon size={24} color="var(--color-primary)" />
                  <div style={{ marginLeft: 'var(--spacing-md)', flex: 1 }}>
                    <div style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--color-text-primary)',
                    }}>
                      {bookmarkedWordsCount} калима хатбаракшуда
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                    }}>
                      Санҷиш аз ин калимаҳо иҷро мешавад
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleStartQuiz}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                }}
              >
                <span style={{ marginRight: 'var(--spacing-xs)' }}>▶</span>
                Санҷишро оғоз кунед
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


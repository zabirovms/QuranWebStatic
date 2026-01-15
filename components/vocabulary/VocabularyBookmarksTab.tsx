'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VocabularyData, VocabularyWord } from '@/lib/types/vocabulary';
import { vocabularyBookmarkService } from '@/lib/services/vocabulary-bookmark-service';
import { BookmarkIcon, MenuBookIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';

interface VocabularyBookmarksTabProps {
  vocabularyData: VocabularyData;
}

export default function VocabularyBookmarksTab({ vocabularyData }: VocabularyBookmarksTabProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [bookmarkedWords, setBookmarkedWords] = useState<Array<{
    lessonId: number;
    lessonTitle: string;
    word: VocabularyWord;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = () => {
      setIsLoading(true);
      try {
        const bookmarks = vocabularyBookmarkService.getAllBookmarkedWords(vocabularyData);
        setBookmarkedWords(bookmarks);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarks();
  }, [vocabularyData, refreshKey]);

  const handleUnbookmark = (lessonId: number, arabicWord: string) => {
    vocabularyBookmarkService.unbookmarkWord(lessonId, arabicWord);
    setRefreshKey(prev => prev + 1);
  };

  const handleWordClick = (lessonId: number, word: VocabularyWord) => {
    const lesson = vocabularyData.lessons.find(l => l.lessonId === lessonId);
    if (lesson) {
      const wordIndex = lesson.words.findIndex(w => w.arabic === word.arabic);
      if (wordIndex >= 0) {
        router.push(`/vocabulary/lesson/${lessonId}/word/${wordIndex}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (bookmarkedWords.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: 'var(--spacing-xl)',
      }}>
        <div style={{ opacity: 0.4 }}>
          <BookmarkIcon size={64} color="var(--color-text-secondary)" />
        </div>
        <h3 style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-secondary)',
          marginTop: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-sm)',
        }}>
          Хатбаракҳо нестанд
        </h3>
        <p style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
        }}>
          Барои хатбарак кардани калимаҳо, лутфан дар дарсҳо калимаҳоро интихоб кунед
        </p>
      </div>
    );
  }

  // Group bookmarks by lesson
  const groupedByLesson = new Map<number, typeof bookmarkedWords>();
  for (const item of bookmarkedWords) {
    if (!groupedByLesson.has(item.lessonId)) {
      groupedByLesson.set(item.lessonId, []);
    }
    groupedByLesson.get(item.lessonId)!.push(item);
  }

  return (
    <div style={{
      margin: '0 auto',
      width: '100%',
    }}>
      <h2 style={{
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-sm)',
      }}>
        Калимаҳои захирашуда
      </h2>
      <p style={{
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--spacing-md)',
      }}>
        {bookmarkedWords.length} калима
      </p>
      {/* Display grouped by lesson */}
      {Array.from(groupedByLesson.entries()).map(([lessonId, words]) => {
        const lessonTitle = words[0].lessonTitle;
        return (
          <div key={lessonId}>
            {/* Lesson header */}
            <div style={{
              padding: '8px 0',
              display: 'flex',
              alignItems: 'center',
            }}>
              <MenuBookIcon size={18} color="var(--color-primary)" />
              <span style={{
                marginLeft: '8px',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-primary)',
              }}>
                {lessonTitle}
              </span>
              <span style={{
                marginLeft: '8px',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                ({words.length})
              </span>
            </div>
            {/* Words in this lesson */}
            {words.map((item, index) => (
              <div
                key={`${item.lessonId}_${item.word.arabic}_${index}`}
                className="card"
                onClick={() => handleWordClick(item.lessonId, item.word)}
                style={{
                  marginBottom: '12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}>
                  {/* Tajik translation (left side) */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}>
                      {item.word.tajik}
                    </div>
                  </div>
                  <div style={{ width: '12px' }} />
                  {/* Arabic word (right side) */}
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{
                      fontSize: '24px',
                      fontFamily: 'Noto_Naskh_Arabic, serif',
                      direction: 'rtl',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.5,
                    }}>
                      <span lang="ar">{item.word.arabic}</span>
                    </div>
                  </div>
                  {/* Unbookmark button */}
                  <div style={{ width: '8px' }} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnbookmark(item.lessonId, item.word.arabic);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BookmarkIcon size={20} color="var(--color-primary)" filled />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


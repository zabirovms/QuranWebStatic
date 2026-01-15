'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VocabularyData, VocabularyLesson } from '@/lib/types/vocabulary';
import { vocabularyProgressService } from '@/lib/services/vocabulary-progress-service';
import { SchoolIcon, MenuBookIcon, TextFieldsIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';

interface VocabularyHomeTabProps {
  vocabularyData: VocabularyData;
}

export default function VocabularyHomeTab({ vocabularyData }: VocabularyHomeTabProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<VocabularyLesson | null>(null);
  const [lessonProgress, setLessonProgress] = useState<{
    completed: number;
    total: number;
    isCompleted: boolean;
  } | null>(null);
  const [stats, setStats] = useState<{
    totalLessons: number;
    completedLessons: number;
    totalWords: number;
    completedWords: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Find current learning lesson (matching Flutter logic)
        let currentLesson: VocabularyLesson | null = null;
        let firstIncompleteLesson: VocabularyLesson | null = null;
        
        // First pass: Find the lesson with progress (started but not completed)
        for (const lesson of vocabularyData.lessons) {
          const isCompleted = vocabularyProgressService.isLessonCompleted(lesson.lessonId);
          if (!isCompleted) {
            // Track the first incomplete lesson we find
            if (firstIncompleteLesson === null) {
              firstIncompleteLesson = lesson;
            }
            
            // Check if it has any progress (words learned)
            const lessonWords = lesson.words.map((w) => w.arabic);
            const completedCount = vocabularyProgressService.getLessonCompletedCountForWords(
              lesson.lessonId,
              lessonWords
            );
            
            // If it has progress, this is the current learning lesson
            if (completedCount > 0) {
              currentLesson = lesson;
              const progress = {
                completed: completedCount,
                total: lesson.words.length,
                isCompleted: false,
              };
              setLessonProgress(progress);
              break; // Found the actual current lesson, stop searching
            }
          }
        }
        
        // If we found a lesson with progress, use it
        if (currentLesson !== null) {
          setCurrentLesson(currentLesson);
        }
        // If no lesson with progress, use the first incomplete lesson (next to start)
        else if (firstIncompleteLesson !== null) {
          currentLesson = firstIncompleteLesson;
          const lessonWords = firstIncompleteLesson.words.map((w) => w.arabic);
          const completedCount = vocabularyProgressService.getLessonCompletedCountForWords(
            firstIncompleteLesson.lessonId,
            lessonWords
          );
          setLessonProgress({
            completed: completedCount,
            total: firstIncompleteLesson.words.length,
            isCompleted: false,
          });
          setCurrentLesson(firstIncompleteLesson);
        }
        // All lessons are completed, return the last lesson
        else if (vocabularyData.lessons.length > 0) {
          currentLesson = vocabularyData.lessons[vocabularyData.lessons.length - 1];
          const lessonWords = currentLesson.words.map((w) => w.arabic);
          const completedCount = vocabularyProgressService.getLessonCompletedCountForWords(
            currentLesson.lessonId,
            lessonWords
          );
          setLessonProgress({
            completed: completedCount,
            total: currentLesson.words.length,
            isCompleted: true,
          });
          setCurrentLesson(currentLesson);
        } else {
          setCurrentLesson(null);
        }

        // Calculate stats
        let totalLessons = vocabularyData.lessons.length;
        let completedLessons = 0;
        let totalWords = 0;
        let completedWords = 0;

        for (const lesson of vocabularyData.lessons) {
          totalWords += lesson.words.length;
          const isCompleted = vocabularyProgressService.isLessonCompleted(lesson.lessonId);
          if (isCompleted) {
            completedLessons++;
          }
          const lessonWords = lesson.words.map((w) => w.arabic);
          const completedCount = vocabularyProgressService.getLessonCompletedCountForWords(
            lesson.lessonId,
            lessonWords
          );
          completedWords += completedCount;
        }

        setStats({
          totalLessons,
          completedLessons,
          totalWords,
          completedWords,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [vocabularyData, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  return (
    <div
      style={{
        width: '100%',
      }}
      onScroll={(e) => {
        // Refresh on pull down (simple implementation)
        if (e.currentTarget.scrollTop === 0) {
          handleRefresh();
        }
      }}
    >
      {/* Current Learning Lesson */}
      {currentLesson && lessonProgress ? (
        <div
          className="card"
          onClick={() => {
            router.push(`/vocabulary/lesson/${currentLesson.lessonId}`);
            setTimeout(() => handleRefresh(), 500);
          }}
          style={{
            cursor: 'pointer',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)',
          }}>
            <MenuBookIcon size={24} color="var(--color-primary)" />
            <span style={{
              marginLeft: 'var(--spacing-sm)',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
            }}>
              Дарси ҷорӣ
            </span>
          </div>
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}>
            {currentLesson.title}
          </h2>
          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'var(--color-surface-variant)',
            borderRadius: '2px',
            marginBottom: 'var(--spacing-sm)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${Math.min(100, (lessonProgress.completed / lessonProgress.total) * 100)}%`,
              height: '100%',
              backgroundColor: lessonProgress.isCompleted
                ? 'var(--color-success)'
                : 'var(--color-primary)',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            <span>{lessonProgress.completed} аз {lessonProgress.total} калима омӯхта шуд</span>
            <span style={{
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
            }}>
              {Math.round((lessonProgress.completed / lessonProgress.total) * 100)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
          }}>
            <div style={{ opacity: 0.7 }}>
              <SchoolIcon size={48} color="var(--color-primary)" />
            </div>
            <h3 style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginTop: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-sm)',
            }}>
              Омӯзишро оғоз кунед
            </h3>
            <p style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-md)',
            }}>
              Барои оғози омӯзиш, лутфан дарси аввалро интихоб кунед
            </p>
            <button
              onClick={() => router.push('/vocabulary/lesson/1')}
              className="btn btn-primary"
            >
              <span style={{ marginRight: 'var(--spacing-xs)' }}>▶</span>
              Оғоз кардан
            </button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      {stats && (
        <div>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-md)',
          }}>
            Омори умумӣ
          </h3>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
          }}>
            <div className="card" style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 'var(--spacing-md)',
              }}>
                <MenuBookIcon size={32} color="var(--color-primary)" />
                <div style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                  marginTop: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  {stats.completedLessons}/{stats.totalLessons}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                }}>
                  Дарсҳо
                </div>
              </div>
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: 'var(--spacing-md)',
              }}>
                <TextFieldsIcon size={32} color="var(--color-primary)" />
                <div style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                  marginTop: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  {stats.completedWords}/{stats.totalWords}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center',
                }}>
                  Калимаҳо
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


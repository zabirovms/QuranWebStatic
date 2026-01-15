'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VocabularyData, VocabularyLesson } from '@/lib/types/vocabulary';
import { vocabularyProgressService } from '@/lib/services/vocabulary-progress-service';
import { LockIcon } from '@/components/Icons';

interface VocabularyLearnTabProps {
  vocabularyData: VocabularyData;
}

export default function VocabularyLearnTab({ vocabularyData }: VocabularyLearnTabProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lessonsProgress, setLessonsProgress] = useState<Map<number, {
    completed: number;
    total: number;
    isCompleted: boolean;
  }>>(new Map());

  // Get all lessons (only real lessons, no placeholders)
  const getAllLessons = (): VocabularyLesson[] => {
    return vocabularyData.lessons;
  };

  useEffect(() => {
    const loadProgress = async () => {
      const allLessons = getAllLessons();
      const progressMap = new Map<number, {
        completed: number;
        total: number;
        isCompleted: boolean;
      }>();

      for (const lesson of allLessons) {
        // Get list of Arabic words from the lesson
        const lessonWords = lesson.words.map((w) => w.arabic);
        
        // Use the accurate method that checks each word individually
        const completedCount = vocabularyProgressService.getLessonCompletedCountForWords(
          lesson.lessonId,
          lessonWords
        );
        const totalWords = lesson.words.length;
        // Only mark as completed if ALL words are learned (completed == total)
        const isCompleted = completedCount === totalWords && totalWords > 0;
        
        progressMap.set(lesson.lessonId, {
          completed: completedCount,
          total: totalWords,
          isCompleted,
        });
      }

      setLessonsProgress(progressMap);
    };

    loadProgress();
  }, [vocabularyData, refreshKey]);

  const handleLessonClick = (lesson: VocabularyLesson) => {
    if (lesson.words.length > 0) {
      router.push(`/vocabulary/lesson/${lesson.lessonId}`);
      setTimeout(() => setRefreshKey(prev => prev + 1), 500);
    }
  };

  const allLessons = getAllLessons();

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
        Дарсҳо
      </h2>
      {allLessons.map((lesson) => {
        const progress = lessonsProgress.get(lesson.lessonId) || {
          completed: 0,
          total: lesson.words.length,
          isCompleted: false,
        };
        const safeCompleted = progress.completed > progress.total ? progress.total : progress.completed;
        const progressValue = progress.total > 0 ? Math.min(1, safeCompleted / progress.total) : 0;
        const progressColor = progress.isCompleted
          ? 'rgba(76, 175, 80, 0.15)'
          : 'rgba(33, 150, 243, 0.15)';

        return (
          <div
            key={lesson.lessonId}
            className="card"
            onClick={() => handleLessonClick(lesson)}
            style={{
              marginTop: '10px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Progress background fill */}
            {progressValue > 0 && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progressValue * 100}%`,
                backgroundColor: progressColor,
                pointerEvents: 'none',
              }} />
            )}
            {/* Content */}
            <div style={{
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}>
              {/* Lesson number circle */}
              <div style={{
                position: 'relative',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(33, 150, 243, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
              }}>
                <span style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                }}>
                  {lesson.lessonId}
                </span>
                {progress.isCompleted && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
                  </div>
                )}
              </div>
              {/* Lesson title */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}>
                  {lesson.title}
                </h3>
              </div>
              {/* Progress badge */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(33, 150, 243, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                }}>
                  {progress.completed}/{progress.total}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


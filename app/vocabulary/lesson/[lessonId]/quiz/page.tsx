'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getVocabularyLessonClient } from '@/lib/data/vocabulary-data-client';
import { VocabularyLesson, VocabularyWord } from '@/lib/types/vocabulary';
import { vocabularyProgressService } from '@/lib/services/vocabulary-progress-service';
import { CheckCircleIcon, CancelIcon, ArrowBackIcon, ArrowForwardIcon, ReplayIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useTopBar } from '@/lib/contexts/TopBarContext';

export default function VocabularyQuizPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const params = useParams();
  const lessonId = parseInt(params.lessonId as string, 10);
  
  const [lesson, setLesson] = useState<VocabularyLesson | null>(null);
  const [quizWords, setQuizWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, number>>(new Map());
  const [answers, setAnswers] = useState<Map<number, boolean>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [options, setOptions] = useState<Map<number, string[]>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const lessonData = await getVocabularyLessonClient(lessonId);
        if (lessonData) {
          setLesson(lessonData);
          initializeQuiz(lessonData.words);
        } else {
          setError('Дарс ёфт нашуд');
        }
      } catch (err) {
        console.error('Error loading vocabulary lesson:', err);
        setError(err instanceof Error ? err.message : 'Хатогӣ');
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  const initializeQuiz = (words: VocabularyWord[]) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setQuizWords(shuffled);
    setCurrentIndex(0);
    setSelectedAnswers(new Map());
    setAnswers(new Map());
    setShowResults(false);

    // Generate options for each word
    const newOptions = new Map<number, string[]>();
    shuffled.forEach((word, index) => {
      newOptions.set(index, generateOptions(word, words));
    });
    setOptions(newOptions);
  };

  const generateOptions = (currentWord: VocabularyWord, allWords: VocabularyWord[]): string[] => {
    // Use only Tajik translation (no note)
    const correctAnswer = currentWord.tajik;
    
    // Generate other options (without notes)
    const otherOptions: string[] = [];
    const usedTajik = new Set<string>([currentWord.tajik]);
    
    for (const word of allWords) {
      if (word.tajik !== currentWord.tajik && !usedTajik.has(word.tajik)) {
        usedTajik.add(word.tajik);
        otherOptions.push(word.tajik);
      }
    }
    
    // Shuffle and take 3
    const shuffled = otherOptions.sort(() => Math.random() - 0.5);
    const options = [correctAnswer, ...shuffled.slice(0, 3)];
    return options.sort(() => Math.random() - 0.5);
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (answers.has(currentIndex)) return;

    const selectedAnswer = options.get(currentIndex)?.[optionIndex];
    const currentWord = quizWords[currentIndex];
    // Use only Tajik translation (no note)
    const correctAnswer = currentWord.tajik;
    const isCorrect = selectedAnswer === correctAnswer;

    setSelectedAnswers(prev => new Map(prev).set(currentIndex, optionIndex));
    setAnswers(prev => new Map(prev).set(currentIndex, isCorrect));

    if (isCorrect) {
      vocabularyProgressService.markWordCompleted(lessonId, currentWord.arabic);
      
      // Auto-advance after delay
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        if (currentIndex < quizWords.length - 1) {
          handleNext();
        } else {
          handleFinish();
        }
      }, 1200);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    const score = Array.from(answers.values()).filter(Boolean).length;
    const total = quizWords.length;
    await vocabularyProgressService.saveQuizScore(lessonId, score, total);

    // Mark lesson as completed if score is high enough
    if (score >= Math.round(total * 0.8)) {
      vocabularyProgressService.markLessonCompleted(lessonId);
    }

    setShowResults(true);
  };

  const handleRestart = () => {
    if (lesson) {
      initializeQuiz(lesson.words);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/vocabulary/lesson/${lessonId}`);
    }
  };

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

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
            <button
              onClick={handleBack}
              className="btn btn-icon"
              style={{ marginRight: 'var(--spacing-sm)' }}
              title="Баргаштан"
            >
              <span style={{ fontSize: '24px', color: 'var(--color-primary)' }}>←</span>
            </button>
            <h1 className="app-bar-title">Санҷиш</h1>
          </div>
        </div>
        <ErrorDisplay
          message={error || 'Хатогӣ'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (showResults) {
    const score = Array.from(answers.values()).filter(Boolean).length;
    const total = quizWords.length;
    const percentage = total > 0 ? (score / total) * 100 : 0;

    let resultColor: string;
    let resultEmoji: string;
    let resultMessage: string;

    if (percentage >= 80) {
      resultColor = 'var(--color-success)';
      resultEmoji = '🎉';
      resultMessage = 'Офарин! Пешравиҳо муборак!';
    } else if (percentage >= 60) {
      resultColor = 'var(--color-primary)';
      resultEmoji = '👍';
      resultMessage = 'Бад не. Кӯшиш мекунем аз ин беҳтар шавад!';
    } else {
      resultColor = 'var(--color-error)';
      resultEmoji = '💪';
      resultMessage = 'Ноумед намешавем! Боз дубора кӯшиш мекунем!';
    }

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
            <h1 className="app-bar-title">Санҷиш</h1>
          </div>
        </div>
        <div style={{
          padding: 'var(--spacing-lg)',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <div className="card" style={{
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '72px', marginBottom: 'var(--spacing-md)' }}>
              {resultEmoji}
            </div>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-lg)',
            }}>
              Натиҷаҳои санҷиш
            </h2>
            {/* Circular progress indicator */}
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto var(--spacing-lg)',
              position: 'relative',
            }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="var(--color-surface-variant)"
                  strokeWidth="12"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={resultColor}
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: resultColor,
              }}>
                {score}/{total}
              </div>
            </div>
            <div style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: resultColor,
              marginBottom: 'var(--spacing-md)',
            }}>
              {percentage.toFixed(1)}%
            </div>
            <p style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-xl)',
            }}>
              {resultMessage}
            </p>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
            }}>
              <button
                onClick={handleRestart}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-xs)',
                }}
              >
                <ReplayIcon size={20} color="var(--color-primary)" />
                Аз нав такрор
              </button>
              <button
                onClick={() => router.push(`/vocabulary/lesson/${lessonId}`)}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-xs)',
                }}
              >
                <ArrowBackIcon size={20} color="var(--color-primary)" />
                Бозгашт ба дарс
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizWords.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div>Ҳеҷ калимае нест</div>
      </div>
    );
  }

  const currentWord = quizWords[currentIndex];
  const currentOptions = options.get(currentIndex) || [];
  const alreadyAnswered = answers.has(currentIndex);
  const selectedIndex = selectedAnswers.get(currentIndex);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* AppBar */}
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
          <h1 className="app-bar-title">Санҷиш</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: 'var(--spacing-lg)',
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Progress indicator */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <div style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-sm)',
          }}>
            Калима {currentIndex + 1} аз {quizWords.length}
          </div>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto',
            position: 'relative',
          }}>
            <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="30"
                cy="30"
                r="27"
                fill="none"
                stroke="transparent"
                strokeWidth="4"
              />
              <circle
                cx="30"
                cy="30"
                r="27"
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 27}`}
                strokeDashoffset={`${2 * Math.PI * 27 * (1 - (currentIndex + 1) / quizWords.length)}`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Arabic word card */}
        <div className="card" style={{
          padding: 'var(--spacing-xl)',
          marginBottom: 'var(--spacing-xl)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '48px',
            fontFamily: 'Noto_Naskh_Arabic, serif',
            direction: 'rtl',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
          }}>
            {currentWord.arabic}
          </div>
        </div>

        {/* Options */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          {currentOptions.map((option, index) => {
            // Compare with only Tajik translation (no note)
            const correctAnswer = currentWord.tajik;
            const isCorrect = option === correctAnswer;
            const isSelected = selectedIndex === index;

            let textColor: string | undefined;
            let trailingIcon: JSX.Element | null = null;

            if (alreadyAnswered) {
              if (isCorrect) {
                textColor = 'var(--color-success)';
                trailingIcon = <CheckCircleIcon size={24} color="var(--color-success)" />;
              } else if (isSelected) {
                textColor = 'var(--color-error)';
                trailingIcon = <CancelIcon size={24} color="var(--color-error)" />;
              } else {
                textColor = 'var(--color-text-secondary)';
              }
            }

            return (
              <button
                key={index}
                onClick={() => !alreadyAnswered && handleSelectAnswer(index)}
                disabled={alreadyAnswered}
                className="btn btn-outline"
                style={{
                  padding: 'var(--spacing-md) 20px',
                  minHeight: '56px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--spacing-sm)',
                  color: textColor || 'var(--color-text-primary)',
                  opacity: alreadyAnswered && !isCorrect && !isSelected ? 0.6 : 1,
                }}
              >
                <span style={{
                  flex: 1,
                  fontSize: 'var(--font-size-base)',
                  textAlign: 'center',
                  maxLines: 3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {option}
                </span>
                {trailingIcon}
              </button>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn btn-outline"
            style={{
              flex: 1,
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-xs)',
              opacity: currentIndex === 0 ? 0.5 : 1,
            }}
          >
            <ArrowBackIcon size={20} color="var(--color-primary)" />
            Қаблӣ
          </button>
          <button
            onClick={answers.size === quizWords.length ? handleFinish : (alreadyAnswered ? handleNext : undefined)}
            disabled={answers.size !== quizWords.length && (!alreadyAnswered || currentIndex === quizWords.length - 1)}
            className="btn btn-outline"
            style={{
              flex: 1,
              padding: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-xs)',
              opacity: (answers.size !== quizWords.length && (!alreadyAnswered || currentIndex === quizWords.length - 1)) ? 0.5 : 1,
            }}
          >
            {answers.size === quizWords.length ? 'Натиҷа' : 'Баъдӣ'}
            <ArrowForwardIcon size={20} color="var(--color-primary)" />
          </button>
        </div>
      </div>
    </div>
  );
}

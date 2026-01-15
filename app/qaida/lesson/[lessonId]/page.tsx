'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQaidaModuleClient } from '@/lib/data/qaida-data-client';
import { QaidaModule, QaidaLesson, QaidaContentBlock, QaidaLetter, QaidaVowel, QaidaSyllableExample } from '@/lib/types/qaida';
import { ArrowBackIcon, SkipNextIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useTopBar } from '@/lib/contexts/TopBarContext';

type QuestionType = 'letterToSound' | 'soundToLetter' | 'identifyForm';

interface QaidaQuestion {
  questionType: QuestionType;
  promptLetter?: QaidaLetter;
  promptSyllable?: QaidaSyllableExample;
  optionsLetters: QaidaLetter[];
  optionsExamples: QaidaSyllableExample[];
  optionsFormKeys: string[];
  correctIndex: number;
  correctFormType?: string;
}

export default function QaidaLessonPage({
  params,
}: {
  params: { lessonId: string };
}) {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const lessonId = parseInt(params.lessonId, 10);
  const [module, setModule] = useState<QaidaModule | null>(null);
  const [lesson, setLesson] = useState<QaidaLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questions, setQuestions] = useState<QaidaQuestion[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getQaidaModuleClient();
        setModule(data);
        const foundLesson = data.lessons.find((l) => l.id === lessonId) || data.lessons[0];
        setLesson(foundLesson);
      } catch (err) {
        console.error('Error loading Qaida lesson:', err);
        setError(err instanceof Error ? err.message : 'Дарс бор нашуд');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [lessonId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/qaida');
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
          <div className="app-bar-content">
            <h1 className="app-bar-title">Қоидаи Бағдодӣ</h1>
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

  if (error || !module || !lesson) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
          <div className="app-bar-content">
            <h1 className="app-bar-title">Қоидаи Бағдодӣ</h1>
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
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <main style={{
        padding: 'var(--spacing-lg) 4px',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {quizMode ? (
          <QuizBody
            questions={questions}
            currentIndex={currentIndex}
            correctAnswers={correctAnswers}
            showResults={showResults}
            selectedAnswers={selectedAnswers}
            quizAnswers={quizAnswers}
            lessonId={lessonId}
            onPrevious={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            onNext={() => {
              if (currentIndex === questions.length - 1) {
                setShowResults(true);
              } else {
                setCurrentIndex(currentIndex + 1);
              }
            }}
            onSelectAnswer={(index) => {
              if (!selectedAnswers.hasOwnProperty(currentIndex)) {
                const q = questions[currentIndex];
                const isCorrect = index === q.correctIndex;
                if (isCorrect) {
                  setCorrectAnswers(correctAnswers + 1);
                }
                setSelectedAnswers({ ...selectedAnswers, [currentIndex]: index });
                setQuizAnswers({ ...quizAnswers, [currentIndex]: isCorrect });
              }
            }}
            onExitQuiz={() => {
              setQuizMode(false);
              setCurrentIndex(0);
              setCorrectAnswers(0);
              setShowResults(false);
              setSelectedAnswers({});
              setQuizAnswers({});
            }}
          />
        ) : (
          <LessonBody
            lesson={lesson}
            onStartQuiz={(questions) => {
              setQuestions(questions);
              setQuizMode(true);
              setCurrentIndex(0);
              setCorrectAnswers(0);
              setShowResults(false);
              setSelectedAnswers({});
              setQuizAnswers({});
            }}
          />
        )}
      </main>
    </div>
  );
}

// Lesson Body Component
function LessonBody({
  lesson,
  onStartQuiz,
}: {
  lesson: QaidaLesson;
  onStartQuiz: (questions: QaidaQuestion[]) => void;
}) {
  const router = useRouter();

  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      {/* Header with Objectives */}
      {lesson.id < 5 && (
        <>
          <div className="card" style={{
            backgroundColor: 'var(--color-primary-container-low-opacity)',
            borderRadius: '16px',
            padding: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-lg)',
            boxShadow: 'none',
          }}>
            {(lesson.objectives && lesson.objectives.length > 0) && lesson.id < 5 && (
              <>
                <h3 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  margin: '0 0 var(--spacing-xs) 0',
                }}>
                  Ҳадафи дарс:
                </h3>
                <ul style={{
                  margin: '0',
                  paddingLeft: 'var(--spacing-lg)',
                  listStyle: 'disc',
                }}>
                  {lesson.objectives.map((objective, index) => (
                    <li key={index} style={{
                      fontSize: '13px',
                      lineHeight: '1.3',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--spacing-xs)',
                    }}>
                      {objective}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {lesson.id === 1 && (
              <>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <button
                    onClick={() => router.push('/qaida/lesson/1/letter/alif')}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <span style={{ marginRight: 'var(--spacing-xs)' }}>▶</span>
                    Оғози дарс
                  </button>
                </div>
              </>
            )}
            {lesson.id === 2 && (
              <>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <button
                    onClick={() => router.push('/qaida/lesson/2/letter/ا')}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <span style={{ marginRight: 'var(--spacing-xs)' }}>▶</span>
                    Оғози дарс
                  </button>
                </div>
              </>
            )}
            {lesson.id === 5 && (
              <>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <button
                    onClick={() => {
                      const lettersBlock = lesson.content.find(
                        (b) => b.subtype === 'letters_forms_chart'
                      );
                      const letters = lettersBlock?.letters || [];
                      if (letters.length > 0) {
                        router.push(`/qaida/lesson/5/letter/${letters[0].id}`);
                      }
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <span style={{ marginRight: 'var(--spacing-xs)' }}>▶</span>
                    Оғози дарс
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Content Blocks */}
      {lesson.content.map((block, index) => (
        <ContentBlockRenderer
          key={index}
          block={block}
          lesson={lesson}
          onStartQuiz={onStartQuiz}
        />
      ))}
    </div>
  );
}

// Content Block Renderer
function ContentBlockRenderer({
  block,
  lesson,
  onStartQuiz,
}: {
  block: QaidaContentBlock;
  lesson: QaidaLesson;
  onStartQuiz: (questions: QaidaQuestion[]) => void;
}) {
  switch (block.subtype) {
    case 'text':
      return <TextBlock textKey={block.textKey} />;
    case 'letters_chart':
      if (lesson.id === 1) {
        return <LettersChartLesson1 letters={block.letters || []} />;
      }
      return <LettersChart letters={block.letters || []} />;
    case 'letters_forms_chart':
      return <LettersFormsChart letters={block.letters || []} lessonId={lesson.id} />;
    case 'vowels_chart':
      return <VowelsChart vowels={block.vowels || []} lessonId={lesson.id} />;
    case 'syllables_examples':
      return <SyllablesExamples examples={block.examples || []} lessonId={lesson.id} />;
    case 'quiz':
      return <QuizButton lesson={lesson} config={block.config || {}} onStartQuiz={onStartQuiz} />;
    case 'audio':
      return null; // Audio blocks are skipped
    default:
      return null;
  }
}

// Text Block
function TextBlock({ textKey }: { textKey?: string }) {
  // Text blocks are intentionally hidden (as per Flutter implementation)
  return null;
}

// Letters Chart (for lessons other than 1)
function LettersChart({ letters }: { letters: QaidaLetter[] }) {
  const [screenWidth, setScreenWidth] = useState(800);
  
  useEffect(() => {
    // Set screen width after mount to prevent hydration mismatch
    setScreenWidth(typeof window !== 'undefined' ? window.innerWidth : 800);
    
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const itemWidth = (screenWidth - 16 * 2 - 8 * 4) / 5;

  return (
    <div style={{ marginTop: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
      <h4 style={{
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-sm)',
      }}>
        Ҳарфҳо:
      </h4>
      <div style={{
        direction: 'rtl',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)',
        justifyContent: 'flex-end',
      }}>
        {letters.map((letter) => (
          <div
            key={letter.id}
            style={{
              width: `${itemWidth}px`,
              padding: '10px 8px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface-variant)',
              border: '1px solid var(--color-outline)',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: '26px',
              fontFamily: 'Noto_Naskh_Arabic, serif',
              direction: 'rtl',
              marginBottom: '4px',
              color: 'var(--color-text-primary)',
            }}>
              {letter.letter}
            </div>
            {letter.name && (
              <div style={{
                fontSize: '11px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
              }}>
                {letter.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Letters Chart for Lesson 1 (clickable)
function LettersChartLesson1({ letters }: { letters: QaidaLetter[] }) {
  const router = useRouter();
  const [screenWidth, setScreenWidth] = useState(800);
  
  useEffect(() => {
    // Set screen width after mount to prevent hydration mismatch
    setScreenWidth(typeof window !== 'undefined' ? window.innerWidth : 800);
    
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const itemWidth = (screenWidth - 16 * 2 - 8 * 4) / 5;

  return (
    <div style={{ marginTop: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
      <h4 style={{
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-sm)',
      }}>
        Ҳарфҳо:
      </h4>
      <div style={{
        direction: 'rtl',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)',
        justifyContent: 'flex-end',
      }}>
        {letters.map((letter) => (
          <button
            key={letter.id}
            onClick={() => router.push(`/qaida/lesson/1/letter/${letter.id}`)}
            style={{
              width: `${itemWidth}px`,
              padding: '10px 8px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface-variant)',
              border: '1px solid var(--color-outline)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: '26px',
              fontFamily: 'Noto_Naskh_Arabic, serif',
              direction: 'rtl',
              color: 'var(--color-text-primary)',
            }}>
              {letter.letter}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Letters Forms Chart
function LettersFormsChart({ letters, lessonId }: { letters: QaidaLetter[]; lessonId: number }) {
  const router = useRouter();
  const isClickable = lessonId === 5;

  return (
    <div style={{ marginTop: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
      <h4 style={{
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-sm)',
      }}>
        Шакли ҳарфҳо дар калима:
      </h4>
      <div style={{
        direction: 'rtl',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--color-outline)',
      }}>
        {/* Header Row */}
        <div style={{
          display: 'flex',
          padding: '12px 16px',
          backgroundColor: 'var(--color-surface-variant)',
          borderBottom: '1px solid var(--color-outline)',
        }}>
          {['Ҳарф', 'Аввал', 'Байн', 'Охир'].map((header) => (
            <div key={header} style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
            }}>
              {header}
            </div>
          ))}
        </div>
        {/* Data Rows */}
        {letters.map((letter) => {
          const forms = letter.forms || {};
          const RowContent = (
            <div style={{
              display: 'flex',
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-outline)',
              backgroundColor: 'var(--color-surface)',
            }}>
              <div style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '28px',
                fontFamily: 'Noto_Naskh_Arabic, serif',
                direction: 'rtl',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
              }}>
                {letter.letter}
              </div>
              {['initial', 'medial', 'final'].map((formKey) => (
                <div key={formKey} style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: '24px',
                  fontFamily: 'Noto_Naskh_Arabic, serif',
                  direction: 'rtl',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                }}>
                  {forms[formKey] || ''}
                </div>
              ))}
            </div>
          );

          if (isClickable) {
            return (
              <button
                key={letter.id}
                onClick={() => router.push(`/qaida/lesson/5/letter/${letter.id}`)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {RowContent}
              </button>
            );
          }

          return <div key={letter.id}>{RowContent}</div>;
        })}
      </div>
    </div>
  );
}

// Vowels Chart
function VowelsChart({ vowels, lessonId }: { vowels: QaidaVowel[]; lessonId: number }) {
  const isTanween = lessonId === 4;
  const isShadda = lessonId === 6;
  const isSukun = lessonId === 7;
  const isMadd = lessonId === 8;

  const mapVowelNameKeyToTajik = (key?: string): string => {
    switch (key) {
      case 'qaida.vowel.fatha': return 'Фатҳа';
      case 'qaida.vowel.kasra': return 'Касра';
      case 'qaida.vowel.damma': return 'Замма';
      case 'qaida.vowel.sukoon': return 'Сукун';
      case 'qaida.vowel.tanwin_fatha': return 'Танвини фатҳа';
      case 'qaida.vowel.tanwin_kasra': return 'Танвини касра';
      case 'qaida.vowel.tanwin_damma': return 'Танвини замма';
      case 'qaida.vowel.shadda': return 'Шадда';
      case 'qaida.madd.alif': return 'Алиф';
      case 'qaida.madd.waw': return 'Вав';
      case 'qaida.madd.ya': return 'Йо';
      default: return '';
    }
  };

  const mapVowelNameKeyToPronunciation = (key?: string): string => {
    switch (key) {
      case 'qaida.vowel.fatha': return 'а';
      case 'qaida.vowel.kasra': return 'и';
      case 'qaida.vowel.damma': return 'у';
      case 'qaida.vowel.tanwin_fatha': return 'ан';
      case 'qaida.vowel.tanwin_kasra': return 'ин';
      case 'qaida.vowel.tanwin_damma': return 'ун';
      default: return '';
    }
  };

  return (
    <div style={{ marginTop: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
      {!isTanween && !isShadda && !isSukun && !isMadd && (
        <h4 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-sm)',
        }}>
          Ҳаракатҳо (садонокҳо):
        </h4>
      )}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 'var(--spacing-md)',
      }}>
        {(isTanween || isShadda || isSukun) && vowels.length === 1 ? (
          <div style={{
            padding: 'var(--spacing-lg)',
            borderRadius: '12px',
            backgroundColor: 'var(--color-surface-variant)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '32px',
              fontFamily: 'Noto_Naskh_Arabic, serif',
              direction: 'rtl',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--color-text-primary)',
            }}>
              {vowels[0].symbol}
            </div>
            <div style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
            }}>
              {mapVowelNameKeyToTajik(vowels[0].nameKey)}
            </div>
          </div>
        ) : (isTanween || isShadda || isSukun) ? (
          <div style={{
            display: 'flex',
            gap: '4px',
            width: '100%',
          }}>
            {vowels.map((v) => (
              <div key={v.id} style={{
                flex: 1,
                padding: 'var(--spacing-md)',
                borderRadius: '12px',
                backgroundColor: 'var(--color-surface-variant)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '24px',
                  fontFamily: 'Noto_Naskh_Arabic, serif',
                  direction: 'rtl',
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: '6px',
                  color: 'var(--color-text-primary)',
                }}>
                  {v.symbol}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: '2px',
                }}>
                  {mapVowelNameKeyToTajik(v.nameKey)}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {mapVowelNameKeyToPronunciation(v.nameKey)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          vowels.map((v) => (
            <div key={v.id} style={{
              padding: 'var(--spacing-lg)',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface-variant)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '32px',
                fontFamily: 'Noto_Naskh_Arabic, serif',
                direction: 'rtl',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--color-text-primary)',
              }}>
                {v.symbol}
              </div>
              <div style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}>
                {mapVowelNameKeyToTajik(v.nameKey)}
              </div>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                {mapVowelNameKeyToPronunciation(v.nameKey)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Syllables Examples
function SyllablesExamples({ examples, lessonId }: { examples: QaidaSyllableExample[]; lessonId: number }) {
  const router = useRouter();
  const [screenWidth, setScreenWidth] = useState(800);
  
  useEffect(() => {
    // Set screen width after mount to prevent hydration mismatch
    setScreenWidth(typeof window !== 'undefined' ? window.innerWidth : 800);
    
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const itemWidth = (screenWidth - 16 * 2 - 8 * 3) / 4;
  const isClickable = lessonId === 2 || lessonId === 3 || lessonId === 4 || lessonId === 6 || lessonId === 7 || lessonId === 8;

  return (
    <div style={{ marginTop: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
      {lessonId !== 5 && lessonId !== 6 && lessonId !== 7 && (
        <h4 style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-sm)',
        }}>
          Мисолҳо:
        </h4>
      )}
      {(lessonId === 3 || lessonId === 4 || lessonId === 6 || lessonId === 7 || lessonId === 8) && examples.length > 0 && (
        <>
          <button
            onClick={() => {
              const firstLetter = examples[0].letter;
              router.push(`/qaida/lesson/${lessonId}/letter/${firstLetter}`);
            }}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: 'var(--spacing-lg)' }}
          >
            <span style={{ marginRight: 'var(--spacing-xs)' }}>▶</span>
            Оғози дарс
          </button>
        </>
      )}
      <div style={{
        direction: 'rtl',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)',
        justifyContent: 'center',
      }}>
        {examples.map((e) => {
          const displayText = lessonId === 6
            ? (e.letter === 'لا' && e.vowel === 'ء')
              ? 'لاء'
              : `${e.letter}َ` + 'لَّ' + 'ا'
            : lessonId === 7
              ? (e.letter === 'لا' && e.vowel === 'ء')
                ? 'لاء'
                : `${e.letter}ِ` + 'نِّ' + 'يْ'
              : `${e.letter}${e.vowel}`;

          const CardContent = (
            <div style={{
              width: `${itemWidth}px`,
              padding: '12px 8px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-surface-variant)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '28px',
                fontFamily: 'Noto_Naskh_Arabic, serif',
                direction: 'rtl',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
              }}>
                {displayText}
              </div>
            </div>
          );

          if (isClickable) {
            return (
              <button
                key={e.id}
                onClick={() => router.push(`/qaida/lesson/${lessonId}/letter/${e.letter}`)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {CardContent}
              </button>
            );
          }

          return <div key={e.id}>{CardContent}</div>;
        })}
      </div>
    </div>
  );
}

// Quiz Button
function QuizButton({
  lesson,
  config,
  onStartQuiz,
}: {
  lesson: QaidaLesson;
  config: Record<string, any>;
  onStartQuiz: (questions: QaidaQuestion[]) => void;
}) {
  const startQuiz = () => {
    const mode = config.mode || '';
    const source = config.source || '';
    const itemsPerQuiz = config.itemsPerQuiz || 10;

    const questions: QaidaQuestion[] = [];

    if (mode === 'letter_to_sound' && source === 'letters_chart') {
      const lettersBlock = lesson.content.find(
        (b) => b.subtype === 'letters_chart'
      );
      const letters = lettersBlock?.letters || [];
      const shuffled = [...letters].sort(() => Math.random() - 0.5);
      const subset = shuffled.slice(0, itemsPerQuiz);

      for (const l of subset) {
        const optionsPool = [...letters].sort(() => Math.random() - 0.5);
        const options = [l];
        for (const other of optionsPool) {
          if (options.length >= 4) break;
          if (!options.find((o) => o.id === other.id)) {
            options.push(other);
          }
        }
        const optionsList = options.sort(() => Math.random() - 0.5);
        const correctIndex = optionsList.findIndex((o) => o.id === l.id);

        questions.push({
          questionType: 'letterToSound',
          promptLetter: l,
          optionsLetters: optionsList,
          optionsExamples: [],
          optionsFormKeys: [],
          correctIndex,
        });
      }
    } else if (mode === 'sound_to_letter' && source === 'syllables_examples') {
      const examplesBlock = lesson.content.find(
        (b) => b.subtype === 'syllables_examples'
      );
      const examples = examplesBlock?.examples || [];
      const shuffled = [...examples].sort(() => Math.random() - 0.5);
      const subset = shuffled.slice(0, itemsPerQuiz);

      for (const ex of subset) {
        const optionsPool = [...examples].sort(() => Math.random() - 0.5);
        const options = [ex];
        for (const other of optionsPool) {
          if (options.length >= 4) break;
          if (!options.find((o) => o.id === other.id)) {
            options.push(other);
          }
        }
        const optionsList = options.sort(() => Math.random() - 0.5);
        const correctIndex = optionsList.findIndex((o) => o.id === ex.id);

        questions.push({
          questionType: 'soundToLetter',
          promptSyllable: ex,
          optionsLetters: [],
          optionsExamples: optionsList,
          optionsFormKeys: [],
          correctIndex,
        });
      }
    } else if (mode === 'identify_form' && source === 'letters_forms_chart') {
      const formsBlock = lesson.content.find(
        (b) => b.subtype === 'letters_forms_chart'
      );
      const letters = formsBlock?.letters || [];
      const shuffled = [...letters].sort(() => Math.random() - 0.5);
      const subset = shuffled.slice(0, itemsPerQuiz);

      for (const l of subset) {
        const forms = l.forms || {};
        if (Object.keys(forms).length === 0) continue;

        const uniqueFormKeys: string[] = [];
        const seenValues = new Set<string>();
        for (const [key, value] of Object.entries(forms)) {
          if (!seenValues.has(value)) {
            seenValues.add(value);
            uniqueFormKeys.push(key);
          }
        }

        if (uniqueFormKeys.length < 2) continue;

        const correctFormType = uniqueFormKeys[Math.floor(Math.random() * uniqueFormKeys.length)];
        const options = [...uniqueFormKeys].sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(correctFormType);

        questions.push({
          questionType: 'identifyForm',
          promptLetter: l,
          optionsLetters: [],
          optionsExamples: [],
          optionsFormKeys: options,
          correctIndex,
          correctFormType,
        });
      }
    }

    if (questions.length > 0) {
      onStartQuiz(questions);
    }
  };

  return (
    <div style={{ marginTop: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
      <button
        onClick={startQuiz}
        className="btn btn-primary"
        style={{ width: '100%', padding: '12px' }}
      >
        <span style={{ marginRight: 'var(--spacing-xs)' }}>📝</span>
        Санҷиш
      </button>
    </div>
  );
}

// Quiz Body Component (simplified for now - will be expanded)
function QuizBody({
  questions,
  currentIndex,
  correctAnswers,
  showResults,
  selectedAnswers,
  quizAnswers,
  lessonId,
  onPrevious,
  onNext,
  onSelectAnswer,
  onExitQuiz,
}: {
  questions: QaidaQuestion[];
  currentIndex: number;
  correctAnswers: number;
  showResults: boolean;
  selectedAnswers: Record<number, number>;
  quizAnswers: Record<number, boolean>;
  lessonId: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelectAnswer: (index: number) => void;
  onExitQuiz: () => void;
}) {
  if (showResults) {
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    let message = '';
    if (percentage >= 80) {
      message = 'Офарин! Шумо хеле хуб қироат ва фаҳмидед.';
    } else if (percentage >= 60) {
      message = 'Натиҷа бад нест. Боз каме тамрин кунед.';
    } else {
      message = 'Ҳеҷ гап нест. Боз як бор дарс ва санҷишро такрор кунед.';
    }

    return (
      <div style={{
        width: '100%',
      }}>
        <h2 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          textAlign: 'center',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--color-text-primary)',
        }}>
          Натиҷаи санҷиш
        </h2>
        <div style={{
          fontSize: '48px',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-primary)',
          textAlign: 'center',
          marginBottom: 'var(--spacing-sm)',
        }}>
          {percentage}%
        </div>
        <div style={{
          fontSize: 'var(--font-size-lg)',
          textAlign: 'center',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--color-text-primary)',
        }}>
          Ҷавобҳои дуруст: {correctAnswers} аз {questions.length}
        </div>
        <div style={{
          fontSize: 'var(--font-size-base)',
          textAlign: 'center',
          marginBottom: 'var(--spacing-xl)',
          color: 'var(--color-text-primary)',
        }}>
          {message}
        </div>
        <button
          onClick={onExitQuiz}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          Бозгашт ба дарс
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];
  const selectedForQuestion = selectedAnswers[currentIndex];

  return (
    <div style={{
      width: '100%',
    }}>
      <div style={{
        fontSize: 'var(--font-size-base)',
        marginBottom: 'var(--spacing-lg)',
        color: 'var(--color-text-primary)',
      }}>
        Саволи {currentIndex + 1} аз {questions.length}
      </div>
      <div style={{
        height: '4px',
        backgroundColor: 'var(--color-outline)',
        borderRadius: '2px',
        marginBottom: 'var(--spacing-xl)',
      }}>
        <div style={{
          height: '100%',
          width: `${((currentIndex + 1) / questions.length) * 100}%`,
          backgroundColor: 'var(--color-primary)',
          borderRadius: '2px',
        }} />
      </div>
      <QuizPrompt question={q} lessonId={lessonId} />
      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <QuizOptions
          question={q}
          selectedIndex={selectedForQuestion}
          lessonId={lessonId}
          onSelect={onSelectAnswer}
        />
      </div>
      <div style={{
        marginTop: 'auto',
        paddingTop: 'var(--spacing-xl)',
        display: 'flex',
        gap: 'var(--spacing-md)',
      }}>
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
          style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-xs)',
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          <ArrowBackIcon size={20} color="var(--color-text-primary)" />
          Қаблӣ
        </button>
        <button
          onClick={onNext}
          className="btn btn-primary"
          style={{ 
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-xs)',
          }}
        >
          {currentIndex === questions.length - 1 ? 'Натиҷа' : 'Баъдӣ'}
          {currentIndex !== questions.length - 1 && (
            <SkipNextIcon size={20} color="var(--color-on-primary)" />
          )}
        </button>
      </div>
      <button
        onClick={onExitQuiz}
        className="btn btn-secondary"
        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
      >
        Қатъ кардан
      </button>
    </div>
  );
}

// Quiz Prompt
function QuizPrompt({ question, lessonId }: { question: QaidaQuestion; lessonId: number }) {
  switch (question.questionType) {
    case 'letterToSound':
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--color-text-primary)',
          }}>
            Ин кадом ҳарф аст?
          </div>
          <div className="card" style={{
            padding: '24px',
            boxShadow: 'var(--elevation-4)',
          }}>
            <div style={{
              fontSize: '40px',
              fontFamily: 'Noto_Naskh_Arabic, serif',
              direction: 'rtl',
              textAlign: 'center',
              color: 'var(--color-text-primary)',
            }}>
              {question.promptLetter?.letter}
            </div>
          </div>
        </div>
      );
    case 'soundToLetter':
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--color-text-primary)',
          }}>
            Ҷавоби дурустро интихоб кунед.
          </div>
          <div className="card" style={{
            padding: '16px',
            boxShadow: 'var(--elevation-4)',
          }}>
            <div style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              textAlign: 'center',
              color: 'var(--color-text-primary)',
            }}>
              {question.promptSyllable?.syllable}
            </div>
          </div>
        </div>
      );
    case 'identifyForm':
      const mapFormKeyToTajik = (key: string): string => {
        switch (key) {
          case 'isolated': return 'танҳо';
          case 'initial': return 'аввали калима';
          case 'medial': return 'байни калима';
          case 'final': return 'охири калима';
          default: return key;
        }
      };
      const formLabel = question.correctFormType ? mapFormKeyToTajik(question.correctFormType) : '';
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--color-text-primary)',
          }}>
            Кадомаш дар {formLabel} меояд?
          </div>
          <div style={{
            fontSize: '36px',
            fontFamily: 'Noto_Naskh_Arabic, serif',
            direction: 'rtl',
            textAlign: 'center',
            color: 'var(--color-text-primary)',
          }}>
            {question.promptLetter?.letter}
          </div>
        </div>
      );
  }
}

// Quiz Options
function QuizOptions({
  question,
  selectedIndex,
  lessonId,
  onSelect,
}: {
  question: QaidaQuestion;
  selectedIndex?: number;
  lessonId: number;
  onSelect: (index: number) => void;
}) {
  switch (question.questionType) {
    case 'letterToSound':
      return (
        <>
          {question.optionsLetters.map((letter, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              disabled={selectedIndex !== undefined}
              className="btn"
              style={{
                width: '100%',
                marginBottom: 'var(--spacing-sm)',
                backgroundColor: selectedIndex === index ? 'var(--color-primary)' : 'var(--color-surface)',
                color: selectedIndex === index ? 'var(--color-on-primary)' : 'var(--color-text-primary)',
                border: `1px solid var(--color-primary)`,
              }}
            >
              {letter.name || ''}
            </button>
          ))}
        </>
      );
    case 'soundToLetter':
      return (
        <>
          {question.optionsExamples.map((ex, index) => {
            const displayText = lessonId === 6
              ? (ex.letter === 'لا' && ex.vowel === 'ء')
                ? 'لاء'
                : `${ex.letter}َ` + 'لَّ' + 'ا'
              : lessonId === 7
                ? (ex.letter === 'لا' && ex.vowel === 'ء')
                  ? 'لاء'
                  : `${ex.letter}ِ` + 'نِّ' + 'يْ'
                : `${ex.letter}${ex.vowel}`;
            return (
              <button
                key={index}
                onClick={() => onSelect(index)}
                disabled={selectedIndex !== undefined}
                className="btn"
                style={{
                  width: '100%',
                  marginBottom: 'var(--spacing-sm)',
                  backgroundColor: selectedIndex === index ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedIndex === index ? 'var(--color-on-primary)' : 'var(--color-text-primary)',
                  border: `1px solid var(--color-primary)`,
                }}
              >
                <div style={{
                  fontSize: '24px',
                  fontFamily: 'Noto_Naskh_Arabic, serif',
                  direction: 'rtl',
                  color: 'var(--color-text-primary)',
                }}>
                  {displayText}
                </div>
              </button>
            );
          })}
        </>
      );
    case 'identifyForm':
      return (
        <>
          {question.optionsFormKeys.map((key, index) => {
            const forms = question.promptLetter?.forms || {};
            const value = forms[key] || '';
            return (
              <button
                key={index}
                onClick={() => onSelect(index)}
                disabled={selectedIndex !== undefined}
                className="btn"
                style={{
                  width: '100%',
                  marginBottom: 'var(--spacing-sm)',
                  backgroundColor: selectedIndex === index ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedIndex === index ? 'var(--color-on-primary)' : 'var(--color-text-primary)',
                  border: `1px solid var(--color-primary)`,
                }}
              >
                <div style={{
                  fontSize: '24px',
                  fontFamily: 'Noto_Naskh_Arabic, serif',
                  direction: 'rtl',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-primary)',
                }}>
                  {value}
                </div>
              </button>
            );
          })}
        </>
      );
  }
}

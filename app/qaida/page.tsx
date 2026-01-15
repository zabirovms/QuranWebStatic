'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getQaidaModuleClient } from '@/lib/data/qaida-data-client';
import { QaidaModule } from '@/lib/types/qaida';
import { ArrowBackIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { useTopBar } from '@/lib/contexts/TopBarContext';

export default function QaidaPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const [module, setModule] = useState<QaidaModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getQaidaModuleClient();
        setModule(data);
      } catch (err) {
        console.error('Error loading Qaida module:', err);
        setError(err instanceof Error ? err.message : 'Қоидаи Бағдодӣ бор нашуд');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/learn-words');
    }
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

  if (error || !module) {
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
            message={error || 'Қоидаи Бағдодӣ бор нашуд'}
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
      <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
        <div className="app-bar-content">
          <h1 className="app-bar-title" style={{ fontSize: 'var(--font-size-md)' }}>
            Қоидаи Бағдодӣ
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
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            Дарсҳо
          </h2>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}>
          {module.lessons.map((lesson) => (
            <Link
              key={lesson.id}
              href={`/qaida/lesson/${lesson.id}`}
              className="card"
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                marginTop: lesson.id === 1 ? 0 : 'var(--spacing-sm)',
                borderRadius: '14px',
                boxShadow: 'var(--elevation-2)',
              }}
            >
              <div style={{
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-container-low-opacity)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-primary)',
                  }}>
                    {lesson.id}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}>
                    {lesson.title}
                  </h3>
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

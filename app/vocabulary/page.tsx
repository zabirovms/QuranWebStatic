'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVocabularyDataClient } from '@/lib/data/vocabulary-data-client';
import { VocabularyData } from '@/lib/types/vocabulary';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import { HomeIcon, MenuBookIcon, BookmarkIcon, QuizIcon, ArrowBackIcon } from '@/components/Icons';
import VocabularyHomeTab from '@/components/vocabulary/VocabularyHomeTab';
import VocabularyLearnTab from '@/components/vocabulary/VocabularyLearnTab';
import VocabularyBookmarksTab from '@/components/vocabulary/VocabularyBookmarksTab';
import VocabularyQuizTab from '@/components/vocabulary/VocabularyQuizTab';
import { useTopBar } from '@/lib/contexts/TopBarContext';

export default function VocabularyPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const [vocabularyData, setVocabularyData] = useState<VocabularyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getVocabularyDataClient();
        setVocabularyData(data);
      } catch (err) {
        console.error('Error loading vocabulary data:', err);
        setError(err instanceof Error ? err.message : 'Маълумот бор нашуд');
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

  if (error || !vocabularyData) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
          <div className="app-bar-content">
            <h1 className="app-bar-title">85% калимаҳои Қуръон</h1>
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
            message={error || 'Маълумот бор нашуд'}
            onRetry={() => window.location.reload()}
          />
        </main>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (currentTabIndex) {
      case 0:
        return <VocabularyHomeTab vocabularyData={vocabularyData} />;
      case 1:
        return <VocabularyLearnTab vocabularyData={vocabularyData} />;
      case 2:
        return <VocabularyBookmarksTab vocabularyData={vocabularyData} />;
      case 3:
        return <VocabularyQuizTab vocabularyData={vocabularyData} />;
      default:
        return <VocabularyHomeTab vocabularyData={vocabularyData} />;
    }
  };

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
            <ArrowBackIcon size={24} color="var(--color-primary)" />
          </button>
          <h1 className="app-bar-title">85% калимаҳои Қуръон</h1>
        </div>
      </div>

      {/* Tab Content */}
      <main style={{ 
        flex: 1, 
        overflow: 'auto',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        paddingBottom: 'calc(60px + var(--spacing-md))',
        paddingLeft: 'clamp(16px, 4vw, 4px)',
        paddingRight: 'clamp(16px, 4vw, 4px)',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-outline)',
        display: 'flex',
        zIndex: 1018,
        height: '60px',
        boxShadow: 'var(--elevation-2)',
      }}>
        {[
          { icon: HomeIcon, label: 'Асосӣ', index: 0 },
          { icon: MenuBookIcon, label: 'Омӯзиш', index: 1 },
          { icon: BookmarkIcon, label: 'Хатбарак', index: 2 },
          { icon: QuizIcon, label: 'Санҷиш', index: 3 },
        ].map(({ icon: Icon, label, index }) => (
          <button
            key={index}
            onClick={() => setCurrentTabIndex(index)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: currentTabIndex === index ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: '12px',
            }}
          >
            <Icon size={24} color={currentTabIndex === index ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

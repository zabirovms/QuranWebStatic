'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAllTasbeehs } from '@/lib/data/tasbeeh-data-client';
import { Tasbeeh } from '@/lib/types';
import { TasbeehService } from '@/lib/services/tasbeeh-service';

// Inner client component that uses search params and all hooks
function TasbeehPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tasbeehs, setTasbeehs] = useState<Tasbeeh[]>([]);
  const [count, setCount] = useState(0);
  const [completedTasbeehs, setCompletedTasbeehs] = useState(0);
  const [targetCount, setTargetCount] = useState(33);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'counter' | 'collection'>('counter');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const urlIndex = searchParams.get('selectedIndex')
    ? parseInt(searchParams.get('selectedIndex')!, 10)
    : null;
  
  const tasbeehService = TasbeehService.getInstance();
  const settings = tasbeehService.getSettings();
  const selectedIndex = urlIndex !== null ? urlIndex : settings.currentTasbeehIndex;
  const selectedTasbeeh = tasbeehs[selectedIndex] || tasbeehs[0];

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      setLoadError(null);
      try {
        console.log('TasbeehPage: Starting to load data...');
        const data = await getAllTasbeehs();
        console.log('TasbeehPage: Data loaded, count:', data?.length);
        
        if (data && data.length > 0) {
          setTasbeehs(data);
          // Update service with current index if URL param provided
          if (urlIndex !== null) {
            tasbeehService.setCurrentTasbeehIndex(urlIndex);
          }
          console.log('TasbeehPage: Data set successfully');
        } else {
          console.error('TasbeehPage: No data returned');
          setLoadError('Маълумот ёфт нашуд');
        }
      } catch (error) {
        console.error('TasbeehPage: Error loading tasbeehs:', error);
        const errorMessage = error instanceof Error ? error.message : 'Хатоги дар боргирии маълумот';
        setLoadError(errorMessage);
      } finally {
        setIsLoadingData(false);
        console.log('TasbeehPage: Loading finished');
      }
    };
    loadData();
  }, [urlIndex]);

  useEffect(() => {
    // Load settings when component mounts
    const currentSettings = tasbeehService.getSettings();
    setCount(currentSettings.count);
    setCompletedTasbeehs(currentSettings.completedTasbeehs);
    setTargetCount(currentSettings.targetCount);
    
    // Update target count if tasbeeh has specific target
    if (selectedTasbeeh?.targetCount) {
      const newTarget = selectedTasbeeh.targetCount;
      if (newTarget !== currentSettings.targetCount) {
        tasbeehService.setTargetCount(newTarget);
        setTargetCount(newTarget);
      }
    }
  }, [selectedTasbeeh, tasbeehService]);

  const handleIncrement = () => {
    tasbeehService.incrementCount();
    const newCount = tasbeehService.getSettings().count;
    setCount(newCount);
    
    // Check if target reached
    if (tasbeehService.checkTargetReached()) {
      tasbeehService.incrementCompletedTasbeehs();
      setCompletedTasbeehs(tasbeehService.getSettings().completedTasbeehs);
      setShowCompletionDialog(true);
    }
  };

  const handleReset = () => {
    tasbeehService.resetCount();
    setCount(0);
  };

  const handleResetAll = () => {
    if (confirm('Оё шумо мехоҳед ҳамаи маълумотро нест кунед?')) {
      tasbeehService.resetAll();
      setCount(0);
      setCompletedTasbeehs(0);
      setTargetCount(33);
    }
  };

  if (isLoadingData) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: '500' }}>Боргирӣ карда истодааст...</div>
      </div>
    );
  }

  if (loadError || tasbeehs.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}>
        <div style={{ 
          textAlign: 'center',
          color: 'var(--color-text-primary)',
          fontSize: '1rem',
        }}>
          <div style={{ marginBottom: '16px', fontWeight: '500' }}>
            {loadError || 'Маълумот ёфт нашуд'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Аз нав кӯшиш кардан
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      paddingBottom: '80px',
    }}>
      <div style={{
        padding: 'clamp(16px, 4vw, 24px)',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Tab Bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-outline)',
          marginBottom: '24px',
        }}>
          <button
            onClick={() => setActiveTab('counter')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'counter' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'counter' ? 'var(--color-primary)' : 'var(--color-text-primary)',
              fontWeight: activeTab === 'counter' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            Тасбеҳгӯяк
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'collection' ? '2px solid var(--color-primary)' : '2px solid transparent',
              color: activeTab === 'collection' ? 'var(--color-primary)' : 'var(--color-text-primary)',
              fontWeight: activeTab === 'collection' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            Зикрҳо
          </button>
        </div>

        {/* Counter Tab */}
        {activeTab === 'counter' && (
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: 'var(--elevation-1)',
            marginBottom: '24px',
          }}>
          <div style={{
            fontSize: '48px',
            fontFamily: 'Amiri, serif',
            direction: 'rtl',
            textAlign: 'center',
            marginBottom: '16px',
            color: 'var(--color-text-primary)',
            unicodeBidi: 'bidi-override',
          }}>
            {selectedTasbeeh.arabic}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginBottom: '8px',
            textAlign: 'center',
            fontWeight: 'var(--font-weight-semibold)',
            fontStyle: 'italic',
          }}>
            {selectedTasbeeh.tajikTransliteration}
          </div>
          {selectedTasbeeh.tajikTranslation && (
            <div style={{
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              marginBottom: '24px',
              textAlign: 'center',
              lineHeight: '1.6',
            }}>
              {selectedTasbeeh.tajikTranslation}
            </div>
          )}
          <div style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: 'var(--color-primary)',
            marginBottom: '16px',
            transition: 'transform 0.2s ease',
          }}>
            {count}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginBottom: '8px',
          }}>
            Мақсад: {targetCount}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--color-text-primary)',
            marginBottom: '24px',
          }}>
            Шумораи хатм: {completedTasbeehs}
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
          }}>
            <button
              onClick={handleIncrement}
              style={{
                flex: 1,
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-variant)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
            >
              Зикр кардан
            </button>
            <button
              onClick={handleReset}
              style={{
                backgroundColor: 'var(--color-surface-variant)',
                color: 'var(--color-text-primary)',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Барқарор кардан"
            >
              ↻
            </button>
          </div>
          <button
            onClick={handleResetAll}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-outline)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Ҳамаро нест кардан
          </button>
          
          {/* Completion Dialog */}
          {showCompletionDialog && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowCompletionDialog(false)}
            >
              <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '300px',
                width: '90%',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                }}>
                  🎉
                </div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: 'var(--color-text-primary)',
                }}>
                  Табрик!
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-primary)',
                  marginBottom: '24px',
                }}>
                  Шумо {targetCount} зикрро анҷом додед!
                </p>
                <button
                  onClick={() => setShowCompletionDialog(false)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Хуб
                </button>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              marginBottom: '16px',
              color: 'var(--color-text-primary)',
            }}>
              Зикрҳо
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {tasbeehs.map((tasbeeh, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid ${index === selectedIndex ? 'var(--color-primary)' : 'var(--color-outline)'}`,
                    borderRadius: '12px',
                    boxShadow: 'var(--elevation-1)',
                  }}
                >
                  <div style={{
                    fontSize: '24px',
                    fontFamily: 'Amiri, serif',
                    direction: 'rtl',
                    textAlign: 'center',
                    marginBottom: '12px',
                    unicodeBidi: 'bidi-override',
                    color: 'var(--color-text-primary)',
                  }}>
                    {tasbeeh.arabic}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '8px',
                    textAlign: 'center',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontStyle: 'italic',
                  }}>
                    {tasbeeh.tajikTransliteration}
                  </div>
                  {tasbeeh.tajikTranslation && (
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--color-text-primary)',
                      marginBottom: '12px',
                      lineHeight: '1.6',
                      textAlign: 'center',
                    }}>
                      {tasbeeh.tajikTranslation}
                    </div>
                  )}
                  {tasbeeh.description && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      marginBottom: '12px',
                      fontStyle: 'italic',
                      textAlign: 'center',
                    }}>
                      {tasbeeh.description}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      tasbeehService.setCurrentTasbeehIndex(index);
                      setActiveTab('counter');
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    Шуморидан
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple wrapper component that Next.js can statically analyze as the page
function TasbeehPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-background)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--color-outline)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
        </div>
      }
    >
      <TasbeehPageContent />
    </Suspense>
  );
}

export default TasbeehPage;

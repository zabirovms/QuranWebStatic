'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllProphetsDuas } from '@/lib/data/dua-data-client';
import { Dua } from '@/lib/types';
import { ProphetDua } from '@/lib/types/prophet-dua';
import { getProphetSvgPath, getProphetThemeColor } from '@/lib/utils/prophet-helper';
import { ArrowBackIcon, SearchIcon, ClearIcon, CloseIcon, MenuBookIcon, ArrowForwardIosIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import Image from 'next/image';
import { useTopBar } from '@/lib/contexts/TopBarContext';

function ProphetsDuasPageContent() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const searchParams = useSearchParams();
  const [prophets, setProphets] = useState<ProphetDua[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load and group prophet duas
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const allDuas = await getAllProphetsDuas();
        
        // Group duas by prophet
        const prophetMap = new Map<string, { arabicName?: string; references: Map<number, number[]> }>();
        
        for (const dua of allDuas) {
          if (!dua.prophet) continue;
          
          const prophetName = dua.prophet;
          if (!prophetMap.has(prophetName)) {
            prophetMap.set(prophetName, {
              arabicName: dua.prophetArabic,
              references: new Map(),
            });
          }
          
          const prophet = prophetMap.get(prophetName)!;
          if (!prophet.references.has(dua.surah)) {
            prophet.references.set(dua.surah, []);
          }
          
          const verses = prophet.references.get(dua.surah)!;
          if (!verses.includes(dua.verse)) {
            verses.push(dua.verse);
          }
        }
        
        // Convert to ProphetDua list
        const prophetsList: ProphetDua[] = [];
        for (const [name, data] of prophetMap.entries()) {
          const references = Array.from(data.references.entries())
            .map(([surah, verses]) => ({
              surah,
              verses: verses.sort((a, b) => a - b),
            }))
            .sort((a, b) => a.surah - b.surah);
          
          prophetsList.push({
            name,
            arabicName: data.arabicName,
            references,
          });
        }
        
        setProphets(prophetsList);
      } catch (error) {
        console.error('Error loading prophets duas:', error);
        setLoadError(error instanceof Error ? error.message : 'Хатоги дар боргирии маълумот');
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
      router.push('/duas');
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleSearchToggle = () => {
    setIsSearchExpanded(true);
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      input?.focus();
    }, 100);
  };

  const handleSearchClose = () => {
    setIsSearchExpanded(false);
    setSearchQuery('');
  };

  // Filter prophets based on search query
  const filteredProphets = searchQuery.trim() === ''
    ? prophets
    : prophets.filter((p) => {
        const lowerQuery = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(lowerQuery) ||
          (p.arabicName?.toLowerCase().includes(lowerQuery) ?? false)
        );
      });

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      {/* AppBar */}
      <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
        <div className="app-bar-content">
          {/* Search Bar */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isSearchExpanded && (
              <h1 className="app-bar-title" style={{ flex: 1, textAlign: 'left' }}>
                Дуоҳои Паёмбарон
              </h1>
            )}
            <div
              style={{
                width: isSearchExpanded ? '100%' : '40px',
                transition: 'width 0.3s ease',
              }}
            >
              {isSearchExpanded ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Ҷустуҷӯи паёмбар..."
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: '20px',
                      border: '1px solid var(--color-outline)',
                      backgroundColor: 'var(--color-surface)',
                      fontSize: 'var(--font-size-sm)',
                      outline: 'none',
                    }}
                  />
                  <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <SearchIcon size={18} color="var(--color-text-secondary)" />
                  </div>
                  <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px' }}>
                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <ClearIcon size={18} color="var(--color-text-secondary)" />
                      </button>
                    )}
                    <button
                      onClick={handleSearchClose}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <CloseIcon size={18} color="var(--color-text-secondary)" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSearchToggle}
                  className="btn btn-icon"
                  title="Ҷустуҷӯ"
                >
                  <SearchIcon size={24} color="var(--color-primary)" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <LoadingSpinner />
        </div>
      ) : loadError ? (
        <div style={{ padding: '32px' }}>
          <ErrorDisplay 
            message={loadError}
            onRetry={() => window.location.reload()}
          />
        </div>
      ) : filteredProphets.length === 0 ? (
        <div style={{ padding: '32px' }}>
          <EmptyState
            title={searchQuery ? 'Паёмбарон ёфт нашуд' : 'Паёмбарон ёфт нашуд'}
            message={searchQuery ? `Барои "${searchQuery}" паёмбаре ёфт нашуд.` : 'Дар ҳоли ҳозир ҳеҷ паёмбаре дар рӯйхат нест.'}
          />
        </div>
      ) : (
        <main style={{
          padding: 'var(--spacing-lg) 4px',
          paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
        <div
          className="scrollable-container-vertical"
          style={{
            overflowY: 'auto',
              overflowX: 'hidden',
              padding: '0',
              paddingTop: '0',
              paddingBottom: 'calc(80px)',
              width: '100%',
              boxSizing: 'border-box',
          }}
        >
          {filteredProphets.map((prophet, index) => (
            <ProphetCard
              key={index}
              prophet={prophet}
              onTap={() => {
                router.push(`/duas/prophets/detail?name=${encodeURIComponent(prophet.name)}`);
              }}
            />
          ))}
        </div>
        </main>
      )}

    </div>
  );
}

// Prophet Card Component
function ProphetCard({
  prophet,
  onTap,
}: {
  prophet: ProphetDua;
  onTap: () => void;
}) {
  const prophetSvgPath = getProphetSvgPath(prophet.name);
  const prophetThemeColor = getProphetThemeColor(prophet.name);
  const hasReferences = prophet.references.length > 0;
  const totalVerses = prophet.references.reduce((sum, ref) => sum + ref.verses.length, 0);

  return (
    <div
      onClick={onTap}
      style={{
        marginTop: '0',
        marginBottom: 'var(--spacing-md)',
        marginLeft: 'var(--spacing-md)',
        marginRight: 'var(--spacing-md)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: prophetThemeColor ? `2px solid ${prophetThemeColor}4D` : 'none',
        boxShadow: 'var(--elevation-2)',
        cursor: 'pointer',
        overflow: 'hidden',
        height: '120px',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {/* Prophet image on the left side */}
      {prophetSvgPath && (
        <div
          style={{
            width: '120px',
            height: '120px',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Image
            src={prophetSvgPath}
            alt={prophet.name}
            width={120}
            height={120}
            style={{
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Content on the right side */}
      <div
        style={{
          flex: 1,
          padding: 'var(--spacing-lg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: hasReferences ? 'var(--spacing-sm)' : 0,
              }}
            >
              {prophet.name}
            </div>
          </div>
          <ArrowForwardIosIcon
            size={16}
            color={prophetThemeColor || 'var(--color-text-secondary)'}
          />
        </div>

        {hasReferences ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'var(--spacing-sm)' }}>
            <MenuBookIcon
              size={16}
              color={prophetThemeColor || 'var(--color-primary)'}
            />
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                color: prophetThemeColor || 'var(--color-primary)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {prophet.references.length} сура, {totalVerses} оят
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
              marginTop: 'var(--spacing-sm)',
            }}
          >
            Ишорат мавҷуд нест
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProphetsDuasPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner size="large" />
      </div>
    }>
      <ProphetsDuasPageContent />
    </Suspense>
  );
}

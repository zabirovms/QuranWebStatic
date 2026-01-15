'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllDuas } from '@/lib/data/dua-data-client';
import { Dua } from '@/lib/types';
import { getSurahName } from '@/lib/utils/surah-names';
import { ArrowBackIcon, SearchIcon, ClearIcon, CloseIcon, FormatListNumberedIcon, ArrowForwardIosIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import { useTopBar } from '@/lib/contexts/TopBarContext';

function RabbanoDuasPageContent() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const searchParams = useSearchParams();
  const [duas, setDuas] = useState<Dua[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = "All", 1+ = surah tabs
  const [surahNumbers, setSurahNumbers] = useState<number[]>([]);
  const [duasBySurah, setDuasBySurah] = useState<Map<number, Dua[]>>(new Map());
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const scrollControllersRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Load duas
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getAllDuas();
        setDuas(data);

        // Group duas by surah
        const bySurah = new Map<number, Dua[]>();
        for (const dua of data) {
          if (!bySurah.has(dua.surah)) {
            bySurah.set(dua.surah, []);
          }
          bySurah.get(dua.surah)!.push(dua);
        }

        const surahNums = Array.from(bySurah.keys()).sort((a, b) => a - b);
        setSurahNumbers(surahNums);
        setDuasBySurah(bySurah);
      } catch (error) {
        console.error('Error loading duas:', error);
        setLoadError(error instanceof Error ? error.message : 'Хатоги дар боргирии маълумот');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle query parameters for selected dua
  useEffect(() => {
    const surahParam = searchParams.get('surah');
    const verseParam = searchParams.get('verse');
    if (surahParam && verseParam) {
      const surah = parseInt(surahParam, 10);
      const verse = parseInt(verseParam, 10);
      if (!isNaN(surah) && !isNaN(verse)) {
        setSelectedSurah(surah);
        setSelectedVerse(verse);
        
        // Switch to the correct surah tab
        const surahIndex = surahNumbers.indexOf(surah);
        if (surahIndex !== -1) {
          setActiveTab(surahIndex + 1); // +1 because index 0 is "All" tab
        }

        // Remove highlight after 3 seconds
        setTimeout(() => {
          setSelectedSurah(null);
          setSelectedVerse(null);
        }, 3000);
      }
    }
  }, [searchParams, surahNumbers]);

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

  // Filter duas based on search query
  const getFilteredDuas = (duasList: Dua[]): Dua[] => {
    if (searchQuery.trim() === '') {
      return duasList;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return duasList.filter((dua) => {
      return (
        dua.arabic.toLowerCase().includes(lowerQuery) ||
        dua.transliteration.toLowerCase().includes(lowerQuery) ||
        dua.tajik.toLowerCase().includes(lowerQuery) ||
        `${dua.surah}:${dua.verse}`.includes(lowerQuery)
      );
    });
  };

  const tabs = ['Ҳама', ...surahNumbers.map(num => getSurahName(num))];

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
                Раббано
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
                    placeholder="Ҷустуҷӯи дуоҳои Раббано..."
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

        {/* TabBar */}
        {!isLoading && !loadError && duas.length > 0 && (
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: '1px solid var(--color-outline)',
            backgroundColor: 'var(--color-background)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  border: 'none',
                  backgroundColor: activeTab === index ? 'var(--color-surface-variant)' : 'var(--color-background)',
                  borderBottom: activeTab === index ? '2px solid var(--color-primary)' : '2px solid transparent',
                  color: activeTab === index ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === index ? 'bold' : 'normal',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
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
      ) : duas.length === 0 ? (
        <div style={{ padding: '32px' }}>
          <EmptyState
            title="Дуоҳо ёфт нашуд"
            message="Дар ҳоли ҳозир ҳеҷ дуое дар рӯйхат нест."
          />
        </div>
      ) : (
        <main style={{
          padding: 'var(--spacing-lg) 4px',
          paddingTop: isTopBarVisible ? 'calc(112px + var(--spacing-md))' : 'calc(56px + var(--spacing-md))',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeTab === 0 ? (
            <DuasList
              duas={getFilteredDuas(duas)}
              selectedSurah={selectedSurah}
              selectedVerse={selectedVerse}
              scrollKey="rabbano_all"
            />
          ) : (
            <DuasList
              duas={getFilteredDuas(duasBySurah.get(surahNumbers[activeTab - 1]) || [])}
              selectedSurah={selectedSurah}
              selectedVerse={selectedVerse}
              scrollKey={`rabbano_surah_${surahNumbers[activeTab - 1]}`}
            />
          )}
        </div>
        </main>
      )}

    </div>
  );
}

// Duas List Component
function DuasList({
  duas,
  selectedSurah,
  selectedVerse,
  scrollKey,
}: {
  duas: Dua[];
  selectedSurah: number | null;
  selectedVerse: number | null;
  scrollKey: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to selected dua
  useEffect(() => {
    if (selectedSurah !== null && selectedVerse !== null && scrollRef.current) {
      const index = duas.findIndex(
        (d) => d.surah === selectedSurah && d.verse === selectedVerse
      );
      if (index !== -1) {
        setTimeout(() => {
          if (scrollRef.current) {
            const cardHeight = 200; // Approximate height per card
            scrollRef.current.scrollTo({
              top: index * cardHeight,
              behavior: 'smooth',
            });
          }
        }, 100);
      }
    }
  }, [selectedSurah, selectedVerse, duas.length]);

  if (duas.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        minHeight: 'calc(100vh - 200px)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>🔍</div>
        <div style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
        }}>
          Дуоҳо ёфт нашуд
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
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
      {duas.map((dua, index) => {
        const isSelected = dua.surah === selectedSurah && dua.verse === selectedVerse;
        return (
          <QuranicDuaCard
            key={`${dua.surah}-${dua.verse}-${index}`}
            dua={dua}
            isSelected={isSelected}
            onTap={() => {
              window.location.href = `/surah/${dua.surah}?verse=${dua.verse}`;
            }}
          />
        );
      })}
    </div>
  );
}

// Quranic Dua Card Component
function QuranicDuaCard({
  dua,
  isSelected,
  onTap,
}: {
  dua: Dua;
  isSelected: boolean;
  onTap: () => void;
}) {
  return (
    <div
      onClick={onTap}
      style={{
        marginTop: '0',
        marginBottom: 'var(--spacing-md)',
        marginLeft: 'var(--spacing-md)',
        marginRight: 'var(--spacing-md)',
        padding: 'var(--spacing-lg)',
        backgroundColor: isSelected
          ? 'var(--color-primary-container-low-opacity)'
          : 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: isSelected
          ? '2px solid var(--color-primary)'
          : 'none',
        boxShadow: isSelected ? 'var(--elevation-4)' : 'var(--elevation-3)',
        cursor: 'pointer',
      }}
    >
      {/* Header with reference and navigation icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)' }}>
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: 'var(--color-primary-container-low-opacity)',
            borderRadius: '20px',
            border: '1px solid var(--color-primary-low-opacity)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <FormatListNumberedIcon size={14} color="var(--color-text-primary)" />
          <div
            style={{
              fontSize: '13px',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {dua.surah}:{dua.verse}
          </div>
        </div>
        <ArrowForwardIosIcon size={16} color="var(--color-text-secondary)" />
      </div>

      {/* Arabic text (RTL) */}
      <div
        style={{
          direction: 'rtl',
          textAlign: 'right',
          fontSize: '20px',
          lineHeight: '1.8',
          fontWeight: 'var(--font-weight-medium)',
          marginBottom: 'var(--spacing-md)',
          fontFamily: 'Amiri, serif',
        }}
      >
        <span lang="ar">{dua.arabic}</span>
      </div>

      {/* Transliteration (LTR) */}
      <div
        style={{
          direction: 'ltr',
          textAlign: 'left',
          fontSize: 'var(--font-size-sm)',
          lineHeight: '1.4',
          color: 'var(--color-text-secondary)',
          fontStyle: 'italic',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        {dua.transliteration}
      </div>

      {/* Tajik translation (LTR) */}
      <div
        style={{
          direction: 'ltr',
          textAlign: 'left',
          fontSize: '16px',
          lineHeight: '1.5',
        }}
      >
        {dua.tajik}
      </div>
    </div>
  );
}

export default function RabbanoDuasPage() {
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
      <RabbanoDuasPageContent />
    </Suspense>
  );
}

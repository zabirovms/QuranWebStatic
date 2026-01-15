'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProphetSummaries } from '@/lib/data/prophet-data-client';
import { ProphetSummary } from '@/lib/types';
import { getProphetSvgPath, getProphetThemeColor } from '@/lib/utils/prophet-helper';
import { ArrowBackIcon, MenuBookIcon, ArrowForwardIosIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import { useTopBar } from '@/lib/contexts/TopBarContext';

type SortOrder = 'chronological' | 'aToZ';

function ProphetsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isVisible: isTopBarVisible } = useTopBar();
  const [prophets, setProphets] = useState<ProphetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOrder>('chronological');
  const highlightProphet = searchParams.get('prophet');
  const [highlightedProphetName, setHighlightedProphetName] = useState<string | null>(highlightProphet);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load prophets
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getProphetSummaries();
        setProphets(data);
      } catch (error) {
        console.error('Error loading prophets:', error);
        setLoadError(error instanceof Error ? error.message : 'Хатоги дар боргирии маълумот');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle highlight from query parameter
  useEffect(() => {
    const prophet = searchParams.get('prophet');
    if (prophet) {
      setHighlightedProphetName(prophet);
      // Clear highlight after 2.5 seconds (matching Flutter)
      const timer = setTimeout(() => {
        setHighlightedProphetName(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Scroll to highlighted prophet
  useEffect(() => {
    if (highlightedProphetName && prophets.length > 0 && scrollRef.current) {
      const index = prophets.findIndex(p => p.name.includes(highlightedProphetName));
      if (index !== -1) {
        // Wait for list to be built, then scroll (matching Flutter)
        setTimeout(() => {
          if (scrollRef.current) {
            // Each card is ~120 height + 12 margin = 132
            const position = index * 132;
            scrollRef.current.scrollTo({
              top: Math.max(0, position),
              behavior: 'smooth',
            });
          }
        }, 100);
      }
    }
  }, [highlightedProphetName, prophets.length]);

  const applySortOrder = (prophets: ProphetSummary[], sortOrder: SortOrder): ProphetSummary[] => {
    const sorted = [...prophets];
    switch (sortOrder) {
      case 'chronological':
        // Keep original order
        break;
      case 'aToZ':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  };

  const displayProphets = applySortOrder(prophets, currentSort);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      width: '100%',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* Content */}
      <main style={{
        paddingLeft: '4px',
        paddingRight: '4px',
        paddingBottom: 'var(--spacing-lg)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
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
      ) : displayProphets.length === 0 ? (
        <div style={{ padding: '32px' }}>
          <EmptyState
            title="Паёмбарон ёфт нашуд"
            message="Дар ҳоли ҳозир ҳеҷ паёмбаре дар рӯйхат нест."
          />
        </div>
      ) : (
        <>
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
            {displayProphets.map((prophet, index) => {
              const isHighlighted = highlightedProphetName !== null && 
                prophet.name.includes(highlightedProphetName);
              return (
                <ProphetCard
                  key={index}
                  prophet={prophet}
                  isHighlighted={isHighlighted}
                  onTap={() => {
                    router.push(`/prophets/detail?name=${encodeURIComponent(prophet.name)}`);
                  }}
                />
              );
            })}
          </div>

          {/* Sort Toggle FAB */}
          <SortToggleFab
            currentSort={currentSort}
            onChanged={(value) => setCurrentSort(value)}
          />
        </>
      )}
      </main>
    </div>
  );
}

// Prophet Card Component
function ProphetCard({
  prophet,
  isHighlighted,
  onTap,
}: {
  prophet: ProphetSummary;
  isHighlighted: boolean;
  onTap: () => void;
}) {
  const prophetSvgPath = getProphetSvgPath(prophet.name);
  const prophetThemeColor = getProphetThemeColor(prophet.name);
  const hasSummary = prophet.summaryText.trim().length > 0;

  const cardColor = isHighlighted
    ? (prophetThemeColor ? `${prophetThemeColor}1A` : 'var(--color-primary-container)')
    : 'var(--color-surface)';

  const borderColor = isHighlighted
    ? (prophetThemeColor || 'var(--color-primary)')
    : (prophetThemeColor ? `${prophetThemeColor}4D` : 'transparent');

  const borderWidth = isHighlighted ? 3 : (prophetThemeColor ? 2 : 0);

  return (
    <div
      onClick={onTap}
      style={{
        marginTop: '0',
        marginBottom: 'var(--spacing-md)',
        backgroundColor: cardColor,
        borderRadius: 'var(--radius-xl)',
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: isHighlighted ? 'var(--elevation-8)' : 'var(--elevation-2)',
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
            className="surah-name-svg"
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
                marginBottom: hasSummary ? 'var(--spacing-sm)' : 0,
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

        {hasSummary ? (
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
              {prophet.summaryText}
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

// Sort Toggle FAB Component
function SortToggleFab({
  currentSort,
  onChanged,
}: {
  currentSort: SortOrder;
  onChanged: (value: SortOrder) => void;
}) {
  const [localSort, setLocalSort] = useState<SortOrder>(currentSort);

  useEffect(() => {
    setLocalSort(currentSort);
  }, [currentSort]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        margin: 0,
        padding: 0,
        width: 'fit-content',
        height: 'auto',
        pointerEvents: 'none',
        right: 'auto',
        top: 'auto',
        display: 'inline-block',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: '30px',
          boxShadow: 'var(--elevation-8)',
          display: 'inline-flex',
          overflow: 'hidden',
          margin: 0,
          padding: 0,
          width: 'fit-content',
          height: 'auto',
          pointerEvents: 'auto',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            const newSort = 'chronological';
            setLocalSort(newSort);
            onChanged(newSort);
          }}
          style={{
            padding: '10px 20px',
            border: 'none',
            margin: 0,
            backgroundColor: localSort === 'chronological' 
              ? 'rgba(74, 144, 226, 0.15)' 
              : 'transparent',
            color: localSort === 'chronological' 
              ? 'var(--color-primary)' 
              : 'var(--color-text-primary)',
            fontWeight: localSort === 'chronological' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1,
          }}
        >
          Сол
        </button>
        <button
          onClick={() => {
            const newSort = 'aToZ';
            setLocalSort(newSort);
            onChanged(newSort);
          }}
          style={{
            padding: '10px 20px',
            border: 'none',
            margin: 0,
            backgroundColor: localSort === 'aToZ' 
              ? 'rgba(74, 144, 226, 0.15)' 
              : 'transparent',
            color: localSort === 'aToZ' 
              ? 'var(--color-primary)' 
              : 'var(--color-text-primary)',
            fontWeight: localSort === 'aToZ' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1,
          }}
        >
          А-Я
        </button>
      </div>
    </div>
  );
}

export default function ProphetsPage() {
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
      <ProphetsPageContent />
    </Suspense>
  );
}

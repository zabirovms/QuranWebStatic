'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProphetByName } from '@/lib/data/prophet-data-client';
import { getProphetSummaries } from '@/lib/data/prophet-data-client';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { Prophet, ProphetSummary, ProphetReference, VerseData } from '@/lib/types';
import { getSurahName } from '@/lib/utils/surah-names';
import { ArrowBackIcon, OpenInFullIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import DynamicMetadata from '@/components/DynamicMetadata';
import { useTopBar } from '@/lib/contexts/TopBarContext';

function ProphetDetailPageContent() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const searchParams = useSearchParams();
  const prophetName = searchParams.get('name') || '';
  
  const [prophet, setProphet] = useState<Prophet | null>(null);
  const [summary, setSummary] = useState<ProphetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = "All", 1+ = surah tabs
  const [surahVersesMap, setSurahVersesMap] = useState<Map<number, number[]>>(new Map());
  const [surahReferenceMap, setSurahReferenceMap] = useState<Map<number, ProphetReference>>(new Map());
  const [surahNumbers, setSurahNumbers] = useState<number[]>([]);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);
  const allTabScrollRef = useRef<HTMLDivElement>(null);
  const surahTabScrollRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Load prophet data
  useEffect(() => {
    const loadData = async () => {
      if (!prophetName) {
        setLoadError('Номи паёмбар муайян нашудааст');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);
      
      try {
        // Load summary first
        const summaries = await getProphetSummaries();
        const foundSummary = summaries.find(s => s.name.includes(prophetName) || prophetName.includes(s.name));
        
        if (!foundSummary) {
          setLoadError('Паёмбар ёфт нашуд');
          setIsLoading(false);
          return;
        }
        
        setSummary(foundSummary);
        
        // Load detail
        const detail = await getProphetByName(prophetName);
        
        if (!detail) {
          setLoadError('Маълумоти паёмбар ёфт нашуд');
          setIsLoading(false);
          return;
        }
        
        setProphet(detail);
        
        // Process references
        const references = detail.references || [];
        const versesMap = new Map<number, number[]>();
        const refMap = new Map<number, ProphetReference>();
        
        for (const ref of references) {
          const surah = ref.surah;
          if (!versesMap.has(surah)) {
            versesMap.set(surah, []);
          }
          versesMap.get(surah)!.push(...ref.verses);
          refMap.set(surah, ref);
        }
        
        // Sort verses and get unique surahs
        for (const [surah, verses] of versesMap.entries()) {
          const unique = Array.from(new Set(verses)).sort((a, b) => a - b);
          versesMap.set(surah, unique);
        }
        
        setSurahVersesMap(versesMap);
        setSurahReferenceMap(refMap);
        setSurahNumbers(Array.from(versesMap.keys()).sort((a, b) => a - b));
        
        // Build summary message
        const summaryText = foundSummary.summaryText;
        const matches = summaryText.match(/\d+/g);
        if (matches && matches.length >= 2) {
          const surahCount = matches[0];
          const verseCount = matches[1];
          setSummaryMessage(`Ҳамагӣ дар ${surahCount} сура, ${verseCount} оят мустақим ё ғайримустақим зикр шудааст.`);
        } else {
          setSummaryMessage(summaryText);
        }
      } catch (error) {
        console.error('Error loading prophet detail:', error);
        setLoadError(error instanceof Error ? error.message : 'Хатоги дар боргирии маълумот');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [prophetName]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/prophets');
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
            <button
              onClick={handleBack}
              className="btn btn-icon"
              style={{ marginRight: 'var(--spacing-sm)' }}
              title="Баргаштан"
            >
              <ArrowBackIcon size={24} color="var(--color-primary)" />
            </button>
            <h1 className="app-bar-title" style={{ flex: 1, textAlign: 'center' }}>
              {prophetName || 'Паёмбар'}
            </h1>
          </div>
        </div>
        <main style={{
          padding: 'var(--spacing-lg) 4px',
          paddingTop: isTopBarVisible ? 'calc(112px + var(--spacing-lg))' : 'calc(56px + var(--spacing-lg))',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <LoadingSpinner />
        </div>
        </main>
      </div>
    );
  }

  if (loadError || !prophet || !summary) {
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
              <ArrowBackIcon size={24} color="var(--color-primary)" />
            </button>
            <h1 className="app-bar-title" style={{ flex: 1, textAlign: 'center' }}>
              {prophetName || 'Паёмбар'}
            </h1>
          </div>
        </div>
        <main style={{
          padding: 'var(--spacing-lg) 4px',
          paddingTop: isTopBarVisible ? 'calc(112px + var(--spacing-lg))' : 'calc(56px + var(--spacing-lg))',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
        <div style={{ padding: '32px' }}>
          <ErrorDisplay 
            message={loadError || 'Паёмбар ёфт нашуд'}
            onRetry={() => window.location.reload()}
          />
        </div>
        </main>
      </div>
    );
  }

  const references = prophet.references || [];
  
  if (references.length === 0) {
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
              <ArrowBackIcon size={24} color="var(--color-primary)" />
            </button>
            <h1 className="app-bar-title" style={{ flex: 1, textAlign: 'center' }}>
              {summary.name}
            </h1>
          </div>
        </div>
        <main style={{
          padding: 'var(--spacing-lg) 4px',
          paddingTop: isTopBarVisible ? 'calc(112px + var(--spacing-lg))' : 'calc(56px + var(--spacing-lg))',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
        <div style={{ 
          padding: '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>ℹ️</div>
          <h2 style={{ 
            fontSize: 'var(--font-size-xl)', 
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: '8px',
            color: 'var(--color-text-primary)',
          }}>
            Ишорат мавҷуд нест
          </h2>
          <p style={{ 
            fontSize: 'var(--font-size-md)', 
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
          }}>
            Барои ин паёмбар ишорате дар Қуръон мавҷуд нест.
          </p>
        </div>
        </main>
      </div>
    );
  }

  const tabs = ['Ҳама', ...surahNumbers.map(num => getSurahName(num))];

  // Generate dynamic metadata with actual prophet name
  const prophetDisplayName = summary?.name || prophet?.name || prophetName;
  const surahCount = surahNumbers.length;
  const totalVerses = Array.from(surahVersesMap.values()).reduce((sum, verses) => sum + verses.length, 0);
  
  // Create SEO-optimized description with actual prophet name and specific details
  let prophetDescription: string;
  if (surahCount > 0 && totalVerses > 0) {
    prophetDescription = `Тафсилоти паёмбар ${prophetDisplayName} дар Қуръони Карим. ${prophetDisplayName} дар ${surahCount} сура ва ${totalVerses} оят зикр шудааст. Маълумоти пурра дар бораи ${prophetDisplayName} дар Quran.tj.`;
  } else if (summary?.summaryText) {
    prophetDescription = `Тафсилоти паёмбар ${prophetDisplayName} дар Қуръони Карим. ${summary.summaryText}. Маълумоти пурра дар бораи ${prophetDisplayName} дар Quran.tj.`;
  } else {
    prophetDescription = `Тафсилоти паёмбар ${prophetDisplayName} дар Қуръон.`;
  }
  
  const canonicalUrl = `https://www.quran.tj/prophets/detail/?name=${encodeURIComponent(prophetName)}`;

  return (
    <>
      <DynamicMetadata
        title={`${prophetDisplayName} | Паёмбар дар Қуръон`}
        description={prophetDescription}
        canonical={canonicalUrl}
      />
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        {/* AppBar */}
        <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
        <div className="app-bar-content">
          <h1 className="app-bar-title" style={{ flex: 1, textAlign: 'center' }}>
            {summary.name}
          </h1>
        </div>

        {/* TabBar */}
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
      </div>

      {/* Tab Content */}
      <main style={{
        padding: 'var(--spacing-lg) 4px',
        paddingTop: isTopBarVisible ? 'calc(112px + var(--spacing-lg))' : 'calc(56px + var(--spacing-lg))',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
      {activeTab === 0 ? (
        <AllVersesTab
          scrollRef={allTabScrollRef}
          surahNumbers={surahNumbers}
          surahVersesMap={surahVersesMap}
          surahReferenceMap={surahReferenceMap}
          summaryMessage={summaryMessage}
          onVerseTap={(surahNum, verseNum) => {
            router.push(`/surah/${surahNum}?verse=${verseNum}`);
          }}
        />
      ) : (
        <SurahTab
          surahNumber={surahNumbers[activeTab - 1]}
          verseNumbers={surahVersesMap.get(surahNumbers[activeTab - 1]) || []}
          reference={surahReferenceMap.get(surahNumbers[activeTab - 1])}
          onVerseTap={(surahNum, verseNum) => {
            router.push(`/surah/${surahNum}?verse=${verseNum}`);
          }}
        />
      )}
      </main>

    </div>
    </>
  );
}

// All Verses Tab Component
function AllVersesTab({
  scrollRef,
  surahNumbers,
  surahVersesMap,
  surahReferenceMap,
  summaryMessage,
  onVerseTap,
}: {
  scrollRef: React.RefObject<HTMLDivElement>;
  surahNumbers: number[];
  surahVersesMap: Map<number, number[]>;
  surahReferenceMap: Map<number, ProphetReference>;
  summaryMessage: string | null;
  onVerseTap: (surahNum: number, verseNum: number) => void;
}) {
  return (
    <div
      ref={scrollRef}
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: 'calc(80px)',
      }}
    >
      {summaryMessage && (
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--color-primary-container-low-opacity)',
            padding: '12px 16px',
            marginBottom: '8px',
            borderRadius: 'var(--radius-md)',
            margin: '0 0 8px',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            {summaryMessage}
          </div>
        </div>
      )}

      {surahNumbers.map((surahNum) => {
        const verseNumbers = surahVersesMap.get(surahNum) || [];
        const ref = surahReferenceMap.get(surahNum);
        return (
          <SurahVersesSection
            key={surahNum}
            surahNumber={surahNum}
            verseNumbers={verseNumbers}
            reference={ref}
            isNested={true}
            onVerseTap={onVerseTap}
          />
        );
      })}
    </div>
  );
}

// Surah Tab Component
function SurahTab({
  surahNumber,
  verseNumbers,
  reference,
  onVerseTap,
}: {
  surahNumber: number;
  verseNumbers: number[];
  reference?: ProphetReference;
  onVerseTap: (surahNum: number, verseNum: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: 'calc(80px)',
      }}
    >
      <SurahVersesSection
        surahNumber={surahNumber}
        verseNumbers={verseNumbers}
        reference={reference}
        isNested={false}
        onVerseTap={onVerseTap}
      />
    </div>
  );
}

// Surah Verses Section Component
function SurahVersesSection({
  surahNumber,
  verseNumbers,
  reference,
  isNested,
  onVerseTap,
}: {
  surahNumber: number;
  verseNumbers: number[];
  reference?: ProphetReference;
  isNested: boolean;
  onVerseTap: (surahNum: number, verseNum: number) => void;
}) {
  const [surah, setSurah] = useState<any>(null);

  useEffect(() => {
    getAllSurahs().then(surahs => {
      const found = surahs.find(s => s.number === surahNumber);
      setSurah(found);
    });
  }, [surahNumber]);

  // Use only pre-populated data from Prophets.json
  if (!reference?.verse_data || Object.keys(reference.verse_data).length === 0) {
    return null;
  }

  const children: React.ReactNode[] = [];

  // Surah header - only show in "All" tab (when isNested is true)
  if (isNested) {
    children.push(
      <div
        key="header"
        style={{
          margin: '8px var(--spacing-md)',
          padding: '12px',
          backgroundColor: 'var(--color-primary-container-low-opacity)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-primary-low-opacity)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '20px',
            color: 'var(--color-on-primary)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {surahNumber}
        </div>
        <div style={{ flex: 1, fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
          {surah?.nameTajik || getSurahName(surahNumber)}
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {verseNumbers.length} оят
        </div>
      </div>
    );
  }

  // Verse widgets
  for (const verseNum of verseNumbers) {
    const verseData = reference.verse_data?.[verseNum.toString()];
    if (!verseData) continue;

    children.push(
      <SimpleVerseWidget
        key={`${surahNumber}-${verseNum}`}
        surahNumber={surahNumber}
        verseNumber={verseNum}
        arabic={verseData.arabic.trim()}
        tajik={verseData.tajik || ''}
        transliteration={verseData.transliteration}
        onTap={() => onVerseTap(surahNumber, verseNum)}
      />
    );
  }

  if (isNested) {
    return <div>{children}</div>;
  } else {
    return <div>{children}</div>;
  }
}

// Simple Verse Widget Component
function SimpleVerseWidget({
  surahNumber,
  verseNumber,
  arabic,
  tajik,
  transliteration,
  onTap,
}: {
  surahNumber: number;
  verseNumber: number;
  arabic: string;
  tajik: string;
  transliteration?: string;
  onTap: () => void;
}) {
  return (
    <div
      style={{
        margin: 'var(--spacing-md) var(--spacing-md)',
        padding: '12px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--elevation-1)',
      }}
    >
      {/* Verse number */}
      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}
      >
        {surahNumber}:{verseNumber}
      </div>

      {/* Arabic text */}
      <div
        style={{
          direction: 'rtl',
          textAlign: 'right',
          fontSize: '22px',
          lineHeight: '1.4',
          fontFamily: 'Amiri, serif',
          marginBottom: transliteration ? '8px' : (tajik ? '8px' : '12px'),
        }}
      >
        <span lang="ar">{arabic}</span>
      </div>

      {/* Transliteration */}
      {transliteration && transliteration.trim() && (
        <div
          style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            marginBottom: tajik ? '8px' : '12px',
          }}
        >
          {transliteration}
        </div>
      )}

      {/* Tajik translation */}
      {tajik.trim() && (
        <div
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            letterSpacing: '0.3px',
            marginBottom: '12px',
          }}
        >
          {tajik}
        </div>
      )}

      {/* Button to view in full surah */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onTap}
          style={{
            padding: '8px 12px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <OpenInFullIcon size={16} color="var(--color-primary)" />
          Дар сура дидан
        </button>
      </div>
    </div>
  );
}

export default function ProphetDetailPage() {
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
      <ProphetDetailPageContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAllProphetsDuas } from '@/lib/data/dua-data-client';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { Dua } from '@/lib/types';
import { ProphetDua } from '@/lib/types/prophet-dua';
import { getSurahName } from '@/lib/utils/surah-names';
import { getProphetThemeColor } from '@/lib/utils/prophet-helper';
import { ArrowBackIcon, OpenInFullIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import DynamicMetadata from '@/components/DynamicMetadata';
import { useTopBar } from '@/lib/contexts/TopBarContext';

function ProphetDuaDetailPageContent() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const searchParams = useSearchParams();
  const prophetName = searchParams.get('name') || '';
  
  const [prophet, setProphet] = useState<ProphetDua | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0); // 0 = "All", 1+ = surah tabs
  const [surahVersesMap, setSurahVersesMap] = useState<Map<number, number[]>>(new Map());
  const [surahVerseDataMap, setSurahVerseDataMap] = useState<Map<number, Map<number, Dua>>>(new Map());
  const [surahNumbers, setSurahNumbers] = useState<number[]>([]);
  const allTabScrollRef = useRef<HTMLDivElement>(null);
  const surahTabScrollRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Load prophet dua data
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
        // Load all prophets duas
        const allDuas = await getAllProphetsDuas();
        
        // Filter duas for this prophet
        const prophetDuas = allDuas.filter((dua) => dua.prophet === prophetName);
        
        if (prophetDuas.length === 0) {
          setLoadError('Дуоҳои паёмбар ёфт нашуд');
          setIsLoading(false);
          return;
        }
        
        // Group by surah and verse
        const versesMap = new Map<number, number[]>();
        const verseDataMap = new Map<number, Map<number, Dua>>();
        
        for (const dua of prophetDuas) {
          if (!versesMap.has(dua.surah)) {
            versesMap.set(dua.surah, []);
            verseDataMap.set(dua.surah, new Map());
          }
          
          const verses = versesMap.get(dua.surah)!;
          if (!verses.includes(dua.verse)) {
            verses.push(dua.verse);
          }
          
          verseDataMap.get(dua.surah)!.set(dua.verse, dua);
        }
        
        // Sort verses for each surah
        for (const [surah, verses] of versesMap.entries()) {
          verses.sort((a, b) => a - b);
        }
        
        const surahNums = Array.from(versesMap.keys()).sort((a, b) => a - b);
        setSurahVersesMap(versesMap);
        setSurahVerseDataMap(verseDataMap);
        setSurahNumbers(surahNums);
        
        // Create ProphetDua object for display
        const references = surahNums.map(surah => ({
          surah,
          verses: versesMap.get(surah)!,
        }));
        
        setProphet({
          name: prophetName,
          references,
        });
      } catch (error) {
        console.error('Error loading prophet dua detail:', error);
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
      router.push('/duas/prophets');
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
            <h1 className="app-bar-title" style={{ flex: 1, textAlign: 'center' }}>
              {prophetName || 'Паёмбар'}
            </h1>
          </div>
        </div>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (loadError || !prophet || surahNumbers.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
          <div className="app-bar-content">
            <h1 className="app-bar-title" style={{ flex: 1, textAlign: 'center' }}>
              {prophetName || 'Паёмбар'}
            </h1>
          </div>
        </div>
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
      </div>
    );
  }

  const prophetThemeColor = getProphetThemeColor(prophet.name);
  const tabs = ['Ҳама', ...surahNumbers.map(num => getSurahName(num))];

  // Generate dynamic metadata with actual prophet name
  const prophetDisplayName = prophet?.name || prophetName;
  const duaCount = surahNumbers.reduce((total, surahNum) => {
    return total + (surahVersesMap.get(surahNum)?.length || 0);
  }, 0);
  const surahCount = surahNumbers.length;
  
  // Create SEO-optimized description with actual prophet name and specific details
  let prophetDuaDescription: string;
  if (duaCount > 0 && surahCount > 0) {
    prophetDuaDescription = `Дуоҳои паёмбар ${prophetDisplayName} дар Қуръони Карим. Рӯйхати пурраи ${duaCount} дуоҳое, ки ${prophetDisplayName} дар ${surahCount} сураи Қуръон кардаанд. Хондани дуоҳои ${prophetDisplayName} бо тарҷума ва тафсири осонбаён дар забони тоҷикӣ.`;
  } else if (duaCount > 0) {
    prophetDuaDescription = `Дуоҳои паёмбар ${prophetDisplayName} дар Қуръони Карим. Рӯйхати пурраи ${duaCount} дуоҳое, ки ${prophetDisplayName} дар Қуръон кардаанд. Хондани дуоҳои ${prophetDisplayName} бо тарҷума ва тафсири осонбаён.`;
  } else {
    prophetDuaDescription = `Дуоҳои паёмбар ${prophetDisplayName} дар Қуръон. Рӯйхати дуоҳое, ки ${prophetDisplayName} дар Қуръони Карим кардаанд бо тарҷума ва тафсири осонбаён.`;
  }
  
  const canonicalUrl = `https://www.quran.tj/duas/prophets/detail/?name=${encodeURIComponent(prophetName)}`;

  return (
    <>
      <DynamicMetadata
        title={`Дуоҳои ${prophetDisplayName} | Дуоҳои паёмбар дар Қуръон`}
        description={prophetDuaDescription}
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
            {prophet.name}
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
                color: activeTab === index 
                  ? (prophetThemeColor || 'var(--color-primary)')
                  : 'var(--color-text-secondary)',
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
        paddingTop: isTopBarVisible ? 'calc(112px + var(--spacing-md))' : 'calc(56px + var(--spacing-md))',
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
          surahVerseDataMap={surahVerseDataMap}
          prophetThemeColor={prophetThemeColor}
          onVerseTap={(surahNum, verseNum) => {
            router.push(`/surah/${surahNum}?verse=${verseNum}`);
          }}
        />
      ) : (
        <SurahTab
          surahNumber={surahNumbers[activeTab - 1]}
          verseNumbers={surahVersesMap.get(surahNumbers[activeTab - 1]) || []}
          verseDataMap={surahVerseDataMap.get(surahNumbers[activeTab - 1])}
          prophetThemeColor={prophetThemeColor}
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
  surahVerseDataMap,
  prophetThemeColor,
  onVerseTap,
}: {
  scrollRef: React.RefObject<HTMLDivElement>;
  surahNumbers: number[];
  surahVersesMap: Map<number, number[]>;
  surahVerseDataMap: Map<number, Map<number, Dua>>;
  prophetThemeColor: string | null;
  onVerseTap: (surahNum: number, verseNum: number) => void;
}) {
  return (
    <div
      ref={scrollRef}
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
      {surahNumbers.map((surahNum) => {
        const verseNumbers = surahVersesMap.get(surahNum) || [];
        const verseDataMap = surahVerseDataMap.get(surahNum);
        return (
          <SurahVersesSection
            key={surahNum}
            surahNumber={surahNum}
            verseNumbers={verseNumbers}
            verseDataMap={verseDataMap}
            isNested={true}
            prophetThemeColor={prophetThemeColor}
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
  verseDataMap,
  prophetThemeColor,
  onVerseTap,
}: {
  surahNumber: number;
  verseNumbers: number[];
  verseDataMap?: Map<number, Dua>;
  prophetThemeColor: string | null;
  onVerseTap: (surahNum: number, verseNum: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
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
      <SurahVersesSection
        surahNumber={surahNumber}
        verseNumbers={verseNumbers}
        verseDataMap={verseDataMap}
        isNested={false}
        prophetThemeColor={prophetThemeColor}
        onVerseTap={onVerseTap}
      />
    </div>
  );
}

// Surah Verses Section Component
function SurahVersesSection({
  surahNumber,
  verseNumbers,
  verseDataMap,
  isNested,
  prophetThemeColor,
  onVerseTap,
}: {
  surahNumber: number;
  verseNumbers: number[];
  verseDataMap?: Map<number, Dua>;
  isNested: boolean;
  prophetThemeColor: string | null;
  onVerseTap: (surahNum: number, verseNum: number) => void;
}) {
  const [surah, setSurah] = useState<any>(null);

  useEffect(() => {
    getAllSurahs().then(surahs => {
      const found = surahs.find(s => s.number === surahNumber);
      setSurah(found);
    });
  }, [surahNumber]);

  // Use only pre-populated data from prophets_duas.json
  if (!verseDataMap || verseDataMap.size === 0) {
    return null;
  }

  const children: React.ReactNode[] = [];

  // Surah header - only show in "All" tab (when isNested is true)
  if (isNested) {
    children.push(
      <div
        key="header"
        style={{
          margin: '8px 16px',
          padding: '12px',
          backgroundColor: `${prophetThemeColor || 'var(--color-primary)'}30`,
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${prophetThemeColor || 'var(--color-primary)'}30`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: prophetThemeColor || 'var(--color-primary)',
            borderRadius: '20px',
            color: '#fff',
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
    const dua = verseDataMap.get(verseNum);
    if (!dua) continue;

    children.push(
      <SimpleVerseWidget
        key={`${surahNumber}-${verseNum}`}
        surahNumber={surahNumber}
        verseNumber={verseNum}
        arabic={dua.arabic.trim()}
        tajik={dua.tajik || ''}
        transliteration={dua.transliteration}
        prophetThemeColor={prophetThemeColor}
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
  prophetThemeColor,
  onTap,
}: {
  surahNumber: number;
  verseNumber: number;
  arabic: string;
  tajik: string;
  transliteration?: string;
  prophetThemeColor: string | null;
  onTap: () => void;
}) {
  return (
    <div
      style={{
        margin: '3px 16px',
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
            color: prophetThemeColor || 'var(--color-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <OpenInFullIcon size={16} color={prophetThemeColor || 'var(--color-primary)'} />
          Дар сура дидан
        </button>
      </div>
    </div>
  );
}

export default function ProphetDuaDetailPage() {
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
      <ProphetDuaDetailPageContent />
    </Suspense>
  );
}

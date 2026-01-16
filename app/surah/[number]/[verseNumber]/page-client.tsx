'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { getSurahByNumberClient } from '@/lib/data/surah-data-client';
import { getVerse } from '@/lib/data/verse-data-client';
import { getVersesBySurahClient } from '@/lib/data/verse-data-client';
import { Surah, Verse } from '@/lib/types';
import { ArrowForwardIosIcon } from '@/components/Icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import VerseItem from '@/components/VerseItem';
import SurahAppBar from '@/components/SurahAppBar';
import SurahDisplaySettings, { SurahDisplaySettings as SurahDisplaySettingsType } from '@/components/SurahDisplaySettings';
import BookmarksDrawer from '@/components/BookmarksDrawer';
import { BookmarkService } from '@/lib/services/bookmark-service';
import { SettingsService } from '@/lib/services/settings-service';
import StructuredData from '@/components/StructuredData';
import { getSurahName } from '@/lib/utils/surah-names';

interface VersePageClientProps {
  params: {
    number: string;
    verseNumber: string;
  };
  initialSurah: Surah | null;
  initialVerse: Verse | null;
  initialAllVerses: Verse[];
}

export default function DedicatedVersePage({ 
  params, 
  initialSurah, 
  initialVerse, 
  initialAllVerses 
}: VersePageClientProps) {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const surahNumber = parseInt(params.number);
  const verseNumber = parseInt(params.verseNumber);
  
  const [surah, setSurah] = useState<Surah | null>(initialSurah);
  const [verse, setVerse] = useState<Verse | null>(initialVerse);
  const [allVerses, setAllVerses] = useState<Verse[]>(initialAllVerses);
  const [isLoading, setIsLoading] = useState(!initialSurah || !initialVerse || initialAllVerses.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasAnyBookmarks, setHasAnyBookmarks] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showBookmarksDrawer, setShowBookmarksDrawer] = useState(false);
  
  // Load settings from SettingsService on mount
  const settingsService = SettingsService.getInstance();
  const initialSettings = settingsService.getSettings();
  const [surahSettings, setSurahSettings] = useState<SurahDisplaySettingsType>({
    showTransliteration: initialSettings.showTransliteration,
    showTranslation: initialSettings.showTranslation,
    showOnlyArabic: initialSettings.showOnlyArabic,
    isWordByWordMode: initialSettings.wordByWordMode,
    showVerseActions: true,
    plainCardsMode: true,
    translationLanguage: initialSettings.translationLanguage,
    audioEdition: initialSettings.audioEdition,
  });

  useEffect(() => {
    // Only load if we don't have initial data
    if (initialSurah && initialVerse && initialAllVerses.length > 0) {
      setIsLoading(false);
      // Check for bookmarks
      const bookmarkService = BookmarkService.getInstance();
      setHasAnyBookmarks(bookmarkService.hasAnyBookmarks());
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        const [surahData, verseData, versesData] = await Promise.all([
          getSurahByNumberClient(surahNumber),
          getVerse(surahNumber, verseNumber),
          getVersesBySurahClient(surahNumber),
        ]);

        if (!surahData) {
          notFound();
          return;
        }

        if (!verseData) {
          setLoadError(`Оят ${verseNumber} дар сураи ${surahNumber} ёфт нашуд`);
          setIsLoading(false);
          return;
        }

        setSurah(surahData);
        setVerse(verseData);
        setAllVerses(versesData);
        
        // Check for bookmarks
        const bookmarkService = BookmarkService.getInstance();
        setHasAnyBookmarks(bookmarkService.hasAnyBookmarks());
      } catch (error) {
        console.error('Error loading verse:', error);
        const errorMessage = error instanceof Error ? error.message : 'Хатоги дар боргирии маълумот';
        setLoadError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [surahNumber, verseNumber, initialSurah, initialVerse, initialAllVerses]);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)',
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (loadError || !verse || !surah) {
    return (
      <div style={{ 
        minHeight: '100vh',
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-background)',
      }}>
        <ErrorDisplay 
          message={loadError || 'Оят ёфт нашуд'} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  // Calculate progress (verse position in surah)
  const currentIndex = allVerses.findIndex(v => v.verseNumber === verseNumber);
  const progress = allVerses.length > 0 ? (currentIndex + 1) / allVerses.length : 0;
  const surahName = getSurahName(surahNumber);

  return (
    <>
      <StructuredData
        type="verse"
        surahNumber={surahNumber}
        surahName={surahName}
        verseNumber={verseNumber}
        verseText={verse.arabicText}
        verseTranslation={verse.tj3 || verse.tajikText}
      />
      <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      <SurahAppBar 
        surah={surah}
        hasAnyBookmarks={hasAnyBookmarks}
        onSettingsClick={() => setShowSettingsDialog(true)}
        onBookmarksClick={() => setShowBookmarksDrawer(true)}
        currentJuz={verse?.juz}
        currentPage={verse?.page}
        progress={progress}
      />

      {/* Verse content */}
      <main style={{
        padding: 'var(--spacing-lg) 4px',
        paddingTop: isTopBarVisible ? 'calc(112px + var(--spacing-lg) - 12px)' : 'calc(56px + var(--spacing-lg) - 12px)',
        transition: 'padding-top 0.4s ease-out',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{
          marginBottom: 'var(--spacing-xl)',
        }}>
          <VerseItem
            verse={verse}
            surahNumber={surahNumber}
            highlight={true}
            plainCardsMode={true}
            showExtraActions={true}
            showTransliteration={surahSettings.showTransliteration}
            showTranslation={surahSettings.showTranslation}
            showOnlyArabic={surahSettings.showOnlyArabic}
            translationLanguage="tj_3"
          />
        </div>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          flexWrap: 'wrap',
          marginTop: 'var(--spacing-xl)',
          paddingTop: 'var(--spacing-lg)',
          borderTop: '1px solid var(--color-outline)',
        }}>
          {/* Full surah link */}
          <Link
            href={`/surah/${surahNumber}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-outline)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              transition: 'all var(--transition-base)',
              flex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
          >
            <span>Сураи пурра</span>
          </Link>

          {/* Continue reading link */}
          <Link
            href={`/surah/${surahNumber}?verse=${verseNumber}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '12px 16px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-outline)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              transition: 'all var(--transition-base)',
              flex: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
            }}
          >
            <span>Идома додан</span>
            <ArrowForwardIosIcon size={14} />
          </Link>
        </div>
      </main>

      {/* Settings Dialog */}
      <SurahDisplaySettings
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        onSettingsChange={(newSettings) => {
          setSurahSettings(newSettings);
          // Update global settings
          settingsService.setShowTransliteration(newSettings.showTransliteration);
          settingsService.setShowTranslation(newSettings.showTranslation);
          settingsService.setShowOnlyArabic(newSettings.showOnlyArabic);
          settingsService.setWordByWordMode(newSettings.isWordByWordMode);
          settingsService.setTranslationLanguage(newSettings.translationLanguage);
          if (newSettings.audioEdition) {
            settingsService.setAudioEdition(newSettings.audioEdition);
          }
        }}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={showBookmarksDrawer}
        onClose={() => setShowBookmarksDrawer(false)}
      />
      </div>
    </>
  );
}

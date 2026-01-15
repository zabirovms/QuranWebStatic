import { notFound } from 'next/navigation';
import { getSurahByNumber } from '@/lib/data/surah-data';
import { getVerse, getVersesBySurah } from '@/lib/data/verse-data';
import DedicatedVersePage from './page-client';

interface PageProps {
  params: {
    number: string;
    verseNumber: string;
  };
}

/**
 * Server component that fetches initial data at build time
 * This ensures the page is statically generated with content visible to search engines
 */
export default async function VersePage({ params }: PageProps) {
  const surahNumber = parseInt(params.number);
  const verseNumber = parseInt(params.verseNumber);
  
  // Fetch data at build time for static generation
  const [surah, verse, allVerses] = await Promise.all([
    getSurahByNumber(surahNumber),
    getVerse(surahNumber, verseNumber),
    getVersesBySurah(surahNumber),
  ]);

  if (!surah || !verse) {
    notFound();
  }

  return (
    <DedicatedVersePage 
      params={params}
      initialSurah={surah}
      initialVerse={verse}
      initialAllVerses={allVerses}
    />
  );
}

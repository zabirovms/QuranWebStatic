import { notFound } from 'next/navigation';
import { getSurahByNumber } from '@/lib/data/surah-data';
import { getVersesBySurah } from '@/lib/data/verse-data';
import SurahPageClient from './page-client';

interface PageProps {
  params: {
    number: string;
  };
}

/**
 * Server component that fetches initial data at build time
 * This ensures the page is statically generated with content visible to search engines
 */
export default async function SurahPage({ params }: PageProps) {
  const surahNumber = parseInt(params.number);
  
  // Fetch data at build time for static generation
  const [surah, verses] = await Promise.all([
    getSurahByNumber(surahNumber),
    getVersesBySurah(surahNumber),
  ]);

  if (!surah) {
    notFound();
  }

  return (
    <SurahPageClient 
      params={params}
      initialSurah={surah}
      initialVerses={verses}
    />
  );
}

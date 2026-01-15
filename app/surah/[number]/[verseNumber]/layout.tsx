import { Metadata } from 'next';
import { getSurahName } from '@/lib/utils/surah-names';
import { getVerse } from '@/lib/data/verse-data';
import { getAllSurahs } from '@/lib/data/surah-data';

type Props = {
  params: { number: string; verseNumber: string };
};

export async function generateStaticParams() {
  const surahs = await getAllSurahs();
  const params: { number: string; verseNumber: string }[] = [];
  
  for (const surah of surahs) {
    for (let verseNum = 1; verseNum <= surah.versesCount; verseNum++) {
      params.push({
        number: String(surah.number),
        verseNumber: String(verseNum),
      });
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const surahNumber = parseInt(params.number);
  const verseNumber = parseInt(params.verseNumber);
  const surahName = getSurahName(surahNumber);
  const verse = await getVerse(surahNumber, verseNumber);

  const baseUrl = 'https://www.quran.tj';
  const canonicalUrl = `${baseUrl}/surah/${surahNumber}/${verseNumber}`;

  // Get verse text preview (first 150 characters of translation)
  const verseTextPreview = verse?.tj3 
    ? verse.tj3.substring(0, 150).replace(/\s+/g, ' ').trim() + (verse.tj3.length > 150 ? '...' : '')
    : `Оят ${verseNumber} аз сураи ${surahName}`;

  const title = `Сураи ${surahName} ояти ${verseNumber}`;
  const description = `${verseTextPreview} (Қуръон ${surahNumber}:${verseNumber})`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Сураи ${surahName} ояти ${verseNumber}`,
      description,
      type: 'article',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title: `Сураи ${surahName} ояти ${verseNumber}`,
      description,
    },
  };
}

export default function VerseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


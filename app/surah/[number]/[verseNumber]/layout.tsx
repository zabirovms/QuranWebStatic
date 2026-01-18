import { Metadata } from 'next';
import { getSurahName } from '@/lib/utils/surah-names';
import { getVerse } from '@/lib/data/verse-data';
import { getAllSurahs, getSurahByNumber } from '@/lib/data/surah-data';
import { getRevelationTypeTajik } from '@/lib/utils/revelation-order';

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
  const [verse, surah] = await Promise.all([
    getVerse(surahNumber, verseNumber),
    getSurahByNumber(surahNumber),
  ]);

  const baseUrl = 'https://www.quran.tj';
  const canonicalUrl = `${baseUrl}/surah/${surahNumber}/${verseNumber}`;

  // Build enhanced description with available data
  const descriptionParts: string[] = [];

  // Primary translation (prefer tj3, fallback to tajikText)
  const primaryTranslation = verse?.tj3 || verse?.tajikText || '';
  if (primaryTranslation) {
    const preview = primaryTranslation.substring(0, 120).replace(/\s+/g, ' ').trim();
    descriptionParts.push(preview + (primaryTranslation.length > 120 ? '...' : ''));
  }

  // Add tafsir if available
  if (verse?.tafsir) {
    const tafsirPreview = verse.tafsir.substring(0, 80).replace(/\s+/g, ' ').trim();
    descriptionParts.push(`Тафсир: ${tafsirPreview}${verse.tafsir.length > 80 ? '...' : ''}`);
  }

  // Add surah context
  if (surah) {
    const contextParts: string[] = [];
    const revelationTypeTajik = getRevelationTypeTajik(surah.revelationType);
    contextParts.push(`Сураи ${surahName} (${revelationTypeTajik})`);
    
    if (verse?.juz) {
      contextParts.push(`Ҷузъ ${verse.juz}`);
    }
    if (verse?.page) {
      contextParts.push(`Саҳифа ${verse.page}`);
    }
    
    if (contextParts.length > 0) {
      descriptionParts.push(contextParts.join(', '));
    }
  }

  // Fallback if no data
  if (descriptionParts.length === 0) {
    descriptionParts.push(`Оят ${verseNumber} аз сураи ${surahName}`);
  }

  const description = descriptionParts.join('. ') + ` (Қуръон ${surahNumber}:${verseNumber})`;

  const title = `Сураи ${surahName} ояти ${verseNumber}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
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


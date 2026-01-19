import { Metadata } from 'next';
import { getSurahName } from '@/lib/utils/surah-names';
import { getAllSurahs } from '@/lib/data/surah-data';
import { getRevelationOrder, getRevelationTypeTajik } from '@/lib/utils/revelation-order';

type Props = {
  params: { number: string };
};

export async function generateStaticParams() {
  // Generate params for all 114 surahs
  return Array.from({ length: 114 }, (_, i) => ({
    number: String(i + 1),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const surahNumber = parseInt(params.number);
  const surahName = getSurahName(surahNumber);

  // Handle well-known alternative names for certain surahs
  // e.g. Surah Al-Mulk is also known as Таборак
  let altName: string | null = null;
  if (surahNumber === 67) {
    altName = 'Таборак';
  }
  const displayName = altName ? `${surahName} / ${altName}` : surahName;
  const surahs = await getAllSurahs();
  const surah = surahs.find(s => s.number === surahNumber);

  const baseUrl = 'https://www.quran.tj';
  const canonicalUrl = `${baseUrl}/surah/${surahNumber}`;

  // Include both name and number in title for better SEO
  const title = `Сураи ${displayName} (${surahNumber}) - Тарҷума ва Тафсири тоҷикӣ`;
  
  let description: string;
  if (surah) {
    const revelationTypeTajik = getRevelationTypeTajik(surah.revelationType);
    const revelationOrder = getRevelationOrder(surahNumber);
    
    // Enhanced description with tafsir keyword and both name/number
    const tafsirKeyword = `Тафсири сураи ${displayName} (${surahNumber})`;
    
    if (revelationOrder) {
      description = `${tafsirKeyword}. Хондани Сураи ${displayName} (${surahNumber}) бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз ${surah.versesCount} оят иборат буда дар ${revelationTypeTajik} нозил шудааст. Тартиби нузулаш ${revelationOrder}-умин сура аст. Курони Карим - Тарчумаи точики`;
    } else {
      description = `${tafsirKeyword}. Хондани Сураи ${displayName} (${surahNumber}) бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз ${surah.versesCount} оят иборат буда дар ${revelationTypeTajik} нозил шудааст. Курони Карим - Тарчумаи точики`;
    }
  } else {
    description = `Тафсири сураи ${displayName} (${surahNumber}). Сураи ${displayName} бо тафсир ва тарҷумаи тоҷикӣ`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Сураи ${displayName} (${surahNumber}) - Тарҷума ва Тафсир`,
      description,
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title: `Сураи ${displayName} (${surahNumber}) - Тарҷума ва Тафсир`,
      description,
    },
  };
}

export default function SurahLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


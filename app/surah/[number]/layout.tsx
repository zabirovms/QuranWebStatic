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
  const surahs = await getAllSurahs();
  const surah = surahs.find(s => s.number === surahNumber);

  const baseUrl = 'https://www.quran.tj';
  const canonicalUrl = `${baseUrl}/surah/${surahNumber}`;

  const title = `Сураи ${surahName} - Тарҷума ва Тафсири тоҷикӣ`;
  
  let description: string;
  if (surah) {
    const revelationTypeTajik = getRevelationTypeTajik(surah.revelationType);
    const revelationOrder = getRevelationOrder(surahNumber);
    
    if (revelationOrder) {
      description = `Хондани Сураи ${surahName} бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз ${surah.versesCount} оят иборат буда дар ${revelationTypeTajik} нозил шудааст. Тартиби нузулаш ${revelationOrder}-умин сура аст. Курони Карим - Тарчумаи точики`;
    } else {
      description = `Хондани Сураи ${surahName} бо тафсир ва тарҷумаи тоҷикӣ. Ин сура аз ${surah.versesCount} оят иборат буда дар ${revelationTypeTajik} нозил шудааст. Курони Карим - Тарчумаи точики`;
    }
  } else {
    description = `Сураи ${surahName} бо тафсир ва тарҷумаи тоҷикӣ`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Сураи ${surahName} - Тарҷума ва Тафсир`,
      description,
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary',
      title: `Сураи ${surahName} - Тарҷума ва Тафсир`,
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


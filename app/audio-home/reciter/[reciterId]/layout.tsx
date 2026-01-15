import type { Metadata } from 'next';
import { getReciterById } from '@/lib/data/reciter-data';
import { getReciters } from '@/lib/data/reciter-data';

type Props = {
  params: { reciterId: string };
};

export async function generateStaticParams() {
  const reciters = await getReciters();
  return reciters.map((reciter) => ({
    reciterId: reciter.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const reciterId = params.reciterId;
  const reciter = await getReciterById(reciterId);
  
  const baseUrl = 'https://www.quran.tj';
  const canonicalUrl = `${baseUrl}/audio-home/reciter/${reciterId}`;
  
  if (reciter) {
    const reciterName = reciter.nameTajik || reciter.name;
    const reciterNameArabic = reciter.nameArabic || '';
    const reciterNameEnglish = reciter.name || '';
    const hasVerseByVerse = reciter.hasVerseByVerse ? ' ва оят-ба-оят' : '';
    
    // Build multilingual description for better SEO across languages
    let description = `Гӯш кардани Қуръони Карим бо овози ${reciterName}. Таҷвид ва тартили пурра${hasVerseByVerse} бо қорӣ ${reciterName}.`;
    if (reciterNameArabic && reciterNameArabic !== reciterName) {
      description += ` ${reciterNameArabic}`;
    }
    if (reciterNameEnglish && reciterNameEnglish !== reciterName && reciterNameEnglish !== reciterNameArabic) {
      description += ` ${reciterNameEnglish}`;
    }
    
    return {
      title: `${reciterName} | Қории Қуръон`,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${reciterName} | Қории Қуръон`,
        description: `Гӯш кардани Қуръони Карим бо овози ${reciterName}. Таҷвид ва тартил.`,
        type: 'website',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary',
        title: `${reciterName} | Қории Қуръон`,
        description: `Гӯш кардани Қуръони Карим бо овози ${reciterName}.`,
      },
    };
  }
  
  // Fallback if reciter not found
  return {
    title: 'Қориҳои Қуръон',
    description: 'Гӯш кардани Қуръони Карим бо таҷвид ва тартил. Қориҳои Қуръони Карим.',
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ReciterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


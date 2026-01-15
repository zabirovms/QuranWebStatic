import type { Metadata } from 'next';

type Props = {
  params: { lessonId: string };
};

export async function generateStaticParams() {
  // Qaida has 8 lessons
  return Array.from({ length: 8 }, (_, i) => ({
    lessonId: String(i + 1),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lessonId = params.lessonId;
  
  return {
    title: `Дарси ${lessonId} | Қоидаи Бағдодӣ`,
    description: `Дарси ${lessonId} аз қоидаи хондани Қуръон. Омӯзиши ҳарфҳо, ҳаракатҳо ва қоидаҳои асосии хондани Қуръони Карим.`,
    alternates: {
      canonical: `https://www.quran.tj/qaida/lesson/${lessonId}`,
    },
    openGraph: {
      title: `Дарси ${lessonId} | Қоидаи Бағдодӣ`,
      description: `Дарси ${lessonId} аз қоидаи хондани Қуръон.`,
      type: 'website',
      url: `https://www.quran.tj/qaida/lesson/${lessonId}`,
    },
    twitter: {
      card: 'summary',
      title: `Дарси ${lessonId} | Қоидаи Бағдодӣ`,
      description: `Дарси ${lessonId} аз қоидаи хондани Қуръон.`,
    },
  };
}

export default function QaidaLessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


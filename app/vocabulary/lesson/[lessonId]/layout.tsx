import type { Metadata } from 'next';
import { getAllVocabularyLessons } from '@/lib/data/vocabulary-data';

type Props = {
  params: { lessonId: string };
};

export async function generateStaticParams() {
  const lessons = await getAllVocabularyLessons();
  return lessons.map((lesson) => ({
    lessonId: String(lesson.lessonId),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lessonId = params.lessonId;
  
  return {
    title: `Дарси ${lessonId} | Луғатҳои Қуръон`,
    description: `Дарси ${lessonId}-и луғатҳои Қуръон. Омӯзиши калимаҳои асосии Қуръони Карим.`,
    alternates: {
      canonical: `https://www.quran.tj/vocabulary/lesson/${lessonId}`,
    },
    openGraph: {
      title: `Дарси ${lessonId} | Луғатҳои Қуръон`,
      description: `Дарси ${lessonId}-и луғатҳои Қуръон. Омӯзиши калимаҳои асосии Қуръони Карим.`,
      type: 'website',
      url: `https://www.quran.tj/vocabulary/lesson/${lessonId}`,
    },
    twitter: {
      card: 'summary',
      title: `Дарси ${lessonId} | Луғатҳои Қуръон`,
      description: `Дарси ${lessonId}-и луғатҳои Қуръон.`,
    },
  };
}

export default function VocabularyLessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


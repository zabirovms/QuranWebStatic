import { getAllVocabularyLessons } from '@/lib/data/vocabulary-data';

export async function generateStaticParams() {
  const lessons = await getAllVocabularyLessons();
  return lessons.map((lesson) => ({
    lessonId: String(lesson.lessonId),
  }));
}

export default function VocabularyLessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

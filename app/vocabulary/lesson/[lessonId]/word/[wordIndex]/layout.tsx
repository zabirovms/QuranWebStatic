import { getAllVocabularyLessons } from '@/lib/data/vocabulary-data';

export async function generateStaticParams() {
  const lessons = await getAllVocabularyLessons();
  const params: { lessonId: string; wordIndex: string }[] = [];
  
  for (const lesson of lessons) {
    for (let wordIndex = 0; wordIndex < lesson.words.length; wordIndex++) {
      params.push({
        lessonId: String(lesson.lessonId),
        wordIndex: String(wordIndex),
      });
    }
  }
  
  return params;
}

export default function VocabularyWordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

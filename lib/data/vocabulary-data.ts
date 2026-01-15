import { loadJson } from '@/lib/utils/data-loader';
import { VocabularyData, VocabularyLesson } from '@/lib/types/vocabulary';

let cachedData: VocabularyData | null = null;

export async function getVocabularyData(): Promise<VocabularyData> {
  if (cachedData) {
    return cachedData;
  }

  const data = await loadJson<VocabularyData>('85quranic-words.json');
  cachedData = data;
  return data;
}

export async function getVocabularyLesson(lessonId: number): Promise<VocabularyLesson | null> {
  const data = await getVocabularyData();
  return data.lessons.find(l => l.lessonId === lessonId) || null;
}

export async function getAllVocabularyLessons(): Promise<VocabularyLesson[]> {
  const data = await getVocabularyData();
  return data.lessons;
}


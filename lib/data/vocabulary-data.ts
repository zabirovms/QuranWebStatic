import { loadJson } from '@/lib/utils/data-loader';
import { VocabularyData, VocabularyLesson, VocabularyWord } from '@/lib/types/vocabulary';

// Raw JSON types (matching the actual JSON structure)
interface RawVocabularyWord {
  arabic: string;
  tajik: string;
  note: string;
  example_arabic: string;
  example_tajik: string;
  reference: string;
  audio_path?: string;
}

interface RawVocabularyLesson {
  lesson_id: number;
  title: string;
  words: RawVocabularyWord[];
}

interface RawVocabularyData {
  lessons: RawVocabularyLesson[];
}

let cachedData: VocabularyData | null = null;

// Transform raw JSON to TypeScript interfaces
function transformWord(raw: RawVocabularyWord): VocabularyWord {
  return {
    arabic: raw.arabic || '',
    tajik: raw.tajik || '',
    note: raw.note || '',
    exampleArabic: raw.example_arabic || '',
    exampleTajik: raw.example_tajik || '',
    reference: raw.reference || '',
    audioPath: raw.audio_path && raw.audio_path.trim() !== '' ? raw.audio_path : undefined,
  };
}

function transformLesson(raw: RawVocabularyLesson): VocabularyLesson {
  return {
    lessonId: raw.lesson_id,
    title: raw.title,
    words: raw.words.map(transformWord),
  };
}

function transformData(raw: RawVocabularyData): VocabularyData {
  return {
    lessons: raw.lessons.map(transformLesson),
  };
}

export async function getVocabularyData(): Promise<VocabularyData> {
  if (cachedData) {
    return cachedData;
  }

  const rawData = await loadJson<RawVocabularyData>('85quranic-words.json');
  cachedData = transformData(rawData);
  return cachedData;
}

export async function getVocabularyLesson(lessonId: number): Promise<VocabularyLesson | null> {
  const data = await getVocabularyData();
  return data.lessons.find(l => l.lessonId === lessonId) || null;
}

export async function getAllVocabularyLessons(): Promise<VocabularyLesson[]> {
  const data = await getVocabularyData();
  return data.lessons;
}


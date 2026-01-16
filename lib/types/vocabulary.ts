export interface VocabularyWord {
  arabic: string;
  tajik: string;
  note: string;
  exampleArabic: string;
  exampleTajik: string;
  reference: string;
  audioPath?: string;
}

export interface VocabularyLesson {
  lessonId: number;
  title: string;
  words: VocabularyWord[];
}

export interface VocabularyData {
  lessons: VocabularyLesson[];
}


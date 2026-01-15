export interface QaidaModule {
  moduleId: number;
  moduleTitle: string;
  lessons: QaidaLesson[];
}

export interface QaidaLesson {
  id: number;
  title: string;
  lessonType: string;
  difficulty: string;
  estimatedMinutes?: number;
  tags: string[];
  objectives: string[];
  content: QaidaContentBlock[];
  nextLessonId?: number;
}

export interface QaidaContentBlock {
  subtype: string;
  textKey?: string;
  audioKey?: string;
  letters?: QaidaLetter[];
  vowels?: QaidaVowel[];
  examples?: QaidaSyllableExample[];
  quizType?: string;
  config?: Record<string, any>;
}

export interface QaidaLetter {
  id: string;
  letter: string;
  name?: string;
  pronunciation?: string;
  forms?: Record<string, string>;
  examples?: Record<string, string>;
}

export interface QaidaVowel {
  id: string;
  symbol: string;
  nameKey?: string;
  category?: string;
}

export interface QaidaSyllableExample {
  id: string;
  letter: string;
  vowel: string;
  syllable: string;
  combined?: string;
  withFatha?: boolean;
}


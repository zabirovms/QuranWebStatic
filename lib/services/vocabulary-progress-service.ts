// Vocabulary Progress Service - tracks completed words and lessons
const KEY_COMPLETED_WORDS = 'vocabulary_completed_words';
const KEY_COMPLETED_LESSONS = 'vocabulary_completed_lessons';
const KEY_QUIZ_SCORES = 'vocabulary_quiz_scores';

export class VocabularyProgressService {
  // Mark a word as completed
  markWordCompleted(lessonId: number, arabicWord: string): void {
    const completedWords = this.getCompletedWords();
    const key = `${lessonId}_${arabicWord}`;
    if (!completedWords.has(key)) {
      completedWords.add(key);
      localStorage.setItem(KEY_COMPLETED_WORDS, JSON.stringify(Array.from(completedWords)));
    }
  }

  // Check if a word is completed
  isWordCompleted(lessonId: number, arabicWord: string): boolean {
    const completedWords = this.getCompletedWords();
    const key = `${lessonId}_${arabicWord}`;
    return completedWords.has(key);
  }

  // Get all completed words
  getCompletedWords(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    const wordsJson = localStorage.getItem(KEY_COMPLETED_WORDS);
    if (!wordsJson) return new Set();
    try {
      const words = JSON.parse(wordsJson) as string[];
      return new Set(words);
    } catch {
      return new Set();
    }
  }

  // Get completed words count for a lesson
  getLessonCompletedCount(lessonId: number, totalWords: number): number {
    const completedWords = this.getCompletedWords();
    let count = 0;
    for (const word of completedWords) {
      if (word.startsWith(`${lessonId}_`)) {
        count++;
      }
    }
    // Ensure count never exceeds total words
    return count > totalWords ? totalWords : count;
  }

  // Get completed words count by checking each word in the lesson
  // This is more accurate as it verifies words actually exist in the lesson
  getLessonCompletedCountForWords(lessonId: number, lessonWords: string[]): number {
    let count = 0;
    for (const arabicWord of lessonWords) {
      if (this.isWordCompleted(lessonId, arabicWord)) {
        count++;
      }
    }
    return count;
  }

  // Mark a lesson as completed
  markLessonCompleted(lessonId: number): void {
    const completedLessons = this.getCompletedLessons();
    completedLessons.add(lessonId);
    localStorage.setItem(
      KEY_COMPLETED_LESSONS,
      JSON.stringify(Array.from(completedLessons))
    );
  }

  // Check if a lesson is completed
  isLessonCompleted(lessonId: number): boolean {
    const completedLessons = this.getCompletedLessons();
    return completedLessons.has(lessonId);
  }

  // Get all completed lessons
  getCompletedLessons(): Set<number> {
    if (typeof window === 'undefined') return new Set();
    const lessonsJson = localStorage.getItem(KEY_COMPLETED_LESSONS);
    if (!lessonsJson) return new Set();
    try {
      const lessons = JSON.parse(lessonsJson) as number[];
      return new Set(lessons);
    } catch {
      return new Set();
    }
  }

  // Save quiz score for a lesson
  saveQuizScore(lessonId: number, score: number, total: number): void {
    const scores = this.getQuizScores();
    scores[lessonId.toString()] = {
      score,
      total,
      percentage: Math.round((score / total) * 100),
      timestamp: Date.now(),
    };
    localStorage.setItem(KEY_QUIZ_SCORES, JSON.stringify(scores));
  }

  // Get quiz score for a lesson
  getQuizScore(lessonId: number): { score: number; total: number; percentage: number; timestamp: number } | null {
    const scores = this.getQuizScores();
    const score = scores[lessonId.toString()];
    return score || null;
  }

  // Get all quiz scores
  getQuizScores(): Record<string, { score: number; total: number; percentage: number; timestamp: number }> {
    if (typeof window === 'undefined') return {};
    const scoresJson = localStorage.getItem(KEY_QUIZ_SCORES);
    if (!scoresJson) return {};
    try {
      return JSON.parse(scoresJson);
    } catch {
      return {};
    }
  }

  // Reset progress for a lesson
  resetLessonProgress(lessonId: number): void {
    const completedWords = this.getCompletedWords();
    const completedLessons = this.getCompletedLessons();
    const scores = this.getQuizScores();
    
    // Remove words for this lesson
    const wordsToRemove: string[] = [];
    for (const word of completedWords) {
      if (word.startsWith(`${lessonId}_`)) {
        wordsToRemove.push(word);
      }
    }
    for (const word of wordsToRemove) {
      completedWords.delete(word);
    }
    
    // Remove lesson completion
    completedLessons.delete(lessonId);
    
    // Remove quiz score
    delete scores[lessonId.toString()];
    
    localStorage.setItem(KEY_COMPLETED_WORDS, JSON.stringify(Array.from(completedWords)));
    localStorage.setItem(KEY_COMPLETED_LESSONS, JSON.stringify(Array.from(completedLessons)));
    localStorage.setItem(KEY_QUIZ_SCORES, JSON.stringify(scores));
  }
}

export const vocabularyProgressService = new VocabularyProgressService();


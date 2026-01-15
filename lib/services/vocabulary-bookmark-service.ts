// Vocabulary Bookmark Service - manages bookmarked words
import { VocabularyData, VocabularyWord } from '@/lib/types/vocabulary';

const KEY_BOOKMARKS = 'vocab_bookmarks';

export class VocabularyBookmarkService {
  // Bookmark a word
  bookmarkWord(lessonId: number, arabicWord: string): void {
    const bookmarks = this.getBookmarks();
    const lessonKey = lessonId.toString();
    
    if (!bookmarks[lessonKey]) {
      bookmarks[lessonKey] = [];
    }
    
    if (!bookmarks[lessonKey].includes(arabicWord)) {
      bookmarks[lessonKey].push(arabicWord);
      localStorage.setItem(KEY_BOOKMARKS, JSON.stringify(bookmarks));
    }
  }

  // Unbookmark a word
  unbookmarkWord(lessonId: number, arabicWord: string): void {
    const bookmarks = this.getBookmarks();
    const lessonKey = lessonId.toString();
    
    if (bookmarks[lessonKey]) {
      bookmarks[lessonKey] = bookmarks[lessonKey].filter((w: string) => w !== arabicWord);
      if (bookmarks[lessonKey].length === 0) {
        delete bookmarks[lessonKey];
      }
      localStorage.setItem(KEY_BOOKMARKS, JSON.stringify(bookmarks));
    }
  }

  // Check if a word is bookmarked
  isWordBookmarked(lessonId: number, arabicWord: string): boolean {
    const bookmarks = this.getBookmarks();
    const lessonKey = lessonId.toString();
    return bookmarks[lessonKey]?.includes(arabicWord) || false;
  }

  // Get all bookmarked words
  getAllBookmarkedWords(vocabularyData: VocabularyData): Array<{
    lessonId: number;
    lessonTitle: string;
    word: VocabularyWord;
  }> {
    const bookmarks = this.getBookmarks();
    const bookmarkedWords: Array<{
      lessonId: number;
      lessonTitle: string;
      word: VocabularyWord;
    }> = [];

    for (const [lessonKey, arabicWords] of Object.entries(bookmarks)) {
      const lessonId = parseInt(lessonKey, 10);
      if (isNaN(lessonId)) continue;

      const lesson = vocabularyData.lessons.find((l) => l.lessonId === lessonId);
      if (!lesson) continue;

      const words = arabicWords as string[];
      for (const arabicWord of words) {
        const word = lesson.words.find((w) => w.arabic === arabicWord);
        if (word) {
          bookmarkedWords.push({
            lessonId,
            lessonTitle: lesson.title,
            word,
          });
        }
      }
    }

    return bookmarkedWords;
  }

  // Get bookmarked words count
  getBookmarkedWordsCount(): number {
    const bookmarks = this.getBookmarks();
    let count = 0;
    for (const words of Object.values(bookmarks)) {
      count += (words as string[]).length;
    }
    return count;
  }

  // Get bookmarks (internal)
  private getBookmarks(): Record<string, string[]> {
    if (typeof window === 'undefined') return {};
    const bookmarksJson = localStorage.getItem(KEY_BOOKMARKS);
    if (!bookmarksJson) return {};
    try {
      return JSON.parse(bookmarksJson);
    } catch {
      return {};
    }
  }
}

export const vocabularyBookmarkService = new VocabularyBookmarkService();


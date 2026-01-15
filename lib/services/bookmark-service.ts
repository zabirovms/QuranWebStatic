/**
 * Bookmark Service
 * Manages verse bookmarks using localStorage
 */

export interface Bookmark {
  id: string;
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  tajikText: string;
  createdAt: string;
  uniqueKey: string; // surahNumber:verseNumber
}

const STORAGE_KEY = 'quran_bookmarks';

export class BookmarkService {
  private static instance: BookmarkService;
  private bookmarks: Bookmark[] = [];

  private constructor() {
    this.loadBookmarks();
  }

  static getInstance(): BookmarkService {
    if (!BookmarkService.instance) {
      BookmarkService.instance = new BookmarkService();
    }
    return BookmarkService.instance;
  }

  private loadBookmarks(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.bookmarks = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      this.bookmarks = [];
    }
  }

  private saveBookmarks(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }

  getAllBookmarks(): Bookmark[] {
    return [...this.bookmarks];
  }

  getBookmark(uniqueKey: string): Bookmark | undefined {
    return this.bookmarks.find(b => b.uniqueKey === uniqueKey);
  }

  isBookmarked(uniqueKey: string): boolean {
    return this.bookmarks.some(b => b.uniqueKey === uniqueKey);
  }

  addBookmark(
    surahNumber: number,
    verseNumber: number,
    arabicText: string,
    tajikText: string
  ): Bookmark {
    const uniqueKey = `${surahNumber}:${verseNumber}`;
    
    // Check if already bookmarked
    const existing = this.getBookmark(uniqueKey);
    if (existing) {
      return existing;
    }

    const bookmark: Bookmark = {
      id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      surahNumber,
      verseNumber,
      arabicText,
      tajikText,
      createdAt: new Date().toISOString(),
      uniqueKey,
    };

    this.bookmarks.push(bookmark);
    this.saveBookmarks();
    return bookmark;
  }

  removeBookmark(uniqueKey: string): boolean {
    const index = this.bookmarks.findIndex(b => b.uniqueKey === uniqueKey);
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      this.saveBookmarks();
      return true;
    }
    return false;
  }

  toggleBookmark(
    surahNumber: number,
    verseNumber: number,
    arabicText: string,
    tajikText: string
  ): boolean {
    const uniqueKey = `${surahNumber}:${verseNumber}`;
    
    if (this.isBookmarked(uniqueKey)) {
      this.removeBookmark(uniqueKey);
      return false;
    } else {
      this.addBookmark(surahNumber, verseNumber, arabicText, tajikText);
      return true;
    }
  }

  hasAnyBookmarks(): boolean {
    return this.bookmarks.length > 0;
  }

  getBookmarkCount(): number {
    return this.bookmarks.length;
  }
}


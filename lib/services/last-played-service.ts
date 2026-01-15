/**
 * Service for managing last played audio (reciter and surah)
 * Matches Flutter's LastPlayedService
 */

const KEY_RECITER_ID = 'last_played_reciter_id';
const KEY_SURAH_NUMBER = 'last_played_surah_number';
const KEY_VERSE_NUMBER = 'last_played_verse_number';
const KEY_TIMESTAMP = 'last_played_timestamp';

export class LastPlayedService {
  // Save last played item
  async saveLastPlayed(params: {
    reciterId: string;
    surahNumber: number;
    verseNumber?: number;
  }): Promise<void> {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(KEY_RECITER_ID, params.reciterId);
    localStorage.setItem(KEY_SURAH_NUMBER, params.surahNumber.toString());
    if (params.verseNumber !== undefined) {
      localStorage.setItem(KEY_VERSE_NUMBER, params.verseNumber.toString());
    } else {
      localStorage.removeItem(KEY_VERSE_NUMBER);
    }
    localStorage.setItem(KEY_TIMESTAMP, Date.now().toString());
  }

  // Get last played reciter ID
  async getLastPlayedReciterId(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(KEY_RECITER_ID);
  }

  // Get last played surah number
  async getLastPlayedSurahNumber(): Promise<number | null> {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(KEY_SURAH_NUMBER);
    return value ? parseInt(value, 10) : null;
  }

  // Get last played verse number
  async getLastPlayedVerseNumber(): Promise<number | null> {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(KEY_VERSE_NUMBER);
    return value ? parseInt(value, 10) : null;
  }

  // Get last played timestamp
  async getLastPlayedTimestamp(): Promise<Date | null> {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(KEY_TIMESTAMP);
    if (value) {
      return new Date(parseInt(value, 10));
    }
    return null;
  }

  // Clear last played
  async clearLastPlayed(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY_RECITER_ID);
    localStorage.removeItem(KEY_SURAH_NUMBER);
    localStorage.removeItem(KEY_VERSE_NUMBER);
    localStorage.removeItem(KEY_TIMESTAMP);
  }
}


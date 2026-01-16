/**
 * Client-side word-by-word data loader
 * Loads and caches qpc-hafs-word-by-word.json for word-by-word functionality
 */

import { loadJson } from '@/lib/utils/data-loader-client';

interface WordData {
  id: number;
  surah: string;
  ayah: string;
  word: string;
  location: string;
  text: string;
}

type WordByWordData = Record<string, WordData>;

let wordDataCache: WordByWordData | null = null;
let isLoading = false;
let loadPromise: Promise<WordByWordData> | null = null;

/**
 * Load word-by-word data (cached)
 */
export async function loadWordByWordData(): Promise<WordByWordData> {
  if (wordDataCache) {
    return wordDataCache;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  loadPromise = loadJson<WordByWordData>('qpc-hafs-word-by-word.json')
    .then((data) => {
      wordDataCache = data;
      isLoading = false;
      return data;
    })
    .catch((error) => {
      isLoading = false;
      loadPromise = null;
      throw error;
    });

  return loadPromise;
}

/**
 * Get words for a specific verse
 */
export async function getWordsForVerse(
  surahNumber: number,
  verseNumber: number
): Promise<WordData[]> {
  const data = await loadWordByWordData();
  const words: WordData[] = [];

  // Find all words for this surah:verse combination
  const prefix = `${surahNumber}:${verseNumber}:`;
  
  for (const key in data) {
    if (key.startsWith(prefix)) {
      words.push(data[key]);
    }
  }

  // Sort by word number
  words.sort((a, b) => parseInt(a.word) - parseInt(b.word));

  return words;
}

/**
 * Get a specific word by surah, verse, and word number
 */
export async function getWord(
  surahNumber: number,
  verseNumber: number,
  wordNumber: number
): Promise<WordData | null> {
  const data = await loadWordByWordData();
  const key = `${surahNumber}:${verseNumber}:${wordNumber}`;
  return data[key] || null;
}

/**
 * Build word audio URL from CDN
 */
export function buildWordAudioUrl(
  surahNumber: number,
  verseNumber: number,
  wordNumber: number
): string {
  const surah = surahNumber.toString().padStart(3, '0');
  const verse = verseNumber.toString().padStart(3, '0');
  const word = wordNumber.toString().padStart(3, '0');
  return `https://cdn.quran.tj/quran-audio-wbw/${surah}/${surah}_${verse}_${word}.mp3`;
}

/**
 * Reconstruct Arabic text for a verse from word data
 * This joins all words in order to create the full verse text
 */
export async function getArabicTextForVerse(
  surahNumber: number,
  verseNumber: number
): Promise<string> {
  const words = await getWordsForVerse(surahNumber, verseNumber);
  
  if (words.length === 0) {
    return '';
  }
  
  // Join words with space, but preserve the original word text formatting
  // Filter out verse number symbols (like "١") that might be in word data
  const verseText = words
    .map((word) => word.text.trim())
    .filter((text) => {
      // Filter out standalone Arabic-Indic numerals (verse number markers)
      // These are typically single characters like "١", "٢", etc.
      const isVerseNumber = /^[\u0660-\u0669]+$/.test(text);
      return !isVerseNumber;
    })
    .join(' ');
  
  return verseText;
}

/**
 * Get Arabic text for all verses in a surah
 * Returns a map of verseNumber -> arabicText
 */
export async function getArabicTextsForSurah(
  surahNumber: number
): Promise<Map<number, string>> {
  const data = await loadWordByWordData();
  const verseMap = new Map<number, WordData[]>();
  
  // Group words by verse number
  const prefix = `${surahNumber}:`;
  for (const key in data) {
    if (key.startsWith(prefix)) {
      const word = data[key];
      const verseNum = parseInt(word.ayah);
      if (!verseMap.has(verseNum)) {
        verseMap.set(verseNum, []);
      }
      verseMap.get(verseNum)!.push(word);
    }
  }
  
  // Sort words in each verse and reconstruct text
  const result = new Map<number, string>();
  for (const [verseNum, words] of verseMap.entries()) {
    words.sort((a, b) => parseInt(a.word) - parseInt(b.word));
    const verseText = words
      .map((word) => word.text.trim())
      .filter((text) => {
        // Filter out standalone Arabic-Indic numerals (verse number markers)
        const isVerseNumber = /^[\u0660-\u0669]+$/.test(text);
        return !isVerseNumber;
      })
      .join(' ');
    result.set(verseNum, verseText);
  }
  
  return result;
}

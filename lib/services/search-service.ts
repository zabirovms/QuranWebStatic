/**
 * Search Service
 * Enhanced search functionality for Quran text
 */

import { Verse, Surah } from '@/lib/types';

export interface SearchResult {
  type: 'surah' | 'verse';
  data: Surah | Verse;
  relevance: number;
  matchedFields: string[];
}

/**
 * Normalize text for better matching
 */
function normalizeText(text: string): string {
  // Check if text contains Arabic characters
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  
  if (hasArabic) {
    // For Arabic text, return as-is for exact matching
    return text;
  }
  
  // For non-Arabic text, apply normalization
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF\u0400-\u04FF]/g, '') // Keep Arabic, Cyrillic, and alphanumeric
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Check if text contains Arabic characters
 */
function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Calculate relevance score for a match
 */
function calculateRelevance(
  text: string,
  query: string,
  isExact: boolean = false,
  isStart: boolean = false
): number {
  if (isExact) return 100;
  if (isStart) return 80;
  if (text.toLowerCase().includes(query.toLowerCase())) return 60;
  return 40;
}

/**
 * Search surahs
 */
export function searchSurahs(surahs: Surah[], query: string): SearchResult[] {
  if (!query.trim() || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = normalizeText(query);
  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const surah of surahs) {
    let relevance = 0;
    const matchedFields: string[] = [];

    // Search in surah name (Tajik)
    if (surah.nameTajik.toLowerCase().includes(queryLower)) {
      const isExact = surah.nameTajik.toLowerCase() === queryLower;
      const isStart = surah.nameTajik.toLowerCase().startsWith(queryLower);
      relevance += calculateRelevance(surah.nameTajik, query, isExact, isStart);
      matchedFields.push('nameTajik');
    }

    // Search in surah name (Arabic)
    if (surah.nameArabic.includes(query)) {
      const isExact = surah.nameArabic === query;
      const isStart = surah.nameArabic.startsWith(query);
      relevance += calculateRelevance(surah.nameArabic, query, isExact, isStart);
      matchedFields.push('nameArabic');
    }

    // Search in surah name (English)
    if (surah.nameEnglish && surah.nameEnglish.toLowerCase().includes(queryLower)) {
      const isExact = surah.nameEnglish.toLowerCase() === queryLower;
      const isStart = surah.nameEnglish.toLowerCase().startsWith(queryLower);
      relevance += calculateRelevance(surah.nameEnglish, query, isExact, isStart);
      matchedFields.push('nameEnglish');
    }

    // Search in surah number
    if (surah.number.toString().includes(query)) {
      relevance += 50;
      matchedFields.push('number');
    }

    if (relevance > 0) {
      results.push({
        type: 'surah',
        data: surah,
        relevance,
        matchedFields,
      });
    }
  }

  // Sort by relevance (highest first)
  results.sort((a, b) => b.relevance - a.relevance);

  return results;
}

/**
 * Search verses with enhanced algorithm
 */
export function searchVerses(
  verses: Verse[],
  query: string,
  options: {
    language?: 'arabic' | 'transliteration' | 'tajik' | 'tj2' | 'tj3' | 'farsi' | 'russian' | 'both';
    surahId?: number;
    maxResults?: number;
  } = {}
): SearchResult[] {
  if (!query.trim() || query.trim().length < 2) {
    return [];
  }

  const {
    language = 'both',
    surahId,
    maxResults = 100,
  } = options;

  const normalizedQuery = normalizeText(query);
  const queryLower = query.toLowerCase();
  const queryHasArabic = hasArabic(query);
  const results: SearchResult[] = [];

  for (const verse of verses) {
    // Filter by surah if specified
    if (surahId !== undefined && verse.surahId !== surahId) {
      continue;
    }

    let relevance = 0;
    const matchedFields: string[] = [];
    let matches = false;

    // Search based on language preference
    switch (language) {
      case 'arabic':
        if (verse.arabicText.includes(query)) {
          const isExact = verse.arabicText === query;
          const isStart = verse.arabicText.startsWith(query);
          relevance += calculateRelevance(verse.arabicText, query, isExact, isStart);
          matchedFields.push('arabicText');
          matches = true;
        }
        break;

      case 'transliteration':
        if (verse.transliteration?.toLowerCase().includes(queryLower)) {
          const isExact = verse.transliteration.toLowerCase() === queryLower;
          const isStart = verse.transliteration.toLowerCase().startsWith(queryLower);
          relevance += calculateRelevance(verse.transliteration, query, isExact, isStart);
          matchedFields.push('transliteration');
          matches = true;
        }
        break;

      case 'tajik':
        if (verse.tajikText.toLowerCase().includes(queryLower)) {
          const isExact = verse.tajikText.toLowerCase() === queryLower;
          const isStart = verse.tajikText.toLowerCase().startsWith(queryLower);
          relevance += calculateRelevance(verse.tajikText, query, isExact, isStart);
          matchedFields.push('tajikText');
          matches = true;
        }
        break;

      case 'tj2':
        if (verse.tj2?.toLowerCase().includes(queryLower)) {
          const isExact = verse.tj2.toLowerCase() === queryLower;
          const isStart = verse.tj2.toLowerCase().startsWith(queryLower);
          relevance += calculateRelevance(verse.tj2, query, isExact, isStart);
          matchedFields.push('tj2');
          matches = true;
        }
        break;

      case 'tj3':
        if (verse.tj3?.toLowerCase().includes(queryLower)) {
          const isExact = verse.tj3.toLowerCase() === queryLower;
          const isStart = verse.tj3.toLowerCase().startsWith(queryLower);
          relevance += calculateRelevance(verse.tj3, query, isExact, isStart);
          matchedFields.push('tj3');
          matches = true;
        }
        break;

      case 'farsi':
        if (verse.farsi?.toLowerCase().includes(queryLower)) {
          const isExact = verse.farsi.toLowerCase() === queryLower;
          const isStart = verse.farsi.toLowerCase().startsWith(queryLower);
          relevance += calculateRelevance(verse.farsi, query, isExact, isStart);
          matchedFields.push('farsi');
          matches = true;
        }
        break;

      case 'russian':
        if (verse.russian?.toLowerCase().includes(queryLower)) {
          const isExact = verse.russian.toLowerCase() === queryLower;
          const isStart = verse.russian.toLowerCase().startsWith(queryLower);
          relevance += calculateRelevance(verse.russian, query, isExact, isStart);
          matchedFields.push('russian');
          matches = true;
        }
        break;

      case 'both':
      default:
        // If query is Arabic, prioritize Arabic text matching
        if (queryHasArabic) {
          // For Arabic queries, require match in Arabic text
          if (verse.arabicText.includes(query)) {
            const isExact = verse.arabicText === query;
            const isStart = verse.arabicText.startsWith(query);
            relevance += calculateRelevance(verse.arabicText, query, isExact, isStart);
            matchedFields.push('arabicText');
            matches = true;
          }
          // Also allow matches in transliteration as fallback
          if (!matches && verse.transliteration?.toLowerCase().includes(queryLower)) {
            const isExact = verse.transliteration.toLowerCase() === queryLower;
            const isStart = verse.transliteration.toLowerCase().startsWith(queryLower);
            relevance += calculateRelevance(verse.transliteration, query, isExact, isStart) * 0.8;
            matchedFields.push('transliteration');
            matches = true;
          }
        } else {
          // For non-Arabic queries, search in all translations
          if (verse.arabicText.includes(query)) {
            const isExact = verse.arabicText === query;
            const isStart = verse.arabicText.startsWith(query);
            relevance += calculateRelevance(verse.arabicText, query, isExact, isStart);
            matchedFields.push('arabicText');
            matches = true;
          }
          if (verse.transliteration?.toLowerCase().includes(queryLower)) {
            const isExact = verse.transliteration.toLowerCase() === queryLower;
            const isStart = verse.transliteration.toLowerCase().startsWith(queryLower);
            relevance += calculateRelevance(verse.transliteration, query, isExact, isStart);
            matchedFields.push('transliteration');
            matches = true;
          }
          if (verse.tajikText.toLowerCase().includes(queryLower)) {
            const isExact = verse.tajikText.toLowerCase() === queryLower;
            const isStart = verse.tajikText.toLowerCase().startsWith(queryLower);
            relevance += calculateRelevance(verse.tajikText, query, isExact, isStart);
            matchedFields.push('tajikText');
            matches = true;
          }
          if (verse.tj2?.toLowerCase().includes(queryLower)) {
            const isExact = verse.tj2.toLowerCase() === queryLower;
            const isStart = verse.tj2.toLowerCase().startsWith(queryLower);
            relevance += calculateRelevance(verse.tj2, query, isExact, isStart);
            matchedFields.push('tj2');
            matches = true;
          }
          if (verse.tj3?.toLowerCase().includes(queryLower)) {
            const isExact = verse.tj3.toLowerCase() === queryLower;
            const isStart = verse.tj3.toLowerCase().startsWith(queryLower);
            relevance += calculateRelevance(verse.tj3, query, isExact, isStart);
            matchedFields.push('tj3');
            matches = true;
          }
          if (verse.farsi?.toLowerCase().includes(queryLower)) {
            const isExact = verse.farsi.toLowerCase() === queryLower;
            const isStart = verse.farsi.toLowerCase().startsWith(queryLower);
            relevance += calculateRelevance(verse.farsi, query, isExact, isStart);
            matchedFields.push('farsi');
            matches = true;
          }
          if (verse.russian?.toLowerCase().includes(queryLower)) {
            const isExact = verse.russian.toLowerCase() === queryLower;
            const isStart = verse.russian.toLowerCase().startsWith(queryLower);
            relevance += calculateRelevance(verse.russian, query, isExact, isStart);
            matchedFields.push('russian');
            matches = true;
          }
        }
        break;
    }

    // Additional verification: if query is Arabic, ensure the original Arabic text actually contains it
    if (matches && queryHasArabic) {
      if (!verse.arabicText.includes(query)) {
        matches = false;
        relevance = 0;
        matchedFields.length = 0;
      }
    }

    if (matches && relevance > 0) {
      results.push({
        type: 'verse',
        data: verse,
        relevance,
        matchedFields,
      });

      if (results.length >= maxResults) {
        break;
      }
    }
  }

  // Sort by relevance (highest first), then by surah and verse number
  results.sort((a, b) => {
    if (a.relevance !== b.relevance) {
      return b.relevance - a.relevance;
    }
    const verseA = a.data as Verse;
    const verseB = b.data as Verse;
    if (verseA.surahId !== verseB.surahId) {
      return verseA.surahId - verseB.surahId;
    }
    return verseA.verseNumber - verseB.verseNumber;
  });

  return results;
}

/**
 * Highlight search query in text
 */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;

  const queryHasArabic = hasArabic(query);
  const regex = queryHasArabic
    ? new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    : new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

  if (!text) return '';
  return text.replace(regex, '<mark>$1</mark>');
}


/**
 * Client-side alignment data loader
 * Loads word-by-word timestamp alignment data for reciters
 */

import { loadJson } from '@/lib/utils/data-loader-client';

/**
 * Alignment segment: [word_start_index, word_end_index, start_msec, end_msec]
 * - word_start_index: 0-based index of the word start
 * - word_end_index: 0-based index of the word end (exclusive)
 * - start_msec: Start time in milliseconds
 * - end_msec: End time in milliseconds
 */
export type AlignmentSegment = [number, number, number, number];

/**
 * Alignment data for a single verse
 */
export interface VerseAlignment {
  surah: number;
  ayah: number;
  segments: AlignmentSegment[];
  stats?: {
    deletions?: number;
    transpositions?: number;
    insertions?: number;
  };
}

/**
 * Map reciter IDs to alignment filenames
 */
const RECITER_ALIGNMENT_MAP: Record<string, string> = {
  'ar.alafasy': 'Alafasy_128kbps.json',
  'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps.json',
  'ar.shaatree': 'Abu_Bakr_Ash-Shaatree_128kbps.json',
  'ar.hanirifai': 'Hani_Rifai_192kbps.json',
  'ar.husary': 'Husary_64kbps.json',
  'ar.husarymujawwad': 'Husary_Muallim_128kbps.json',
  'ar.minshawimujawwad': 'Minshawy_Mujawwad_192kbps.json',
  'ar.minshawi': 'Minshawy_Murattal_128kbps.json',
  'ar.saoodshuraym': 'Saood_ash-Shuraym_128kbps.json',
  // Additional mappings if needed
  'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_64kbps.json',
  'ar.abdulbasitmujawwad': 'Abdul_Basit_Mujawwad_128kbps.json',
  'ar.mohammadaltablaway': 'Mohammad_al_Tablaway_128kbps.json',
};

/**
 * Cache for loaded alignment data
 */
const alignmentCache: Map<string, VerseAlignment[]> = new Map();

/**
 * Check if a reciter has alignment data available
 */
export function hasAlignmentData(reciterId: string): boolean {
  return reciterId.toLowerCase() in RECITER_ALIGNMENT_MAP;
}

/**
 * Get alignment filename for a reciter
 */
function getAlignmentFilename(reciterId: string): string | null {
  const filename = RECITER_ALIGNMENT_MAP[reciterId.toLowerCase()];
  return filename || null;
}

/**
 * Load alignment data for a reciter
 */
export async function loadAlignmentData(reciterId: string): Promise<VerseAlignment[]> {
  const filename = getAlignmentFilename(reciterId);
  if (!filename) {
    throw new Error(`No alignment data available for reciter: ${reciterId}`);
  }

  // Check cache first
  const cacheKey = reciterId.toLowerCase();
  if (alignmentCache.has(cacheKey)) {
    return alignmentCache.get(cacheKey)!;
  }

  try {
    // Load from public/data/reciters-wbw-timestamps/
    const dataPath = `reciters-wbw-timestamps/${filename}`;
    const data = await loadJson<VerseAlignment[]>(dataPath);
    
    // Cache the data
    alignmentCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Failed to load alignment data for ${reciterId}:`, error);
    throw error;
  }
}

/**
 * Get alignment data for a specific verse
 */
export async function getAlignmentForVerse(
  reciterId: string,
  surahNumber: number,
  verseNumber: number
): Promise<VerseAlignment | null> {
  try {
    const allAlignments = await loadAlignmentData(reciterId);
    const alignment = allAlignments.find(
      (a) => a.surah === surahNumber && a.ayah === verseNumber
    );
    return alignment || null;
  } catch (error) {
    console.error(`Failed to get alignment for verse ${surahNumber}:${verseNumber}:`, error);
    return null;
  }
}

/**
 * Get the current word index based on playback position
 * @param alignment Alignment data for the verse
 * @param currentTimeMs Current playback time in milliseconds
 * @returns Word index (0-based) or null if not found
 */
export function getCurrentWordIndex(
  alignment: VerseAlignment | null,
  currentTimeMs: number
): number | null {
  if (!alignment || !alignment.segments || alignment.segments.length === 0) {
    return null;
  }

  // Find the segment that contains the current time
  for (const segment of alignment.segments) {
    const [wordStartIndex, , startMsec, endMsec] = segment;
    
    // Check if current time is within this segment
    // Use >= for start and < for end to handle boundaries correctly
    if (currentTimeMs >= startMsec && currentTimeMs < endMsec) {
      return wordStartIndex;
    }
  }

  // If we're past the last segment, return the last word index
  const lastSegment = alignment.segments[alignment.segments.length - 1];
  if (lastSegment && currentTimeMs >= lastSegment[3]) {
    return lastSegment[0];
  }

  // If we're before the first segment, return null
  const firstSegment = alignment.segments[0];
  if (firstSegment && currentTimeMs < firstSegment[2]) {
    return null;
  }

  return null;
}

/**
 * Convert word index (0-based from alignment) to word number (1-based for qpc-hafs)
 */
export function wordIndexToWordNumber(wordIndex: number | null): number | null {
  if (wordIndex === null) return null;
  return wordIndex + 1;
}

/**
 * Convert word number (1-based for qpc-hafs) to word index (0-based from alignment)
 */
export function wordNumberToWordIndex(wordNumber: number): number {
  return wordNumber - 1;
}

/**
 * Get the start time (in seconds) for a specific word in a verse
 * @param alignment Alignment data for the verse
 * @param wordNumber Word number (1-based)
 * @returns Start time in seconds, or null if not found
 */
export function getWordStartTime(
  alignment: VerseAlignment | null,
  wordNumber: number
): number | null {
  if (!alignment || !alignment.segments || alignment.segments.length === 0) {
    return null;
  }

  const wordIndex = wordNumberToWordIndex(wordNumber);

  // Find the segment that starts with this word index
  for (const segment of alignment.segments) {
    const [wordStartIndex, , startMsec] = segment;
    
    if (wordStartIndex === wordIndex) {
      // Convert milliseconds to seconds
      return startMsec / 1000;
    }
  }

  return null;
}

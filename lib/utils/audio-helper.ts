/**
 * Helper functions for audio playback
 */

/**
 * Calculate global ayah number from surah and verse number
 * Based on Flutter's _globalAyahNumber function
 */
export function getGlobalAyahNumber(surahNumber: number, verseNumber: number): number {
  // Cumulative verse counts for each surah (1-114)
  const versesPerSurah = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
  ];
  
  let globalAyah = 0;
  for (let i = 0; i < surahNumber - 1; i++) {
    globalAyah += versesPerSurah[i];
  }
  globalAyah += verseNumber;
  return globalAyah;
}

/**
 * Get bitrate for verse-by-verse audio
 * Based on Flutter's AudioManifestServiceV2.getVerseByVerseBitrate
 */
export function getVerseByVerseBitrate(reciterId: string): number {
  const bitrateMap: { [key: string]: number } = {
    // 192 kbps
    'ar.abdulbasitmurattal': 192,
    'ar.abdullahbasfar': 192,
    'ar.abdurrahmaansudais': 192,
    'ar.hanirifai': 192,
    'en.walk': 192,
    // 64 kbps
    'ar.abdulsamad': 64,
    'ar.aymanswoaid': 64,
    'ar.minshawimujawwad': 64,
    'ar.saoodshuraym': 64,
    'ur.khan': 64,
    // 32 kbps
    'ar.ibrahimakhbar': 32,
    // 40 kbps
    'fa.hedayatfarfooladvand': 40,
  };
  
  return bitrateMap[reciterId.toLowerCase()] ?? 128; // Default 128 kbps
}

/**
 * Build verse-by-verse audio URL
 * Based on Flutter's AudioUrlBuilder.buildVerseUrl
 */
export function buildVerseAudioUrl(reciterId: string, surahNumber: number, verseNumber: number): string {
  const globalAyah = getGlobalAyahNumber(surahNumber, verseNumber);
  const bitrate = getVerseByVerseBitrate(reciterId);
  return `https://cdn.islamic.network/quran/audio/${bitrate}/${reciterId}/${globalAyah}.mp3`;
}

/**
 * Hardcoded list of reciter IDs that support verse-by-verse audio
 * Based on Flutter's AudioManifestServiceV2.verseByVerseReciterIds
 */
const VERSE_BY_VERSE_RECITER_IDS = new Set([
  // 128 kbps
  'ar.ahmedajamy',
  'ar.alafasy',
  'ar.hudhaify',
  'ar.husary',
  'ar.husarymujawwad',
  'ar.mahermuaiqly',
  'ar.minshawi',
  'ar.muhammadayyoub',
  'ar.muhammadjibreel',
  'ar.shaatree',
  // 192 kbps
  'ar.abdulbasitmurattal',
  'ar.abdullahbasfar',
  'ar.abdurrahmaansudais',
  'ar.hanirifai',
  // 32 kbps
  'ar.ibrahimakhbar',
  // 64 kbps
  'ar.abdulsamad',
  'ar.aymanswoaid',
  'ar.minshawimujawwad',
  'ar.saoodshuraym',
  // Translations with verse-by-verse
  'fr.leclerc',
  'ru.kuliev-audio',
  'zh.chinese',
  'en.walk',
  'fa.hedayatfarfooladvand',
  'ur.khan',
]);

/**
 * Check if a reciter supports verse-by-verse audio
 * @param reciterId The reciter ID to check
 * @param hasVerseByVerse Optional flag from reciter data
 * @returns true if the reciter supports verse-by-verse playback
 */
export function supportsVerseByVerse(reciterId: string, hasVerseByVerse?: boolean): boolean {
  // First check the explicit flag
  if (hasVerseByVerse === true) {
    return true;
  }
  
  // Then check the hardcoded list
  return VERSE_BY_VERSE_RECITER_IDS.has(reciterId.toLowerCase());
}

/**
 * Check if a reciter is a translation (not starting with 'ar.')
 * @param reciterId The reciter ID to check
 * @returns true if it's a translation
 */
export function isTranslation(reciterId: string): boolean {
  return !reciterId.startsWith('ar.');
}

/**
 * Check if a reciter is a verse-by-verse translation
 * (translation that only supports verse-by-verse, not full surah)
 * @param reciterId The reciter ID to check
 * @param hasVerseByVerse Optional flag from reciter data
 * @returns true if it's a verse-by-verse translation
 */
export function isVerseByVerseTranslation(reciterId: string, hasVerseByVerse?: boolean): boolean {
  // Must be a translation (not starting with 'ar.')
  if (reciterId.startsWith('ar.')) {
    return false;
  }
  
  // Check if it supports verse-by-verse
  return supportsVerseByVerse(reciterId, hasVerseByVerse);
}


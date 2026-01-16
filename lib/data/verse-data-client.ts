import { loadCompressedJson } from '@/lib/utils/data-loader-client';
import { Verse } from '@/lib/types';
import { getArabicTextsForSurah } from '@/lib/data/word-by-word-data-client';

interface AlQuranCloudAyah {
  number: number;
  numberInSurah: number;
  text: string;
  page?: number;
  juz?: number;
}

interface AlQuranCloudSurah {
  number: number;
  ayahs: AlQuranCloudAyah[];
}

interface TranslationAyah {
  number: number;
  text?: string; // Some formats use 'text'
  tajik_text?: string; // Some formats use 'tajik_text'
  transliteration?: string;
  tafsir?: string;
}

interface TranslationSurah {
  number: number;
  ayahs: TranslationAyah[];
}

interface TranslationData {
  data: {
    surahs: TranslationSurah[];
  };
}

interface VerseDataByKey {
  [surahKey: string]: Array<{
    verse: number;
    text: string;
  }>;
}

let cachedVerses: Map<number, Verse[]> = new Map();
let allVersesCache: Verse[] | null = null;

/**
 * Get all verses (client-side)
 */
export async function getAllVerses(): Promise<Verse[]> {
  if (allVersesCache) {
    return allVersesCache;
  }

  try {
    // Load Arabic text from word-by-word data instead of alquran_cloud_complete_quran.json.gz
    // Still need alquran_cloud for page/juz info and verse numbering
    const [arabicData, translationsData, tj2Data, tj3Data, farsiData, russianData] = await Promise.all([
      loadCompressedJson<{ data: { surahs: AlQuranCloudSurah[] } }>('alquran_cloud_complete_quran.json.gz'),
      loadCompressedJson<TranslationData>('quran_mirror_with_translations.json.gz'),
      loadCompressedJson<VerseDataByKey>('quran_tj_2_AbuAlomuddin.json.gz'),
      loadCompressedJson<VerseDataByKey>('quran_tj_3_PioneersTranslationCenter.json.gz'),
      loadCompressedJson<VerseDataByKey>('quran_farsi_Farsi.json.gz'),
      loadCompressedJson<VerseDataByKey>('quran_ru.json.gz'),
    ]);

    const allVerses: Verse[] = [];

    // Load Arabic texts from word-by-word data for all surahs
    const arabicTextsBySurah = new Map<number, Map<number, string>>();
    
    for (const surahData of arabicData.data.surahs) {
      const surahNumber = surahData.number;
      try {
        const surahArabicTexts = await getArabicTextsForSurah(surahNumber);
        arabicTextsBySurah.set(surahNumber, surahArabicTexts);
      } catch (error) {
        console.warn(`Failed to load Arabic text from word-by-word data for surah ${surahNumber}:`, error);
        // Fallback: create empty map, will use empty string
        arabicTextsBySurah.set(surahNumber, new Map());
      }
    }

    for (const surahData of arabicData.data.surahs) {
      const surahNumber = surahData.number;
      const arabicAyahs = surahData.ayahs || [];
      const surahArabicTexts = arabicTextsBySurah.get(surahNumber) || new Map();

      const translationSurah = translationsData.data?.surahs?.find((s) => s.number === surahNumber);
      const surahKey = surahNumber.toString();

      const tj2Verses = tj2Data[surahKey] || [];
      const tj3Verses = tj3Data[surahKey] || [];
      const farsiVerses = farsiData[surahKey] || [];
      const russianVerses = russianData[surahKey] || [];

      const translationMap = new Map<number, TranslationAyah>();
      if (translationSurah) {
        translationSurah.ayahs.forEach((ayah) => {
          translationMap.set(ayah.number, ayah);
        });
      }

      const tj2Map = new Map<number, string>();
      tj2Verses.forEach((v) => {
        if (v.verse && v.text) tj2Map.set(v.verse, v.text);
      });

      const tj3Map = new Map<number, string>();
      tj3Verses.forEach((v) => {
        if (v.verse && v.text) tj3Map.set(v.verse, v.text);
      });

      const farsiMap = new Map<number, string>();
      farsiVerses.forEach((v) => {
        if (v.verse && v.text) farsiMap.set(v.verse, v.text);
      });

      const russianMap = new Map<number, string>();
      russianVerses.forEach((v) => {
        if (v.verse && v.text) russianMap.set(v.verse, v.text);
      });

      for (const arabicAyah of arabicAyahs) {
        const verseNum = arabicAyah.numberInSurah;
        const translation = translationMap.get(verseNum);
        
        // Get Arabic text from word-by-word data, fallback to empty string
        const arabicText = surahArabicTexts.get(verseNum) || '';

        allVerses.push({
          id: arabicAyah.number,
          surahId: surahNumber,
          verseNumber: verseNum,
          arabicText: arabicText,
          tajikText: translation?.tajik_text || translation?.text || '',
          transliteration: translation?.transliteration,
          tafsir: translation?.tafsir,
          tj2: tj2Map.get(verseNum),
          tj3: tj3Map.get(verseNum),
          farsi: farsiMap.get(verseNum),
          russian: russianMap.get(verseNum),
          page: arabicAyah.page,
          juz: arabicAyah.juz,
          uniqueKey: `${surahNumber}:${verseNum}`,
        });
      }
    }
    allVersesCache = allVerses;
    console.log('All verses processed, returning', allVerses.length, 'verses');
    return allVerses;
  } catch (error) {
    console.error('Error loading all verses:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error; // Re-throw to let the component handle it
  }
}

/**
 * Get all verses for a specific surah (client-side)
 */
export async function getVersesBySurah(surahNumber: number): Promise<Verse[]> {
  if (cachedVerses.has(surahNumber)) {
    return cachedVerses.get(surahNumber)!;
  }

  try {
    const allVerses = await getAllVerses();
    const surahVerses = allVerses.filter(v => v.surahId === surahNumber);
    cachedVerses.set(surahNumber, surahVerses);
    return surahVerses;
  } catch (error) {
    console.error(`Error loading verses for surah ${surahNumber}:`, error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw error; // Re-throw to let the component handle it
  }
}

// Alias for consistency with import names
export const getVersesBySurahClient = getVersesBySurah;

/**
 * Get a specific verse (client-side)
 */
export async function getVerse(surahNumber: number, verseNumber: number): Promise<Verse | null> {
  const verses = await getVersesBySurah(surahNumber);
  return verses.find(v => v.verseNumber === verseNumber) || null;
}



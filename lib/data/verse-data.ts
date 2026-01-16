import { loadCompressedJson, loadJson } from '@/lib/utils/data-loader';
import { Verse } from '@/lib/types';

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

/**
 * Load word-by-word data (server-side, cached)
 */
async function loadWordByWordData(): Promise<WordByWordData> {
  if (wordDataCache) {
    return wordDataCache;
  }
  try {
    wordDataCache = await loadJson<WordByWordData>('qpc-hafs-word-by-word.json');
    return wordDataCache;
  } catch (error) {
    console.error('Failed to load word-by-word data:', error);
    return {};
  }
}

/**
 * Get Arabic texts for all verses in a surah from word-by-word data
 */
async function getArabicTextsForSurah(surahNumber: number): Promise<Map<number, string>> {
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

let cachedVerses: Map<number, Verse[]> = new Map();

/**
 * Get all verses for a specific surah
 */
export async function getVersesBySurah(surahNumber: number): Promise<Verse[]> {
  if (cachedVerses.has(surahNumber)) {
    return cachedVerses.get(surahNumber)!;
  }
  try {
    const [arabicData, translationsData, tj2Data, tj3Data, farsiData, russianData] = await Promise.all([
      loadCompressedJson<{ data: { surahs: AlQuranCloudSurah[] } }>('alquran_cloud_complete_quran.json.gz'),
      loadCompressedJson<TranslationData>('quran_mirror_with_translations.json.gz'),
      loadCompressedJson<VerseDataByKey>('quran_tj_2_AbuAlomuddin.json.gz'),
      loadCompressedJson<VerseDataByKey>('quran_tj_3_PioneersTranslationCenter.json.gz'),
      loadCompressedJson<VerseDataByKey>('quran_farsi_Farsi.json.gz'),
      loadCompressedJson<VerseDataByKey>('quran_ru.json.gz'),
    ]);
  
  // Get Arabic text from word-by-word data instead of AlQuran Cloud
  let surahArabicTexts: Map<number, string>;
  try {
    surahArabicTexts = await getArabicTextsForSurah(surahNumber);
  } catch (error) {
    console.warn(`Failed to load Arabic text from word-by-word data for surah ${surahNumber}:`, error);
    surahArabicTexts = new Map();
  }
  
  // Get Arabic text from AlQuran Cloud format (for page/juz info and verse structure)
  const surahData = arabicData.data?.surahs?.find((s) => s.number === surahNumber);
  if (!surahData) {
    return [];
  }
  
  const arabicAyahs = surahData.ayahs || [];
  
  // Get translations - try both formats
  const translationSurah = translationsData.data?.surahs?.find((s) => s.number === surahNumber);
  const surahKey = surahNumber.toString();
  
  // Get additional translations
  const tj2Verses = tj2Data[surahKey] || [];
  const tj3Verses = tj3Data[surahKey] || [];
  const farsiVerses = farsiData[surahKey] || [];
  const russianVerses = russianData[surahKey] || [];
  
  // Create maps for quick lookup
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
  
  // Combine data
  const verses: Verse[] = [];
  
  for (const arabicAyah of arabicAyahs) {
    const verseNum = arabicAyah.numberInSurah;
    const translation = translationMap.get(verseNum);
    
    // Get Arabic text from word-by-word data, fallback to empty string
    const arabicText = surahArabicTexts.get(verseNum) || '';
    
    verses.push({
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
  
    cachedVerses.set(surahNumber, verses);
    return verses;
  } catch (error) {
    console.error(`Error loading verses for surah ${surahNumber}:`, error);
    return [];
  }
}

/**
 * Get a specific verse
 */
export async function getVerse(surahNumber: number, verseNumber: number): Promise<Verse | null> {
  const verses = await getVersesBySurah(surahNumber);
  return verses.find(v => v.verseNumber === verseNumber) || null;
}

let cachedAllVerses: Verse[] | null = null;

/**
 * Get all verses from all surahs
 */
export async function getAllVerses(): Promise<Verse[]> {
  if (cachedAllVerses) {
    return cachedAllVerses;
  }
  try {
    const jsonData = await loadCompressedJson<{ data: { surahs: AlQuranCloudSurah[] } }>('alquran_cloud_complete_quran.json.gz');
    const surahsData = jsonData.data.surahs;

    const verses: Verse[] = [];
    for (const surahData of surahsData) {
      const surahNumber = surahData.number;
      
      // Get Arabic texts from word-by-word data for this surah
      let surahArabicTexts: Map<number, string>;
      try {
        surahArabicTexts = await getArabicTextsForSurah(surahNumber);
      } catch (error) {
        console.warn(`Failed to load Arabic text from word-by-word data for surah ${surahNumber}:`, error);
        surahArabicTexts = new Map();
      }
      
      const ayahs = surahData.ayahs;

      for (const ayah of ayahs) {
        // Get Arabic text from word-by-word data, fallback to empty string
        const arabicText = surahArabicTexts.get(ayah.numberInSurah) || '';
        
        verses.push({
          id: ayah.number,
          surahId: surahNumber,
          verseNumber: ayah.numberInSurah,
          arabicText: arabicText,
          tajikText: '', // Will be loaded separately if needed
          uniqueKey: `${surahNumber}:${ayah.numberInSurah}`,
          page: ayah.page,
          juz: ayah.juz,
        });
      }
    }
    cachedAllVerses = verses;
    return verses;
  } catch (error) {
    console.error('Error loading all verses:', error);
    return [];
  }
}


import { loadCompressedJson } from '@/lib/utils/data-loader';
import { Surah } from '@/lib/types';

interface AlQuranCloudSurah {
  number: number;
  name: string;
  name_tajik?: string;
  revelationType: string;
  description?: string;
  ayahs: Array<{
    juz?: number;
    page?: number;
  }>;
}

interface AlQuranCloudData {
  data: {
    surahs: AlQuranCloudSurah[];
  };
}

let cachedSurahs: Surah[] | null = null;

/**
 * Get all surahs from local data
 */
export async function getAllSurahs(): Promise<Surah[]> {
  if (cachedSurahs) {
    return cachedSurahs;
  }
  try {
    const data = await loadCompressedJson<AlQuranCloudData>('alquran_cloud_complete_quran.json.gz');
    
    const surahs = data.data.surahs.map((surah): Surah => {
    const ayahs = surah.ayahs || [];
    const firstAyah = ayahs[0];
    const lastAyah = ayahs[ayahs.length - 1];
    
    return {
      id: surah.number,
      number: surah.number,
      nameArabic: surah.name,
      nameTajik: surah.name_tajik || surah.name,
      nameEnglish: '', // Not available in this format
      revelationType: surah.revelationType,
      versesCount: ayahs.length,
      description: surah.description,
      startJuz: firstAyah?.juz,
      endJuz: lastAyah?.juz,
      startPage: firstAyah?.page,
      endPage: lastAyah?.page,
    };
    });
    cachedSurahs = surahs;
    return surahs;
  } catch (error) {
    console.error('Error loading surahs:', error);
    return [];
  }
}

/**
 * Get a specific surah by number
 */
export async function getSurahByNumber(number: number): Promise<Surah | null> {
  const surahs = await getAllSurahs();
  return surahs.find(s => s.number === number) || null;
}


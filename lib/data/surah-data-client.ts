import { loadCompressedJson } from '@/lib/utils/data-loader-client';
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
 * Get all surahs from local data (client-side)
 */
export async function getAllSurahs(): Promise<Surah[]> {
  if (cachedSurahs) {
    return cachedSurahs;
  }
  try {
    console.log('Loading surahs from alquran_cloud_complete_quran.json.gz...');
    const data = await loadCompressedJson<AlQuranCloudData>('alquran_cloud_complete_quran.json.gz');
    console.log('Surahs data loaded, processing...');
    
    if (!data?.data?.surahs || !Array.isArray(data.data.surahs)) {
      console.error('Invalid surahs data format:', data);
      throw new Error('Invalid data format');
    }
    
    const surahs = data.data.surahs.map((surah): Surah => {
      const ayahs = surah.ayahs || [];
      const firstAyah = ayahs[0];
      const lastAyah = ayahs[ayahs.length - 1];
      
      return {
        id: surah.number,
        number: surah.number,
        nameArabic: surah.name,
        nameTajik: surah.name_tajik || surah.name,
        nameEnglish: '',
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
    console.log('Surahs processed, returning', surahs.length, 'surahs');
    return surahs;
  } catch (error) {
    console.error('Error loading surahs:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw error; // Re-throw to let the component handle it
  }
}

/**
 * Get a specific surah by number (client-side)
 */
export async function getSurahByNumber(number: number): Promise<Surah | null> {
  const surahs = await getAllSurahs();
  return surahs.find(s => s.number === number) || null;
}

// Alias for consistency with import names
export const getSurahByNumberClient = getSurahByNumber;



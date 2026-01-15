import { loadCompressedJson } from '@/lib/utils/data-loader-client';
import { getReciterPhotoUrlAsync, initializeReciterPhotoCache } from '@/lib/utils/reciter-image-helper';

export interface Reciter {
  id: string;
  name: string;
  nameTajik: string;
  nameArabic?: string;
  hasVerseByVerse?: boolean;
  photoUrl?: string | null;
}

let cachedReciters: Reciter[] | null = null;

// For static site, we'll load from JSON if available
// Otherwise return empty array
export async function getReciters(): Promise<Reciter[]> {
  if (cachedReciters) {
    return cachedReciters;
  }
  try {
    // Initialize reciter photo cache early
    await initializeReciterPhotoCache();
    
    // Load both full surah and verse-by-verse reciters
    const [fullSurahData, verseByVerseData] = await Promise.all([
      loadCompressedJson<any[]>('full_surah_reciters.json.gz').catch(() => []),
      loadCompressedJson<any[]>('verse_by_verse_reciters.json.gz').catch(() => []),
    ]);
    
    // Combine and deduplicate by id
    const reciterMap = new Map<string, Reciter>();
    
    // Process full surah reciters
    for (const item of fullSurahData) {
      const id = item.id || item.identifier || '';
      if (id) {
        const photoUrl = await getReciterPhotoUrlAsync(id);
        reciterMap.set(id, {
          id,
          name: item.name || '',
          nameTajik: item.nameTajik || item.name || '',
          nameArabic: item.nameArabic || '',
          hasVerseByVerse: false,
          photoUrl,
        });
      }
    }
    
    // Process verse-by-verse reciters
    for (const item of verseByVerseData) {
      const id = item.id || item.identifier || '';
      if (id) {
        const existing = reciterMap.get(id);
        if (existing) {
          existing.hasVerseByVerse = true;
          if (!existing.photoUrl) {
            existing.photoUrl = await getReciterPhotoUrlAsync(id);
          }
        } else {
          const photoUrl = await getReciterPhotoUrlAsync(id);
          reciterMap.set(id, {
            id,
            name: item.name || '',
            nameTajik: item.nameTajik || item.name || '',
            nameArabic: item.nameArabic || '',
            hasVerseByVerse: true,
            photoUrl,
          });
        }
      }
    }
    
    // Add Tajik audio editions
    const tajikEditions: Reciter[] = [
      {
        id: 'tg.akmal_mansurov',
        name: 'Tajik - Akmal Mansurov',
        nameTajik: 'Тоҷикӣ - Акмал Мансуров',
        nameArabic: '',
        hasVerseByVerse: false,
        photoUrl: '/images/reciters_photo/akmal_mansurov.jpg', // Local asset
      },
    ];
    
    // Add Tajik editions to the map
    tajikEditions.forEach(edition => {
      if (!reciterMap.has(edition.id)) {
        reciterMap.set(edition.id, edition);
      }
    });
    
    cachedReciters = Array.from(reciterMap.values());
    return cachedReciters;
  } catch (error) {
    console.error('Error loading reciters:', error);
    return [];
  }
}

export async function getReciterById(id: string): Promise<Reciter | undefined> {
  const reciters = await getReciters();
  return reciters.find(r => r.id === id);
}


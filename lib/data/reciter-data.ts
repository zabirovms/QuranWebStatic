export interface Reciter {
  id: string;
  name: string;
  nameTajik: string;
  nameArabic?: string;
  hasVerseByVerse?: boolean;
}

let cachedReciters: Reciter[] | null = null;

// For static site, we'll load from JSON if available
// Otherwise return empty array
export async function getReciters(): Promise<Reciter[]> {
  if (cachedReciters) {
    return cachedReciters;
  }
  try {
    const { loadCompressedJson } = await import('@/lib/utils/data-loader');
    // Load both full surah and verse-by-verse reciters
    const [fullSurahData, verseByVerseData] = await Promise.all([
      loadCompressedJson<any[]>('full_surah_reciters.json.gz').catch(() => []),
      loadCompressedJson<any[]>('verse_by_verse_reciters.json.gz').catch(() => []),
    ]);
    
    // Combine and deduplicate by id
    const reciterMap = new Map<string, Reciter>();
    
    fullSurahData.forEach((item: any) => {
      const id = item.id || item.identifier || '';
      if (id) {
        reciterMap.set(id, {
          id,
          name: item.name || '',
          nameTajik: item.nameTajik || item.name || '',
          nameArabic: item.nameArabic || '',
          hasVerseByVerse: false,
        });
      }
    });
    
    verseByVerseData.forEach((item: any) => {
      const id = item.id || item.identifier || '';
      if (id) {
        const existing = reciterMap.get(id);
        if (existing) {
          existing.hasVerseByVerse = true;
        } else {
          reciterMap.set(id, {
            id,
            name: item.name || '',
            nameTajik: item.nameTajik || item.name || '',
            nameArabic: item.nameArabic || '',
            hasVerseByVerse: true,
          });
        }
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


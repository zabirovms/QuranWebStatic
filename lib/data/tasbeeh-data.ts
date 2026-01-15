import { loadCompressedJson } from '@/lib/utils/data-loader';
import { Tasbeeh } from '@/lib/types';

let cachedTasbeehs: Tasbeeh[] | null = null;

/**
 * Get all tasbeehs
 */
export async function getAllTasbeehs(): Promise<Tasbeeh[]> {
  if (cachedTasbeehs) {
    return cachedTasbeehs;
  }
  try {
    const rawData = await loadCompressedJson<any[]>('tasbeehs.json.gz');
    // Map the data to match our interface (handle snake_case from JSON)
    const data: Tasbeeh[] = rawData.map((item: any) => ({
      arabic: item.arabic || '',
      tajikTransliteration: item.tajik_transliteration || item.tajikTransliteration || '',
      tajikTranslation: item.tajik_translation || item.tajikTranslation || '',
      description: item.description,
      targetCount: item.target_count || item.targetCount || 33,
    }));
    cachedTasbeehs = data;
    return data;
  } catch (error) {
    console.error('Error loading tasbeehs:', error);
    return [];
  }
}


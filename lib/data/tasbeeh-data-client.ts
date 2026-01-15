import { loadCompressedJson } from '@/lib/utils/data-loader-client';
import { Tasbeeh } from '@/lib/types';

let cachedTasbeehs: Tasbeeh[] | null = null;

/**
 * Get all tasbeehs (client-side)
 */
export async function getAllTasbeehs(): Promise<Tasbeeh[]> {
  if (cachedTasbeehs) {
    return cachedTasbeehs;
  }
  try {
    console.log('Loading tasbeehs from tasbeehs.json.gz...');
    const rawData = await loadCompressedJson<any[]>('tasbeehs.json.gz');
    console.log('Tasbeehs loaded, count:', rawData?.length);
    
    if (!rawData || !Array.isArray(rawData)) {
      console.error('Invalid tasbeeh data format:', rawData);
      throw new Error('Invalid data format');
    }
    
    // Map the data to match our interface (handle snake_case from JSON)
    const data: Tasbeeh[] = rawData.map((item: any) => ({
      arabic: item.arabic || '',
      tajikTransliteration: item.tajik_transliteration || item.tajikTransliteration || '',
      tajikTranslation: item.tajik_translation || item.tajikTranslation || '',
      description: item.description,
      targetCount: item.target_count || item.targetCount || 33,
    }));
    cachedTasbeehs = data;
    console.log('Tasbeehs processed, returning', data.length, 'items');
    return data;
  } catch (error) {
    console.error('Error loading tasbeehs:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    throw error; // Re-throw to let the component handle it
  }
}



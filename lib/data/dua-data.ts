import { loadCompressedJson } from '@/lib/utils/data-loader';
import { Dua } from '@/lib/types';

let cachedDuas: Dua[] | null = null;

/**
 * Get all duas
 */
export async function getAllDuas(): Promise<Dua[]> {
  if (cachedDuas) {
    return cachedDuas;
  }
  try {
    const data = await loadCompressedJson<Dua[]>('quranic_duas.json.gz');
    cachedDuas = data;
    return data;
  } catch (error) {
    console.error('Error loading duas:', error);
    return [];
  }
}

/**
 * Get duas by category
 */
export async function getDuasByCategory(category: string): Promise<Dua[]> {
  const duas = await getAllDuas();
  return duas.filter(d => d.category === category);
}


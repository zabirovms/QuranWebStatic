import { loadCompressedJson } from '@/lib/utils/data-loader-client';
import { Dua } from '@/lib/types';

let cachedDuas: Dua[] | null = null;
let cachedProphetsDuas: Dua[] | null = null;

/**
 * Get all duas (Rabbano duas) from local data (client-side)
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
 * Get all prophets duas from local data (client-side)
 */
export async function getAllProphetsDuas(): Promise<Dua[]> {
  if (cachedProphetsDuas) {
    return cachedProphetsDuas;
  }
  try {
    const data = await loadCompressedJson<Dua[]>('prophets_duas.json.gz');
    cachedProphetsDuas = data;
    return data;
  } catch (error) {
    console.error('Error loading prophets duas:', error);
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


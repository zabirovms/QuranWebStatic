import { loadCompressedJson } from '@/lib/utils/data-loader';

export interface TajikInfo {
  transliteration: string;
  meaning: string;
}

export interface AsmaulHusna {
  name: string;
  number: number;
  found: string;
  tajik: TajikInfo;
}

let cachedAsmaulHusna: AsmaulHusna[] | null = null;

/**
 * Get all Asmaul Husna names
 */
export async function getAllAsmaulHusna(): Promise<AsmaulHusna[]> {
  if (cachedAsmaulHusna) {
    return cachedAsmaulHusna;
  }
  try {
    const rawData = await loadCompressedJson<any>('99_Names_Of_Allah.json.gz');
    // Handle wrapped response structure: { code, status, data: [...] }
    const dataArray = rawData.data || rawData;
    const data: AsmaulHusna[] = Array.isArray(dataArray) ? dataArray : [];
    cachedAsmaulHusna = data;
    return data;
  } catch (error) {
    console.error('Error loading Asmaul Husna:', error);
    return [];
  }
}


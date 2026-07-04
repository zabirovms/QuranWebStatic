import { loadCompressedJson } from '@/lib/utils/data-loader-client';

export interface TajikInfo {
  transliteration: string;
  meaning: string;
  description: string;
}

export interface AsmaulHusna {
  // Old compatible fields
  name: string; // Holds Arabic script (e.g., "اللَّهُ") for backward compatibility
  number: number; // Maps to id (1-99)
  found: string;
  tajik: TajikInfo;
  
  // New detailed fields
  id: number;
  arabic: string; // Holds Arabic script explicitly (e.g., "اللَّهُ")
  description: string; // Full explanation in Tajik Cyrillic
  slug: string; // Latin slug for URLs (e.g., "alloh")
  shortMeaning: string; // Extracted short meaning
}

export interface AsmaulHusnaIntro {
  title: string;
  subtitle: string;
  introduction: {
    title: string;
    bismillah: string;
    content: string;
  };
  virtue: {
    title: string;
    hadith_narrator: string;
    hadith_text: string;
    hadith_source: string;
    appeal: string;
  };
  benefit: {
    title: string;
    quote_author: string;
    quote_text: string;
    content: string;
  };
}

interface DetailedFileFormat {
  intro: AsmaulHusnaIntro;
  names: Array<{
    id: number;
    name: string;
    description: string;
    found: string;
    arabic: string;
    slug: string;
    shortMeaning: string;
  }>;
}

let cachedAsmaulHusna: AsmaulHusna[] | null = null;
let cachedAsmaulIntro: AsmaulHusnaIntro | null = null;

/**
 * Loads the detailed 99 Names of Allah JSON and caches intro/names list (client-side)
 */
async function loadDetailedData(): Promise<DetailedFileFormat> {
  const rawData = await loadCompressedJson<DetailedFileFormat>('99_Names_Of_Allah_detailed.json.gz');
  return rawData;
}

/**
 * Get all Asmaul Husna names with backward-compatible legacy fields mapped dynamically.
 * Used during client runtime.
 */
export async function getAllAsmaulHusna(): Promise<AsmaulHusna[]> {
  if (cachedAsmaulHusna) {
    return cachedAsmaulHusna;
  }
  try {
    const rawData = await loadDetailedData();
    const names = rawData.names || [];
    
    // Map new dataset format to compatible shape for legacy components
    const mapped: AsmaulHusna[] = names.map((n) => ({
      // Legacy compatibility keys
      name: n.arabic, // Legacy home page displays name as Arabic script
      number: n.id,
      found: n.found,
      tajik: {
        transliteration: n.name, // Tajik transliterated name (e.g., "Аллоҳ")
        meaning: n.shortMeaning,
        description: n.description,
      },
      
      // Explicit new keys
      id: n.id,
      arabic: n.arabic,
      description: n.description,
      slug: n.slug,
      shortMeaning: n.shortMeaning
    }));
    
    cachedAsmaulHusna = mapped;
    return cachedAsmaulHusna;
  } catch (error) {
    console.error('Error loading Asmaul Husna detailed names (client-side):', error);
    return [];
  }
}

/**
 * Get the introduction text header data (Muqaddima, Virtue Hadiths, Benefits)
 */
export async function getAsmaulHusnaIntro(): Promise<AsmaulHusnaIntro | null> {
  if (cachedAsmaulIntro) {
    return cachedAsmaulIntro;
  }
  try {
    const rawData = await loadDetailedData();
    cachedAsmaulIntro = rawData.intro;
    return cachedAsmaulIntro;
  } catch (error) {
    console.error('Error loading Asmaul Husna intro headers (client-side):', error);
    return null;
  }
}

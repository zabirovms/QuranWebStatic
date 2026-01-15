import { loadCompressedJson } from '@/lib/utils/data-loader-client';
import { Prophet, ProphetSummary } from '@/lib/types';
import { kProphetSummaries } from './prophet-summaries';

let cachedProphets: Map<string, Prophet> | null = null;

/**
 * Get all prophet summaries (hardcoded, matching Flutter)
 */
export async function getProphetSummaries(): Promise<ProphetSummary[]> {
  return kProphetSummaries;
}

/**
 * Load all prophet details from JSON
 */
async function loadAllProphetDetails(): Promise<Map<string, Prophet>> {
  if (cachedProphets) {
    return cachedProphets;
  }

  try {
    const jsonList = await loadCompressedJson<any[]>('Prophets.json.gz');
    
    // Process and merge references by surah (matching Flutter logic)
    const processedJson = jsonList.map((item) => {
      const prophet = { ...item };
      const references = prophet.references;
      
      if (Array.isArray(references)) {
        prophet.references = mergeReferencesBySurah(references);
      }
      
      return prophet;
    });

    const map = new Map<string, Prophet>();
    for (const entry of processedJson) {
      const prophet: Prophet = {
        name: entry.name || '',
        arabic: entry.arabic || '',
        references: entry.references || [],
      };
      map.set(entry.name, prophet);
    }

    cachedProphets = map;
    return map;
  } catch (error) {
    console.error('Error loading prophets data:', error);
    return new Map();
  }
}

/**
 * Merge references by surah (matching Flutter's _mergeReferencesBySurah)
 */
function mergeReferencesBySurah(references: any[]): any[] {
  const merged = new Map<number, any>();

  for (const ref of references) {
    if (!ref || typeof ref !== 'object') continue;

    const surah = ref.surah;
    if (typeof surah !== 'number') continue;

    const verses = Array.isArray(ref.verses)
      ? ref.verses.map((v: any) => typeof v === 'number' ? v : parseInt(String(v), 10)).filter((v: any) => !isNaN(v))
      : [];

    const verseData = ref.verse_data || {};

    if (!merged.has(surah)) {
      verses.sort((a: number, b: number) => a - b);
      merged.set(surah, {
        surah,
        verses,
        verse_data: verseData,
      });
    } else {
      const existing = merged.get(surah)!;
      const existingVerses = [...existing.verses, ...verses];
      const deduped = Array.from(new Set(existingVerses)).sort((a, b) => a - b);
      existing.verses = deduped;

      existing.verse_data = {
        ...existing.verse_data,
        ...verseData,
      };
    }
  }

  return Array.from(merged.values()).sort((a, b) => a.surah - b.surah);
}

/**
 * Get prophet detail by name
 */
export async function getProphetByName(name: string): Promise<Prophet | null> {
  const map = await loadAllProphetDetails();
  
  // Try exact match first
  let prophet = map.get(name);
  
  // Try partial match
  if (!prophet) {
    for (const [key, value] of map.entries()) {
      if (key.includes(name) || name.includes(key)) {
        prophet = value;
        break;
      }
    }
  }
  
  return prophet || null;
}



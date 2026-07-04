import { loadCompressedJson } from '@/lib/utils/data-loader';
import { FarziAynSection } from '@/lib/types/farzi-ayn';

let cachedFarziAyn: FarziAynSection[] | null = null;

/**
 * Load all sections of Farzi Ayn from the compressed JSON data.
 * Results are cached in-memory during build time.
 */
export async function getAllFarziAynSections(): Promise<FarziAynSection[]> {
  if (cachedFarziAyn) {
    return cachedFarziAyn;
  }
  try {
    cachedFarziAyn = await loadCompressedJson<FarziAynSection[]>('farzi-ayn.json.gz');
    return cachedFarziAyn || [];
  } catch (error) {
    console.error('Error loading Farzi Ayn sections:', error);
    return [];
  }
}

/**
 * Get a specific section of Farzi Ayn by its Latin string ID.
 */
export async function getFarziAynSectionById(id: string): Promise<FarziAynSection | null> {
  const sections = await getAllFarziAynSections();
  return sections.find(s => s.id === id) || null;
}

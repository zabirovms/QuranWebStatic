import { loadCompressedJson } from '@/lib/utils/data-loader-client';

export interface CategoryDuaItem {
  id: number;
  page: number;
  arabic: string;
  tajik: string;
  reference: string;
  audio_url: string | null;
}

export interface DuaCategoryData {
  source: string;
  category_id: number;
  category_name_tajik: string;
  category_name_en: string;
  language: string;
  total: number;
  duas: CategoryDuaItem[];
}

const cachedCategoryData = new Map<string, DuaCategoryData | null>();

/**
 * Get gzipped daily Adhkar category data by slug (client-side)
 * Loaded at client runtime for search, tabs, and filters.
 */
export async function getDuaCategoryBySlug(slug: string): Promise<DuaCategoryData | null> {
  if (cachedCategoryData.has(slug)) {
    return cachedCategoryData.get(slug) || null;
  }

  try {
    const data = await loadCompressedJson<DuaCategoryData>(`duas/${slug}.json.gz`);
    cachedCategoryData.set(slug, data);
    return data;
  } catch (error) {
    console.error(`Error loading client-side dua category "${slug}":`, error);
    cachedCategoryData.set(slug, null);
    return null;
  }
}

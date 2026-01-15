import { loadCompressedJson } from '@/lib/utils/data-loader';

export interface QuotedVerse {
  ref: string;
  quotedArabic: string;
  quoted_arabic?: string; // Support both formats
  tajik: string;
  transliteration?: string;
}

let cachedQuotedVerses: QuotedVerse[] | null = null;

/**
 * Get all quoted verses
 */
export async function getAllQuotedVerses(): Promise<QuotedVerse[]> {
  if (cachedQuotedVerses) {
    return cachedQuotedVerses;
  }
  try {
    const rawData = await loadCompressedJson<any[]>('most_quoted_verses.json.gz');
    // Map the data to match our interface (handle snake_case from JSON)
    const data: QuotedVerse[] = rawData.map((item: any) => ({
      ref: item.ref || '',
      quotedArabic: item.quoted_arabic || item.quotedArabic || '',
      tajik: item.tajik || '',
      transliteration: item.transliteration,
    }));
    cachedQuotedVerses = data;
    return data;
  } catch (error) {
    console.error('Error loading quoted verses:', error);
    return [];
  }
}


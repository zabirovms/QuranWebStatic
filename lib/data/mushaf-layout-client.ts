import type { } from 'react';

export interface MushafPageLine {
  page_number: number;
  line_number: number;
  line_type: 'ayah' | 'surah_name' | 'basmallah';
  is_centered: 0 | 1;
  first_word_id: number | '' | null;
  last_word_id: number | '' | null;
  surah_number: number | '' | null;
}

let pagesPromise: Promise<MushafPageLine[]> | null = null;

async function fetchMushafPagesJson(): Promise<MushafPageLine[]> {
  // Try optimized gzip first on supported browsers
  if (typeof window !== 'undefined' && 'DecompressionStream' in window) {
    try {
      const resGz = await fetch('/data/qpc-v4-tajweed-pages.json.gz');
      if (resGz.ok && resGz.body) {
        const ds = new (window as any).DecompressionStream('gzip');
        const stream = resGz.body.pipeThrough(ds);
        const decompressed = new Response(stream);
        const text = await decompressed.text();
        return JSON.parse(text) as MushafPageLine[];
      }
    } catch {
      // fall back to plain JSON below
    }
  }

  const res = await fetch('/data/qpc-v4-tajweed-pages.json');
  if (!res.ok) {
    throw new Error(`Failed to load mushaf pages: ${res.status}`);
  }
  return res.json();
}

/**
 * Load full mushaf layout (604 pages, 15 lines per page) from public data.
 * Data exported from qpc-v4-tajweed-15-lines.db as JSON.
 */
export function getMushafPages(): Promise<MushafPageLine[]> {
  if (!pagesPromise) {
    pagesPromise = fetchMushafPagesJson();
  }
  return pagesPromise;
}


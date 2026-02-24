import type { } from 'react';

interface QpcV4Entry {
  id: number;
  surah: string;
  ayah: string;
  word: string;
  location: string; // "surah:ayah:word"
  text: string;     // single glyph (PUA, e.g. U+F741)
}

export interface QpcIndex {
  idToGlyph: Map<number, string>;
  idToLocation: Map<number, { surah: number; ayah: number; word: number }>;
}

let qpcIndexPromise: Promise<QpcIndex> | null = null;

async function fetchQpcV4Json(): Promise<Record<string, QpcV4Entry>> {
  // Try optimized gzip first on supported browsers
  if (typeof window !== 'undefined' && 'DecompressionStream' in window) {
    try {
      const resGz = await fetch('/data/qpc-v4.json.gz');
      if (resGz.ok && resGz.body) {
        const ds = new (window as any).DecompressionStream('gzip');
        const stream = resGz.body.pipeThrough(ds);
        const decompressed = new Response(stream);
        const text = await decompressed.text();
        return JSON.parse(text) as Record<string, QpcV4Entry>;
      }
    } catch {
      // fall back to plain JSON below
    }
  }

  const res = await fetch('/data/qpc-v4.json');
  if (!res.ok) {
    throw new Error(`Failed to load qpc-v4.json: ${res.status}`);
  }
  const text = await res.text();
  return JSON.parse(text) as Record<string, QpcV4Entry>;
}

/**
 * Load qpc-v4.json and build an index: word id -> glyph + (surah, ayah, word).
 * qpc-v4.json is a large JSON object keyed by "surah:ayah:word".
 */
export function getQpcV4Index(): Promise<QpcIndex> {
  if (!qpcIndexPromise) {
    qpcIndexPromise = fetchQpcV4Json()
      .then((raw) => {
        const idToGlyph = new Map<number, string>();
        const idToLocation = new Map<number, { surah: number; ayah: number; word: number }>();

        for (const key of Object.keys(raw)) {
          const entry = raw[key];
          const id = entry.id;
          if (!id || typeof id !== 'number') continue;
          const surah = parseInt(entry.surah, 10);
          const ayah = parseInt(entry.ayah, 10);
          const word = parseInt(entry.word, 10);
          if (!Number.isFinite(surah) || !Number.isFinite(ayah) || !Number.isFinite(word)) continue;
          if (typeof entry.text !== 'string' || entry.text.length === 0) continue;

          idToGlyph.set(id, entry.text);
          idToLocation.set(id, { surah, ayah, word });
        }

        return { idToGlyph, idToLocation };
      });
  }

  return qpcIndexPromise;
}


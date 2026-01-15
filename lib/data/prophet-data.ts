import { loadCompressedJson } from '@/lib/utils/data-loader';
import { Prophet, ProphetSummary } from '@/lib/types';

let cachedProphets: Prophet[] | null = null;

export async function getAllProphets(): Promise<Prophet[]> {
  if (cachedProphets) {
    return cachedProphets;
  }

  try {
    const jsonData = await loadCompressedJson<any>('Prophets.json.gz');
    // Transform the data to match our Prophet interface
    const prophets: Prophet[] = jsonData.map((item: any) => ({
      name: item.name || item.nameTajik || '',
      arabic: item.nameArabic || item.arabic || '',
      references: item.references || [],
    }));
    cachedProphets = prophets;
    return prophets;
  } catch (error) {
    console.error('Error loading prophets:', error);
    return [];
  }
}

export async function getProphetSummaries(): Promise<ProphetSummary[]> {
  const prophets = await getAllProphets();
  return prophets.map(p => {
    const surahCount = p.references?.length || 0;
    const verseCount = p.references?.reduce((sum, ref) => sum + (ref.verses?.length || 0), 0) || 0;
    return {
    name: p.name,
      arabic: p.arabic,
      summaryText: `Дар ${surahCount} сура, ${verseCount} оят`,
    };
  });
}

export async function getProphetByName(name: string): Promise<Prophet | undefined> {
  const prophets = await getAllProphets();
  return prophets.find(p => p.name.includes(name) || p.arabic.includes(name));
}


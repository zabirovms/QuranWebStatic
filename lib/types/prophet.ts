export interface ProphetSummary {
  name: string;
  arabic: string;
  summaryText: string;
}

export interface VerseData {
  arabic: string;
  transliteration?: string;
  tajik: string;
}

export interface ProphetReference {
  surah: number;
  verses: number[];
  verse_data?: Record<string, VerseData>; // Map of verse number (as string) to VerseData
}

export interface Prophet {
  name: string;
  arabic: string;
  references?: ProphetReference[];
}


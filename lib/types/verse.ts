export interface Verse {
  id: number;
  surahId: number;
  verseNumber: number;
  arabicText: string;
  tajikText: string;
  transliteration?: string;
  tafsir?: string;
  tj2?: string;
  tj3?: string;
  farsi?: string;
  russian?: string;
  page?: number;
  juz?: number;
  uniqueKey: string;
}

export type TranslationLanguage = 'tajik' | 'tj_2' | 'tj_3' | 'farsi' | 'russian';


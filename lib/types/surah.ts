export interface Surah {
  id: number;
  number: number;
  nameArabic: string;
  nameTajik: string;
  nameEnglish: string;
  revelationType: string;
  versesCount: number;
  description?: string;
  startJuz?: number;
  endJuz?: number;
  startPage?: number;
  endPage?: number;
}


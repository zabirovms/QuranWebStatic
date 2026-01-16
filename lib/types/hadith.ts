export interface Hadith {
  number: number;
  full_text: string;
}

export interface Chapter {
  number: number;
  title: string;
  hadiths: Hadith[];
}

export interface BookJson {
  id: number;
  number: number;
  title: string;
  chapters: Chapter[];
  total_chapters: number;
  total_hadiths: number;
  unique_hadith_numbers: number;
}

export interface BookMetadata {
  id: number;
  number: number;
  sub_number: number | null;
  is_sub_book: boolean;
  title: string;
  total_chapters: number;
  total_hadiths: number;
}

export interface IntroductionMetadata {
  id: string;
  title: string;
}

export interface MetadataJson {
  metadata: {
    title: string;
    author: string;
    language: string;
    total_books: number;
    total_sub_books: number;
    total_chapters: number;
    total_hadith_occurrences: number;
    unique_hadith_numbers: number;
    total_hadith_occurrences_in_files: number;
  };
  books: BookMetadata[];
  introductions: IntroductionMetadata[];
}

export interface IntroductionJson {
  id: string;
  title: string;
  content?: string;
}

import { loadJson } from '@/lib/utils/data-loader-client';
import { BookJson, MetadataJson, IntroductionJson, BookMetadata } from '@/lib/types/hadith';

let cachedMetadata: MetadataJson | null = null;

/**
 * Get metadata for all Bukhari books (client-side)
 */
export async function getBukhariMetadata(): Promise<MetadataJson> {
  if (cachedMetadata) {
    return cachedMetadata;
  }
  try {
    const metadata = await loadJson<MetadataJson>('bukhari/metadata.json');
    cachedMetadata = metadata;
    return metadata;
  } catch (error) {
    console.error('Error loading Bukhari metadata:', error);
    throw error;
  }
}

/**
 * Get a specific book by ID
 */
export async function getBukhariBook(bookId: number, subNumber?: number | null): Promise<BookJson> {
  try {
    let fileName: string;
    if (subNumber !== null && subNumber !== undefined) {
      fileName = `bukhari/book_${bookId}_${subNumber}.json`;
    } else {
      fileName = `bukhari/book_${bookId}.json`;
    }
    
    const book = await loadJson<BookJson>(fileName);
    return book;
  } catch (error) {
    console.error(`Error loading Bukhari book ${bookId}:`, error);
    throw error;
  }
}

/**
 * Get an introduction by ID
 */
export async function getBukhariIntroduction(introId: string): Promise<IntroductionJson> {
  try {
    const fileName = `bukhari/${introId}.json`;
    const intro = await loadJson<IntroductionJson>(fileName);
    return intro;
  } catch (error) {
    console.error(`Error loading Bukhari introduction ${introId}:`, error);
    throw error;
  }
}

/**
 * Get all books metadata
 */
export async function getAllBooksMetadata(): Promise<BookMetadata[]> {
  const metadata = await getBukhariMetadata();
  return metadata.books;
}

/**
 * Get main books (excluding sub-books)
 */
export async function getMainBooksMetadata(): Promise<BookMetadata[]> {
  const metadata = await getBukhariMetadata();
  return metadata.books.filter(book => !book.is_sub_book);
}

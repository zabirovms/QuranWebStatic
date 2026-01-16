import { loadJson } from '@/lib/utils/data-loader';
import { BookJson, MetadataJson, IntroductionJson, BookMetadata } from '@/lib/types/hadith';

/**
 * Get metadata for all Bukhari books (server-side, for static generation)
 */
export async function getBukhariMetadata(): Promise<MetadataJson> {
  try {
    const metadata = await loadJson<MetadataJson>('bukhari/metadata.json');
    return metadata;
  } catch (error) {
    console.error('Error loading Bukhari metadata:', error);
    throw error;
  }
}

/**
 * Get a specific book by ID (server-side, for static generation)
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
 * Get all books metadata (server-side)
 */
export async function getAllBooksMetadata(): Promise<BookMetadata[]> {
  const metadata = await getBukhariMetadata();
  return metadata.books;
}

/**
 * Get main books (excluding sub-books) (server-side)
 */
export async function getMainBooksMetadata(): Promise<BookMetadata[]> {
  const metadata = await getBukhariMetadata();
  return metadata.books.filter(book => !book.is_sub_book);
}

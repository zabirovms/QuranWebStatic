import { getIslamicBooks } from '@/lib/data/downloads-data';
import DownloadsPageClient from './page-client';

/**
 * Server component that fetches data at build time
 * This ensures the page is statically generated with all content
 */
export default async function DownloadsPage() {
  // Fetch books at build time for static generation
  const books = await getIslamicBooks();

  return <DownloadsPageClient initialBooks={books} />;
}

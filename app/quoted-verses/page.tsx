import { getAllQuotedVerses } from '@/lib/data/quoted-verse-data';
import { QuotedVerse } from '@/lib/types';
import QuotedVersesPageClient from '@/components/QuotedVersesPageClient';

/**
 * Server component that fetches and processes data at build time
 * Shuffling is done on server to avoid client-side processing (Phase 2, Section 3.2)
 */
export default async function QuotedVersesPage() {
  const verses: QuotedVerse[] = await getAllQuotedVerses();
  
  // Shuffle on server instead of client to reduce TBT (Phase 2, Section 3.2)
  // This avoids heavy array operations in useEffect on client
  const shuffled = [...verses].sort(() => Math.random() - 0.5);
  
  return <QuotedVersesPageClient initialVerses={shuffled} />;
}


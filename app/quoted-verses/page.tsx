import { getAllQuotedVerses } from '@/lib/data/quoted-verse-data';
import { QuotedVerse } from '@/lib/types';
import QuotedVersesPageClient from '@/components/QuotedVersesPageClient';

export default async function QuotedVersesPage() {
  const verses: QuotedVerse[] = await getAllQuotedVerses();
  return <QuotedVersesPageClient initialVerses={verses} />;
}


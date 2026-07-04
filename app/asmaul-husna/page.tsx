import { getAllAsmaulHusna, getAsmaulHusnaIntro } from '@/lib/data/asmaul-husna-data';
import AsmaulHusnaPageClient from './page-client';

/**
 * Server component that fetches Asmaul Husna detailed data
 * at build time for dynamic static page pre-rendering.
 */
export default async function AsmaulHusnaPage() {
  const [names, intro] = await Promise.all([
    getAllAsmaulHusna(),
    getAsmaulHusnaIntro(),
  ]);

  return (
    <AsmaulHusnaPageClient 
      names={names} 
      intro={intro} 
    />
  );
}

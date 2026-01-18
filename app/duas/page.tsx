import { getAllDuas, getAllProphetsDuas } from '@/lib/data/dua-data';
import DuasPageClient from './page-client';

/**
 * Server component that fetches data at build time for SEO
 */
export default async function DuasPage() {
  const [rabbanoDuas, prophetsDuas] = await Promise.all([
    getAllDuas(),
    getAllProphetsDuas(),
  ]);

  // Count unique prophets
  const uniqueProphets = new Set(prophetsDuas.map(dua => dua.prophet).filter(Boolean));
  
  // Get sample duas for preview (first 3 from each category)
  const sampleRabbanoDuas = rabbanoDuas.slice(0, 3);
  const sampleProphetsDuas = prophetsDuas.slice(0, 3);

  return (
    <DuasPageClient
      rabbanoCount={rabbanoDuas.length}
      prophetsCount={prophetsDuas.length}
      uniqueProphetsCount={uniqueProphets.size}
      sampleRabbanoDuas={sampleRabbanoDuas}
      sampleProphetsDuas={sampleProphetsDuas}
    />
  );
}

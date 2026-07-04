import { getAllFarziAynSections } from '@/lib/data/farzi-ayn-data';
import FarziAynPageWrapper from './page-wrapper';

/**
 * Server component that fetches Farzi Ayn sections at build time
 * for static site generation.
 */
export default async function FarziAynPage() {
  const sections = await getAllFarziAynSections();
  return <FarziAynPageWrapper sections={sections} />;
}

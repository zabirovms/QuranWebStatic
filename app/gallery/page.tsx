import { getInitialGalleryImages } from '@/lib/data/gallery-data';
import GalleryPageClient from './page-client';
import GalleryStructuredData from './structured-data';

/**
 * Server component that fetches initial images at build time
 * This ensures the page is statically generated with content visible to search engines
 */
export default async function GalleryPage() {
  // Fetch initial images at build time for static generation
  const { pictures, wallpapers } = await getInitialGalleryImages();

  // Create structured data for image gallery
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: 'Аксҳо ва тасвирҳои исломӣ',
    description: 'Тасвирҳои исломӣ, аксҳои исломӣ, дуоҳо ва ғайра.',
    url: 'https://www.quran.tj/gallery',
    image: pictures.slice(0, 10).map(img => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      name: img.name,
    })),
  };

  return (
    <>
      <GalleryStructuredData data={structuredData} />
      <GalleryPageClient 
        initialPictures={pictures} 
        initialWallpapers={wallpapers} 
      />
    </>
  );
}

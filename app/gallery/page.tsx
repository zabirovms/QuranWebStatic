import { getInitialGalleryImages } from '@/lib/data/gallery-data';
import GalleryPageClient from './page-client';

const GALLERY_URL = 'https://www.quran.tj/gallery';
const GALLERY_TITLE = 'Аксҳо ва тасвирҳои исломӣ';
const GALLERY_DESCRIPTION = 'Тасвирҳои исломӣ, аксҳои исломӣ, дуоҳо ва ғайра.';

/**
 * Dynamic metadata with first image for og:image and Twitter card
 */
export async function generateMetadata() {
  const { pictures } = await getInitialGalleryImages();
  const firstImageUrl = pictures.length > 0 ? pictures[0].url : undefined;

  return {
    openGraph: {
      title: GALLERY_TITLE,
      description: GALLERY_DESCRIPTION,
      type: 'website',
      url: GALLERY_URL,
      ...(firstImageUrl && {
        images: [{ url: firstImageUrl, alt: GALLERY_TITLE }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: GALLERY_TITLE,
      description: GALLERY_DESCRIPTION,
      ...(firstImageUrl && { images: [firstImageUrl] }),
    },
  };
}

/**
 * Server component that fetches initial images at build time
 * This ensures the page is statically generated with content visible to search engines
 */
export default async function GalleryPage() {
  const { pictures, wallpapers } = await getInitialGalleryImages();

  // Server-rendered JSON-LD so crawlers see it without running JS
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: GALLERY_TITLE,
    description: GALLERY_DESCRIPTION,
    url: GALLERY_URL,
    image: pictures.slice(0, 30).map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      name: img.name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <GalleryPageClient
        initialPictures={pictures}
        initialWallpapers={wallpapers}
      />
    </>
  );
}

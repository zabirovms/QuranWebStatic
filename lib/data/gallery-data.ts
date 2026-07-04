import { ImageData } from '@/lib/services/image-api-service';
import { slugify } from '@/lib/utils/slug';

const PICTURES_LIST_URL = 'https://cdn.quran.tj/pictures/list';
const WALLPAPERS_LIST_URL = 'https://cdn.quran.tj/wallpapers/list';
const PICTURES_BASE_URL = 'https://cdn.quran.tj/pictures/';
const WALLPAPERS_BASE_URL = 'https://cdn.quran.tj/wallpapers/';

export interface GalleryData {
  pictures: ImageData[];
  wallpapers: ImageData[];
}

/**
 * Fetch initial images for gallery page at build time
 * This ensures the page is statically generated with content visible to search engines
 */
export async function getInitialGalleryImages(): Promise<GalleryData> {
  try {
    // Fetch both pictures and wallpapers in parallel
    const [picturesResponse, wallpapersResponse] = await Promise.all([
      fetch(PICTURES_LIST_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'force-cache',
      }).catch(() => null),
      fetch(WALLPAPERS_LIST_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'force-cache',
      }).catch(() => null),
    ]);

    let pictures: ImageData[] = [];
    let wallpapers: ImageData[] = [];

    // Process pictures
    if (picturesResponse?.ok) {
      try {
        const filenames: string[] = await picturesResponse.json();
        if (Array.isArray(filenames) && filenames.length > 0) {
          // Take first 40 images for initial render
          const initialFilenames = filenames.slice(0, 40);
          pictures = initialFilenames.map(filename => {
            const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
            const cleanName = nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ');
            return {
              url: `${PICTURES_BASE_URL}${encodeURIComponent(filename)}`,
              name: cleanName,
              slug: slugify(filename),
            };
          });
        }
      } catch (error) {
        console.error('Error parsing pictures:', error);
      }
    }

    // Process wallpapers
    if (wallpapersResponse?.ok) {
      try {
        const filenames: string[] = await wallpapersResponse.json();
        if (Array.isArray(filenames) && filenames.length > 0) {
          // Take first 40 wallpapers for initial render
          const initialFilenames = filenames.slice(0, 40);
          wallpapers = initialFilenames.map(filename => {
            const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
            const cleanName = nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ');
            return {
              url: `${WALLPAPERS_BASE_URL}${encodeURIComponent(filename)}`,
              name: cleanName,
              slug: slugify(filename),
            };
          });
        }
      } catch (error) {
        console.error('Error parsing wallpapers:', error);
      }
    }

    return { pictures, wallpapers };
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return { pictures: [], wallpapers: [] };
  }
}

/**
 * Fetch all picture files from CDN to support static parameter generation
 */
export async function getAllPictures(): Promise<ImageData[]> {
  try {
    const response = await fetch(PICTURES_LIST_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const filenames: string[] = await response.json();
    if (!Array.isArray(filenames)) return [];

    return filenames.map(filename => {
      const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
      const cleanName = nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ');
      return {
        url: `${PICTURES_BASE_URL}${encodeURIComponent(filename)}`,
        name: cleanName,
        slug: slugify(filename),
      };
    });
  } catch (error) {
    console.error('Error fetching all pictures:', error);
    return [];
  }
}

/**
 * Resolves a picture from the CDN by its slug.
 * Since we don't store slugs, we fetch the CDN file list and match the slugified filenames.
 */
export async function getPictureBySlug(slug: string): Promise<ImageData | null> {
  if (!slug) return null;
  
  try {
    const pictures = await getAllPictures();
    const match = pictures.find(p => p.slug === slug);
    return match || null;
  } catch (error) {
    console.error(`Error resolving picture by slug ${slug}:`, error);
    return null;
  }
}

import { ImageData } from '@/lib/services/image-api-service';

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
            // Extract clean name from filename (remove extension and clean up)
            const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
            const cleanName = nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ');
            return {
              url: `${PICTURES_BASE_URL}${encodeURIComponent(filename)}`,
              name: cleanName,
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
            // Extract clean name from filename (remove extension and clean up)
            const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
            const cleanName = nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ');
            return {
              url: `${WALLPAPERS_BASE_URL}${encodeURIComponent(filename)}`,
              name: cleanName,
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
    // Return empty arrays on error - page will still render
    return { pictures: [], wallpapers: [] };
  }
}

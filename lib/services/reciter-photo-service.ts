/**
 * Reciter Photo Service
 * Fetches and caches the list of available reciter photos from CDN
 */

const CDN_BASE_URL = 'https://cdn.quran.tj/reciters-photo/';
const LIST_ENDPOINT = `${CDN_BASE_URL}list`;

// Cache for the photo filenames list
let cachedFilenames: string[] | null = null;
let cacheTimestamp: Date | null = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch the list of available reciter photo filenames from the CDN
 */
export async function fetchReciterPhotoFilenames(): Promise<string[]> {
  // Return cached data if available and not expired
  if (cachedFilenames !== null && cacheTimestamp !== null) {
    const age = Date.now() - cacheTimestamp.getTime();
    if (age < CACHE_DURATION_MS) {
      return cachedFilenames;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(LIST_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch reciter photos list: HTTP ${response.status}`);
    }

    const filenames: string[] = await response.json();
    
    if (!Array.isArray(filenames)) {
      throw new Error('Invalid response format: expected array of filenames');
    }

    // Cache the results
    cachedFilenames = filenames;
    cacheTimestamp = new Date();

    return filenames;
  } catch (error) {
    // If we have cached data, return it even if expired
    if (cachedFilenames !== null) {
      console.warn('[ReciterPhotoService] Using expired cache due to fetch error:', error);
      return cachedFilenames;
    }
    console.error('[ReciterPhotoService] Error fetching reciter photos list:', error);
    return [];
  }
}

/**
 * Get photo URL for a reciter ID
 * Checks if a matching filename exists in the CDN list
 */
export async function getReciterPhotoUrlFromCDN(reciterId: string): Promise<string | null> {
  try {
    const filenames = await fetchReciterPhotoFilenames();
    
    // Try to find a matching filename
    // Format: reciterId matches filename without extension
    // e.g., "ar.alafasy" matches "ar.alafasy.jpeg"
    // Handle cases where filename might have different extensions (jpg, jpeg, png, webp)
    const matchingFilename = filenames.find(filename => {
      // Remove extension (last dot + extension) and compare
      // This handles filenames with multiple dots like "ar.muhammadsiddiqalminshawimujawwad.jpeg"
      const filenameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      return filenameWithoutExt === reciterId;
    });

    if (matchingFilename) {
      return `${CDN_BASE_URL}${encodeURIComponent(matchingFilename)}`;
    }

    return null;
  } catch (error) {
    console.error('[ReciterPhotoService] Error getting photo URL:', error);
    return null;
  }
}

/**
 * Check if a reciter has a photo in the CDN
 */
export async function hasReciterPhoto(reciterId: string): Promise<boolean> {
  const url = await getReciterPhotoUrlFromCDN(reciterId);
  return url !== null;
}

/**
 * Clear the cache (useful for testing or forced refresh)
 */
export function clearReciterPhotoCache(): void {
  cachedFilenames = null;
  cacheTimestamp = null;
}


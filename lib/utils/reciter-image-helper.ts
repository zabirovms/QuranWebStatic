/**
 * Helper utility for reciter image URLs
 * Uses CDN endpoint to dynamically fetch available photos
 */

import { getReciterPhotoUrlFromCDN, hasReciterPhoto as checkCDNPhoto } from '@/lib/services/reciter-photo-service';

const CDN_BASE_URL = 'https://cdn.quran.tj/reciters-photo/';
const TAJIK_RECITER_ID = 'tg.akmal_mansurov';
const TAJIK_RECITER_LOCAL_PATH = '/images/reciters_photo/akmal_mansurov.jpg';

// Cache for synchronous lookups (populated asynchronously)
let photoUrlCache: Map<string, string | null> = new Map();
let isCacheInitialized = false;

/**
 * Initialize the photo URL cache by fetching from CDN
 * This should be called early in the app lifecycle
 */
export async function initializeReciterPhotoCache(): Promise<void> {
  if (isCacheInitialized) {
    return;
  }

  try {
    // Import the service dynamically to avoid circular dependencies
    const { fetchReciterPhotoFilenames } = await import('@/lib/services/reciter-photo-service');
    const filenames = await fetchReciterPhotoFilenames();
    
    // Build cache map: reciterId -> full URL
    filenames.forEach(filename => {
      // Remove extension (jpg, jpeg, png, webp) and use as key
      const filenameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const fullUrl = `${CDN_BASE_URL}${encodeURIComponent(filename)}`;
      photoUrlCache.set(filenameWithoutExt, fullUrl);
    });
    
    isCacheInitialized = true;
    console.log(`[ReciterImageHelper] Initialized cache with ${photoUrlCache.size} reciter photos`);
  } catch (error) {
    console.error('[ReciterImageHelper] Error initializing cache:', error);
  }
}

/**
 * Get reciter photo URL (synchronous, uses cache)
 * Returns local asset path for Tajik reciter, CDN URL for cached reciters, or null
 */
export function getReciterPhotoUrl(reciterId: string): string | null {
  // Keep Tajik reciter as local asset
  if (reciterId === TAJIK_RECITER_ID) {
    return TAJIK_RECITER_LOCAL_PATH;
  }
  
  // Check cache first (synchronous)
  if (photoUrlCache.has(reciterId)) {
    return photoUrlCache.get(reciterId) || null;
  }
  
  // If cache not initialized, try async lookup (but return null for now)
  // Components should handle async loading separately
  return null;
}

/**
 * Get reciter photo URL asynchronously (fetches from CDN if not in cache)
 */
export async function getReciterPhotoUrlAsync(reciterId: string): Promise<string | null> {
  // Keep Tajik reciter as local asset
  if (reciterId === TAJIK_RECITER_ID) {
    return TAJIK_RECITER_LOCAL_PATH;
  }
  
  // Initialize cache if needed
  if (!isCacheInitialized) {
    await initializeReciterPhotoCache();
  }
  
  // Check cache
  if (photoUrlCache.has(reciterId)) {
    return photoUrlCache.get(reciterId) || null;
  }
  
  // Try CDN lookup
  const url = await getReciterPhotoUrlFromCDN(reciterId);
  if (url) {
    photoUrlCache.set(reciterId, url);
  }
  
  return url;
}

/**
 * Check if reciter has a mapped image (synchronous, uses cache)
 */
export function hasMappedImage(reciterId: string): boolean {
  if (reciterId === TAJIK_RECITER_ID) {
    return true; // Tajik reciter always has local asset
  }
  
  if (isCacheInitialized) {
    return photoUrlCache.has(reciterId) && photoUrlCache.get(reciterId) !== null;
  }
  
  // If cache not initialized, return false (will be checked async)
  return false;
}

/**
 * Check if reciter has a mapped image asynchronously
 */
export async function hasMappedImageAsync(reciterId: string): Promise<boolean> {
  if (reciterId === TAJIK_RECITER_ID) {
    return true;
  }
  
  if (!isCacheInitialized) {
    await initializeReciterPhotoCache();
  }
  
  if (photoUrlCache.has(reciterId)) {
    return photoUrlCache.get(reciterId) !== null;
  }
  
  return await checkCDNPhoto(reciterId);
}

/**
 * Check if reciter photo is a local asset
 */
export function isLocalAsset(path: string | null): boolean {
  if (!path) return false;
  return path.startsWith('/images/') || path.startsWith('assets/');
}



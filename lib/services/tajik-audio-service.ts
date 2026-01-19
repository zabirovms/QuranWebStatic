/**
 * Tajik Audio Service
 * Fetches and provides URLs for Tajik translation audio files
 * Based on Flutter's TajikAudioService
 */

export interface TajikAudioFile {
  name: string;
  url: string;
  surahNumber: number;
}

class TajikAudioService {
  private static readonly API_BASE_URL = 'https://orange-salad-3850.zabirovms.workers.dev';
  private static readonly LIST_ENDPOINT = '/list';
  
  // Cache for the audio files list
  private static cachedFiles: TajikAudioFile[] | null = null;
  private static cacheTimestamp: Date | null = null;
  private static readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Fetch the list of available Tajik audio files from the API
   */
  async fetchAudioFiles(): Promise<TajikAudioFile[]> {
    // Return cached data if available and not expired
    if (TajikAudioService.cachedFiles !== null && TajikAudioService.cacheTimestamp !== null) {
      const age = Date.now() - TajikAudioService.cacheTimestamp.getTime();
      if (age < TajikAudioService.CACHE_DURATION_MS) {
        console.log('[TajikAudioService] Using cached audio files list');
        return TajikAudioService.cachedFiles;
      }
      console.log('[TajikAudioService] Cache expired, fetching fresh data');
    }

    try {
      console.log('[TajikAudioService] Fetching audio files from API:', `${TajikAudioService.API_BASE_URL}${TajikAudioService.LIST_ENDPOINT}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('[TajikAudioService] API request timeout');
        controller.abort();
      }, 10000); // 10 second timeout

      const response = await fetch(
        `${TajikAudioService.API_BASE_URL}${TajikAudioService.LIST_ENDPOINT}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch audio files: HTTP ${response.status}`);
      }

      const jsonList: any[] = await response.json();
      console.log('[TajikAudioService] Received', jsonList.length, 'files from API');
      const files: TajikAudioFile[] = jsonList.map((json) => {
        // Extract surah number from filename (e.g., "003.mp3" -> 3)
        const fileName = json.name || json.filename || '';
        const surahMatch = fileName.match(/(\d+)\.mp3$/);
        const surahNumber = surahMatch ? parseInt(surahMatch[1], 10) : 0;

        const url = json.url || json.path || '';
        if (!url) {
          console.warn('[TajikAudioService] File has no URL:', json);
        }

        return {
          name: fileName,
          url: url,
          surahNumber,
        };
      }).filter(f => f.url && f.url.trim() !== ''); // Filter out files without URLs

      console.log('[TajikAudioService] Processed', files.length, 'valid audio files');

      // Cache the results
      TajikAudioService.cachedFiles = files;
      TajikAudioService.cacheTimestamp = new Date();

      return files;
    } catch (error) {
      console.error('[TajikAudioService] Error fetching audio files:', error);
      // If we have cached data, return it even if expired
      if (TajikAudioService.cachedFiles !== null) {
        console.log('[TajikAudioService] Returning expired cache due to error');
        return TajikAudioService.cachedFiles;
      }
      throw error;
    }
  }

  /**
   * Get the audio URL for a specific surah number
   */
  async getAudioUrlForSurah(surahNumber: number): Promise<string | null> {
    try {
      console.log('[TajikAudioService] Fetching audio files for surah', surahNumber);
      const files = await this.fetchAudioFiles();
      console.log('[TajikAudioService] Fetched', files.length, 'audio files');

      // Find file matching the surah number
      // Format: "003.mp3" for surah 3
      const surahNumberStr = surahNumber.toString().padStart(3, '0');
      const fileName = `${surahNumberStr}.mp3`;

      const file = files.find(
        (f) => f.name === fileName || f.surahNumber === surahNumber
      );

      if (file) {
        console.log('[TajikAudioService] Found audio file for surah', surahNumber, ':', file.name, '->', file.url);
        // Validate URL
        if (!file.url || file.url.trim() === '') {
          console.error('[TajikAudioService] Audio file has empty URL:', file);
          return null;
        }
        // Ensure URL is absolute
        if (!file.url.startsWith('http://') && !file.url.startsWith('https://')) {
          console.error('[TajikAudioService] Audio file URL is not absolute:', file.url);
          return null;
        }
        return file.url;
      } else {
        console.warn('[TajikAudioService] No audio file found for surah', surahNumber, 'Available files:', files.map(f => f.name));
        return null;
      }
    } catch (error) {
      console.error('[TajikAudioService] Error getting Tajik audio URL for surah', surahNumber, ':', error);
      return null;
    }
  }

  /**
   * Clear the cache (useful for testing or forced refresh)
   */
  static clearCache(): void {
    TajikAudioService.cachedFiles = null;
    TajikAudioService.cacheTimestamp = null;
  }
}

// Export singleton instance
export const tajikAudioService = new TajikAudioService();



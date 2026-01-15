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
        return TajikAudioService.cachedFiles;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
      const files: TajikAudioFile[] = jsonList.map((json) => {
        // Extract surah number from filename (e.g., "003.mp3" -> 3)
        const fileName = json.name || json.filename || '';
        const surahMatch = fileName.match(/(\d+)\.mp3$/);
        const surahNumber = surahMatch ? parseInt(surahMatch[1], 10) : 0;

        return {
          name: fileName,
          url: json.url || json.path || '',
          surahNumber,
        };
      });

      // Cache the results
      TajikAudioService.cachedFiles = files;
      TajikAudioService.cacheTimestamp = new Date();

      return files;
    } catch (error) {
      // If we have cached data, return it even if expired
      if (TajikAudioService.cachedFiles !== null) {
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
      const files = await this.fetchAudioFiles();

      // Find file matching the surah number
      // Format: "003.mp3" for surah 3
      const surahNumberStr = surahNumber.toString().padStart(3, '0');
      const fileName = `${surahNumberStr}.mp3`;

      const file = files.find(
        (f) => f.name === fileName || f.surahNumber === surahNumber
      );

      return file ? file.url : null;
    } catch (error) {
      console.error('Error getting Tajik audio URL:', error);
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



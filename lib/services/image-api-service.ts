export interface ImageData {
  url: string;
  name: string;
}

export interface ImageApiResult {
  images: ImageData[];
  nextPageToken: string | null;
}

export class ImageApiService {
  // CDN base URLs
  private static readonly CDN_BASE_URL = 'https://cdn.quran.tj';
  
  // List endpoints
  private static readonly PICTURES_LIST_URL = `${ImageApiService.CDN_BASE_URL}/pictures/list`;
  private static readonly WALLPAPERS_LIST_URL = `${ImageApiService.CDN_BASE_URL}/wallpapers/list`;
  
  // Image base URLs
  private static readonly PICTURES_BASE_URL = `${ImageApiService.CDN_BASE_URL}/pictures/`;
  private static readonly WALLPAPERS_BASE_URL = `${ImageApiService.CDN_BASE_URL}/wallpapers/`;

  /**
   * Fetches image data from CDN using the list endpoint
   * The list endpoint returns a JSON array of image filenames
   */
  async fetchImageData({
    prefix = 'pictures/',
    pageToken = null,
    pageSize = 40,
  }: {
    prefix?: string;
    pageToken?: string | null;
    pageSize?: number;
  }): Promise<ImageApiResult> {
    try {
      // Determine list URL and base URL based on prefix
      const listUrl = prefix === 'wallpapers/' 
        ? ImageApiService.WALLPAPERS_LIST_URL
        : ImageApiService.PICTURES_LIST_URL;
      
      const baseUrl = prefix === 'wallpapers/'
        ? ImageApiService.WALLPAPERS_BASE_URL
        : ImageApiService.PICTURES_BASE_URL;

      // Fetch the list of image filenames with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      let response: Response;
      try {
        response = await fetch(listUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout. Please check your internet connection.');
        }
        throw fetchError;
      }

      if (!response.ok) {
        throw new Error(`Failed to load image list: HTTP ${response.status}`);
      }

      // Parse the JSON array of filenames
      let filenames: string[];
      try {
        filenames = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('Invalid response format from server.');
      }
      
      if (!Array.isArray(filenames) || filenames.length === 0) {
        throw new Error('No images found in the list');
      }

      // Apply pagination
      const startIndex = pageToken ? parseInt(pageToken, 10) : 0;
      const endIndex = startIndex + pageSize;
      const pageFilenames = filenames.slice(startIndex, endIndex);

      // Convert filenames to ImageData
      const imageDataList: ImageData[] = pageFilenames.map((filename) => {
        // Construct full URL - encode the filename properly
        const encodedFilename = encodeURIComponent(filename);
        const url = `${baseUrl}${encodedFilename}`;
        
        // Extract clean name from filename (remove extension and clean up)
        const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
        const cleanName = nameWithoutExt.replace(/_/g, ' ').replace(/-/g, ' ');

        return {
          url,
          name: cleanName,
        };
      });

      // Determine next page token
      const nextPageToken = endIndex < filenames.length ? endIndex.toString() : null;

      return {
        images: imageDataList,
        nextPageToken,
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network is unreachable. Please check your internet connection.');
      }
      throw error;
    }
  }
}

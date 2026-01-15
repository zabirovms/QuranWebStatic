/**
 * Background Service
 * Fetches background images for quoted verses from Google Cloud Storage
 */

const PUBLIC_BUCKET_BASE = 'https://storage.googleapis.com/quran-tajik/';

export class BackgroundService {
  private cachedBackgrounds: string[] | null = null;

  async fetchBackgroundUrls(): Promise<string[]> {
    if (this.cachedBackgrounds && this.cachedBackgrounds.length > 0) {
      return this.cachedBackgrounds;
    }

    try {
      // Try backgrounds/ prefix first
      let urls = await this.fetchImagesFromBucket('backgrounds/');
      
      // Fallback to wallpapers/ if backgrounds/ is empty
      if (urls.length === 0) {
        urls = await this.fetchImagesFromBucket('wallpapers/');
      }

      this.cachedBackgrounds = urls;
      return urls;
    } catch (error) {
      console.error('Error fetching background images:', error);
      return this.cachedBackgrounds || [];
    }
  }

  private async fetchImagesFromBucket(prefix: string): Promise<string[]> {
    try {
      const queryParams = new URLSearchParams({
        prefix,
        maxResults: '40',
        fields: 'items/name,nextPageToken',
      });

      const url = `https://storage.googleapis.com/storage/v1/b/quran-tajik/o?${queryParams.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const items = data.items || [];

      // Filter for image files and construct URLs
      const imageUrls = items
        .filter((item: any) => {
          const name = item.name || '';
          const lowerName = name.toLowerCase();
          return lowerName.endsWith('.jpg') ||
                 lowerName.endsWith('.jpeg') ||
                 lowerName.endsWith('.png') ||
                 lowerName.endsWith('.gif') ||
                 lowerName.endsWith('.webp');
        })
        .map((item: any) => {
          const name = item.name || '';
          // Encode each path segment
          const encodedName = name.split('/').map(encodeURIComponent).join('/');
          return `${PUBLIC_BUCKET_BASE}${encodedName}`;
        });

      return imageUrls;
    } catch (error) {
      console.error(`Error fetching images from ${prefix}:`, error);
      return [];
    }
  }

  clearCache(): void {
    this.cachedBackgrounds = null;
  }
}


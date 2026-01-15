/**
 * Service for managing audio downloads
 * Matches Flutter's AudioDownloadsService (simplified for web)
 * Note: Actual file downloads are not supported on web, but we track metadata
 */

export interface AudioDownload {
  reciterId: string;
  surahNumber: number;
  fileName: string;
  url: string;
  downloadedAt: Date;
  fileSizeBytes: number;
  key: string; // Computed: 'reciterId:surahNumber'
}

const KEY = 'audio_downloads';

export class AudioDownloadsService {
  async getDownloads(): Promise<AudioDownload[]> {
    if (typeof window === 'undefined') return [];
    
    const jsonString = localStorage.getItem(KEY);
    if (!jsonString) return [];

    try {
      const jsonList = JSON.parse(jsonString);
      return jsonList.map((json: any) => ({
        reciterId: json.reciterId,
        surahNumber: json.surahNumber,
        fileName: json.fileName,
        url: json.url,
        downloadedAt: new Date(json.downloadedAt),
        fileSizeBytes: json.fileSizeBytes,
        key: `${json.reciterId}:${json.surahNumber}`,
      }));
    } catch (e) {
      return [];
    }
  }

  async isDownloaded(reciterId: string, surahNumber: number): Promise<boolean> {
    // On web, downloads are not supported, so always return false
    return false;
  }

  async getDownloadsByReciter(reciterId: string): Promise<AudioDownload[]> {
    const downloads = await this.getDownloads();
    return downloads.filter(d => d.reciterId === reciterId);
  }

  async deleteDownload(reciterId: string, surahNumber: number): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    const downloads = await this.getDownloads();
    const key = `${reciterId}:${surahNumber}`;
    const filtered = downloads.filter(d => d.key !== key);
    await this._saveDownloads(filtered);
    return true;
  }

  private async _saveDownloads(downloads: AudioDownload[]): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const jsonList = downloads.map(d => ({
      reciterId: d.reciterId,
      surahNumber: d.surahNumber,
      fileName: d.fileName,
      url: d.url,
      downloadedAt: d.downloadedAt.toISOString(),
      fileSizeBytes: d.fileSizeBytes,
    }));
    localStorage.setItem(KEY, JSON.stringify(jsonList));
  }
}


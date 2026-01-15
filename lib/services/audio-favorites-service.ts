/**
 * Service for managing audio favorites
 * Matches Flutter's AudioFavoritesService
 */

export interface AudioFavorite {
  reciterId: string;
  surahNumber: number;
  createdAt: Date;
  key: string; // Computed: 'reciterId:surahNumber'
}

const KEY = 'audio_favorites';

export class AudioFavoritesService {
  async getFavorites(): Promise<AudioFavorite[]> {
    if (typeof window === 'undefined') return [];
    
    const jsonString = localStorage.getItem(KEY);
    if (!jsonString) return [];

    try {
      const jsonList = JSON.parse(jsonString);
      return jsonList.map((json: any) => ({
        reciterId: json.reciterId,
        surahNumber: json.surahNumber,
        createdAt: new Date(json.createdAt),
        key: `${json.reciterId}:${json.surahNumber}`,
      }));
    } catch (e) {
      return [];
    }
  }

  async isFavorite(reciterId: string, surahNumber: number): Promise<boolean> {
    const favorites = await this.getFavorites();
    const key = `${reciterId}:${surahNumber}`;
    return favorites.some(f => f.key === key);
  }

  async addFavorite(reciterId: string, surahNumber: number): Promise<void> {
    const favorites = await this.getFavorites();
    const key = `${reciterId}:${surahNumber}`;
    
    // Check if already exists
    if (favorites.some(f => f.key === key)) return;

    favorites.push({
      reciterId,
      surahNumber,
      createdAt: new Date(),
      key,
    });

    await this._saveFavorites(favorites);
  }

  async removeFavorite(reciterId: string, surahNumber: number): Promise<void> {
    const favorites = await this.getFavorites();
    const key = `${reciterId}:${surahNumber}`;
    const filtered = favorites.filter(f => f.key !== key);
    await this._saveFavorites(filtered);
  }

  async toggleFavorite(reciterId: string, surahNumber: number): Promise<void> {
    const isFav = await this.isFavorite(reciterId, surahNumber);
    if (isFav) {
      await this.removeFavorite(reciterId, surahNumber);
    } else {
      await this.addFavorite(reciterId, surahNumber);
    }
  }

  async getFavoritesByReciter(reciterId: string): Promise<AudioFavorite[]> {
    const favorites = await this.getFavorites();
    return favorites.filter(f => f.reciterId === reciterId);
  }

  private async _saveFavorites(favorites: AudioFavorite[]): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const jsonList = favorites.map(f => ({
      reciterId: f.reciterId,
      surahNumber: f.surahNumber,
      createdAt: f.createdAt.toISOString(),
    }));
    localStorage.setItem(KEY, JSON.stringify(jsonList));
  }
}


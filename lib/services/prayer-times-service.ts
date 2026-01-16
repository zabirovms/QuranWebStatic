import type { PrayerTime, PrayerTimesMonth, PrayerTimesMonthResponse, PrayerDay } from '@/lib/types/prayer-times';

export class PrayerTimesService {
  private static readonly API_BASE_URL = 'https://cdn.quran.tj/prayertimes';
  private static readonly LIST_ENDPOINT = `${PrayerTimesService.API_BASE_URL}/list`;
  
  // Cache for list of available files
  private static cachedFiles: string[] | null = null;
  private static cacheTimestamp: Date | null = null;
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  /**
   * Extracts the start time from a time range (e.g., "06:00 - 07:39" -> "06:00")
   */
  private extractStartTime(timeRange: string): string {
    return timeRange.split(' - ')[0] || timeRange;
  }

  /**
   * Converts a PrayerDay to PrayerTime format
   */
  private convertDayToPrayerTime(day: PrayerDay): PrayerTime {
    return {
      fajr: this.extractStartTime(day.fajr),
      dhuhr: this.extractStartTime(day.dhuhr),
      asr: this.extractStartTime(day.asr),
      maghrib: this.extractStartTime(day.maghrib),
      isha: this.extractStartTime(day.isha),
    };
  }

  /**
   * Extracts day number from gregorian date string (e.g., "01.01.2026" -> "01")
   */
  private extractDayNumber(gregorian: string): string {
    const parts = gregorian.split('.');
    return parts[0] || '';
  }

  /**
   * Fetches the list of available prayer time files
   */
  async fetchAvailableFiles(): Promise<string[]> {
    // Return cached data if available and not expired
    if (
      PrayerTimesService.cachedFiles !== null &&
      PrayerTimesService.cacheTimestamp !== null &&
      Date.now() - PrayerTimesService.cacheTimestamp.getTime() < PrayerTimesService.CACHE_DURATION
    ) {
      return PrayerTimesService.cachedFiles;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(PrayerTimesService.LIST_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch prayer times list: HTTP ${response.status}`);
      }

      const data = await response.json();
      // Handle both array response and object with files property
      const files = Array.isArray(data) 
        ? data 
        : (Array.isArray(data.files) ? data.files : []);

      // Cache the results
      PrayerTimesService.cachedFiles = files;
      PrayerTimesService.cacheTimestamp = new Date();

      return files;
    } catch (error) {
      // If we have cached data, return it even if expired
      if (PrayerTimesService.cachedFiles !== null) {
        return PrayerTimesService.cachedFiles;
      }
      throw error;
    }
  }

  /**
   * Fetches prayer times for a specific month (format: YYYY-MM.json)
   * Returns data in a format keyed by day number (01-31)
   */
  async fetchMonthPrayerTimes(monthFile: string): Promise<PrayerTimesMonth> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const url = `${PrayerTimesService.API_BASE_URL}/${monthFile}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch prayer times for ${monthFile}: HTTP ${response.status}`);
      }

      const data: PrayerTimesMonthResponse = await response.json();
      
      // Convert days array to object keyed by day number
      const monthData: PrayerTimesMonth = {};
      for (const day of data.days) {
        const dayNumber = this.extractDayNumber(day.gregorian);
        if (dayNumber) {
          monthData[dayNumber] = this.convertDayToPrayerTime(day);
        }
      }

      return monthData;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network is unreachable. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Gets prayer times for today
   */
  async getTodayPrayerTimes(): Promise<PrayerTime | null> {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const monthFile = `${year}-${month}.json`;

      const monthData = await this.fetchMonthPrayerTimes(monthFile);
      const dayData = monthData[day] || monthData[String(today.getDate())];

      return dayData || null;
    } catch (error) {
      console.error('Failed to get today prayer times:', error);
      return null;
    }
  }

  /**
   * Gets prayer times for a specific date
   */
  async getPrayerTimesForDate(date: Date): Promise<PrayerTime | null> {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const monthFile = `${year}-${month}.json`;

      const monthData = await this.fetchMonthPrayerTimes(monthFile);
      const dayData = monthData[day] || monthData[String(date.getDate())];

      return dayData || null;
    } catch (error) {
      console.error('Failed to get prayer times for date:', error);
      return null;
    }
  }

  /**
   * Fetches full month data with all day details (weekday, hijri, etc.)
   */
  async fetchFullMonthData(monthFile: string): Promise<PrayerTimesMonthResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const url = `${PrayerTimesService.API_BASE_URL}/${monthFile}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch prayer times for ${monthFile}: HTTP ${response.status}`);
      }

      const data: PrayerTimesMonthResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network is unreachable. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Gets the filename for a specific month (format: YYYY-MM.json)
   */
  getMonthFileName(year: number, month: number): string {
    const monthStr = String(month).padStart(2, '0');
    return `${year}-${monthStr}.json`;
  }
}

// Export singleton instance
export const prayerTimesService = new PrayerTimesService();

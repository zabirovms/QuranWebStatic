export interface PrayerDay {
  weekday: string;
  gregorian: string; // Format: "DD.MM.YYYY"
  hijri: string; // Format: "DD.MM.YYYY"
  fajr: string; // Format: "HH:MM - HH:MM"
  dhuhr: string; // Format: "HH:MM - HH:MM"
  asr: string; // Format: "HH:MM - HH:MM"
  sunset_makruh: string; // Format: "HH:MM - HH:MM"
  maghrib: string; // Format: "HH:MM - HH:MM"
  isha: string; // Format: "HH:MM - HH:MM"
}

export interface PrayerTimesMonthResponse {
  source: string;
  location: string;
  year: number;
  month: number;
  generated_at: string;
  days: PrayerDay[];
}

export interface PrayerTime {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  sunrise?: string; // Not in API but we can calculate or use fajr end time
}

export interface PrayerTimesMonth {
  [day: string]: PrayerTime; // day is "DD" (01-31)
}

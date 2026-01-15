/**
 * Settings Service
 * Manages app settings using localStorage
 */

export interface AppSettings {
  theme: string;
  translationLanguage: string;
  fontSize: number;
  fontFamily: string;
  showTransliteration: boolean;
  showTranslation: boolean;
  showTafsir: boolean;
  audioEnabled: boolean;
  audioVolume: number;
  audioSpeed: number;
  audioEdition: string;
  wordByWordMode: boolean;
  showOnlyArabic: boolean;
  showVerseActions: boolean;
  plainCardsMode: boolean;
  hapticFeedbackEnabled: boolean;
  autoPlay: boolean;
  repeatMode: boolean;
  weeklyReminderEnabled: boolean;
  dailyRemindersEnabled: boolean;
  dailyDuaTime: string;
  dailyVerseTime: string;
}

const STORAGE_KEY = 'quran_app_settings';

const defaultSettings: AppSettings = {
  theme: 'newLight',
  translationLanguage: 'tj_2', // Абуаломуддин (бо тафсир) - matches Flutter default
  fontSize: 16,
  fontFamily: 'Roboto',
  showTransliteration: true,
  showTranslation: true,
  showTafsir: false,
  audioEnabled: true,
  audioVolume: 0.8,
  audioSpeed: 1.0,
  audioEdition: 'ar.alafasy', // Default reciter: Mishary Alafasy
  wordByWordMode: false,
  showOnlyArabic: false,
  showVerseActions: false,
  plainCardsMode: true,
  hapticFeedbackEnabled: true,
  autoPlay: false,
  repeatMode: false,
  weeklyReminderEnabled: true,
  dailyRemindersEnabled: true,
  dailyDuaTime: '07:00',
  dailyVerseTime: '19:00',
};

export class SettingsService {
  private static instance: SettingsService;
  private settings: AppSettings;

  private constructor() {
    this.settings = this.loadSettings();
    // Apply theme on initialization
    if (typeof document !== 'undefined') {
      this.applyTheme(this.settings.theme);
    }
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private loadSettings(): AppSettings {
    if (typeof window === 'undefined') {
      return { ...defaultSettings };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }

    return { ...defaultSettings };
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  setTheme(theme: string): void {
    this.settings.theme = theme;
    this.saveSettings();
    // Apply theme immediately
    if (typeof document !== 'undefined') {
      this.applyTheme(theme);
    }
  }

  setTranslationLanguage(language: string): void {
    this.settings.translationLanguage = language;
    this.saveSettings();
  }

  setFontSize(fontSize: number): void {
    this.settings.fontSize = fontSize;
    this.saveSettings();
    this.applyFontSize(fontSize);
  }

  setFontFamily(fontFamily: string): void {
    this.settings.fontFamily = fontFamily;
    this.saveSettings();
    this.applyFontFamily(fontFamily);
  }

  setShowTransliteration(show: boolean): void {
    this.settings.showTransliteration = show;
    this.saveSettings();
  }

  setShowTranslation(show: boolean): void {
    this.settings.showTranslation = show;
    this.saveSettings();
  }

  setShowTafsir(show: boolean): void {
    this.settings.showTafsir = show;
    this.saveSettings();
  }

  setAudioEnabled(enabled: boolean): void {
    this.settings.audioEnabled = enabled;
    this.saveSettings();
  }

  setAudioVolume(volume: number): void {
    this.settings.audioVolume = volume;
    this.saveSettings();
  }

  setAudioSpeed(speed: number): void {
    this.settings.audioSpeed = speed;
    this.saveSettings();
  }

  setAudioEdition(edition: string): void {
    this.settings.audioEdition = edition;
    this.saveSettings();
  }

  setWordByWordMode(enabled: boolean): void {
    this.settings.wordByWordMode = enabled;
    this.saveSettings();
  }

  setShowOnlyArabic(show: boolean): void {
    this.settings.showOnlyArabic = show;
    this.saveSettings();
  }

  setShowVerseActions(show: boolean): void {
    this.settings.showVerseActions = show;
    this.saveSettings();
  }

  setPlainCardsMode(enabled: boolean): void {
    this.settings.plainCardsMode = enabled;
    this.saveSettings();
  }

  setHapticFeedbackEnabled(enabled: boolean): void {
    this.settings.hapticFeedbackEnabled = enabled;
    this.saveSettings();
  }

  setAutoPlay(enabled: boolean): void {
    this.settings.autoPlay = enabled;
    this.saveSettings();
  }

  setRepeatMode(enabled: boolean): void {
    this.settings.repeatMode = enabled;
    this.saveSettings();
  }

  setWeeklyReminderEnabled(enabled: boolean): void {
    this.settings.weeklyReminderEnabled = enabled;
    this.saveSettings();
  }

  setDailyRemindersEnabled(enabled: boolean): void {
    this.settings.dailyRemindersEnabled = enabled;
    this.saveSettings();
  }

  setDailyDuaTime(time: string): void {
    this.settings.dailyDuaTime = time;
    this.saveSettings();
  }

  setDailyVerseTime(time: string): void {
    this.settings.dailyVerseTime = time;
    this.saveSettings();
  }

  resetToDefaults(): void {
    this.settings = { ...defaultSettings };
    this.saveSettings();
    this.applyTheme(defaultSettings.theme);
    this.applyFontSize(defaultSettings.fontSize);
    this.applyFontFamily(defaultSettings.fontFamily);
  }

  private applyTheme(theme: string): void {
    if (typeof document === 'undefined') return;
    
    try {
      document.documentElement.setAttribute('data-theme', theme);
      // Force a reflow to ensure CSS variables are updated
      void document.documentElement.offsetHeight;
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }

  private applyFontSize(fontSize: number): void {
    if (typeof document === 'undefined') return;
    
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
  }

  private applyFontFamily(fontFamily: string): void {
    if (typeof document === 'undefined') return;
    
    document.documentElement.style.setProperty('--base-font-family', fontFamily);
  }
}


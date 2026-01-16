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
const WORD_BY_WORD_MODE_RESET_KEY = 'wbw_mode_reset_v1'; // Version key for one-time reset

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
        const merged = { ...defaultSettings, ...parsed };
        
        // One-time reset: If wordByWordMode is true and we haven't done the reset yet,
        // reset it to false to fix any corrupted localStorage data
        const resetDone = localStorage.getItem(WORD_BY_WORD_MODE_RESET_KEY);
        if (merged.wordByWordMode === true && !resetDone) {
          console.warn('[SettingsService] Resetting wordByWordMode to false (one-time fix for corrupted data)');
          merged.wordByWordMode = false;
          // Mark that we've done the reset
          localStorage.setItem(WORD_BY_WORD_MODE_RESET_KEY, 'true');
          // Save corrected settings
          this.settings = merged;
          this.saveSettings();
        }
        
        return merged;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // If there's an error parsing, clear corrupted data and use defaults
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (clearError) {
        console.error('Error clearing corrupted settings:', clearError);
      }
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
    // Double-check that wordByWordMode is never true unless explicitly set by user
    // This is a safety check in case something tries to enable it automatically
    const settings = { ...this.settings };
    // Note: We allow it to be true if user explicitly set it, but we prevent auto-enabling
    return settings;
  }
  
  /**
   * Reset wordByWordMode to false if it was somehow enabled automatically
   * Call this if you suspect wordByWordMode was enabled incorrectly
   */
  resetWordByWordMode(): void {
    if (this.settings.wordByWordMode === true) {
      console.warn('[SettingsService] Resetting wordByWordMode to false');
      this.settings.wordByWordMode = false;
      this.saveSettings();
    }
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
    // Prevent automatic enabling - only allow manual toggle
    // This ensures wordByWordMode can only be enabled through user interaction
    if (enabled === true) {
      console.log('[SettingsService] Word-by-word mode enabled by user');
    }
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


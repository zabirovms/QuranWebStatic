/**
 * Tasbeeh Service
 * Manages tasbeeh counter state and persistence
 */

export interface TasbeehSettings {
  currentTasbeehIndex: number;
  count: number;
  completedTasbeehs: number;
  targetCount: number;
  vibrationEnabled: boolean;
  saveHistory: boolean;
}

const STORAGE_KEY = 'tasbeeh_settings';
const DEFAULT_TARGET_COUNT = 33;

const defaultSettings: TasbeehSettings = {
  currentTasbeehIndex: 0,
  count: 0,
  completedTasbeehs: 0,
  targetCount: DEFAULT_TARGET_COUNT,
  vibrationEnabled: false,
  saveHistory: true,
};

export class TasbeehService {
  private static instance: TasbeehService;
  private settings: TasbeehSettings;

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance(): TasbeehService {
    if (!TasbeehService.instance) {
      TasbeehService.instance = new TasbeehService();
    }
    return TasbeehService.instance;
  }

  private loadSettings(): TasbeehSettings {
    if (typeof window === 'undefined') {
      return defaultSettings;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Error loading tasbeeh settings:', error);
    }

    return defaultSettings;
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving tasbeeh settings:', error);
    }
  }

  getSettings(): TasbeehSettings {
    return { ...this.settings };
  }

  setCurrentTasbeehIndex(index: number): void {
    this.settings.currentTasbeehIndex = index;
    this.saveSettings();
  }

  incrementCount(): void {
    this.settings.count += 1;
    this.saveSettings();
  }

  resetCount(): void {
    this.settings.count = 0;
    this.saveSettings();
  }

  incrementCompletedTasbeehs(): void {
    this.settings.completedTasbeehs += 1;
    this.settings.count = 0;
    this.saveSettings();
  }

  setTargetCount(targetCount: number): void {
    this.settings.targetCount = targetCount;
    this.saveSettings();
  }

  resetAll(): void {
    this.settings = { ...defaultSettings };
    this.saveSettings();
  }

  checkTargetReached(): boolean {
    return this.settings.count >= this.settings.targetCount;
  }
}


/**
 * Word-by-word audio service
 * Handles playback of individual word audio files
 */

export interface WordAudioState {
  isPlaying: boolean;
  currentSurah: number | null;
  currentVerse: number | null;
  currentWord: number | null;
  isLoading: boolean;
  error: string | null;
}

type WordAudioStateListener = (state: WordAudioState) => void;

class WordAudioService {
  private audio: HTMLAudioElement | null = null;
  private state: WordAudioState = {
    isPlaying: false,
    currentSurah: null,
    currentVerse: null,
    currentWord: null,
    isLoading: false,
    error: null,
  };
  private listeners: Set<WordAudioStateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true, isLoading: false });
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('ended', () => {
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('loadstart', () => {
      this.updateState({ isLoading: true, error: null });
    });

    this.audio.addEventListener('error', (e) => {
      const error = this.audio?.error
        ? `Audio error: ${this.audio.error.message || 'Unknown error'}`
        : 'Failed to load audio';
      this.updateState({ isPlaying: false, isLoading: false, error });
    });

    this.audio.addEventListener('canplay', () => {
      this.updateState({ isLoading: false });
    });
  }

  private updateState(updates: Partial<WordAudioState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Play a specific word
   */
  async playWord(
    surahNumber: number,
    verseNumber: number,
    wordNumber: number,
    audioUrl: string
  ): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Word audio playback is only available in the browser');
    }

    if (!this.audio) {
      this.audio = new Audio();
      this.setupAudioListeners();
    }

    // If already playing the same word, pause it
    if (
      this.state.isPlaying &&
      this.state.currentSurah === surahNumber &&
      this.state.currentVerse === verseNumber &&
      this.state.currentWord === wordNumber
    ) {
      await this.pause();
      return;
    }

    this.updateState({
      currentSurah: surahNumber,
      currentVerse: verseNumber,
      currentWord: wordNumber,
      isLoading: true,
      error: null,
    });

    try {
      this.audio.src = audioUrl;
      this.audio.load();
      await this.audio.play();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to play word audio';
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * Pause current playback
   */
  async pause(): Promise<void> {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    this.updateState({ isPlaying: false });
  }

  /**
   * Stop and reset
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
    }
    this.updateState({
      isPlaying: false,
      currentSurah: null,
      currentVerse: null,
      currentWord: null,
      isLoading: false,
      error: null,
    });
  }

  /**
   * Get current state
   */
  getState(): WordAudioState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: WordAudioStateListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.state);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if a specific word is currently playing
   */
  isWordPlaying(
    surahNumber: number,
    verseNumber: number,
    wordNumber: number
  ): boolean {
    return (
      this.state.isPlaying &&
      this.state.currentSurah === surahNumber &&
      this.state.currentVerse === verseNumber &&
      this.state.currentWord === wordNumber
    );
  }
}

// Singleton instance
export const wordAudioService = new WordAudioService();

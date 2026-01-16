/**
 * Audio Service for Quran playback
 * Handles both verse-by-verse and full surah playback
 */

export interface PlaybackState {
  isPlaying: boolean;
  currentSurahNumber: number | null;
  currentVerseNumber: number | null;
  currentEdition: string | null;
  currentUrl: string | null; // Current audio URL
  position: number; // in seconds
  duration: number; // in seconds
  isLoading: boolean;
  error: string | null;
  currentWordNumber: number | null; // Current word number (1-based) for highlighting
}

type PlaybackStateListener = (state: PlaybackState) => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private currentState: PlaybackState = {
    isPlaying: false,
    currentSurahNumber: null,
    currentVerseNumber: null,
    currentEdition: null,
    currentUrl: null,
    position: 0,
    duration: 0,
    isLoading: false,
    error: null,
    currentWordNumber: null,
  };
  private listeners: Set<PlaybackStateListener> = new Set();
  private positionInterval: NodeJS.Timeout | null = null;
  private autoPlayNextVerse: boolean = false;
  private playbackSpeed: number = 1.0;
  private isRepeating: boolean = false;
  private currentUrl: string | null = null;
  private currentAlignment: any = null; // Current verse alignment data
  private alignmentData: any = null; // Cached alignment data for current reciter
  private isLoadingAlignment: boolean = false; // Flag to prevent concurrent alignment loads

  constructor() {
    // Don't initialize audio element during SSR
    // It will be initialized lazily when needed in the browser
  }

  private ensureAudioElement(): void {
    // Only create Audio element in browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    if (!this.audio) {
      this.audio = new Audio();
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    this.ensureAudioElement();
    if (!this.audio) return;

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio) {
        this.updateState({
          duration: this.audio.duration,
          isLoading: false,
        });
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        const position = this.audio.currentTime;
        this.updateState({
          position,
        });
        // Update current word if we have alignment data
        this.updateCurrentWord(position);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.handleAudioEnded();
    });

    this.audio.addEventListener('play', () => {
      this.updateState({ isPlaying: true, isLoading: false });
    });

    this.audio.addEventListener('pause', () => {
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('waiting', () => {
      this.updateState({ isLoading: true });
    });

    this.audio.addEventListener('canplay', () => {
      this.updateState({ isLoading: false });
    });

    this.audio.addEventListener('error', (e) => {
      const error = this.audio?.error;
      let errorMessage = 'Хатогӣ дар пахш кардан';
      
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Пахш қатъ карда шуд';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Хатогии шабака';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Хатогии декоди кардан';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Формати садо дастгирӣ намешавад';
            console.error('[AudioService] Source not supported. URL:', this.audio?.src);
            break;
          default:
            errorMessage = `Хатогӣ: ${error.message || 'Хатогии номаълум'}`;
        }
        console.error('[AudioService] Audio error:', {
          code: error.code,
          message: error.message,
          url: this.audio?.src,
        });
      }
      
      this.updateState({
        error: errorMessage,
        isLoading: false,
        isPlaying: false,
      });
    });
  }

  private updateState(updates: Partial<PlaybackState>) {
    this.currentState = { ...this.currentState, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener({ ...this.currentState });
      } catch (error) {
        console.error('[AudioService] Listener error:', error);
      }
    });
  }

  subscribe(listener: PlaybackStateListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener({ ...this.currentState });
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  private startPositionPolling() {
    if (typeof window === 'undefined') return;
    this.stopPositionPolling();
    this.positionInterval = setInterval(() => {
      if (this.audio && !this.audio.paused) {
        this.updateState({
          position: this.audio.currentTime,
        });
      }
    }, 100);
  }

  private stopPositionPolling() {
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
      this.positionInterval = null;
    }
  }

  /**
   * Update current word based on playback position and alignment data
   */
  private async updateCurrentWord(positionSeconds: number) {
    // Only update if we're in verse-by-verse mode and have alignment data
    if (
      !this.currentState.currentSurahNumber ||
      !this.currentState.currentVerseNumber ||
      !this.currentState.currentEdition
    ) {
      return;
    }

    // Check if alignment data is available for this reciter
    try {
      const { hasAlignmentData, getAlignmentForVerse, getCurrentWordIndex, wordIndexToWordNumber } = 
        await import('@/lib/data/alignment-data-client');
      
      const reciterId = this.currentState.currentEdition;
      if (!hasAlignmentData(reciterId)) {
        // No alignment data for this reciter, clear word tracking
        if (this.currentState.currentWordNumber !== null) {
          this.updateState({ currentWordNumber: null });
        }
        return;
      }

      // Load alignment data if not already loaded (and not currently loading)
      if (!this.currentAlignment && !this.isLoadingAlignment) {
        this.isLoadingAlignment = true;
        try {
          const alignment = await getAlignmentForVerse(
            reciterId,
            this.currentState.currentSurahNumber,
            this.currentState.currentVerseNumber
          );
          this.currentAlignment = alignment;
        } finally {
          this.isLoadingAlignment = false;
        }
      }

      // Get current word index from alignment (only if we have alignment data)
      if (this.currentAlignment) {
        const currentTimeMs = positionSeconds * 1000;
        const wordIndex = getCurrentWordIndex(this.currentAlignment, currentTimeMs);
        const wordNumber = wordIndexToWordNumber(wordIndex);
        
        // Only update if word number changed
        if (this.currentState.currentWordNumber !== wordNumber) {
          this.updateState({ currentWordNumber: wordNumber });
        }
      }
    } catch (error) {
      // Silently fail - alignment data is optional
      console.debug('[AudioService] Failed to update current word:', error);
      this.isLoadingAlignment = false; // Reset loading flag on error
    }
  }

  private async handleAudioEnded() {
    if (this.autoPlayNextVerse && this.currentState.currentSurahNumber && this.currentState.currentVerseNumber) {
      // Auto-play next verse
      const nextVerse = this.currentState.currentVerseNumber + 1;
      
      // Get verse count for the surah
      const versesPerSurah = [
        7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
      ];
      
      const maxVerses = versesPerSurah[this.currentState.currentSurahNumber - 1];
      
      if (nextVerse > maxVerses) {
        // End of surah - stop auto-play
        this.autoPlayNextVerse = false;
        this.updateState({
          isPlaying: false,
          currentVerseNumber: null,
        });
      } else {
        try {
          await this.playVerse(this.currentState.currentSurahNumber, nextVerse, this.currentState.currentEdition || 'ar.alafasy');
        } catch (error) {
          // Error playing next verse
          this.autoPlayNextVerse = false;
          this.updateState({
            isPlaying: false,
            currentVerseNumber: null,
          });
        }
      }
    } else if (this.isRepeating && this.currentState.currentSurahNumber) {
      // Repeat current surah
      if (this.currentState.currentVerseNumber) {
        // Repeat current verse
        await this.playVerse(
          this.currentState.currentSurahNumber,
          this.currentState.currentVerseNumber,
          this.currentState.currentEdition || 'ar.alafasy'
        );
      } else {
        // Repeat full surah
        await this.playSurah(this.currentState.currentSurahNumber, this.currentState.currentEdition || 'ar.alafasy');
      }
    } else {
      // Normal end
      this.updateState({
        isPlaying: false,
      });
    }
  }

  async playVerse(surahNumber: number, verseNumber: number, edition: string): Promise<void> {
    try {
      // Ensure we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Audio playback is only available in the browser');
      }

      // Normalize edition - replace 'default' with valid default reciter
      let normalizedEdition = edition;
      if (!edition || edition === 'default' || edition.trim() === '') {
        normalizedEdition = 'ar.alafasy';
        console.warn('[AudioService] Invalid edition "' + edition + '", using default: ar.alafasy');
      }
      
      // Check if edition supports verse-by-verse
      const { supportsVerseByVerse } = await import('@/lib/utils/audio-helper');
      if (!supportsVerseByVerse(normalizedEdition)) {
        throw new Error(`Қорӣ "${normalizedEdition}" дархост кардани ояти ҷудогонаро дастгирӣ намекунад`);
      }

      const { buildVerseAudioUrl } = await import('@/lib/utils/audio-helper');
      const audioUrl = buildVerseAudioUrl(normalizedEdition, surahNumber, verseNumber);
      
      console.log('[AudioService] Playing verse:', { surahNumber, verseNumber, edition: normalizedEdition, audioUrl });
      
      // Validate URL format
      if (!audioUrl || !audioUrl.startsWith('http')) {
        throw new Error(`Invalid audio URL: ${audioUrl}`);
      }

      this.ensureAudioElement();
      if (!this.audio) {
        throw new Error('Audio element could not be initialized');
      }

      if (this.currentUrl === audioUrl && this.audio && !this.audio.paused) {
        return; // Already playing
      }

      this.currentUrl = audioUrl;
      // Clear previous alignment data
      this.currentAlignment = null;
      this.isLoadingAlignment = false;
      this.updateState({
        isLoading: true,
        error: null,
        currentSurahNumber: surahNumber,
        currentVerseNumber: verseNumber,
        currentEdition: normalizedEdition,
        currentUrl: audioUrl,
        currentWordNumber: null, // Reset word tracking
      });

      // Clear previous source and reset
      if (this.audio.src) {
        this.audio.pause();
        this.audio.src = '';
        this.audio.load(); // Reset the audio element
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Set new source
      this.audio.src = audioUrl;
      this.audio.playbackRate = this.playbackSpeed;
      this.audio.preload = 'auto';
      // Don't set crossOrigin - let browser handle CORS naturally
      
      // Load and play with timeout
      await new Promise<void>((resolve, reject) => {
        if (!this.audio) {
          reject(new Error('Audio element not initialized'));
          return;
        }

        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            this.audio?.removeEventListener('canplay', handleCanPlay);
            this.audio?.removeEventListener('canplaythrough', handleCanPlayThrough);
            this.audio?.removeEventListener('error', handleError);
            reject(new Error('Timeout loading audio'));
          }
        }, 10000); // 10 second timeout

        const handleCanPlay = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            this.audio?.removeEventListener('canplay', handleCanPlay);
            this.audio?.removeEventListener('canplaythrough', handleCanPlayThrough);
            this.audio?.removeEventListener('error', handleError);
            resolve();
          }
        };

        const handleCanPlayThrough = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            this.audio?.removeEventListener('canplay', handleCanPlay);
            this.audio?.removeEventListener('canplaythrough', handleCanPlayThrough);
            this.audio?.removeEventListener('error', handleError);
            resolve();
          }
        };

        const handleError = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            this.audio?.removeEventListener('canplay', handleCanPlay);
            this.audio?.removeEventListener('canplaythrough', handleCanPlayThrough);
            this.audio?.removeEventListener('error', handleError);
            const error = this.audio?.error;
            const errorMsg = error 
              ? `Media error (code ${error.code}): ${error.message || 'Unknown error'}`
              : 'Failed to load audio source';
            console.error('[AudioService] Audio load error:', {
              url: audioUrl,
              error: errorMsg,
              errorCode: error?.code,
            });
            reject(new Error(errorMsg));
          }
        };

        this.audio.addEventListener('canplay', handleCanPlay);
        this.audio.addEventListener('canplaythrough', handleCanPlayThrough);
        this.audio.addEventListener('error', handleError);
        
        this.audio.load();
      });

      await this.audio.play();
      this.startPositionPolling();
    } catch (error) {
      console.error('[AudioService] Error playing verse:', error);
      this.updateState({
        error: error instanceof Error ? error.message : 'Хатогӣ дар пахш кардан',
        isLoading: false,
        isPlaying: false,
      });
      throw error;
    }
  }

  async playSurah(surahNumber: number, edition: string): Promise<void> {
    try {
      // Ensure we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Audio playback is only available in the browser');
      }

      // Normalize edition - replace 'default' with valid default reciter
      let normalizedEdition = edition;
      if (!edition || edition === 'default' || edition.trim() === '') {
        normalizedEdition = 'ar.alafasy';
        console.warn('[AudioService] Invalid edition "' + edition + '", using default: ar.alafasy');
      }
      
      let audioUrl: string;
      
      // Check if this is Tajik translation audio (uses separate API)
      if (normalizedEdition === 'tg.akmal_mansurov') {
        const { tajikAudioService } = await import('./tajik-audio-service');
        const tajikUrl = await tajikAudioService.getAudioUrlForSurah(surahNumber);
        if (tajikUrl) {
          audioUrl = tajikUrl;
          console.log('[AudioService] Using Tajik translation API URL for surah', surahNumber, '->', audioUrl);
        } else {
          throw new Error(`Tajik audio not available for surah ${surahNumber}`);
        }
      } else {
        const bitrate = 128; // Default bitrate for full surah
        audioUrl = `https://cdn.islamic.network/quran/audio-surah/${bitrate}/${normalizedEdition}/${surahNumber}.mp3`;
        console.log('[AudioService] Playing surah:', { surahNumber, edition: normalizedEdition, audioUrl });
      }
      
      // Validate URL format
      if (!audioUrl || !audioUrl.startsWith('http')) {
        throw new Error(`Invalid audio URL: ${audioUrl}`);
      }

      this.ensureAudioElement();
      if (!this.audio) {
        throw new Error('Audio element could not be initialized');
      }

      if (this.currentUrl === audioUrl && this.audio && !this.audio.paused) {
        return; // Already playing
      }

      this.currentUrl = audioUrl;
      // Clear alignment data for full surah mode
      this.currentAlignment = null;
      this.isLoadingAlignment = false;
      this.updateState({
        isLoading: true,
        error: null,
        currentSurahNumber: surahNumber,
        currentVerseNumber: null, // Full surah mode
        currentEdition: normalizedEdition,
        currentUrl: audioUrl,
        currentWordNumber: null, // No word tracking in full surah mode
      });

      // Clear previous source and reset
      if (this.audio.src) {
        this.audio.pause();
        this.audio.src = '';
        this.audio.load(); // Reset the audio element
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Set new source
      this.audio.src = audioUrl;
      this.audio.playbackRate = this.playbackSpeed;
      this.audio.preload = 'auto';
      // Don't set crossOrigin - let browser handle CORS naturally
      
      // Load and play with timeout
      await new Promise<void>((resolve, reject) => {
        if (!this.audio) {
          reject(new Error('Audio element not initialized'));
          return;
        }

        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            this.audio?.removeEventListener('canplay', handleCanPlay);
            this.audio?.removeEventListener('canplaythrough', handleCanPlayThrough);
            this.audio?.removeEventListener('error', handleError);
            reject(new Error('Timeout loading audio'));
          }
        }, 10000); // 10 second timeout

        const handleCanPlay = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            this.audio?.removeEventListener('canplay', handleCanPlay);
            this.audio?.removeEventListener('canplaythrough', handleCanPlayThrough);
            this.audio?.removeEventListener('error', handleError);
            resolve();
          }
        };

        const handleCanPlayThrough = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            this.audio?.removeEventListener('canplay', handleCanPlay);
            this.audio?.removeEventListener('canplaythrough', handleCanPlayThrough);
            this.audio?.removeEventListener('error', handleError);
            resolve();
          }
        };

        const handleError = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            this.audio?.removeEventListener('canplay', handleCanPlay);
            this.audio?.removeEventListener('canplaythrough', handleCanPlayThrough);
            this.audio?.removeEventListener('error', handleError);
            const error = this.audio?.error;
            const errorMsg = error 
              ? `Media error (code ${error.code}): ${error.message || 'Unknown error'}`
              : 'Failed to load audio source';
            console.error('[AudioService] Audio load error:', {
              url: audioUrl,
              error: errorMsg,
              errorCode: error?.code,
            });
            reject(new Error(errorMsg));
          }
        };

        this.audio.addEventListener('canplay', handleCanPlay);
        this.audio.addEventListener('canplaythrough', handleCanPlayThrough);
        this.audio.addEventListener('error', handleError);
        
        this.audio.load();
      });

      await this.audio.play();
      this.startPositionPolling();
    } catch (error) {
      console.error('[AudioService] Error playing surah:', error);
      this.updateState({
        error: error instanceof Error ? error.message : 'Хатогӣ дар пахш кардан',
        isLoading: false,
        isPlaying: false,
      });
      throw error;
    }
  }

  async playSurahVerseByVerse(surahNumber: number, edition: string): Promise<void> {
    // Normalize edition - replace 'default' with valid default reciter
    let normalizedEdition = edition;
    if (!edition || edition === 'default' || edition.trim() === '') {
      normalizedEdition = 'ar.alafasy';
      console.warn('[AudioService] Invalid edition "' + edition + '", using default: ar.alafasy');
    }
    
    // Use normalized edition for playback
    edition = normalizedEdition;
    this.autoPlayNextVerse = true;
    await this.playVerse(surahNumber, 1, edition);
  }

  async togglePlayPause(): Promise<void> {
    if (typeof window === 'undefined') return;
    this.ensureAudioElement();
    if (!this.audio) return;

    if (this.audio.paused) {
      await this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  async pause(): Promise<void> {
    if (typeof window === 'undefined') return;
    this.ensureAudioElement();
    if (this.audio) {
      this.audio.pause();
    }
  }

  async stop(): Promise<void> {
    if (typeof window === 'undefined') return;
    this.ensureAudioElement();
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.autoPlayNextVerse = false;
    this.currentUrl = null;
    this.currentAlignment = null;
    this.isLoadingAlignment = false;
    this.updateState({
      isPlaying: false,
      currentSurahNumber: null,
      currentVerseNumber: null,
      currentEdition: null,
      currentUrl: null,
      position: 0,
      currentWordNumber: null,
    });
  }

  seekTo(position: number): void {
    if (typeof window === 'undefined') return;
    this.ensureAudioElement();
    if (this.audio) {
      this.audio.currentTime = position;
      this.updateState({ position });
    }
  }

  setSpeed(speed: number): void {
    this.playbackSpeed = speed;
    if (typeof window !== 'undefined') {
      this.ensureAudioElement();
      if (this.audio) {
        this.audio.playbackRate = speed;
      }
    }
  }

  getSpeed(): number {
    return this.playbackSpeed;
  }

  setRepeat(repeat: boolean): void {
    this.isRepeating = repeat;
  }

  getRepeat(): boolean {
    return this.isRepeating;
  }

  async playNextSurah(edition: string): Promise<void> {
    if (this.currentState.currentSurahNumber) {
      const nextSurah = Math.min(114, this.currentState.currentSurahNumber + 1);
      if (this.currentState.currentVerseNumber) {
        // Verse-by-verse mode
        await this.playVerse(nextSurah, 1, edition);
      } else {
        // Full surah mode
        await this.playSurah(nextSurah, edition);
      }
    }
  }

  async playPreviousSurah(edition: string): Promise<void> {
    if (this.currentState.currentSurahNumber) {
      const prevSurah = Math.max(1, this.currentState.currentSurahNumber - 1);
      if (this.currentState.currentVerseNumber) {
        // Verse-by-verse mode
        await this.playVerse(prevSurah, 1, edition);
      } else {
        // Full surah mode
        await this.playSurah(prevSurah, edition);
      }
    }
  }

  getState(): PlaybackState {
    return { ...this.currentState };
  }

  cleanup() {
    this.stop();
    this.stopPositionPolling();
    if (this.audio) {
      this.audio.removeEventListener('loadedmetadata', () => {});
      this.audio.removeEventListener('timeupdate', () => {});
      this.audio.removeEventListener('ended', () => {});
      this.audio = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
let audioServiceInstance: AudioService | null = null;

export function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
}


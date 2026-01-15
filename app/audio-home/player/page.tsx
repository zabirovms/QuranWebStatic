'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAudioService, PlaybackState } from '@/lib/services/audio-service';
import { getReciterById } from '@/lib/data/reciter-data-client';
import { getSurahByNumberClient } from '@/lib/data/surah-data-client';
import { Reciter } from '@/lib/data/reciter-data-client';
import { Surah } from '@/lib/types';
import { getReciterPhotoUrl, hasMappedImage } from '@/lib/utils/reciter-image-helper';
import { AudioFavoritesService } from '@/lib/services/audio-favorites-service';
import { supportsVerseByVerse } from '@/lib/utils/audio-helper';
import { ArrowBackIcon, PlayArrowIcon, PauseIcon, SkipPreviousIcon, SkipNextIcon, Replay10Icon, Forward10Icon, RepeatIcon, FavoriteIcon, FavoriteBorderIcon, PersonIcon } from '@/components/Icons';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTopBar } from '@/lib/contexts/TopBarContext';

function FullPlayerPageContent() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const searchParams = useSearchParams();
  const editionId = searchParams.get('edition');
  const surahParam = searchParams.get('surah');
  const verseByVerseParam = searchParams.get('verseByVerse') === 'true';

  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [reciter, setReciter] = useState<Reciter | null>(null);
  const [surah, setSurah] = useState<Surah | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isRepeating, setIsRepeating] = useState(false);
  const [showSpeedDialog, setShowSpeedDialog] = useState(false);
  const [hasNavigatedBack, setHasNavigatedBack] = useState(false);
  
  const audioService = getAudioService();
  const favoritesService = new AudioFavoritesService();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!editionId) {
        if (!hasNavigatedBack) {
          setHasNavigatedBack(true);
          router.back();
        }
        return;
      }

      try {
        setIsLoading(true);

        // Load reciter
        const reciterData = await getReciterById(editionId);
        if (!reciterData) {
          console.error('Reciter not found:', editionId);
          if (!hasNavigatedBack) {
            setHasNavigatedBack(true);
            router.back();
          }
          return;
        }
        setReciter(reciterData);

        // Load surah if provided
        if (surahParam) {
          const surahNumber = parseInt(surahParam, 10);
          const surahData = await getSurahByNumberClient(surahNumber);
          setSurah(surahData);

          // Load favorite status
          const fav = await favoritesService.isFavorite(editionId, surahNumber);
          setIsFavorite(fav);

          // Start playback
          if (verseByVerseParam || supportsVerseByVerse(editionId, reciterData.hasVerseByVerse)) {
            await audioService.playSurahVerseByVerse(surahNumber, editionId);
          } else {
            await audioService.playSurah(surahNumber, editionId);
          }
        }

        // Subscribe to playback state
        const unsubscribe = audioService.subscribe((state) => {
          setPlaybackState(state);
          setPlaybackSpeed(audioService.getSpeed());
          setIsRepeating(audioService.getRepeat());
        });
        unsubscribeRef.current = unsubscribe;

        // Get initial state
        const initialState = audioService.getState();
        setPlaybackState(initialState);
        setPlaybackSpeed(audioService.getSpeed());
        setIsRepeating(audioService.getRepeat());
      } catch (error) {
        console.error('Error loading player data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [editionId, surahParam, verseByVerseParam, router, hasNavigatedBack]);

  // Handle navigation back if no active playback
  useEffect(() => {
    if (playbackState && !playbackState.isPlaying && playbackState.currentSurahNumber === null && !hasNavigatedBack) {
      const timer = setTimeout(() => {
        setHasNavigatedBack(true);
        router.back();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [playbackState, hasNavigatedBack, router]);

  const handleBack = () => {
    router.back();
  };

  const handleTogglePlayPause = async () => {
    await audioService.togglePlayPause();
  };

  const handleSeek = (newPosition: number) => {
    audioService.seekTo(newPosition);
  };

  const handleRewind = () => {
    if (playbackState) {
      const newPosition = Math.max(0, playbackState.position - 10);
      audioService.seekTo(newPosition);
    }
  };

  const handleForward = () => {
    if (playbackState && playbackState.duration > 0) {
      const newPosition = Math.min(playbackState.duration, playbackState.position + 10);
      audioService.seekTo(newPosition);
    }
  };

  const handlePrevious = async () => {
    if (editionId) {
      await audioService.playPreviousSurah(editionId);
    }
  };

  const handleNext = async () => {
    if (editionId) {
      await audioService.playNextSurah(editionId);
    }
  };

  const handleToggleRepeat = () => {
    const newRepeat = !isRepeating;
    audioService.setRepeat(newRepeat);
    setIsRepeating(newRepeat);
  };

  const handleToggleFavorite = async () => {
    if (!editionId || !surah) return;
    try {
      await favoritesService.toggleFavorite(editionId, surah.number);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleSpeedChange = (speed: number) => {
    audioService.setSpeed(speed);
    setPlaybackSpeed(speed);
    setShowSpeedDialog(false);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (isLoading || !playbackState || !reciter) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const photoUrl = getReciterPhotoUrl(reciter.id);
  const hasImage = hasMappedImage(reciter.id);
  const activeSurah = playbackState.currentSurahNumber || (surah ? surah.number : null);
  const position = playbackState.position || 0;
  const duration = playbackState.duration || 0;
  const isPlaying = playbackState.isPlaying;
  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const remaining = duration > 0 ? duration - position : 0;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* AppBar */}
      <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
        <div className="app-bar-content">
          <button
            onClick={handleBack}
            className="btn btn-icon"
            style={{ marginRight: 'var(--spacing-sm)' }}
            title="Баргаштан"
          >
            <ArrowBackIcon size={24} color="var(--color-primary)" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '32px',
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Album Art / Image */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '80%',
            maxWidth: '300px',
            aspectRatio: '1',
            borderRadius: '12px',
            backgroundColor: 'var(--color-surface-variant)',
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {hasImage && photoUrl ? (
              <Image
                src={photoUrl}
                alt={reciter.nameTajik || reciter.name}
                width={300}
                height={300}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <PersonIcon
                size={72}
                color="var(--color-primary)"
              />
            )}
          </div>
        </div>

        {/* Track Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
          }}>
            {surah ? surah.nameTajik : 'Қуръон'}
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-secondary)',
          }}>
            {reciter.nameTajik || reciter.name}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={position}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${progress}%, var(--color-surface-variant) ${progress}%, var(--color-surface-variant) 100%)`,
              outline: 'none',
              cursor: 'pointer',
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            <span>{formatDuration(position)}</span>
            <span>-{formatDuration(remaining)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <button
            onClick={handlePrevious}
            className="btn btn-icon"
            style={{ padding: '12px' }}
            title="Сураи қаблӣ"
          >
            <SkipPreviousIcon size={32} color="var(--color-text-primary)" />
          </button>
          <button
            onClick={handleRewind}
            className="btn btn-icon"
            style={{ padding: '12px' }}
            title="10 сония қафо"
          >
            <Replay10Icon size={28} color="var(--color-text-primary)" />
          </button>
          <button
            onClick={handleTogglePlayPause}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
            }}
            title={isPlaying ? 'Пауза' : 'Пахш'}
          >
            {isPlaying ? (
              <PauseIcon size={40} color="var(--color-on-primary)" />
            ) : (
              <PlayArrowIcon size={40} color="var(--color-on-primary)" />
            )}
          </button>
          <button
            onClick={handleForward}
            className="btn btn-icon"
            style={{ padding: '12px' }}
            title="10 сония пеш"
          >
            <Forward10Icon size={28} color="var(--color-text-primary)" />
          </button>
          <button
            onClick={handleNext}
            className="btn btn-icon"
            style={{ padding: '12px' }}
            title="Сураи оянда"
          >
            <SkipNextIcon size={32} color="var(--color-text-primary)" />
          </button>
        </div>

        {/* Options */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Speed */}
          <button
            onClick={() => setShowSpeedDialog(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--color-surface-variant)',
              border: 'none',
              borderRadius: '20px',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: 'var(--color-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{playbackSpeed}x</span>
            <span>▼</span>
          </button>

          {/* Repeat and Favorite */}
          <div style={{
            display: 'flex',
            gap: '8px',
          }}>
            <button
              onClick={handleToggleRepeat}
              className="btn btn-icon"
              style={{ padding: '12px' }}
              title={isRepeating ? 'Такрор хомӯш' : 'Такрор кардан'}
            >
              <RepeatIcon
                size={24}
                color={isRepeating ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
              />
            </button>
            {surah && (
              <button
                onClick={handleToggleFavorite}
                className="btn btn-icon"
                style={{ padding: '12px' }}
                title={isFavorite ? 'Аз дӯстдоштаҳо тоза кардан' : 'Ба дӯстдоштаҳо илова кардан'}
              >
                {isFavorite ? (
                  <FavoriteIcon size={24} color="var(--color-error)" />
                ) : (
                  <FavoriteBorderIcon size={24} color="var(--color-text-secondary)" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Speed Dialog */}
      {showSpeedDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={() => setShowSpeedDialog(false)}
        >
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: '16px',
            }}>
              Суръати пахш
            </h2>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                style={{
                  width: '100%',
                  padding: '16px',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--color-outline)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: playbackSpeed === speed ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                  color: playbackSpeed === speed ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{speed}x</span>
                {playbackSpeed === speed && (
                  <span style={{ color: 'var(--color-primary)' }}>✓</span>
                )}
              </button>
            ))}
            <button
              onClick={() => setShowSpeedDialog(false)}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--color-surface-variant)',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'var(--font-size-base)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Бекор кардан
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FullPlayerPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner size="large" />
      </div>
    }>
      <FullPlayerPageContent />
    </Suspense>
  );
}

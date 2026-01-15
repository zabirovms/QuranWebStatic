'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAudioService, PlaybackState } from '@/lib/services/audio-service';
import { AudioFavoritesService } from '@/lib/services/audio-favorites-service';
import { 
  PlayArrowIcon, 
  PauseIcon, 
  CloseIcon,
  SkipPreviousIcon,
  SkipNextIcon,
  Replay10Icon,
  Forward10Icon,
  RepeatIcon,
  FavoriteIcon,
  FavoriteBorderIcon,
} from './Icons';


export default function MiniAudioPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const audioService = getAudioService();
  const favoritesService = new AudioFavoritesService();
  const [playbackState, setPlaybackState] = useState<PlaybackState | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isRepeating, setIsRepeating] = useState(false);
  const [showSpeedDialog, setShowSpeedDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Subscribe to audio service state
    const unsubscribe = audioService.subscribe((state) => {
      setPlaybackState(state);
      setPlaybackSpeed(audioService.getSpeed());
      setIsRepeating(audioService.getRepeat());
    });

    return () => {
      unsubscribe();
    };
  }, [isMounted]);

  // Load favorite status when surah number changes
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!playbackState?.currentSurahNumber || !playbackState?.currentEdition) {
        setIsFavorite(false);
        return;
      }

      try {
        const fav = await favoritesService.isFavorite(
          playbackState.currentEdition,
          playbackState.currentSurahNumber
        );
        setIsFavorite(fav);
      } catch (error) {
        console.error('Error loading favorite status:', error);
        setIsFavorite(false);
      }
    };

    loadFavoriteStatus();
  }, [playbackState?.currentSurahNumber, playbackState?.currentEdition]);

  // Don't render anything until mounted (prevents hydration issues)
  // Don't show if no active audio - return null early to prevent any rendering
  if (!isMounted || !playbackState || !playbackState.currentUrl) {
    return null;
  }

  // Hide miniplayer when on full player page (check pathname after mount to prevent hydration issues)
  if (pathname && pathname.startsWith('/audio-home/player')) {
    return null;
  }

  const isPlaying = playbackState.isPlaying || false;
  const position = playbackState.position || 0;
  const duration = playbackState.duration || 0;
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  const editionId = playbackState.currentEdition;

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (!editionId || !playbackState.currentSurahNumber) return;
    
    const params = new URLSearchParams();
    params.set('edition', editionId);
    params.set('surah', playbackState.currentSurahNumber.toString());
    if (playbackState.currentVerseNumber) {
      params.set('verseByVerse', 'true');
    }
    
    router.push(`/audio-home/player?${params.toString()}`);
  };

  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await audioService.togglePlayPause();
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handlePrevious = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editionId) {
      try {
        await audioService.playPreviousSurah(editionId);
      } catch (error) {
        console.error('Error playing previous:', error);
      }
    }
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editionId) {
      try {
        await audioService.playNextSurah(editionId);
      } catch (error) {
        console.error('Error playing next:', error);
      }
    }
  };

  const handleRewind = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playbackState) {
      const newPosition = Math.max(0, playbackState.position - 10);
      audioService.seekTo(newPosition);
    }
  };

  const handleForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playbackState && playbackState.duration > 0) {
      const newPosition = Math.min(playbackState.duration, playbackState.position + 10);
      audioService.seekTo(newPosition);
    }
  };

  const handleToggleRepeat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newRepeat = !isRepeating;
    audioService.setRepeat(newRepeat);
    setIsRepeating(newRepeat);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editionId || !playbackState.currentSurahNumber) return;
    try {
      await favoritesService.toggleFavorite(editionId, playbackState.currentSurahNumber);
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

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await audioService.stop();
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: '0',
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-outline)',
          cursor: 'pointer',
          zIndex: 999,
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Progress Bar at Top Edge */}
        <div
          style={{
            width: '100%',
            height: '2px',
            backgroundColor: 'var(--color-surface-variant)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.max(0, Math.min(progress * 100, 100))}%`,
              backgroundColor: 'var(--color-primary)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Controls Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            padding: '6px 12px',
              gap: '8px',
            }}
          >
            {/* Left Time */}
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                minWidth: '40px',
                textAlign: 'left',
              }}
            >
              {formatDuration(position)}
            </div>

          {/* Center: All Control Buttons */}
            <div
              style={{
                flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              }}
            >
            {/* Speed */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeedDialog(true);
              }}
                style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                }}
              title="Суръати пахш"
            >
            <div
              style={{
                fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
              }}
            >
                {playbackSpeed}x
            </div>
            </button>

            {/* Repeat */}
            <button
              onClick={handleToggleRepeat}
            style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              }}
              title={isRepeating ? 'Такрор хомӯш' : 'Такрор кардан'}
            >
              <RepeatIcon
                size={18}
                color={isRepeating ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
              />
            </button>

            {/* Previous */}
            <button
              onClick={handlePrevious}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Сураи қаблӣ"
            >
              <SkipPreviousIcon size={18} color="var(--color-text-secondary)" />
            </button>

            {/* Rewind */}
            <button
              onClick={handleRewind}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="10 сония қафо"
            >
              <Replay10Icon size={18} color="var(--color-text-secondary)" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              style={{
                width: '32px',
                height: '32px',
                padding: 0,
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              title={isPlaying ? 'Ист кардан' : 'Пахш кардан'}
            >
              {isPlaying ? (
                <PauseIcon size={18} color="var(--color-on-primary)" />
              ) : (
                <PlayArrowIcon size={18} color="var(--color-on-primary)" />
              )}
            </button>

            {/* Forward */}
            <button
              onClick={handleForward}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="10 сония пеш"
            >
              <Forward10Icon size={18} color="var(--color-text-secondary)" />
            </button>

            {/* Next */}
            <button
              onClick={handleNext}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Сураи оянда"
            >
              <SkipNextIcon size={18} color="var(--color-text-secondary)" />
            </button>

            {/* Favorite */}
            {playbackState.currentSurahNumber && (
              <button
                onClick={handleToggleFavorite}
                style={{
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={isFavorite ? 'Аз дӯстдоштаҳо тоза кардан' : 'Ба дӯстдоштаҳо илова кардан'}
              >
                {isFavorite ? (
                  <FavoriteIcon size={18} color="var(--color-error)" />
                ) : (
                  <FavoriteBorderIcon size={18} color="var(--color-text-secondary)" />
                )}
              </button>
            )}

            {/* Close */}
            <button
              onClick={handleClose}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Хомӯш кардан"
            >
              <CloseIcon size={16} color="var(--color-text-secondary)" />
            </button>
          </div>

          {/* Right Time */}
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
              minWidth: '40px',
              textAlign: 'right',
            }}
          >
            {formatDuration(duration)}
          </div>
        </div>
      </div>

      {/* Speed Dialog */}
      {showSpeedDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setShowSpeedDialog(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '16px',
              }}
            >
              Суръати пахш
            </h2>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  style={{
                    padding: '12px',
                    backgroundColor:
                      playbackSpeed === speed
                        ? 'var(--color-primary)'
                        : 'var(--color-surface-variant)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: playbackSpeed === speed ? 600 : 400,
                    color:
                      playbackSpeed === speed
                        ? 'var(--color-on-primary)'
                        : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getReciterById } from '@/lib/data/reciter-data-client';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { Reciter } from '@/lib/data/reciter-data-client';
import { Surah } from '@/lib/types';
import { getReciterPhotoUrl, hasMappedImage } from '@/lib/utils/reciter-image-helper';
import { LastPlayedService } from '@/lib/services/last-played-service';
import { AudioFavoritesService } from '@/lib/services/audio-favorites-service';
import { AudioDownloadsService } from '@/lib/services/audio-downloads-service';
import { supportsVerseByVerse } from '@/lib/utils/audio-helper';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import Image from 'next/image';
import { ArrowBackIcon, PlayArrowIcon, FavoriteIcon, FavoriteBorderIcon, ShareIcon, DownloadIcon, DownloadDoneIcon, MusicNoteIcon, PersonIcon } from '@/components/Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';

export default function ReciterPlaylistPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const params = useParams();
  const reciterId = params.reciterId as string;

  const [reciter, setReciter] = useState<Reciter | null>(null);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load reciter
        const reciterData = await getReciterById(reciterId);
        if (!reciterData) {
          setError('Қорӣ ёфт нашуд');
          return;
        }
        setReciter(reciterData);

        // Load surahs
        const surahsData = await getAllSurahs();
        setSurahs(surahsData.sort((a, b) => a.number - b.number));

        // Load favorite status
        const favoritesService = new AudioFavoritesService();
        const fav = await favoritesService.isFavorite(reciterId, 1);
        setIsFavorite(fav);
      } catch (err) {
        console.error('Error loading reciter playlist:', err);
        setError(err instanceof Error ? err.message : 'Хатогӣ дар бор кардани маълумот');
      } finally {
        setIsLoading(false);
        setIsLoadingFavorite(false);
      }
    };
    loadData();
  }, [reciterId]);

  const handleToggleFavorite = async () => {
    if (!reciter) return;
    try {
      const favoritesService = new AudioFavoritesService();
      await favoritesService.toggleFavorite(reciterId, 1);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    if (!reciter) return;
    const surah = surahs.find(s => s.number === 1);
    const shareText = `${reciter.nameTajik || reciter.name} - ${surah?.nameTajik || 'Сураи 1'}\nҚуръонро дар барномаи Quran.tj гӯш кунед.`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or error:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Нусха карда шуд');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handlePlay = async () => {
    if (!reciter) return;
    try {
      const lastPlayedService = new LastPlayedService();
      await lastPlayedService.saveLastPlayed({
        reciterId: reciter.id,
        surahNumber: 1,
      });
      
      // Use verse-by-verse playback if the reciter supports it
      const isVerseByVerse = supportsVerseByVerse(reciter.id, reciter.hasVerseByVerse);
      if (isVerseByVerse) {
        // Navigate to player with verse-by-verse mode
        router.push(`/audio-home/player?edition=${reciter.id}&surah=1&verseByVerse=true`);
      } else {
        // Navigate to player with full surah mode
        router.push(`/audio-home/player?edition=${reciter.id}&surah=1`);
      }
    } catch (error) {
      console.error('Error playing:', error);
    }
  };

  if (isLoading) {
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

  if (error || !reciter) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}>
        <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
          <div className="app-bar-content">
            <button
              onClick={() => router.back()}
              className="btn btn-icon"
              style={{ marginRight: 'var(--spacing-sm)' }}
              title="Баргаштан"
            >
              <ArrowBackIcon size={24} color="var(--color-primary)" />
            </button>
            <h1 className="app-bar-title">Плейлист</h1>
          </div>
        </div>
        <ErrorDisplay
          message={error || 'Қорӣ ёфт нашуд'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const photoUrl = getReciterPhotoUrl(reciter.id);
  const hasImage = hasMappedImage(reciter.id);
  const isTranslation = !reciter.id.startsWith('ar.');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      {/* AppBar */}
      <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
        <div className="app-bar-content">
          <button
            onClick={() => router.back()}
            className="btn btn-icon"
            style={{ marginRight: 'var(--spacing-sm)' }}
            title="Баргаштан"
          >
            <ArrowBackIcon size={24} color="var(--color-primary)" />
          </button>
          <h1 className="app-bar-title">Плейлист</h1>
        </div>
      </div>

      <main style={{
        padding: 'var(--spacing-lg)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-lg))' : 'var(--spacing-lg)',
        overflowX: 'hidden',
      }}>
        {/* Profile Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 'var(--spacing-xl)',
        }}>
          {/* Reciter image */}
          <div style={{
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            opacity: 0.2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: 'var(--spacing-md)',
          }}>
            {hasImage && photoUrl ? (
              <Image
                src={photoUrl}
                alt={reciter.nameTajik || reciter.name}
                width={128}
                height={128}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <PersonIcon
                size={64}
                color="var(--color-primary)"
              />
            )}
          </div>
          {/* Reciter name */}
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
            textAlign: 'center',
          }}>
            {reciter.nameTajik || reciter.name}
          </div>
          {reciter.nameArabic && (
            <div style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
            }}>
              {reciter.nameArabic}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginBottom: 'var(--spacing-xl)',
        }}>
          {/* Play button */}
          <button
            onClick={handlePlay}
            style={{
              padding: 'var(--spacing-md) var(--spacing-xl)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: '12px',
              fontSize: 'var(--font-size-base)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <PlayArrowIcon size={20} color="var(--color-on-primary)" />
            Пахш кардан
          </button>
          {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className="btn btn-icon"
            style={{
              backgroundColor: 'var(--color-surface-variant)',
              padding: '12px',
              borderRadius: '12px',
            }}
            title={isFavorite ? 'Аз дӯстдоштаҳо тоза кардан' : 'Ба дӯстдоштаҳо илова кардан'}
          >
            {isFavorite ? (
              <FavoriteIcon size={24} color="var(--color-error)" />
            ) : (
              <FavoriteBorderIcon size={24} color="var(--color-text-primary)" />
            )}
          </button>
          {/* Share button */}
          <button
            onClick={handleShare}
            className="btn btn-icon"
            style={{
              backgroundColor: 'var(--color-surface-variant)',
              padding: '12px',
              borderRadius: '12px',
            }}
            title="Мубодила"
          >
            <ShareIcon size={24} color="var(--color-text-primary)" />
          </button>
        </div>

        {/* Surahs List */}
        <div className="surahs-grid">
          {surahs.map((surah) => (
            <SurahListItem
              key={surah.number}
              surah={surah}
              reciterId={reciterId}
              hasVerseByVerse={reciter.hasVerseByVerse}
              onPlay={() => {
                const isVerseByVerse = supportsVerseByVerse(reciterId, reciter.hasVerseByVerse);
                if (isVerseByVerse) {
                  router.push(`/audio-home/player?edition=${reciterId}&surah=${surah.number}&verseByVerse=true`);
                } else {
                  router.push(`/audio-home/player?edition=${reciterId}&surah=${surah.number}`);
                }
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

// Surah List Item
interface SurahListItemProps {
  surah: Surah;
  reciterId: string;
  hasVerseByVerse?: boolean;
  onPlay: () => void;
}

function SurahListItem({ surah, reciterId, onPlay }: SurahListItemProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoadingDownload, setIsLoadingDownload] = useState(true);

  useEffect(() => {
    const checkDownload = async () => {
      try {
        const downloadsService = new AudioDownloadsService();
        const downloaded = await downloadsService.isDownloaded(reciterId, surah.number);
        setIsDownloaded(downloaded);
      } catch (error) {
        console.error('Error checking download:', error);
      } finally {
        setIsLoadingDownload(false);
      }
    };
    checkDownload();
  }, [reciterId, surah.number]);

  const handleDownload = async () => {
    // On web, downloads are not supported
    alert('Боргирифтани файлҳо дар веб дастгирӣ намешавад');
  };

  return (
    <div
      onClick={onPlay}
      style={{
        padding: '16px',
        border: '1px solid var(--color-outline)',
        borderRadius: '12px',
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: 'var(--color-surface-variant)',
        marginBottom: 'var(--spacing-sm)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
        e.currentTarget.style.borderColor = 'var(--color-outline)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          position: 'relative',
          flexShrink: 0,
        }}>
          <img 
            src="/surah-names-svg/circle.svg"
            alt=""
            style={{
              width: '40px',
              height: '40px',
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: 0.6,
              filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(201deg) brightness(95%) contrast(89%)',
            }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            fontWeight: 'bold',
            fontSize: '1rem',
          }}>
            {surah.number}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: '1rem', 
            fontWeight: '500',
            marginBottom: '4px',
          }}>
            Сураи {surah.nameTajik}
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: 'var(--color-text-secondary)',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}>
            <span>{surah.revelationType}</span>
            <span>•</span>
            <span>{surah.versesCount} оят</span>
          </div>
        </div>
        <div style={{
          width: '90px',
          height: '45px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          <img 
            src={`/surah-names-svg/${String(surah.number).padStart(3, '0')}.svg`}
            alt={surah.nameArabic}
            className="surah-name-svg"
            style={{
              width: '90px',
              height: '45px',
              objectFit: 'contain',
              filter: 'var(--surah-svg-filter, none)',
            }}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target || !target.parentElement) return; // Safety check
              target.style.display = 'none';
              const parent = target.parentElement;
              // Double-check parent is still in DOM
              if (parent && parent.parentNode && document.body.contains(parent)) {
                const fallback = document.createElement('div');
                fallback.style.cssText = `font-size: 1.1rem; font-weight: bold; color: var(--color-text-primary); direction: rtl; text-align: right;`;
                fallback.textContent = surah.nameArabic;
                parent.appendChild(fallback);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

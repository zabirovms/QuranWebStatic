'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AudioFavoritesService, AudioFavorite } from '@/lib/services/audio-favorites-service';
import { AudioDownloadsService, AudioDownload } from '@/lib/services/audio-downloads-service';
import { getReciterById } from '@/lib/data/reciter-data-client';
import { getSurahByNumber } from '@/lib/data/surah-data-client';
import { Reciter } from '@/lib/data/reciter-data-client';
import { getReciterPhotoUrl, hasMappedImage } from '@/lib/utils/reciter-image-helper';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Image from 'next/image';
import { ArrowBackIcon, FavoriteIcon, FavoriteBorderIcon, DeleteOutlineIcon, PlayArrowIcon, DownloadDoneIcon, DownloadIcon, MusicNoteIcon } from '@/components/Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';

export default function AudioLibraryPage() {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [activeTab, setActiveTab] = useState<'favorites' | 'downloads'>('favorites');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      {/* AppBar */}
      <div className={`app-bar ${!isTopBarVisible ? 'top-bar-hidden' : ''}`}>
        <div className="app-bar-content">
          <button
            onClick={() => window.history.back()}
            className="btn btn-icon"
            style={{ marginRight: 'var(--spacing-sm)' }}
            title="Баргаштан"
          >
            <ArrowBackIcon size={24} color="var(--color-primary)" />
          </button>
          <h1 className="app-bar-title">Китобхона</h1>
        </div>
      </div>

      {/* TabBar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-outline)',
        backgroundColor: 'var(--color-surface)',
      }}>
        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            flex: 1,
            padding: 'var(--spacing-md)',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'favorites' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'favorites' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-base)',
            fontWeight: activeTab === 'favorites' ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          Дӯстдоштаҳо
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          style={{
            flex: 1,
            padding: 'var(--spacing-md)',
            border: 'none',
            backgroundColor: 'transparent',
            borderBottom: activeTab === 'downloads' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'downloads' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-base)',
            fontWeight: activeTab === 'downloads' ? 600 : 400,
            cursor: 'pointer',
          }}
        >
          Боргирифташуда
        </button>
      </div>

      {/* Tab Content */}
      <main className="scrollable-container-vertical" style={{
        height: `calc(100vh - ${isTopBarVisible ? '112px' : '56px'})`,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {activeTab === 'favorites' ? <FavoritesTab /> : <DownloadsTab />}
      </main>
    </div>
  );
}

// Favorites Tab
function FavoritesTab() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<AudioFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const service = new AudioFavoritesService();
      const data = await service.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={
          <div style={{ opacity: 0.3 }}>
            <FavoriteBorderIcon size={64} color="var(--color-text-secondary)" />
          </div>
        }
        message="Ҳеҷ дӯстдоштае нест"
      />
    );
  }

  // Group by reciter
  const favoritesByReciter = new Map<string, AudioFavorite[]>();
  for (const fav of favorites) {
    if (!favoritesByReciter.has(fav.reciterId)) {
      favoritesByReciter.set(fav.reciterId, []);
    }
    favoritesByReciter.get(fav.reciterId)!.push(fav);
  }

  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      paddingBottom: 'var(--spacing-3xl)',
    }}>
      {Array.from(favoritesByReciter.entries()).map(([reciterId, reciterFavorites]) => (
        <ReciterFavoritesGroup
          key={reciterId}
          reciterId={reciterId}
          favorites={reciterFavorites}
          onRefresh={handleRefresh}
        />
      ))}
    </div>
  );
}

// Downloads Tab
function DownloadsTab() {
  const router = useRouter();
  const [downloads, setDownloads] = useState<AudioDownload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      setIsLoading(true);
      const service = new AudioDownloadsService();
      const data = await service.getDownloads();
      setDownloads(data);
    } catch (error) {
      console.error('Error loading downloads:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDownloads();
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <EmptyState
        icon={
          <div style={{ opacity: 0.3 }}>
            <DownloadIcon size={64} color="var(--color-text-secondary)" />
          </div>
        }
        message="Ҳеҷ боргирифташудае нест"
      />
    );
  }

  // Group by reciter
  const downloadsByReciter = new Map<string, AudioDownload[]>();
  for (const download of downloads) {
    if (!downloadsByReciter.has(download.reciterId)) {
      downloadsByReciter.set(download.reciterId, []);
    }
    downloadsByReciter.get(download.reciterId)!.push(download);
  }

  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      paddingBottom: 'var(--spacing-3xl)',
    }}>
      {Array.from(downloadsByReciter.entries()).map(([reciterId, reciterDownloads]) => (
        <ReciterDownloadsGroup
          key={reciterId}
          reciterId={reciterId}
          downloads={reciterDownloads}
          onRefresh={handleRefresh}
        />
      ))}
    </div>
  );
}

// Reciter Favorites Group
interface ReciterFavoritesGroupProps {
  reciterId: string;
  favorites: AudioFavorite[];
  onRefresh: () => void;
}

function ReciterFavoritesGroup({ reciterId, favorites, onRefresh }: ReciterFavoritesGroupProps) {
  const router = useRouter();
  const [reciter, setReciter] = useState<Reciter | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const favoritesService = new AudioFavoritesService();

  useEffect(() => {
    const loadReciter = async () => {
      try {
        const data = await getReciterById(reciterId);
        setReciter(data || null);
      } catch (error) {
        console.error('Error loading reciter:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadReciter();
  }, [reciterId]);

  const handleRemoveFavorite = async (surahNumber: number) => {
    await favoritesService.removeFavorite(reciterId, surahNumber);
    onRefresh();
  };

  const photoUrl = reciter ? getReciterPhotoUrl(reciter.id) : null;
  const hasImage = reciter ? hasMappedImage(reciter.id) : false;

  return (
    <div style={{
      marginBottom: 'var(--spacing-md)',
      backgroundColor: 'var(--color-surface)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: 'var(--spacing-md)',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        {/* Reciter image */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-surface-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginRight: 'var(--spacing-md)',
          flexShrink: 0,
        }}>
          {reciter && hasImage && photoUrl ? (
            <Image
              src={photoUrl}
              alt={reciter.nameTajik || reciter.name}
              width={48}
              height={48}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <MusicNoteIcon size={24} color="var(--color-primary)" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <>
              <div style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}>
                {reciter?.nameTajik || reciter?.name || 'Қорӣ'}
              </div>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                {favorites.length} сура
              </div>
            </>
          )}
        </div>
        <div style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-text-secondary)',
        }}>
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div>
          {favorites.map((fav) => (
            <FavoriteItem
              key={fav.key}
              favorite={fav}
              reciter={reciter}
              onRemove={() => handleRemoveFavorite(fav.surahNumber)}
              onPlay={() => router.push(`/audio-home/reciter/${reciterId}`)}
              onTap={() => router.push(`/audio-home/reciter/${reciterId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Favorite Item
interface FavoriteItemProps {
  favorite: AudioFavorite;
  reciter: Reciter | null;
  onRemove: () => void;
  onPlay: () => void;
  onTap: () => void;
}

function FavoriteItem({ favorite, onRemove, onPlay, onTap }: FavoriteItemProps) {
  const [surahName, setSurahName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSurah = async () => {
      try {
        const surah = await getSurahByNumber(favorite.surahNumber);
        setSurahName(surah?.nameTajik || `Сураи ${favorite.surahNumber}`);
      } catch (error) {
        console.error('Error loading surah:', error);
        setSurahName(`Сураи ${favorite.surahNumber}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadSurah();
  }, [favorite.surahNumber]);

  return (
    <div
      onClick={onTap}
      style={{
        padding: 'var(--spacing-md)',
        borderTop: '1px solid var(--color-outline)',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <div style={{ marginRight: 'var(--spacing-md)' }}>
        <MusicNoteIcon size={20} color="var(--color-text-secondary)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <div style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-primary)',
          }}>
            {surahName}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="btn btn-icon"
          style={{
            padding: '8px',
          }}
          title="Пахш кардан"
        >
          <PlayArrowIcon size={20} color="var(--color-primary)" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="btn btn-icon"
          style={{
            padding: '8px',
          }}
          title="Тоза кардан"
        >
          <DeleteOutlineIcon size={20} color="var(--color-error)" />
        </button>
      </div>
    </div>
  );
}

// Reciter Downloads Group
interface ReciterDownloadsGroupProps {
  reciterId: string;
  downloads: AudioDownload[];
  onRefresh: () => void;
}

function ReciterDownloadsGroup({ reciterId, downloads, onRefresh }: ReciterDownloadsGroupProps) {
  const router = useRouter();
  const [reciter, setReciter] = useState<Reciter | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const downloadsService = new AudioDownloadsService();

  useEffect(() => {
    const loadReciter = async () => {
      try {
        const data = await getReciterById(reciterId);
        setReciter(data || null);
      } catch (error) {
        console.error('Error loading reciter:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadReciter();
  }, [reciterId]);

  const handleDeleteDownload = async (surahNumber: number) => {
    await downloadsService.deleteDownload(reciterId, surahNumber);
    onRefresh();
  };

  const photoUrl = reciter ? getReciterPhotoUrl(reciter.id) : null;
  const hasImage = reciter ? hasMappedImage(reciter.id) : false;

  return (
    <div style={{
      marginBottom: 'var(--spacing-md)',
      backgroundColor: 'var(--color-surface)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: 'var(--spacing-md)',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        {/* Reciter image */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-surface-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginRight: 'var(--spacing-md)',
          flexShrink: 0,
        }}>
          {reciter && hasImage && photoUrl ? (
            <Image
              src={photoUrl}
              alt={reciter.nameTajik || reciter.name}
              width={48}
              height={48}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <DownloadDoneIcon size={24} color="var(--color-primary)" />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {isLoading ? (
            <LoadingSpinner size="small" />
          ) : (
            <>
              <div style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}>
                {reciter?.nameTajik || reciter?.name || 'Қорӣ'}
              </div>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
              }}>
                {downloads.length} сура
              </div>
            </>
          )}
        </div>
        <div style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-text-secondary)',
        }}>
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div>
          {downloads.map((download) => (
            <DownloadItem
              key={download.key}
              download={download}
              reciter={reciter}
              onDelete={() => handleDeleteDownload(download.surahNumber)}
              onPlay={() => router.push(`/audio-home/reciter/${reciterId}`)}
              onTap={() => router.push(`/audio-home/reciter/${reciterId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Download Item
interface DownloadItemProps {
  download: AudioDownload;
  reciter: Reciter | null;
  onDelete: () => void;
  onPlay: () => void;
  onTap: () => void;
}

function DownloadItem({ download, onDelete, onPlay, onTap }: DownloadItemProps) {
  const [surahName, setSurahName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSurah = async () => {
      try {
        const surah = await getSurahByNumber(download.surahNumber);
        setSurahName(surah?.nameTajik || `Сураи ${download.surahNumber}`);
      } catch (error) {
        console.error('Error loading surah:', error);
        setSurahName(`Сураи ${download.surahNumber}`);
      } finally {
        setIsLoading(false);
      }
    };
    loadSurah();
  }, [download.surahNumber]);

  const fileSizeMB = (download.fileSizeBytes / 1024 / 1024).toFixed(2);

  return (
    <div
      onClick={onTap}
      style={{
        padding: 'var(--spacing-md)',
        borderTop: '1px solid var(--color-outline)',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <div style={{ marginRight: 'var(--spacing-md)' }}>
        <MusicNoteIcon size={20} color="var(--color-text-secondary)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <>
            <div style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-primary)',
              marginBottom: '4px',
            }}>
              {surahName}
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              {fileSizeMB} MB
            </div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="btn btn-icon"
          style={{
            padding: '8px',
          }}
          title="Пахш кардан"
        >
          <PlayArrowIcon size={20} color="var(--color-primary)" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="btn btn-icon"
          style={{
            padding: '8px',
          }}
          title="Тоза кардан"
        >
          <DeleteOutlineIcon size={20} color="var(--color-error)" />
        </button>
      </div>
    </div>
  );
}


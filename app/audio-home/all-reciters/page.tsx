'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getReciters } from '@/lib/data/reciter-data-client';
import { Reciter } from '@/lib/data/reciter-data-client';
import { getReciterPhotoUrl, hasMappedImage } from '@/lib/utils/reciter-image-helper';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import Image from 'next/image';
import { ArrowBackIcon, PersonIcon } from '@/components/Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import BottomNavigation from '@/components/BottomNavigation';

export default function AllRecitersPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getReciters();
        // Filter to only full surah reciters (Arabic reciters that support full surah playback)
        const fullSurahReciters = data.filter(r => r.id.startsWith('ar.') && !r.hasVerseByVerse);
        setReciters(fullSurahReciters);
      } catch (err) {
        console.error('Error loading reciters:', err);
        setError(err instanceof Error ? err.message : 'Хатогӣ дар бор кардани қориҳо');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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

  if (error || reciters.length === 0) {
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
            <h1 className="app-bar-title">Ҳамаи қориҳо</h1>
          </div>
        </div>
        <ErrorDisplay
          message={error || 'Ҳеҷ қорие ёфт нашуд'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Helper function to get first letter of English name for grouping
  const getFirstLetter = (reciter: Reciter): string => {
    const name = reciter.name || '';
    if (name.length === 0) return '#';
    const firstChar = name[0].toUpperCase();
    // If it's a letter A-Z, return it, otherwise return '#'
    if (/[A-Z]/.test(firstChar)) {
      return firstChar;
    }
    return '#';
  };

  // Group reciters by first letter
  const grouped = new Map<string, Reciter[]>();
  for (const reciter of reciters) {
    const letter = getFirstLetter(reciter);
    if (!grouped.has(letter)) {
      grouped.set(letter, []);
    }
    grouped.get(letter)!.push(reciter);
  }

  // Sort within each group
  for (const letter of grouped.keys()) {
    grouped.get(letter)!.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Sort letters
  const sortedLetters = Array.from(grouped.keys()).sort();

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
          <h1 className="app-bar-title">Ҳамаи қориҳо</h1>
        </div>
      </div>

      {/* Content */}
      <main className="scrollable-container-vertical" style={{
        padding: 'var(--spacing-lg)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-lg))' : 'var(--spacing-lg)',
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {sortedLetters.map((letter) => {
          const letterReciters = grouped.get(letter)!;
          return (
            <div key={letter} style={{ marginBottom: 'var(--spacing-xl)' }}>
              {/* Section header */}
              <div style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-primary)',
                marginBottom: 'var(--spacing-md)',
                paddingLeft: '4px',
              }}>
                {letter}
              </div>
              {/* Reciter list */}
              <div>
                {letterReciters.map((reciter) => (
                  <ReciterListItem
                    key={reciter.id}
                    reciter={reciter}
                    onClick={() => router.push(`/audio-home/reciter/${reciter.id}`)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </main>

      <BottomNavigation />
    </div>
  );
}

// Reciter List Item
interface ReciterListItemProps {
  reciter: Reciter;
  onClick: () => void;
}

function ReciterListItem({ reciter, onClick }: ReciterListItemProps) {
  const photoUrl = getReciterPhotoUrl(reciter.id);
  const hasImage = hasMappedImage(reciter.id);

  return (
    <div
      onClick={onClick}
      style={{
        padding: 'var(--spacing-md)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '12px',
        marginBottom: 'var(--spacing-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {/* Reciter image */}
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-surface-variant)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {hasImage && photoUrl ? (
          <Image
            src={photoUrl}
            alt={reciter.nameTajik || reciter.name}
            width={56}
            height={56}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{ opacity: 0.6 }}>
          <PersonIcon
            size={28}
            color="var(--color-primary)"
          />
          </div>
        )}
      </div>
      {/* Reciter info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          {reciter.nameTajik || reciter.name}
        </div>
        {reciter.nameArabic && (
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            {reciter.nameArabic}
          </div>
        )}
      </div>
    </div>
  );
}

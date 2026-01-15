'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getReciters } from '@/lib/data/reciter-data-client';
import { Reciter } from '@/lib/data/reciter-data-client';
import { LastPlayedService } from '@/lib/services/last-played-service';
import { getSurahByNumber } from '@/lib/data/surah-data-client';
import { getReciterPhotoUrl, hasMappedImage, initializeReciterPhotoCache } from '@/lib/utils/reciter-image-helper';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import { PersonIcon } from '@/components/Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import ReciterProfileItem from '@/components/ReciterProfileItem';

export default function AudioHomePage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Initialize reciter photo cache
        await initializeReciterPhotoCache();
        const data = await getReciters();
        setReciters(data);
      } catch (error) {
        console.error('Error loading reciters:', error);
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

  // Filter reciters:
  // - Full surah reciters (Arabic reciters that support full surah playback)
  // - Tajik translation audio (full surah translations) - shown in "With Translate" section
  // - Verse-by-verse translations (translations that only support verse-by-verse)
  const verseByVerseTranslations = reciters.filter(r => !r.id.startsWith('ar.') && !r.id.startsWith('tg.') && r.hasVerseByVerse === true);
  const tajikEditions = reciters.filter(r => r.id.startsWith('tg.'));
  const allFullSurahReciters = reciters.filter(r => r.id.startsWith('ar.') && !r.hasVerseByVerse);
  // Filter to only verse-by-verse reciters (for stories) - matches Flutter's verseByVerseRecitersProvider
  const storyReciters = reciters.filter(r => r.hasVerseByVerse === true);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      <main style={{
        padding: 'var(--spacing-md) var(--spacing-md)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        maxWidth: '100%',
        margin: '0',
        width: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}>
        {/* Story Section (Reciter Profiles) */}
        {storyReciters.length > 0 && (
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div 
              className="scrollable-container"
              style={{ 
                display: 'flex',
                gap: 'var(--spacing-md)',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: 'var(--spacing-sm)',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {storyReciters.map((reciter, index) => (
                <ReciterProfileItem
                  key={reciter.id || index}
                  reciter={reciter}
                />
              ))}
        </div>
      </div>
        )}

        {/* Last Seen Section */}
        <LastSeenSection />

        {/* With Translate Section */}
        <WithTranslateSection 
          verseByVerseTranslations={verseByVerseTranslations}
          tajikEditions={tajikEditions}
        />

        {/* Editors' Choice Section */}
        <EditorsChoiceSection reciters={allFullSurahReciters} />
      </main>
    </div>
  );
}

// Last Seen Section
function LastSeenSection() {
  const router = useRouter();
  const [lastPlayed, setLastPlayed] = useState<{
    reciterId: string;
    surahNumber: number;
  } | null>(null);
  const [reciter, setReciter] = useState<Reciter | null>(null);
  const [surahName, setSurahName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLastPlayed = async () => {
      try {
        setIsLoading(true);
        const service = new LastPlayedService();
        const reciterId = await service.getLastPlayedReciterId();
        const surahNumber = await service.getLastPlayedSurahNumber();

        if (reciterId && surahNumber) {
          setLastPlayed({ reciterId, surahNumber });
          
          // Load reciter data
          const reciters = await getReciters();
          const foundReciter = reciters.find(r => r.id === reciterId);
          setReciter(foundReciter || null);

          // Load surah data
          const surah = await getSurahByNumber(surahNumber);
          setSurahName(surah?.nameTajik || `Сураи ${surahNumber}`);
        }
      } catch (error) {
        console.error('Error loading last played:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLastPlayed();
  }, []);

  if (isLoading || !lastPlayed || !reciter) {
    return null;
  }

  const photoUrl = getReciterPhotoUrl(reciter.id);
  const hasImage = hasMappedImage(reciter.id);

  return (
    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
      <h2 style={{
        fontSize: 'var(--font-size-xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-md)',
      }}>
        Охирин боздид
      </h2>
      <div
        onClick={() => router.push(`/audio-home/reciter/${lastPlayed.reciterId}`)}
        style={{
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-surface-variant)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-outline)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface)';
          e.currentTarget.style.boxShadow = 'var(--elevation-2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Reciter image */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-container-low-opacity)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          border: '2px solid var(--color-primary-low-opacity)',
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
            <PersonIcon
              size={24}
              color="var(--color-primary)"
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 'var(--font-size-base)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}>
            {reciter.nameTajik || reciter.name}
          </div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            {surahName}
          </div>
        </div>
      </div>
    </div>
  );
}

// With Translate Section
interface WithTranslateSectionProps {
  verseByVerseTranslations: Reciter[];
  tajikEditions: Reciter[];
}

function WithTranslateSection({ verseByVerseTranslations, tajikEditions }: WithTranslateSectionProps) {
  const router = useRouter();

  // Helper to get flag for a reciter ID
  const getFlagForReciter = (reciterId: string): string => {
    if (reciterId.startsWith('tg.')) return '🇹🇯';
    if (reciterId.startsWith('fa.')) return '🇮🇷';
    if (reciterId.startsWith('ru.')) return '🇷🇺';
    if (reciterId.startsWith('en.')) return '🇬🇧';
    if (reciterId.startsWith('fr.')) return '🇫🇷';
    if (reciterId.startsWith('ur.')) return '🇵🇰';
    if (reciterId.startsWith('zh.')) return '🇨🇳';
    return '🌐';
  };

  // Helper to get language priority for sorting
  const getLanguagePriority = (reciterId: string): number => {
    if (reciterId.startsWith('tg.')) return 0; // Tajik - first (highest priority)
    if (reciterId.startsWith('fa.')) return 1; // Farsi - second
    if (reciterId.startsWith('ru.')) return 2; // Russian - third
    if (reciterId.startsWith('en.')) return 3; // English - fourth
    return 4; // Others - last
  };

  // Build display list: Tajik first (if available), then verse-by-verse translations
  const displayEditions: Reciter[] = [];
  
  // Add Tajik editions first (highest priority)
  tajikEditions.forEach(edition => {
    displayEditions.push(edition);
  });
  
  // Add verse-by-verse translations
  verseByVerseTranslations.forEach(translation => {
    // Skip if already added (shouldn't happen, but just in case)
    if (!displayEditions.find(e => e.id === translation.id)) {
      displayEditions.push(translation);
    }
  });

  // Sort by priority: tajik, farsi, russian, english, then others
  const sortedTranslations = [...displayEditions].sort((a, b) => {
    const priorityA = getLanguagePriority(a.id);
    const priorityB = getLanguagePriority(b.id);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return (a.nameTajik || a.name).localeCompare(b.nameTajik || b.name);
  });

  if (sortedTranslations.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: 'var(--spacing-xl)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)',
      }}>
        <h2 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
        }}>
          Бо тарҷума
        </h2>
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
        }}>
          {sortedTranslations.length} тарҷума
        </div>
      </div>
      <div style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        display: 'flex',
        gap: 'var(--spacing-md)',
        padding: '4px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {sortedTranslations.map((translation) => {
          const photoUrl = getReciterPhotoUrl(translation.id);
          const hasImage = hasMappedImage(translation.id);
          const flag = getFlagForReciter(translation.id);

          return (
            <div
              key={translation.id}
              onClick={() => router.push(`/audio-home/reciter/${translation.id}`)}
              style={{
                width: '140px',
                minWidth: '140px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: '128px',
                height: '128px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-variant)',
                border: '2px solid var(--color-outline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                marginBottom: 'var(--spacing-sm)',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.boxShadow = 'var(--elevation-2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-outline)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
                {hasImage && photoUrl ? (
                  <>
                    <Image
                      src={photoUrl}
                      alt={translation.nameTajik || translation.name}
                      width={128}
                      height={128}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Flag overlay in bottom right corner */}
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      fontSize: '24px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}>
                      {flag}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '64px' }}>{flag}</div>
                )}
              </div>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)',
                textAlign: 'center',
                width: '140px',
                padding: '0 4px',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.3',
              }}>
                {translation.nameTajik || translation.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Editors' Choice Section
interface EditorsChoiceSectionProps {
  reciters: Reciter[];
}

function EditorsChoiceSection({ reciters }: EditorsChoiceSectionProps) {
  const router = useRouter();

  // Helper function to get first letter of Tajik name for grouping
  const getFirstLetter = (reciter: Reciter): string => {
    const name = (reciter.nameTajik && reciter.nameTajik !== reciter.id)
      ? reciter.nameTajik
      : (reciter.name && reciter.name !== reciter.id
          ? reciter.name
          : 'Қорӣ');
    if (name.length === 0) return '?';
    return name[0].toUpperCase();
  };

  // Tajik alphabet order for proper sorting
  const tajikAlphabet = 'АБВГҒДЕЁЖЗИӢЙКҚЛМНОПРСТУӮФХҲЧҶШЩЪЭЮЯ';

  // Get sort order for a letter according to Tajik alphabet
  const getTajikLetterOrder = (letter: string): number => {
    const index = tajikAlphabet.indexOf(letter);
    if (index !== -1) {
      return index;
    }
    return 999;
  };

  // Sort all reciters by Tajik alphabet order
  const sortedReciters = [...reciters].sort((a, b) => {
    const nameA = (a.nameTajik && a.nameTajik !== a.id)
      ? a.nameTajik
      : (a.name && a.name !== a.id ? a.name : 'Қорӣ');
    const nameB = (b.nameTajik && b.nameTajik !== b.id)
      ? b.nameTajik
      : (b.name && b.name !== b.id ? b.name : 'Қорӣ');
    
    // Get first letters
    const letterA = nameA.length > 0 ? nameA[0].toUpperCase() : '?';
    const letterB = nameB.length > 0 ? nameB[0].toUpperCase() : '?';
    
    // Compare by letter order first
    const orderA = getTajikLetterOrder(letterA);
    const orderB = getTajikLetterOrder(letterB);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // If same letter, compare full names
    return nameA.localeCompare(nameB);
  });

  if (reciters.length === 0) {
    return null;
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)',
      }}>
        <h2 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-primary)',
        }}>
          Аслӣ - Арабӣ
        </h2>
        <div style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
        }}>
          {reciters.length} қорӣ
        </div>
      </div>

      {/* Grid layout for all reciters */}
              <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: 'var(--spacing-md)',
        padding: '4px',
              }}>
        {sortedReciters.map((reciter) => (
                  <ReciterCard
                    key={reciter.id}
                    reciter={reciter}
                    onClick={() => router.push(`/audio-home/reciter/${reciter.id}`)}
                  />
                ))}
              </div>
    </div>
  );
}

// Reciter Card Component
interface ReciterCardProps {
  reciter: Reciter;
  onClick: () => void;
}

function ReciterCard({ reciter, onClick }: ReciterCardProps) {
  const photoUrl = getReciterPhotoUrl(reciter.id);
  const hasImage = hasMappedImage(reciter.id);

  return (
    <div
      onClick={onClick}
      style={{
        width: '120px',
        height: '180px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-outline)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.boxShadow = 'var(--elevation-2)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-outline)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Photo section */}
      <div style={{
        flex: 3,
        width: '100%',
        backgroundColor: 'var(--color-surface-variant)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {hasImage && photoUrl ? (
          <Image
            src={photoUrl}
            alt={reciter.nameTajik || reciter.name}
            width={120}
            height={120}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <PersonIcon
            size={60}
            color="var(--color-primary)"
          />
        )}
      </div>
      {/* Text section */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-sm)',
        backgroundColor: 'var(--color-surface)',
      }}>
        <div style={{
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          maxLines: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: '1.4',
        }}>
          {reciter.nameTajik || reciter.name || 'Қорӣ'}
        </div>
      </div>
    </div>
  );
}

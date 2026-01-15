'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getReciterStory } from '@/lib/data/story-data-client';
import { Reciter } from '@/lib/data/reciter-data-client';
import { getReciterPhotoUrl, hasMappedImage, isLocalAsset } from '@/lib/utils/reciter-image-helper';
import StoryViewer from './StoryViewer';
import { PersonIcon } from './Icons';

interface ReciterProfileItemProps {
  reciter: Reciter;
}

export default function ReciterProfileItem({ reciter }: ReciterProfileItemProps) {
  const [imageError, setImageError] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [story, setStory] = useState<any>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const router = useRouter();

  const hasImage = hasMappedImage(reciter.id);
  const photoUrl = getReciterPhotoUrl(reciter.id);
  const isLocal = photoUrl ? isLocalAsset(photoUrl) : false;

  const handleClick = async (e: React.MouseEvent) => {
    // Check if it's a right-click or middle-click (for opening in new tab)
    if (e.button !== 0 || e.ctrlKey || e.metaKey) {
      return; // Let default link behavior handle it
    }

    e.preventDefault();
    
    // Only show story for verse-by-verse reciters
    if (!reciter.hasVerseByVerse) {
      router.push(`/audio-home/reciter/${reciter.id}`);
      return;
    }

    setIsLoadingStory(true);
    try {
      const storyData = await getReciterStory(reciter);
      setStory(storyData);
      setShowStory(true);
    } catch (error) {
      console.error('Error loading story:', error);
      // Fallback to audio page
      router.push(`/audio-home/reciter/${reciter.id}`);
    } finally {
      setIsLoadingStory(false);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textDecoration: 'none',
          color: 'inherit',
          minWidth: '80px',
          cursor: reciter.hasVerseByVerse ? 'pointer' : 'default',
        }}
      >
        {/* Profile circle with image or icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`,
          padding: '2px',
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface)',
            border: '4px solid var(--color-surface)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {hasImage && photoUrl && !imageError ? (
              isLocal ? (
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
                  onError={() => setImageError(true)}
                />
              ) : (
                <img
                  src={photoUrl}
                  alt={reciter.nameTajik || reciter.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={() => setImageError(true)}
                />
              )
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--color-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.6,
              }}>
                <PersonIcon
                  size={32}
                  color="var(--color-on-surface)"
                />
              </div>
            )}
          </div>
        </div>
        <div style={{
          marginTop: '4px',
          fontSize: '10px',
          fontWeight: 500,
          color: 'var(--color-on-surface)',
          textAlign: 'center',
          maxWidth: '80px',
          maxHeight: '16px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {reciter.nameTajik || reciter.name}
        </div>
      </div>
      {isLoadingStory && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '24px',
          borderRadius: '12px',
          color: 'var(--color-on-surface)',
        }}>
          Боргирӣ карда истодааст...
        </div>
      )}
      {showStory && story && (
        <StoryViewer
          story={story}
          reciter={reciter}
          onClose={() => {
            setShowStory(false);
            setStory(null);
          }}
        />
      )}
    </>
  );
}



'use client';

import { useState, useEffect } from 'react';
import { BookmarkService } from '@/lib/services/bookmark-service';

interface BookmarkButtonProps {
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  tajikText: string;
  size?: 'small' | 'medium' | 'large';
}

export default function BookmarkButton({
  surahNumber,
  verseNumber,
  arabicText,
  tajikText,
  size = 'medium',
}: BookmarkButtonProps) {
  const bookmarkService = BookmarkService.getInstance();
  const uniqueKey = `${surahNumber}:${verseNumber}`;
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setIsBookmarked(bookmarkService.isBookmarked(uniqueKey));
  }, [uniqueKey]);

  const handleToggle = () => {
    const newState = bookmarkService.toggleBookmark(
      surahNumber,
      verseNumber,
      arabicText,
      tajikText
    );
    setIsBookmarked(newState);
  };

  const iconSize = size === 'small' ? '1rem' : size === 'large' ? '1.5rem' : '1.25rem';
  const padding = size === 'small' ? '4px' : size === 'large' ? '12px' : '8px';

  return (
    <button
      onClick={handleToggle}
      className="btn btn-icon"
      style={{
        fontSize: iconSize,
        color: isBookmarked ? 'var(--color-primary)' : 'var(--color-text-disabled)',
        padding,
        width: size === 'small' ? '32px' : size === 'large' ? '48px' : '40px',
        height: size === 'small' ? '32px' : size === 'large' ? '48px' : '40px',
        minHeight: size === 'small' ? '32px' : size === 'large' ? '48px' : '40px',
      }}
      title={isBookmarked ? 'Аз захираҳо хориҷ кардан' : 'Ба захираҳо илова кардан'}
    >
      {isBookmarked ? '🔖' : '📑'}
    </button>
  );
}


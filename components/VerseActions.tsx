'use client';

import { useState } from 'react';
import BookmarkButton from './BookmarkButton';

interface VerseActionsProps {
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  tajikText: string;
  showAudio?: boolean;
}

export default function VerseActions({
  surahNumber,
  verseNumber,
  arabicText,
  tajikText,
  showAudio = true,
}: VerseActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = `${arabicText}\n\n${tajikText}\n\nСураи ${surahNumber}:${verseNumber}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Сураи ${surahNumber}, Оят ${verseNumber}`,
          text: text,
        });
      } catch (error) {
        // Share cancelled or failed
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      handleCopy();
    }
  };

  const handleCopy = async () => {
    const text = `${arabicText}\n\n${tajikText}\n\nСураи ${surahNumber}:${verseNumber}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Нусхабардорӣ карда натавонист');
    }
  };

  const handleAudio = () => {
    // Placeholder for audio functionality
    alert('Функсияи аудио дар шабака');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-sm)',
      padding: 'var(--spacing-sm) 0',
      borderTop: '1px solid var(--color-outline-variant)',
      marginTop: 'var(--spacing-sm)',
    }}>
      <BookmarkButton
        surahNumber={surahNumber}
        verseNumber={verseNumber}
        arabicText={arabicText}
        tajikText={tajikText}
        size="small"
      />
      
      <button
        onClick={handleShare}
        className="btn btn-text"
        style={{
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text-secondary)',
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          gap: 'var(--spacing-xs)',
        }}
        title="Баҳам додан"
      >
        📤
      </button>
      
      <button
        onClick={handleCopy}
        className="btn btn-text"
        style={{
          fontSize: 'var(--font-size-base)',
          color: copied ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          gap: 'var(--spacing-xs)',
        }}
        title={copied ? 'Нусхабардорӣ шуд!' : 'Нусхабардорӣ кардан'}
      >
        {copied ? '✓' : '📋'}
      </button>
      
      {showAudio && (
        <button
          onClick={handleAudio}
          className="btn btn-text"
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            gap: 'var(--spacing-xs)',
          }}
          title="Аудио"
        >
          🎵
        </button>
      )}
    </div>
  );
}


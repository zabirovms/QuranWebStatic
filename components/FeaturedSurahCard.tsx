'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FeaturedSurahCardProps {
  surah: {
    name: string;
    surahNumber: number;
    verseNumber?: number;
    isVerse: boolean;
  };
}

export default function FeaturedSurahCard({ surah }: FeaturedSurahCardProps) {
  const [imageError, setImageError] = useState(false);

  const getSvgPath = () => {
    if (surah.isVerse && surah.verseNumber === 255) {
      return '/images/Featured_Surahs/2_255.svg';
    }
    return `/images/Featured_Surahs/${surah.surahNumber}.svg`;
  };

  const getSurahColor = () => {
    switch (surah.surahNumber) {
      case 1: return '#38b6ff';
      case 18: return '#ff751f';
      case 36: return '#ffd21f';
      case 55: return '#000000';
      case 67: return '#004aad';
      default: return '#38b6ff';
    }
  };

  const surahColor = getSurahColor();
  const borderColor = `${surahColor}66`; // 40% opacity

  const href = surah.isVerse && surah.verseNumber
    ? `/surah/${surah.surahNumber}?verse=${surah.verseNumber}`
    : `/surah/${surah.surahNumber}`;

  return (
    <Link
      href={href}
      className="card card-elevation-2 surah-card"
      style={{
        display: 'block',
        minWidth: '160px',
        height: '120px',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        color: 'inherit',
        background: 'var(--color-surface)',
        padding: 0,
        overflow: 'hidden',
        boxShadow: 'var(--elevation-1)',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--elevation-4)';
        e.currentTarget.style.borderColor = surahColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--elevation-1)';
        e.currentTarget.style.borderColor = borderColor;
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {!imageError ? (
          <img
            src={getSvgPath()}
            alt={surah.name}
            className="surah-name-svg"
            style={{
              width: '160px',
              height: '120px',
              objectFit: 'contain',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            fontSize: '0.9rem',
            fontWeight: '500',
          }}>
            {surah.name}
          </div>
        )}
      </div>
    </Link>
  );
}



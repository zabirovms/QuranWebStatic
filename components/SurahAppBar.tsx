'use client';

import { useRouter } from 'next/navigation';
import { BookmarkIcon, SettingsIcon } from './Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { Surah } from '@/lib/types';

interface SurahAppBarProps {
  surah: Surah;
  hasAnyBookmarks?: boolean;
  onSettingsClick?: () => void;
  onBookmarksClick?: () => void;
  currentJuz?: number;
  currentPage?: number;
  progress?: number; // 0 to 1
}

export default function SurahAppBar({ 
  surah,
  hasAnyBookmarks = false,
  onSettingsClick,
  onBookmarksClick,
  currentJuz,
  currentPage,
  progress = 0,
}: SurahAppBarProps) {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();

  const handleSettings = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      router.push('/settings');
    }
  };

  const handleBookmarks = () => {
    if (onBookmarksClick) {
      onBookmarksClick();
    }
  };

  return (
    <div 
      className="app-bar"
      style={{
        top: isTopBarVisible ? '56px' : '0px',
        transition: 'top 0.4s ease-out',
      }}
    >
      <div className="app-bar-content">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-medium)',
            }}>
              {surah.number}
            </span>
            <h1 className="app-bar-title" style={{ 
              margin: 0,
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {surah.nameTajik}
            </h1>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
        }}>
          {/* Juz and Page Info */}
          {(currentJuz || currentPage) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
            }}>
              {currentJuz && (
                <span>Ҷуз {currentJuz}</span>
              )}
              {currentJuz && currentPage && (
                <span style={{ color: 'var(--color-text-secondary)' }}>•</span>
              )}
              {currentPage && (
                <span>Саҳифа {currentPage}</span>
              )}
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
          }}>
            <button
              onClick={handleBookmarks}
              className="btn btn-icon"
              title="Захираҳо"
            >
              <BookmarkIcon 
                size={24} 
                color="var(--color-text-primary)" 
                filled={hasAnyBookmarks}
              />
            </button>
            
            <button
              onClick={handleSettings}
              className="btn btn-icon"
              title="Танзимот"
            >
              <SettingsIcon size={24} color="var(--color-text-primary)" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: 'var(--color-outline)',
        zIndex: 1,
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, progress * 100))}%`,
          backgroundColor: 'var(--color-primary)',
          transition: 'width 0.2s ease',
        }} />
      </div>
    </div>
  );
}

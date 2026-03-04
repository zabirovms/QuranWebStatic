'use client';

import { useEffect, useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkIcon, SettingsIcon } from './Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { Surah } from '@/lib/types';
import { useSidebarHover } from './MagicCurveSidebar';
import { throttle } from '@/lib/utils/throttle';

interface SurahAppBarProps {
  surah: Surah;
  hasAnyBookmarks?: boolean;
  onSettingsClick?: () => void;
  onBookmarksClick?: () => void;
  currentJuz?: number;
  currentPage?: number;
  progress?: number; // 0 to 1
  // Optional: current view mode + toggle (translation vs mushaf)
  viewMode?: 'translation' | 'mushaf';
  onToggleViewMode?: () => void;
}

function SurahAppBar({ 
  surah,
  hasAnyBookmarks = false,
  onSettingsClick,
  onBookmarksClick,
  currentJuz,
  currentPage,
  progress = 0,
  viewMode = 'translation',
  onToggleViewMode,
}: SurahAppBarProps) {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const isSidebarHovered = useSidebarHover();
  // Default to true (mobile) to prevent content shift on initial render
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return true; // Default to mobile on SSR to prevent flash/shift
  });
  const [canAttachResizeListener, setCanAttachResizeListener] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const schedule = (cb: () => void) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(cb);
      } else {
        setTimeout(cb, 200);
      }
    };
    schedule(() => setCanAttachResizeListener(true));
  }, []);

  useEffect(() => {
    if (!canAttachResizeListener) {
      return;
    }
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    // Throttle resize handler to reduce TBT (Phase 2, Section 3.3)
    const throttledCheckMobile = throttle(checkMobile, 150);
    window.addEventListener('resize', throttledCheckMobile, { passive: true });
    return () => window.removeEventListener('resize', throttledCheckMobile);
  }, [canAttachResizeListener]);

  const handleSettings = () => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        if (onSettingsClick) {
          onSettingsClick();
        } else {
          router.push('/settings');
        }
      });
    } else {
      if (onSettingsClick) onSettingsClick();
      else router.push('/settings');
    }
  };

  const handleBookmarks = () => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        if (onBookmarksClick) onBookmarksClick();
      });
    } else if (onBookmarksClick) {
      onBookmarksClick();
    }
  };

  return (
    <div
      className="app-bar"
      style={{
        top: isTopBarVisible ? '56px' : '0px',
        left: isMobile ? 0 : (isSidebarHovered ? '280px' : '64px'),
        right: 0,
        transition: 'top 0.4s ease-out, left 0.5s ease',
        zIndex: 1019,
      }}
    >
      <div
        className="app-bar-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-md)',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Left: Surah number + name (always single row, truncating if needed) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: '1 1 auto',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              minWidth: 28,
              height: 28,
              borderRadius: 999,
              border: '1px solid var(--color-outline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              fontWeight: 'var(--font-weight-medium)',
              paddingInline: 8,
              backgroundColor: 'var(--color-surface-variant)',
              flexShrink: 0,
            }}
          >
            {surah.number}
          </span>
          <h1
            className="app-bar-title"
            style={{
              margin: 0,
              fontSize: 'var(--font-size-sm)', // same visual size as number badge
              fontWeight: 'var(--font-weight-semibold)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {surah.nameTajik}
          </h1>
        </div>

        {/* Right: meta info + controls (stay on one line, no wrapping) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--spacing-sm)',
            flex: '0 0 auto',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {/* Juz and Page Info – always visible but compact on small screens */}
          {(currentJuz || currentPage) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                fontSize: isMobile
                  ? 'var(--font-size-xs)'
                  : 'var(--font-size-sm)',
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: isMobile ? 140 : 220,
              }}
            >
              {currentJuz && <span>Ҷуз {currentJuz}</span>}
              {currentJuz && currentPage && (
                <span style={{ color: 'var(--color-text-secondary)' }}>•</span>
              )}
              {currentPage && <span>Саҳифа {currentPage}</span>}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              flexShrink: 0,
            }}
          >
            {/* View mode toggle (translation vs mushaf) */}
            {onToggleViewMode && (
              <button
                onClick={onToggleViewMode}
                className="btn"
                title={
                  viewMode === 'mushaf'
                    ? 'Ҳолати тарҷума'
                    : 'Ҳолати мусҳаф (танҳо арабӣ)'
                }
                style={{
                  padding: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  minWidth: isMobile ? 'auto' : 'auto',
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minWidth: isMobile ? '96px' : '110px',
                    height: isMobile ? '28px' : '30px',
                    borderRadius: '999px',
                    padding: '2px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-outline)',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      borderRadius: '999px',
                      paddingInline: '8px',
                      paddingBlock: '2px',
                      fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                      fontWeight: 500,
                      backgroundColor:
                        viewMode === 'translation'
                          ? 'var(--color-primary)'
                          : 'transparent',
                      color:
                        viewMode === 'translation'
                          ? 'var(--color-on-primary, #fff)'
                          : 'var(--color-text-secondary)',
                      transition: 'background-color 0.18s ease, color 0.18s ease',
                    }}
                  >
                    Тарҷума
                  </span>
                  <span
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      borderRadius: '999px',
                      paddingInline: '8px',
                      paddingBlock: '2px',
                      fontSize: isMobile ? 'var(--font-size-xs)' : 'var(--font-size-sm)',
                      fontWeight: 500,
                      backgroundColor:
                        viewMode === 'mushaf'
                          ? 'var(--color-primary)'
                          : 'transparent',
                      color:
                        viewMode === 'mushaf'
                          ? 'var(--color-on-primary, #fff)'
                          : 'var(--color-text-secondary)',
                      transition: 'background-color 0.18s ease, color 0.18s ease',
                    }}
                  >
                    Мусҳаф
                  </span>
                </div>
              </button>
            )}

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

export default memo(SurahAppBar);

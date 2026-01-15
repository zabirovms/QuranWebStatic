'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookmarkService, Bookmark } from '@/lib/services/bookmark-service';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { CloseIcon, BookmarkIcon } from './Icons';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookmarksDrawer({ isOpen, onClose }: BookmarksDrawerProps) {
  const router = useRouter();
  const bookmarkService = BookmarkService.getInstance();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [surahs, setSurahs] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBookmarks(bookmarkService.getAllBookmarks());
      getAllSurahs().then(setSurahs).catch(console.error);
    }
  }, [isOpen, bookmarkService]);

  const getSurahName = (surahNumber: number): string => {
    const surah = surahs.find(s => s.number === surahNumber);
    return surah ? surah.nameTajik : `Сураи ${surahNumber}`;
  };

  const handleBookmarkClick = (bookmark: Bookmark) => {
    router.push(`/surah/${bookmark.surahNumber}?verse=${bookmark.verseNumber}`);
    onClose();
  };

  const handleRemoveBookmark = (e: React.MouseEvent, uniqueKey: string) => {
    e.stopPropagation();
    bookmarkService.removeBookmark(uniqueKey);
    setBookmarks(bookmarkService.getAllBookmarks());
  };

  // Sort bookmarks by surah number, then verse number
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.surahNumber !== b.surahNumber) {
      return a.surahNumber - b.surahNumber;
    }
    return a.verseNumber - b.verseNumber;
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2000,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease-in-out',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--color-background)',
          boxShadow: 'var(--elevation-8)',
          zIndex: 2001,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid var(--color-outline)',
            minHeight: '56px',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Захираҳо
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <CloseIcon size={24} color="var(--color-text-primary)" />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
          }}
        >
          {sortedBookmarks.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--spacing-3xl) var(--spacing-lg)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div style={{ opacity: 0.3, marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <BookmarkIcon size={48} color="var(--color-text-secondary)" />
              </div>
              <p style={{ fontSize: 'var(--font-size-base)', margin: 0 }}>
                Захираҳо нест
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortedBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  onClick={() => handleBookmarkClick(bookmark)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: 'var(--color-surface-variant)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 'var(--font-size-base)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-text-primary)',
                        marginBottom: '4px',
                      }}
                    >
                      {getSurahName(bookmark.surahNumber)}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-primary)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      {bookmark.surahNumber}:{bookmark.verseNumber}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemoveBookmark(e, bookmark.uniqueKey)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'background-color 0.2s ease',
                      marginLeft: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Нест кардан"
                  >
                    <BookmarkIcon size={20} color="var(--color-primary)" filled={true} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


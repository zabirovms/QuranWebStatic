'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookmarkService, Bookmark } from '@/lib/services/bookmark-service';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const bookmarkService = BookmarkService.getInstance();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    setBookmarks(bookmarkService.getAllBookmarks());
  };

  const removeBookmark = (uniqueKey: string) => {
    bookmarkService.removeBookmark(uniqueKey);
    loadBookmarks();
  };

  if (bookmarks.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f8f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔖</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
            Захираҳо холӣ аст
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#1a1a1a' }}>
            Оятҳоро захира кунед ва инҷо дида мешаванд
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f8f8',
      paddingBottom: '80px',
    }}>
      <div style={{
        padding: '16px',
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          marginBottom: '24px',
        }}>
          Захираҳо ({bookmarks.length})
        </h1>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                padding: '16px',
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <button
                onClick={() => removeBookmark(bookmark.uniqueKey)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#999',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Нест кардан"
              >
                ×
              </button>
              <Link
                href={`/surah/${bookmark.surahNumber}?verse=${bookmark.verseNumber}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{
                  fontSize: '1.125rem',
                  fontFamily: 'serif',
                  direction: 'rtl',
                  marginBottom: '12px',
                  color: '#4a90e2',
                }}>
                  <span lang="ar">{bookmark.arabicText}</span>
                </div>
                <div style={{
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  marginBottom: '8px',
                  color: '#1a1a1a',
                }}>
                  {bookmark.tajikText}
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  color: '#4a90e2',
                  fontWeight: 'bold',
                }}>
                  Сураи {bookmark.surahNumber}:{bookmark.verseNumber}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



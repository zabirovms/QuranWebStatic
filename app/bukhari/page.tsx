'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBukhariMetadata, getMainBooksMetadata } from '@/lib/data/bukhari-data-client';
import { BookMetadata } from '@/lib/types/hadith';
import BukhariTopBar from '@/components/BukhariTopBar';
import BukhariStructuredData from '@/components/BukhariStructuredData';
import { useTopBar } from '@/lib/contexts/TopBarContext';

export default function BukhariPage() {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [booksData, metadataData] = await Promise.all([
          getMainBooksMetadata(),
          getBukhariMetadata(),
        ]);
        setBooks(booksData);
        setMetadata(metadataData.metadata);
      } catch (err) {
        console.error('Error loading Bukhari data:', err);
        setError('Хатоги дар боргирии маълумот');
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
        background: 'var(--color-background)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}>Боргирӣ...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-background)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: 'var(--color-error)', marginBottom: '16px' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background)',
    }}>
      {/* Structured Data */}
      <BukhariStructuredData
        type="collection"
        totalBooks={metadata?.total_books}
        totalChapters={metadata?.total_chapters}
        totalHadiths={metadata?.total_hadith_occurrences}
      />
      
      {/* Top Bar */}
      <BukhariTopBar />

      {/* Main Content */}
      <div style={{ paddingTop: isTopBarVisible ? 'calc(56px + 56px)' : '56px', transition: 'padding-top 0.4s ease-out', marginTop: 0 }}>
        {/* Hero Header */}
        <div style={{
          background: `linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-variant) 100%)`,
          color: 'var(--color-on-primary)',
          padding: 'clamp(40px, 8vw, 60px) clamp(16px, 4vw, 20px) clamp(24px, 6vw, 40px)',
          boxShadow: 'var(--elevation-2)',
          marginTop: 0,
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: 'clamp(24px, 5vw, 36px)',
              fontWeight: '700',
              marginBottom: '8px',
              letterSpacing: '-0.5px',
              margin: 0,
            }}>
              {metadata?.title || 'Мухтасари Саҳеҳи Бухорӣ'}
            </h1>
            <div style={{
              fontSize: 'clamp(14px, 3vw, 18px)',
              opacity: 0.9,
              marginBottom: '24px',
            }}>
              {metadata?.author || 'Имом Бухорӣ'}
            </div>
            {metadata && (
              <div style={{
                display: 'flex',
                gap: 'clamp(12px, 3vw, 20px)',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                }}>
                  <strong>{metadata.total_books}</strong> китоб
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                }}>
                  <strong>{metadata.total_chapters}</strong> боб
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                }}>
                  <strong>{metadata.total_hadith_occurrences}</strong> ҳадис
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Books Container */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(24px, 6vw, 40px) clamp(16px, 4vw, 20px)',
        }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '24px',
        }}>
          {books.map((book) => (
            <Link
              key={`${book.id}-${book.sub_number || ''}`}
              href={`/bukhari/${book.number}${book.sub_number ? `-${book.sub_number}` : ''}`}
              style={{
                display: 'block',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'clamp(16px, 4vw, 24px)',
                textDecoration: 'none',
                color: 'var(--color-text-primary)',
                boxShadow: 'var(--elevation-1)',
                transition: 'all 0.2s ease',
                border: '1px solid var(--color-outline)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--elevation-4)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--elevation-1)';
                e.currentTarget.style.borderColor = 'var(--color-outline)';
              }}
            >
              {/* Book Number */}
              <div style={{
                position: 'absolute',
                top: 'clamp(16px, 4vw, 20px)',
                right: 'clamp(16px, 4vw, 20px)',
                width: 'clamp(36px, 9vw, 40px)',
                height: 'clamp(36px, 9vw, 40px)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(16px, 4vw, 18px)',
                fontWeight: '700',
              }}>
                {book.number}
              </div>

              <h3 style={{
                fontSize: 'clamp(16px, 4vw, 20px)',
                fontWeight: '600',
                marginBottom: '12px',
                marginRight: 'clamp(50px, 12vw, 60px)',
                lineHeight: '1.4',
                color: 'var(--color-text-primary)',
              }}>
                {book.title}
              </h3>
              
              <div style={{
                display: 'flex',
                gap: '16px',
                marginTop: '16px',
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-outline-variant)',
              }}>
                <div>
                  <span style={{ color: 'var(--color-text-disabled)' }}>Бобҳо: </span>
                  <strong style={{ color: 'var(--color-primary)' }}>{book.total_chapters}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-disabled)' }}>Ҳадисҳо: </span>
                  <strong style={{ color: 'var(--color-primary)' }}>{book.total_hadiths}</strong>
                </div>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

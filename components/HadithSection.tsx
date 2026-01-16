'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMainBooksMetadata } from '@/lib/data/bukhari-data-client';
import { BookMetadata } from '@/lib/types/hadith';
import SectionLink from './SectionLink';

export default function HadithSection() {
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const booksData = await getMainBooksMetadata();
        setBooks(booksData.slice(0, 6)); // Show first 6 books
      } catch (err) {
        console.error('Error loading Bukhari data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: 'clamp(16px, 4vw, 24px)',
          boxShadow: 'var(--elevation-2)',
          border: '1px solid var(--color-outline)',
        }}>
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Боргирӣ...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        boxShadow: 'var(--elevation-2)',
        border: '1px solid var(--color-outline)',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            margin: 0,
            color: 'var(--color-text-primary)',
          }}>
            Саҳеҳи Бухорӣ
          </h2>
          <SectionLink href="/bukhari">
            <span>ҳама</span>
            <span>→</span>
          </SectionLink>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div 
            className="scrollable-container"
            style={{ 
              display: 'inline-flex',
              gap: '16px',
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: '8px 12px',
              maxWidth: '100%',
              width: '100%',
            }}
          >
            {books.map((book) => (
              <Link
                key={`${book.id}-${book.sub_number || ''}`}
                href={`/bukhari/${book.number}${book.sub_number ? `-${book.sub_number}` : ''}`}
                style={{
                  display: 'block',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'clamp(16px, 4vw, 20px)',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                  boxShadow: 'var(--elevation-1)',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--color-outline)',
                  position: 'relative',
                  minWidth: 'min(280px, 100%)',
                  maxWidth: 'min(280px, 100%)',
                  flexShrink: 0,
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
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '700',
                }}>
                  {book.number}
                </div>

                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  marginRight: '50px',
                  lineHeight: '1.4',
                  color: 'var(--color-text-primary)',
                }}>
                  {book.title}
                </h3>
                
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '12px',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  paddingTop: '12px',
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

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBukhariBook } from '@/lib/data/bukhari-data-client';
import { BookJson, Chapter } from '@/lib/types/hadith';
import BukhariTopBar from '@/components/BukhariTopBar';
import BukhariActions from '@/components/BukhariActions';
import BukhariStructuredData from '@/components/BukhariStructuredData';
import { useTopBar } from '@/lib/contexts/TopBarContext';

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const [book, setBook] = useState<BookJson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bookNumberStr = params.bookNumber as string;
  const parts = bookNumberStr.split('-');
  const bookNumber = parseInt(parts[0], 10);
  const subNumber = parts.length > 1 ? parseInt(parts[1], 10) : null;

  useEffect(() => {
    const loadBook = async () => {
      try {
        setIsLoading(true);
        const bookData = await getBukhariBook(bookNumber, subNumber);
        setBook(bookData);
      } catch (err) {
        console.error('Error loading book:', err);
        setError('Хатоги дар боргирии китоб');
      } finally {
        setIsLoading(false);
      }
    };
    loadBook();
  }, [bookNumber, subNumber]);

  // Handle anchor scrolling
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [book]);

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

  if (error || !book) {
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
          <div style={{ fontSize: '18px', color: 'var(--color-error)', marginBottom: '24px' }}>
            {error || 'Китоб ёфт нашуд'}
          </div>
          <button
            onClick={() => router.back()}
            style={{
              padding: '12px 24px',
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            Баргаштан
          </button>
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
        type="book"
        bookNumber={bookNumber}
        subNumber={subNumber}
        bookTitle={book.title}
        totalChapters={book.total_chapters}
        totalHadiths={book.total_hadiths}
      />
      
      {/* Top Bar */}
      <BukhariTopBar 
        currentBookNumber={bookNumber}
        currentSubNumber={subNumber}
      />

      {/* Main Content */}
      <div style={{ paddingTop: isTopBarVisible ? 'calc(56px + 56px)' : '56px', transition: 'padding-top 0.4s ease-out', marginTop: 0 }}>
        {/* Book Header */}
        <div style={{
          background: `linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-variant) 100%)`,
          color: 'var(--color-on-primary)',
          padding: '40px 20px',
          boxShadow: 'var(--elevation-2)',
          marginTop: 0,
        }}>
          <div style={{
            maxWidth: '1000px',
            margin: '0 auto',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              Китоб {bookNumber}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>
              {book.title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '32px 20px',
        }}>
        {/* Book Info */}
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: 'var(--elevation-1)',
          border: '1px solid var(--color-outline)',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            justifyContent: 'center',
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
        </div>

        {/* Chapters with Hadiths */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}>
          {book.chapters.map((chapter) => (
            <div key={chapter.number} id={`chapter-${chapter.number}`} style={{ scrollMarginTop: '80px' }}>
              {/* Chapter Header */}
              <div style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                marginBottom: '16px',
                boxShadow: 'var(--elevation-1)',
                border: '1px solid var(--color-outline)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    display: 'inline-block',
                    background: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Боб {chapter.number}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--color-text-disabled)',
                  }}>
                    {chapter.hadiths.length} ҳадис
                  </div>
                </div>
                <h2 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  lineHeight: '1.4',
                  margin: 0,
                }} id={`chapter-${chapter.number}-title`}>
                  {chapter.title}
                </h2>
              </div>

              {/* Hadiths */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}>
                {chapter.hadiths.map((hadith) => (
                  <div
                    key={hadith.number}
                    style={{
                      background: 'var(--color-surface)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '24px',
                      boxShadow: 'var(--elevation-1)',
                      border: '1px solid var(--color-outline)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--elevation-4)';
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--elevation-1)';
                      e.currentTarget.style.borderColor = 'var(--color-outline)';
                    }}
                  >
                    {/* Hadith Text */}
                    <p style={{
                      fontSize: '17px',
                      lineHeight: '1.8',
                      color: 'var(--color-text-primary)',
                      textAlign: 'justify',
                      fontWeight: '400',
                      margin: 0,
                      marginBottom: '16px',
                    }}>
                      {hadith.full_text}
                    </p>

                    {/* Actions */}
                    <BukhariActions
                      hadithText={hadith.full_text}
                      hadithNumber={hadith.number}
                      chapterTitle={chapter.title}
                      bookTitle={book.title}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}

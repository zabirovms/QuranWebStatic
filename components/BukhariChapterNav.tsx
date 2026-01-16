'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBukhariBook } from '@/lib/data/bukhari-data-client';
import { BookJson } from '@/lib/types/hadith';

interface BukhariChapterNavProps {
  bookNumber: number;
  subNumber?: number | null;
  currentChapterNumber: number;
}

export default function BukhariChapterNav({
  bookNumber,
  subNumber,
  currentChapterNumber,
}: BukhariChapterNavProps) {
  const router = useRouter();
  const [book, setBook] = useState<BookJson | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    const loadBook = async () => {
      try {
        const bookData = await getBukhariBook(bookNumber, subNumber);
        setBook(bookData);
        const index = bookData.chapters.findIndex(ch => ch.number === currentChapterNumber);
        setCurrentIndex(index);
      } catch (error) {
        console.error('Error loading book for navigation:', error);
      }
    };
    loadBook();
  }, [bookNumber, subNumber, currentChapterNumber]);

  if (!book || currentIndex === -1) {
    return null;
  }

  const prevChapter = currentIndex > 0 ? book.chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < book.chapters.length - 1 ? book.chapters[currentIndex + 1] : null;

  const bookNumberStr = subNumber ? `${bookNumber}-${subNumber}` : String(bookNumber);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '8px',
      zIndex: 100,
      background: 'var(--color-surface)',
      backdropFilter: 'blur(20px)',
      padding: '10px 16px',
      borderRadius: '16px',
      boxShadow: 'var(--elevation-4)',
      border: '1px solid var(--color-outline)',
      maxWidth: 'calc(100vw - 48px)',
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {/* Previous Chapter */}
      {prevChapter ? (
        <Link
          href={`/bukhari/${bookNumberStr}/${prevChapter.number}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            textDecoration: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: 'var(--elevation-2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(44, 62, 80, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(44, 62, 80, 0.3)';
          }}
        >
          <span>←</span>
          <span>Боби қаблӣ</span>
        </Link>
      ) : (
        <div style={{
          padding: '10px 16px',
          background: 'var(--color-surface-variant)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '14px',
          color: 'var(--color-text-disabled)',
          cursor: 'not-allowed',
        }}>
          ← Боби қаблӣ
        </div>
      )}

      {/* Chapter Selector */}
      <select
        value={currentChapterNumber}
        onChange={(e) => {
          const chapterNum = parseInt(e.target.value, 10);
          router.push(`/bukhari/${bookNumberStr}/${chapterNum}`);
        }}
        style={{
          padding: '10px 12px',
          background: 'var(--color-surface)',
          border: '2px solid var(--color-primary)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          minWidth: '100px',
          maxWidth: '150px',
          outline: 'none',
        }}
      >
        {book.chapters.map((chapter) => (
          <option key={chapter.number} value={chapter.number}>
            Боб {chapter.number}
          </option>
        ))}
      </select>

      {/* Next Chapter */}
      {nextChapter ? (
        <Link
          href={`/bukhari/${bookNumberStr}/${nextChapter.number}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            textDecoration: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: 'var(--elevation-2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(44, 62, 80, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(44, 62, 80, 0.3)';
          }}
        >
          <span>Боби баъдӣ</span>
          <span>→</span>
        </Link>
      ) : (
        <div style={{
          padding: '10px 16px',
          background: 'var(--color-surface-variant)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '14px',
          color: 'var(--color-text-disabled)',
          cursor: 'not-allowed',
        }}>
          Боби баъдӣ →
        </div>
      )}
    </div>
  );
}

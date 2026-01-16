'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAllBooksMetadata, getBukhariBook } from '@/lib/data/bukhari-data-client';
import { BookMetadata, BookJson } from '@/lib/types/hadith';

interface BukhariSidebarProps {
  currentBookNumber?: number;
  currentSubNumber?: number | null;
  currentChapterNumber?: number;
  isCompact?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function BukhariSidebar({
  currentBookNumber,
  currentSubNumber,
  currentChapterNumber,
  isCompact = false,
  isOpen = true,
  onClose,
}: BukhariSidebarProps) {
  const pathname = usePathname();
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
  const [bookChapters, setBookChapters] = useState<Record<string, BookJson>>({});
  const [loadingChapters, setLoadingChapters] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const allBooks = await getAllBooksMetadata();
        setBooks(allBooks);
        if (currentBookNumber !== undefined) {
          setExpandedBooks(new Set([currentBookNumber]));
          // Load current book's chapters
          const bookKey = `${currentBookNumber}-${currentSubNumber || ''}`;
          if (!bookChapters[bookKey]) {
            try {
              const bookData = await getBukhariBook(currentBookNumber, currentSubNumber);
              setBookChapters(prev => ({ ...prev, [bookKey]: bookData }));
            } catch (error) {
              console.error('Error loading current book chapters:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, [currentBookNumber, currentSubNumber]);

  const toggleBook = async (bookNumber: number, subNumber?: number | null) => {
    const newExpanded = new Set(expandedBooks);
    const bookKey = `${bookNumber}-${subNumber || ''}`;
    
    if (newExpanded.has(bookNumber)) {
      newExpanded.delete(bookNumber);
    } else {
      newExpanded.add(bookNumber);
      if (!bookChapters[bookKey]) {
        setLoadingChapters(prev => new Set(prev).add(bookNumber));
        try {
          const bookData = await getBukhariBook(bookNumber, subNumber);
          setBookChapters(prev => ({ ...prev, [bookKey]: bookData }));
        } catch (error) {
          console.error('Error loading book chapters:', error);
        } finally {
          setLoadingChapters(prev => {
            const newSet = new Set(prev);
            newSet.delete(bookNumber);
            return newSet;
          });
        }
      }
    }
    setExpandedBooks(newExpanded);
  };

  const isActiveBook = (book: BookMetadata) => {
    return book.number === currentBookNumber && book.sub_number === currentSubNumber;
  };

  const isActiveChapter = (bookNumber: number, chapterNumber: number) => {
    return bookNumber === currentBookNumber && chapterNumber === currentChapterNumber;
  };

  // Filter books based on search
  const filteredBooks = books.filter(book => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return book.title.toLowerCase().includes(query);
  });

  // Group books by main book number
  const groupedBooks = filteredBooks.reduce((acc, book) => {
    const key = book.number;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(book);
    return acc;
  }, {} as Record<number, BookMetadata[]>);

  if (isCompact && !isOpen) return null;

  return (
    <>
      {/* Overlay for mobile/compact mode */}
      {isCompact && isOpen && (
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
          }}
        />
      )}
      <div style={{
        position: isCompact ? 'fixed' : 'relative',
        top: isCompact ? '112px' : 'auto',
        left: isCompact ? (isOpen ? 0 : '-320px') : 'auto',
        width: isCompact ? '320px' : '320px',
        maxWidth: isCompact ? '85vw' : '100%',
        height: isCompact ? 'calc(100vh - 112px)' : '100vh',
        background: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: isCompact ? 2001 : 'auto',
        transition: isCompact ? 'left 0.3s ease-in-out' : 'none',
        boxShadow: isCompact ? 'var(--elevation-4)' : 'none',
      }}
      onClick={(e) => e.stopPropagation()}
      >
      {/* Header */}
      {!isCompact && (
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--color-outline)',
          background: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
        }}>
          <Link
            href="/bukhari"
            style={{
              textDecoration: 'none',
              color: 'var(--color-on-primary)',
            }}
          >
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              margin: '0 0 16px 0',
            }}>
              Саҳеҳи Бухорӣ
            </h2>
          </Link>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Ҷустуҷӯи китоб..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.25)';
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.15)';
            }}
          />
        </div>
      )}

      {/* Books List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isCompact ? '16px' : '12px',
        maxHeight: isCompact ? '600px' : 'none',
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            Боргирӣ...
          </div>
        ) : Object.keys(groupedBooks).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '14px' }}>
            Китоб ёфт нашуд
          </div>
        ) : (
          Object.entries(groupedBooks).map(([bookNum, bookGroup]) => {
            const mainBook = bookGroup.find(b => !b.is_sub_book) || bookGroup[0];
            const subBooks = bookGroup.filter(b => b.is_sub_book);
            const isExpanded = expandedBooks.has(mainBook.number);
            const isActive = isActiveBook(mainBook);

            return (
              <div key={mainBook.number} style={{ marginBottom: '6px' }}>
                {/* Main Book */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(44, 62, 80, 0.1)' : 'transparent',
                    border: isActive ? '1px solid var(--color-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => toggleBook(mainBook.number, mainBook.sub_number)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    transition: 'transform 0.2s',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    color: '#666',
                  }}>
                    ▶
                  </div>
                  <Link
                    href={`/bukhari/${mainBook.number}${mainBook.sub_number ? `-${mainBook.sub_number}` : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    style={{
                      flex: 1,
                      textDecoration: 'none',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '14px',
                    }}
                  >
                    {mainBook.number}. {mainBook.title}
                  </Link>
                </div>

                {/* Sub-books and chapters (expanded) */}
                {isExpanded && (
                  <div style={{
                    marginLeft: '20px',
                    marginTop: '4px',
                    paddingLeft: '12px',
                    borderLeft: '2px solid #e0e0e0',
                  }}>
                    {/* Sub-books */}
                    {subBooks.map((subBook) => (
                      <Link
                        key={subBook.id}
                        href={`/bukhari/${subBook.number}-${subBook.sub_number}`}
                        style={{
                          display: 'block',
                          padding: '8px 10px',
                          marginBottom: '4px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                            color: isActiveBook(subBook) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          fontSize: '13px',
                          background: isActiveBook(subBook) ? 'rgba(44, 62, 80, 0.1)' : 'transparent',
                          fontWeight: isActiveBook(subBook) ? '600' : '400',
                        }}
                      >
                        {subBook.number}-{subBook.sub_number}. {subBook.title}
                      </Link>
                    ))}
                    
                    {/* Chapters */}
                    {(() => {
                      const bookKey = `${mainBook.number}-${mainBook.sub_number || ''}`;
                      const isLoadingChapters = loadingChapters.has(mainBook.number);
                      const chapters = bookChapters[bookKey]?.chapters || [];
                      
                      if (isLoadingChapters) {
                        return (
                          <div style={{
                            padding: '8px',
                            textAlign: 'center',
                            color: '#999',
                            fontSize: '12px',
                          }}>
                            Боргирӣ...
                          </div>
                        );
                      }
                      
                      return chapters.map((chapter) => (
                        <Link
                          key={chapter.number}
                          href={`/bukhari/${mainBook.number}${mainBook.sub_number ? `-${mainBook.sub_number}` : ''}#chapter-${chapter.number}`}
                          style={{
                            display: 'block',
                            padding: '6px 10px',
                            marginBottom: '2px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            color: isActiveChapter(mainBook.number, chapter.number) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontSize: '12px',
                            background: isActiveChapter(mainBook.number, chapter.number)
                              ? 'rgba(44, 62, 80, 0.15)'
                              : 'transparent',
                            fontWeight: isActiveChapter(mainBook.number, chapter.number) ? '600' : '400',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (!isActiveChapter(mainBook.number, chapter.number)) {
                              e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActiveChapter(mainBook.number, chapter.number)) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <span style={{ color: '#999', marginRight: '6px' }}>
                            {chapter.number}.
                          </span>
                          <span>
                            {chapter.title.length > 35 
                              ? chapter.title.substring(0, 35) + '...' 
                              : chapter.title}
                          </span>
                        </Link>
                      ));
                    })()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </div>
    </>
  );
}

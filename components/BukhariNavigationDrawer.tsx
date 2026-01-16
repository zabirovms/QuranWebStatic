'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAllBooksMetadata, getBukhariBook } from '@/lib/data/bukhari-data-client';
import { BookMetadata, BookJson } from '@/lib/types/hadith';
import { CloseIcon } from './Icons';

interface BukhariNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BukhariNavigationDrawer({ isOpen, onClose }: BukhariNavigationDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
  const [bookChapters, setBookChapters] = useState<Record<string, BookJson>>({});
  const [loadingChapters, setLoadingChapters] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract current book/chapter from pathname
  useEffect(() => {
    if (pathname && pathname.startsWith('/bukhari/') && pathname !== '/bukhari') {
      const match = pathname.match(/\/bukhari\/(\d+(?:-\d+)?)(?:\/(\d+))?/);
      if (match) {
        const bookStr = match[1];
        const parts = bookStr.split('-');
        const bookNumber = parseInt(parts[0], 10);
        const subNumber = parts.length > 1 ? parseInt(parts[1], 10) : null;
        setExpandedBooks(new Set([bookNumber]));
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      loadBooks();
    }
  }, [isOpen]);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const allBooks = await getAllBooksMetadata();
      setBooks(allBooks);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    if (!pathname || pathname === '/bukhari') return false;
    const match = pathname.match(/\/bukhari\/(\d+(?:-\d+)?)(?:\/(\d+))?/);
    if (!match) return false;
    const bookStr = match[1];
    const parts = bookStr.split('-');
    const bookNumber = parseInt(parts[0], 10);
    const subNumber = parts.length > 1 ? parseInt(parts[1], 10) : null;
    return book.number === bookNumber && book.sub_number === subNumber;
  };

  const isActiveChapter = (bookNumber: number, chapterNumber: number) => {
    if (typeof window === 'undefined') return false;
    // Check if we're on a chapter page (new URL format: /bukhari/88/7)
    if (pathname) {
      const match = pathname.match(/\/bukhari\/(\d+(?:-\d+)?)\/(\d+)/);
      if (match) {
        const bookStr = match[1];
        const parts = bookStr.split('-');
        const pathBookNumber = parseInt(parts[0], 10);
        const pathChapterNumber = parseInt(match[2], 10);
        if (pathBookNumber === bookNumber && pathChapterNumber === chapterNumber) {
          return true;
        }
      }
    }
    // Check hash for book pages with anchor links
    const hash = window.location.hash;
    return hash === `#chapter-${chapterNumber}`;
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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2001,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '320px',
          maxWidth: '85vw',
          backgroundColor: 'var(--color-background)',
          boxShadow: 'var(--elevation-4)',
          zIndex: 2002,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid var(--color-outline)',
            minHeight: '56px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
            title="Пӯшидан"
          >
            <CloseIcon size={24} color="var(--color-text-primary)" />
          </button>
          <div style={{
            flex: 1,
            marginLeft: '16px',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            Саҳеҳи Бухорӣ
          </div>
        </div>

        {/* Search */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--color-outline)',
        }}>
          <input
            type="text"
            placeholder="Ҷустуҷӯи китоб..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-outline)',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-outline)';
            }}
          />
        </div>

        {/* Books List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
              Боргирӣ...
            </div>
          ) : Object.keys(groupedBooks).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Китоб ёфт нашуд
            </div>
          ) : (
            Object.entries(groupedBooks).map(([bookNum, bookGroup]) => {
              const mainBook = bookGroup.find(b => !b.is_sub_book) || bookGroup[0];
              const subBooks = bookGroup.filter(b => b.is_sub_book);
              const isExpanded = expandedBooks.has(mainBook.number);
              const isActive = isActiveBook(mainBook);

              return (
                <div key={mainBook.number} style={{ marginBottom: '4px' }}>
                  {/* Main Book */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '8px',
                      background: isActive ? 'var(--color-surface-variant)' : 'transparent',
                      border: isActive ? '1px solid var(--color-primary)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => toggleBook(mainBook.number, mainBook.sub_number)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--color-surface-variant)';
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
                      color: 'var(--color-text-secondary)',
                    }}>
                      ▶
                    </div>
                    <a
                      href={`/bukhari/${mainBook.number}${mainBook.sub_number ? `-${mainBook.sub_number}` : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
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
                    </a>
                  </div>

                  {/* Sub-books and chapters (expanded) */}
                  {isExpanded && (
                    <div style={{
                      marginLeft: '20px',
                      marginTop: '4px',
                      paddingLeft: '12px',
                      borderLeft: '2px solid var(--color-outline)',
                    }}>
                      {/* Sub-books */}
                      {subBooks.map((subBook) => (
                        <a
                          key={subBook.id}
                          href={`/bukhari/${subBook.number}-${subBook.sub_number}`}
                          onClick={() => onClose()}
                          style={{
                            display: 'block',
                            padding: '8px 10px',
                            marginBottom: '4px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            color: isActiveBook(subBook) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontSize: '13px',
                            background: isActiveBook(subBook) ? 'var(--color-surface-variant)' : 'transparent',
                            fontWeight: isActiveBook(subBook) ? '600' : '400',
                          }}
                        >
                          {subBook.number}-{subBook.sub_number}. {subBook.title}
                        </a>
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
                              color: 'var(--color-text-secondary)',
                              fontSize: '12px',
                            }}>
                              Боргирӣ...
                            </div>
                          );
                        }
                        
                        return chapters.map((chapter) => (
                          <a
                            key={chapter.number}
                            href={`/bukhari/${mainBook.number}${mainBook.sub_number ? `-${mainBook.sub_number}` : ''}#chapter-${chapter.number}`}
                            onClick={() => onClose()}
                            style={{
                              display: 'block',
                              padding: '6px 10px',
                              marginBottom: '2px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              color: isActiveChapter(mainBook.number, chapter.number) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                              fontSize: '12px',
                              background: isActiveChapter(mainBook.number, chapter.number)
                                ? 'var(--color-surface-variant)'
                                : 'transparent',
                              fontWeight: isActiveChapter(mainBook.number, chapter.number) ? '600' : '400',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isActiveChapter(mainBook.number, chapter.number)) {
                                e.currentTarget.style.background = 'var(--color-surface-variant)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActiveChapter(mainBook.number, chapter.number)) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <span style={{ color: 'var(--color-text-secondary)', marginRight: '6px' }}>
                              {chapter.number}.
                            </span>
                            <span>
                              {chapter.title.length > 30 
                                ? chapter.title.substring(0, 30) + '...' 
                                : chapter.title}
                            </span>
                          </a>
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

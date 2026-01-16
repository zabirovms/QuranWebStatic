'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getBukhariMetadata, getAllBooksMetadata, getBukhariBook } from '@/lib/data/bukhari-data-client';
import { BookMetadata, BookJson } from '@/lib/types/hadith';

interface BukhariNavigationProps {
  currentBookNumber?: number;
  currentSubNumber?: number | null;
  currentChapterNumber?: number;
  onClose?: () => void;
}

export default function BukhariNavigation({
  currentBookNumber,
  currentSubNumber,
  currentChapterNumber,
  onClose,
}: BukhariNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
  const [bookChapters, setBookChapters] = useState<Record<string, BookJson>>({});
  const [loadingChapters, setLoadingChapters] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const allBooks = await getAllBooksMetadata();
        setBooks(allBooks);
        // Auto-expand current book if provided
        if (currentBookNumber !== undefined) {
          setExpandedBooks(new Set([currentBookNumber]));
        }
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, [currentBookNumber]);

  const toggleBook = async (bookNumber: number, subNumber?: number | null) => {
    const newExpanded = new Set(expandedBooks);
    const bookKey = `${bookNumber}-${subNumber || ''}`;
    
    if (newExpanded.has(bookNumber)) {
      newExpanded.delete(bookNumber);
    } else {
      newExpanded.add(bookNumber);
      // Load chapters if not already loaded
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

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
    setIsOpen(false);
  };

  const isActiveBook = (book: BookMetadata) => {
    return book.number === currentBookNumber && book.sub_number === currentSubNumber;
  };

  const isActiveChapter = (bookNumber: number, chapterNumber: number) => {
    return bookNumber === currentBookNumber && chapterNumber === currentChapterNumber;
  };

  // Group books by main book number
  const groupedBooks = books.reduce((acc, book) => {
    const key = book.number;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(book);
    return acc;
  }, {} as Record<number, BookMetadata[]>);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: currentChapterNumber ? '100px' : '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#2c3e50',
          color: 'white',
          border: 'none',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          zIndex: 1000,
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
        }}
        title="Менюи навигатсия"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar Navigation */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-400px',
          width: '400px',
          maxWidth: '90vw',
          height: '100vh',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 999,
          transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          background: '#2c3e50',
          color: 'white',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              margin: 0,
            }}>
              Навигатсия
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
          <Link
            href="/bukhari"
            onClick={handleLinkClick}
            style={{
              display: 'block',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            ← Бозгашт ба саҳифаи асосӣ
          </Link>
        </div>

        {/* Books List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Боргирӣ...
            </div>
          ) : (
            Object.entries(groupedBooks).map(([bookNum, bookGroup]) => {
              const mainBook = bookGroup.find(b => !b.is_sub_book) || bookGroup[0];
              const subBooks = bookGroup.filter(b => b.is_sub_book);
              const isExpanded = expandedBooks.has(mainBook.number);
              const isActive = isActiveBook(mainBook);

              return (
                <div key={mainBook.number} style={{ marginBottom: '8px' }}>
                  {/* Main Book */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: isActive
                        ? 'rgba(44, 62, 80, 0.1)'
                        : 'transparent',
                      border: isActive ? '2px solid #2c3e50' : '1px solid rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => toggleBook(mainBook.number, mainBook.sub_number)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      fontSize: '18px',
                      transition: 'transform 0.2s',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}>
                      ▶
                    </div>
                    <Link
                      href={`/bukhari/${mainBook.number}${mainBook.sub_number ? `-${mainBook.sub_number}` : ''}`}
                      onClick={handleLinkClick}
                      style={{
                        flex: 1,
                        textDecoration: 'none',
                        color: isActive ? '#2c3e50' : '#1a1a1a',
                        fontWeight: isActive ? '600' : '500',
                        fontSize: '15px',
                      }}
                    >
                      {mainBook.number}. {mainBook.title}
                    </Link>
                    <div style={{
                      fontSize: '12px',
                      color: '#999',
                      background: 'rgba(44, 62, 80, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}>
                      {mainBook.total_chapters}
                    </div>
                  </div>

                  {/* Sub-books and chapters (expanded) */}
                  {isExpanded && (
                    <div style={{
                      marginLeft: '24px',
                      marginTop: '4px',
                      paddingLeft: '16px',
                      borderLeft: '2px solid rgba(102, 126, 234, 0.2)',
                    }}>
                      {/* Sub-books */}
                      {subBooks.map((subBook) => (
                        <Link
                          key={subBook.id}
                          href={`/bukhari/${subBook.number}-${subBook.sub_number}`}
                          onClick={handleLinkClick}
                          style={{
                            display: 'block',
                            padding: '8px 12px',
                            marginBottom: '4px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: isActiveBook(subBook) ? '#2c3e50' : '#666',
                            fontSize: '14px',
                            background: isActiveBook(subBook)
                              ? 'rgba(44, 62, 80, 0.1)'
                              : 'transparent',
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
                              padding: '12px',
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
                            href={`/bukhari/${mainBook.number}${mainBook.sub_number ? `-${mainBook.sub_number}` : ''}/${chapter.number}`}
                            onClick={handleLinkClick}
                            style={{
                              display: 'block',
                              padding: '6px 12px',
                              marginBottom: '2px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              color: isActiveChapter(mainBook.number, chapter.number) ? '#2c3e50' : '#666',
                              fontSize: '13px',
                              background: isActiveChapter(mainBook.number, chapter.number)
                                ? 'rgba(44, 62, 80, 0.15)'
                                : 'transparent',
                              fontWeight: isActiveChapter(mainBook.number, chapter.number) ? '600' : '400',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isActiveChapter(mainBook.number, chapter.number)) {
                                e.currentTarget.style.background = 'rgba(44, 62, 80, 0.05)';
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
                            <span style={{ fontSize: '12px' }}>
                              {chapter.title.length > 40 
                                ? chapter.title.substring(0, 40) + '...' 
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

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 998,
          }}
        />
      )}
    </>
  );
}

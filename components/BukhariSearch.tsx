'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllBooksMetadata, getBukhariBook } from '@/lib/data/bukhari-data-client';
import { BookMetadata, BookJson, Chapter, Hadith } from '@/lib/types/hadith';
import { ClearIcon } from './Icons';

interface SearchResult {
  type: 'book' | 'chapter' | 'hadith';
  book: BookMetadata;
  chapter?: Chapter;
  hadith?: Hadith;
  bookData?: BookJson;
}

export default function BukhariSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      performSearch(searchQuery);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const allBooks = await getAllBooksMetadata();
      const searchResults: SearchResult[] = [];
      const queryLower = query.toLowerCase();

      // First, search books by title
      for (const book of allBooks) {
        if (book.title.toLowerCase().includes(queryLower)) {
          searchResults.push({
            type: 'book',
            book,
          });
        }
      }

      // Then search chapters and hadiths (limit to first 15 books for performance)
      for (const book of allBooks.slice(0, 15)) {
        try {
          const bookData = await getBukhariBook(book.number, book.sub_number);
          
          for (const chapter of bookData.chapters) {
            // Search chapter titles
            if (chapter.title.toLowerCase().includes(queryLower)) {
              searchResults.push({
                type: 'chapter',
                book,
                chapter,
                bookData,
              });
            }
            
            // Search hadith text
            for (const hadith of chapter.hadiths) {
              if (hadith.full_text.toLowerCase().includes(queryLower)) {
                searchResults.push({
                  type: 'hadith',
                  book,
                  chapter,
                  hadith,
                  bookData,
                });
                
                // Limit hadith results
                if (searchResults.filter(r => r.type === 'hadith').length >= 30) {
                  break;
                }
              }
            }
            if (searchResults.filter(r => r.type === 'hadith').length >= 30) break;
          }
          if (searchResults.length >= 50) break;
        } catch (error) {
          console.error(`Error searching book ${book.number}:`, error);
        }
      }
      
      // Sort results: books first, then chapters, then hadiths
      searchResults.sort((a, b) => {
        if (a.type === 'book' && b.type !== 'book') return -1;
        if (a.type !== 'book' && b.type === 'book') return 1;
        if (a.type === 'chapter' && b.type === 'hadith') return -1;
        if (a.type === 'hadith' && b.type === 'chapter') return 1;
        return 0;
      });
      
      setResults(searchResults.slice(0, 50));
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const bookNumberStr = (book: BookMetadata) => 
    `${book.number}${book.sub_number ? `-${book.sub_number}` : ''}`;

  const highlightText = (text: string, query: string) => {
    if (!query || query.trim().length < 2) return text;
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const parts: Array<{ text: string; highlight: boolean }> = [];
    let lastIndex = 0;
    let index = textLower.indexOf(queryLower, lastIndex);
    
    while (index !== -1) {
      // Add text before match
      if (index > lastIndex) {
        parts.push({ text: text.substring(lastIndex, index), highlight: false });
      }
      // Add highlighted match
      parts.push({ text: text.substring(index, index + query.length), highlight: true });
      lastIndex = index + query.length;
      index = textLower.indexOf(queryLower, lastIndex);
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), highlight: false });
    }
    
    return parts.length > 0 ? parts : [{ text, highlight: false }];
  };

  const showResults = isOpen && (searchQuery.trim().length >= 2 || results.length > 0);
  const isFocused = isOpen;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Search Input */}
      <div
        onClick={() => {
          const input = document.querySelector('input[placeholder="Ҷустуҷӯи китоб, боб ё матн..."]') as HTMLInputElement;
          input?.focus();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: 'clamp(36px, 8vw, 40px)',
          padding: '0 clamp(8px, 2vw, 12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: showResults ? '20px 20px 0 0' : '20px',
          border: `2px solid ${isFocused ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}`,
          color: 'white',
          fontSize: 'clamp(14px, 3vw, var(--font-size-base))',
          transition: 'background-color 0.2s ease, border-color 0.2s ease, border-radius 0.2s ease',
          position: 'relative',
          zIndex: showResults ? 1001 : 1,
          cursor: 'text',
        }}
      >
        <span style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.8)',
          pointerEvents: 'none',
        }}>
          🔍
        </span>
        <input
          type="text"
          placeholder="Ҷустуҷӯи китоб, боб ё матн..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 200);
          }}
          style={{
            flex: 1,
            marginLeft: '12px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'white',
            fontSize: 'clamp(14px, 3vw, var(--font-size-base))',
            minWidth: 0,
          }}
        />
        {searchQuery && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery('');
            }}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
          >
            <ClearIcon size={20} color="rgba(255,255,255,0.8)" />
          </button>
        )}
      </div>

      {/* Search Results Panel */}
      {showResults && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '0 0 20px 20px',
            boxShadow: 'var(--elevation-4)',
            border: `2px solid var(--color-outline)`,
            borderTop: 'none',
            zIndex: 1000,
            marginTop: '-2px',
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
            {/* Results */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 120px)',
            }}>
              {isSearching ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                }}>
                  Ҷустуҷӯ...
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  fontSize: '14px',
                }}>
                  Ақаллан 2 ҳарфро ворид кунед
                </div>
              ) : results.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  fontSize: '14px',
                }}>
                  Натиҷа ёфт нашуд
                </div>
              ) : (
                <div style={{
                  padding: '8px',
                }}>
                  <div style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    borderBottom: '1px solid var(--color-outline)',
                    fontWeight: '600',
                  }}>
                    {results.length} натиҷа
                  </div>
                  {results.map((result, index) => {
                    const bookUrl = `/bukhari/${bookNumberStr(result.book)}`;
                    const href = result.type === 'book'
                      ? bookUrl
                      : result.type === 'chapter'
                      ? `/bukhari/${bookNumberStr(result.book)}/${result.chapter!.number}`
                      : `${bookUrl}#chapter-${result.chapter!.number}`;
                    
                    return (
                      <Link
                        key={`${result.type}-${result.book.id}-${result.chapter?.number || ''}-${result.hadith?.number || ''}`}
                        href={href}
                        onClick={() => {
                          setIsOpen(false);
                          setSearchQuery('');
                        }}
                        style={{
                          display: 'block',
                          padding: '12px',
                          textDecoration: 'none',
                          color: 'var(--color-text-primary)',
                          borderBottom: '1px solid var(--color-outline)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-surface)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--color-primary)',
                          fontWeight: '600',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                        }}>
                          {result.type === 'book' ? 'Китоб' : result.type === 'chapter' ? 'Боб' : 'Ҳадис'}
                        </div>
                        {result.type === 'book' ? (
                          <>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: 'var(--color-text-primary)',
                              marginBottom: '4px',
                            }}>
                              Китоб {result.book.number}. {highlightText(result.book.title, searchQuery).map((part, idx) => 
                                part.highlight ? (
                                  <mark key={idx} style={{
                                    backgroundColor: 'var(--color-primary-container-low-opacity)',
                                    color: 'var(--color-primary)',
                                    fontWeight: '700',
                                    padding: '0 2px',
                                  }}>
                                    {part.text}
                                  </mark>
                                ) : (
                                  <span key={idx}>{part.text}</span>
                                )
                              )}
                            </div>
                          </>
                        ) : result.type === 'chapter' ? (
                          <>
                            <div style={{
                              fontSize: '12px',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '4px',
                            }}>
                              Китоб {result.book.number} • Боб {result.chapter!.number}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: 'var(--color-text-primary)',
                            }}>
                              {highlightText(result.chapter!.title, searchQuery).map((part, idx) => 
                                part.highlight ? (
                                  <mark key={idx} style={{
                                    backgroundColor: 'var(--color-primary-container-low-opacity)',
                                    color: 'var(--color-primary)',
                                    fontWeight: '700',
                                    padding: '0 2px',
                                  }}>
                                    {part.text}
                                  </mark>
                                ) : (
                                  <span key={idx}>{part.text}</span>
                                )
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{
                              fontSize: '12px',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '4px',
                            }}>
                              Китоб {result.book.number} • Боб {result.chapter!.number} • Ҳадис {result.hadith!.number}
                            </div>
                            <div style={{
                              fontSize: '13px',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '6px',
                            }}>
                              {highlightText(result.chapter!.title, searchQuery).map((part, idx) => 
                                part.highlight ? (
                                  <mark key={idx} style={{
                                    backgroundColor: 'var(--color-primary-container-low-opacity)',
                                    color: 'var(--color-primary)',
                                    fontWeight: '700',
                                    padding: '0 2px',
                                  }}>
                                    {part.text}
                                  </mark>
                                ) : (
                                  <span key={idx}>{part.text}</span>
                                )
                              )}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: 'var(--color-text-primary)',
                              lineHeight: '1.5',
                            }}>
                              {(() => {
                                const text = result.hadith!.full_text.length > 120
                                  ? result.hadith!.full_text.substring(0, 120) + '...'
                                  : result.hadith!.full_text;
                                return highlightText(text, searchQuery).map((part, idx) => 
                                  part.highlight ? (
                                    <mark key={idx} style={{
                                      backgroundColor: 'var(--color-primary-container-low-opacity)',
                                      color: 'var(--color-primary)',
                                      fontWeight: '700',
                                      padding: '0 2px',
                                    }}>
                                      {part.text}
                                    </mark>
                                  ) : (
                                    <span key={idx}>{part.text}</span>
                                  )
                                );
                              })()}
                            </div>
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
}

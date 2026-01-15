'use client';

import { useState, useMemo } from 'react';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { BookFile, getIslamicBooks } from '@/lib/data/downloads-data';
import { fuzzyMatch, calculateRelevance } from '@/lib/utils/tajik-search';

const CDN_BASE_URL = 'https://cdn.quran.tj/kitobkhona';

interface DownloadsPageClientProps {
  initialBooks: BookFile[];
}

/**
 * Client component for Махзани Маърифат (Knowledge Repository)
 * Features: Search, filtering, and downloads with fuzzy Tajik character matching
 */
export default function DownloadsPageClient({ initialBooks }: DownloadsPageClientProps) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [books, setBooks] = useState<BookFile[]>(initialBooks);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(books.map(b => b.subcategory)))].filter(Boolean);
  }, [books]);

  // Filter and search books
  const filteredBooks = useMemo(() => {
    let result = books;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(b => b.subcategory === selectedCategory);
    }

    // Search with fuzzy matching
    if (searchQuery.trim()) {
      result = result
        .filter(book => 
          fuzzyMatch(searchQuery, book.name) || 
          fuzzyMatch(searchQuery, book.subcategory)
        )
        .map(book => ({
          ...book,
          relevance: calculateRelevance(searchQuery, book.name),
        }))
        .sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    }

    return result;
  }, [books, selectedCategory, searchQuery]);

  const getDownloadUrl = (filePath: string) => {
    return `${CDN_BASE_URL}/${encodeURIComponent(filePath)}`;
  };

  const handleDownload = async (filePath: string, book: BookFile, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    try {
      const url = getDownloadUrl(filePath);
      
      // Fetch the file as a blob
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Create a temporary download link with proper filename and extension
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${book.name}.${book.extension}`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up - use remove() which is safer and handles null cases
      setTimeout(() => {
        if (link && link.parentNode) {
          link.remove();
        }
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(getDownloadUrl(filePath), '_blank');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshedBooks = await getIslamicBooks();
      setBooks(refreshedBooks);
      // Clear search and category on refresh
      setSearchQuery('');
      setSelectedCategory('all');
    } catch (error) {
      console.error('Error refreshing books:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      {/* Title at the very top */}
      <div style={{
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-xl))' : 'var(--spacing-xl)',
        paddingBottom: 'var(--spacing-xl)',
        paddingLeft: 'var(--spacing-lg)',
        paddingRight: 'var(--spacing-lg)',
        textAlign: 'center',
        backgroundColor: 'var(--color-primary)',
        borderBottom: '3px solid var(--color-primary)',
        boxShadow: 'var(--elevation-2)',
      }}>
        <h1 style={{ 
          fontSize: 'var(--font-size-3xl)', 
          fontWeight: 'var(--font-weight-bold)',
          margin: 0,
          color: 'var(--color-on-primary)',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}>
          МАХЗАНИ МАЪРИФАТ
        </h1>
      </div>

      <main style={{
        padding: 'var(--spacing-lg)',
        paddingTop: 'var(--spacing-lg)',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Description */}
        <div style={{
          marginBottom: 'var(--spacing-xl)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Китобҳои динӣ, таърихӣ ва маърифатӣ барои боргирӣ ва хондан
          </p>
        </div>

        {/* Search Bar */}
        <div style={{
          marginBottom: 'var(--spacing-xl)',
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            alignItems: 'center',
          }}>
            <div style={{
              position: 'relative',
              flex: 1,
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ҷустуҷӯи китобҳо... (масалан: Қуръон, Ҳадис, Таърих)"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-md) var(--spacing-xl) var(--spacing-md) var(--spacing-md)',
                  fontSize: 'var(--font-size-base)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '2px solid var(--color-outline)',
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(var(--color-primary-rgb), 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-outline)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: 'var(--spacing-sm)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: 'var(--spacing-xs)',
                    fontSize: 'var(--font-size-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Пок кардан"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '2px solid var(--color-outline)',
                borderRadius: 'var(--radius-lg)',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                opacity: isRefreshing ? 0.6 : 1,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isRefreshing) {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  e.currentTarget.style.color = 'var(--color-on-primary)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRefreshing) {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                  e.currentTarget.style.borderColor = 'var(--color-outline)';
                }
              }}
            >
              {isRefreshing ? '⏳ Боргирӣ...' : '🔄 Бозоғозӣ'}
            </button>
          </div>
          {searchQuery && (
            <div style={{
              marginTop: 'var(--spacing-sm)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              {filteredBooks.length > 0 
                ? `Ҷавобҳо: ${filteredBooks.length} китоб` 
                : 'Китобе ёфт нашуд'}
            </div>
          )}
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-xl)',
            paddingBottom: 'var(--spacing-lg)',
            borderBottom: '2px solid var(--color-outline)',
          }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  backgroundColor: selectedCategory === category 
                    ? 'var(--color-primary)' 
                    : 'var(--color-surface)',
                  color: selectedCategory === category 
                    ? 'var(--color-on-primary)' 
                    : 'var(--color-text-primary)',
                  border: `2px solid ${selectedCategory === category ? 'var(--color-primary)' : 'var(--color-outline)'}`,
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: selectedCategory === category 
                    ? 'var(--font-weight-semibold)' 
                    : 'var(--font-weight-normal)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                    e.currentTarget.style.backgroundColor = 'rgba(var(--color-primary-rgb), 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = 'var(--color-outline)';
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  }
                }}
              >
                {category === 'all' ? '📚 Ҳама' : category}
              </button>
            ))}
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-xl)',
          }}>
            {filteredBooks.map((book, index) => (
              <div
                key={`${book.path}-${index}`}
                style={{
                  padding: 'var(--spacing-lg)',
                  backgroundColor: 'var(--color-surface)',
                  border: '2px solid var(--color-outline)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--elevation-1)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--elevation-3)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--elevation-1)';
                  e.currentTarget.style.borderColor = 'var(--color-outline)';
                }}
              >
                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  top: 'var(--spacing-md)',
                  right: 'var(--spacing-md)',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-semibold)',
                  zIndex: 1,
                }}>
                  {book.extension.toUpperCase()}
                </div>

                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-primary)',
                  fontWeight: 'var(--font-weight-semibold)',
                  marginBottom: 'var(--spacing-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {book.subcategory}
                </div>
                
                <h3 style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--spacing-md)',
                  lineHeight: '1.5',
                  flex: 1,
                  paddingRight: 'var(--spacing-md)',
                }}>
                  {book.name}
                </h3>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-sm)',
                  marginTop: 'auto',
                }}>
                  {/* Preview Button */}
                  <a
                    href={getDownloadUrl(book.path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'inline-block',
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      textAlign: 'center',
                      border: '2px solid var(--color-primary)',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-on-primary)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    👁️ Намоиш
                  </a>

                  {/* Download Button */}
                  <a
                    href={getDownloadUrl(book.path)}
                    onClick={(e) => handleDownload(book.path, book, e)}
                    style={{
                      flex: 1,
                      display: 'inline-block',
                      padding: 'var(--spacing-md)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ⬇️ Боргирӣ
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-3xl)',
            color: 'var(--color-text-secondary)',
          }}>
            <div style={{
              fontSize: 'var(--font-size-4xl)',
              marginBottom: 'var(--spacing-md)',
            }}>
              📚
            </div>
            <div style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--spacing-sm)',
            }}>
              Китобе ёфт нашуд
            </div>
            <div style={{
              fontSize: 'var(--font-size-base)',
            }}>
              {searchQuery 
                ? 'Лутфан, матни ҷустуҷӯро тағйир диҳед ё категорияро интихоб кунед'
                : 'Китобе дар ин категория нест'}
            </div>
          </div>
        )}

        {/* Footer Stats */}
        {filteredBooks.length > 0 && (
          <div style={{
            marginTop: 'var(--spacing-xl)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '2px solid var(--color-outline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            <div>
              <strong style={{ color: 'var(--color-text-primary)' }}>
                {filteredBooks.length}
              </strong> китоб
              {searchQuery && ` барои "${searchQuery}"`}
            </div>
            <div>
              Ҳамагӣ <strong style={{ color: 'var(--color-text-primary)' }}>{books.length}</strong> китоб дар махзан
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

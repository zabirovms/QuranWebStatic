'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { getAllVerses } from '@/lib/data/verse-data-client';
import { searchVerses, highlightText, SearchResult } from '@/lib/services/search-service';
import { SettingsService } from '@/lib/services/settings-service';
import { Verse } from '@/lib/types';
import { CloseIcon, SearchIcon, ClearIcon, LanguageIcon, TranslateIcon } from './Icons';

type FilterType = 'both' | 'arabic' | 'transliteration' | 'tajik' | 'tj_2' | 'tj_3' | 'farsi' | 'russian';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function SearchDrawer({ isOpen, onClose, initialQuery = '' }: SearchDrawerProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const settingsService = SettingsService.getInstance();
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('both');
  const [currentTranslation, setCurrentTranslation] = useState<string>('tajik');
  const [surahs, setSurahs] = useState<any[]>([]);

  // Load current translation language
  useEffect(() => {
    const settings = settingsService.getSettings();
    setCurrentTranslation(settings.translationLanguage);
  }, []);

  // Load surahs
  useEffect(() => {
    getAllSurahs().then(setSurahs).catch(console.error);
  }, []);

  // Auto-focus search input when drawer opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Set initial query when provided
  useEffect(() => {
    if (initialQuery && isOpen) {
      setQuery(initialQuery);
    }
  }, [initialQuery, isOpen]);

  // Perform search
  useEffect(() => {
    if (!isOpen) return;

    const performSearch = async () => {
      if (!query.trim() || query.trim().length < 2) {
        setResults([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const verses = await getAllVerses();
        
        // Map filter to search service format
        const searchFilter = selectedFilter === 'tj_2' ? 'tj2' :
                           selectedFilter === 'tj_3' ? 'tj3' :
                           selectedFilter;

        const verseResults = searchVerses(verses, query, {
          language: searchFilter as any,
          maxResults: 100,
        });

        setResults(verseResults);
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Хатоги дар ҷустуҷӯ');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, selectedFilter, isOpen]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setSelectedFilter(filter);
  };

  const getTranslationText = (verse: Verse, filter: FilterType): string => {
    const translationToUse = (filter !== null && filter !== 'both' && filter !== 'arabic' && filter !== 'transliteration') 
        ? filter 
        : currentTranslation;
    
    switch (translationToUse) {
      case 'tajik':
        return verse.tajikText;
      case 'tj_2':
        return verse.tj2 ?? verse.tajikText;
      case 'tj_3':
        return verse.tj3 ?? verse.tajikText;
      case 'farsi':
        return verse.farsi ?? verse.tajikText;
      case 'russian':
        return verse.russian ?? verse.tajikText;
      default:
        return verse.tajikText;
    }
  };

  const renderHighlightedText = (text: string, query: string) => {
    const highlighted = highlightText(text, query);
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  const getSurahNameTajik = (surahId: number): string => {
    try {
      const surah = surahs.find(s => s.number === surahId);
      return surah ? surah.nameTajik : `Сураи ${surahId}`;
    } catch {
      return `Сураи ${surahId}`;
    }
  };

  const handleResultClick = (verse: Verse) => {
    router.push(`/surah/${verse.surahId}?verse=${verse.verseNumber}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
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
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
      
      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'var(--color-background)',
          boxShadow: 'var(--elevation-4)',
          zIndex: 2002,
          overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--color-background)',
            borderBottom: '1px solid var(--color-outline)',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            margin: 0,
          }}>
            Ҷустуҷӯ
          </h2>
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
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--spacing-lg) 0', flex: 1 }}>
          {/* Search Input */}
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}>
                <SearchIcon size={24} color="var(--color-text-secondary)" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ҷустуҷӯ дар Қуръон..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  fontSize: 'var(--font-size-base)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  letterSpacing: 0,
                }}
              />
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  border: '2px solid var(--color-outline)',
                  borderTopColor: 'var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
              )}
              {query && !isLoading && (
                <button
                  onClick={handleClear}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '24px',
                    padding: 0,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Тоза кардан"
                >
                  <ClearIcon size={20} color="var(--color-text-secondary)" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips */}
          <div style={{
            padding: '0 16px 16px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              minWidth: 'max-content',
            }}>
              {[
                { label: 'Ҳама', value: 'both' as FilterType, icon: SearchIcon },
                { label: 'Арабӣ', value: 'arabic' as FilterType, icon: LanguageIcon },
                { label: 'Транслитератсия', value: 'transliteration' as FilterType, icon: TranslateIcon },
                { label: 'Абдул Муҳаммад Оятӣ', value: 'tajik' as FilterType, icon: TranslateIcon },
                { label: 'Абуаломуддин (бо тафсир)', value: 'tj_2' as FilterType, icon: TranslateIcon },
                { label: 'Pioneers of Translation Center', value: 'tj_3' as FilterType, icon: TranslateIcon },
                { label: 'Форсӣ', value: 'farsi' as FilterType, icon: TranslateIcon },
                { label: 'Эльмир Кулиев', value: 'russian' as FilterType, icon: TranslateIcon },
              ].map(({ label, value, icon: Icon }) => {
                const isSelected = selectedFilter === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleFilterChange(value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-outline)',
                      backgroundColor: isSelected 
                        ? 'var(--color-primary)' 
                        : 'var(--color-surface)',
                      color: isSelected 
                        ? 'var(--color-on-primary)' 
                        : 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: isSelected ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={16} color={isSelected ? 'var(--color-on-primary)' : 'var(--color-text-secondary)'} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div style={{ flex: 1 }}>
            {query.trim().length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 16px',
                minHeight: 'calc(100vh - 300px)',
              }}>
                <div style={{ opacity: 0.5, marginBottom: '16px' }}>
                  <SearchIcon size={64} color="var(--color-text-secondary)" />
                </div>
                <div style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: '8px',
                  opacity: 0.7,
                }}>
                  Ҷустуҷӯ дар Қуръон
                </div>
                <div style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  opacity: 0.5,
                }}>
                  Дар ҳамаи забонҳо ҷустуҷӯ кунед
                </div>
              </div>
            ) : isLoading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 16px',
                minHeight: 'calc(100vh - 300px)',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--color-outline)',
                  borderTopColor: 'var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
              </div>
            ) : error ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 16px',
                minHeight: 'calc(100vh - 300px)',
              }}>
                <div style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-error)',
                  marginBottom: '8px',
                }}>
                  Хатоги дар ҷустуҷӯ
                </div>
                <div style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '16px',
                }}>
                  {error}
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    const timeoutId = setTimeout(() => {
                      const performSearch = async () => {
                        if (!query.trim() || query.trim().length < 2) return;
                        setIsLoading(true);
                        try {
                          const verses = await getAllVerses();
                          const searchFilter = selectedFilter === 'tj_2' ? 'tj2' :
                                             selectedFilter === 'tj_3' ? 'tj3' :
                                             selectedFilter;
                          const verseResults = searchVerses(verses, query, {
                            language: searchFilter as any,
                            maxResults: 100,
                          });
                          setResults(verseResults);
                          setError(null);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Хатоги дар ҷустуҷӯ');
                        } finally {
                          setIsLoading(false);
                        }
                      };
                      performSearch();
                    }, 300);
                  }}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    fontSize: 'var(--font-size-base)',
                    fontWeight: 'var(--font-weight-medium)',
                    cursor: 'pointer',
                  }}
                >
                  Такрор кун
                </button>
              </div>
            ) : results.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 16px',
                minHeight: 'calc(100vh - 300px)',
              }}>
                <div style={{ opacity: 0.5, marginBottom: '16px' }}>
                  <SearchIcon size={64} color="var(--color-text-secondary)" />
                </div>
                <div style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: '8px',
                  opacity: 0.7,
                }}>
                  Ҳеҷ натиҷае ёфт нашуд
                </div>
                <div style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  opacity: 0.5,
                }}>
                  Ҷустуҷӯи дигарро санҷед
                </div>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div style={{
                  padding: '8px 16px',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {results.length} натиҷа ёфт шуд
                </div>

                {/* Results List */}
                <div style={{
                  paddingBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {results.map((result) => {
                    const verse = result.data as Verse;
                    const surahName = getSurahNameTajik(verse.surahId);
                    const translationText = getTranslationText(verse, selectedFilter);

                    return (
                      <div
                        key={verse.uniqueKey}
                        onClick={() => handleResultClick(verse)}
                        style={{
                          display: 'block',
                          margin: '0 16px 8px',
                          padding: '16px',
                          backgroundColor: 'var(--color-surface-variant)',
                          borderRadius: '18px',
                          border: '1px solid var(--color-outline)',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = 'var(--elevation-2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Surah and verse info */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '12px',
                        }}>
                          <div style={{
                            padding: '4px 8px',
                            backgroundColor: 'var(--color-primary)',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'var(--font-weight-bold)',
                            color: 'var(--color-on-primary)',
                          }}>
                            {verse.surahId}:{verse.verseNumber}
                          </div>
                          <div style={{
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)',
                            flex: 1,
                          }}>
                            {surahName}
                          </div>
                        </div>

                        {/* Arabic text */}
                        <div style={{
                          direction: 'rtl',
                          fontSize: '20px',
                          lineHeight: '1.8',
                          fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Arabic Typesetting', serif",
                          color: 'var(--color-text-primary)',
                          marginBottom: '8px',
                        }}>
                          <span lang="ar">{renderHighlightedText(verse.arabicText, query)}</span>
                        </div>

                        {/* Transliteration */}
                        {verse.transliteration && (
                          <div style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            fontStyle: 'italic',
                            marginBottom: '8px',
                          }}>
                            {renderHighlightedText(verse.transliteration, query)}
                          </div>
                        )}

                        {/* Translation */}
                        {translationText ? (
                          <div style={{
                            fontSize: 'var(--font-size-base)',
                            color: 'var(--color-text-primary)',
                            lineHeight: '1.4',
                          }}>
                            {renderHighlightedText(translationText, query)}
                          </div>
                        ) : (
                          <div style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            fontStyle: 'italic',
                          }}>
                            Тарҷума мавҷуд нест
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        mark {
          background-color: rgba(255, 235, 59, 0.3);
          color: inherit;
          padding: 2px 0;
          font-weight: var(--font-weight-bold);
        }
      `}</style>
    </>
  );
}


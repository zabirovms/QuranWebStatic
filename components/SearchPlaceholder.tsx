'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SearchIcon, ClearIcon } from './Icons';
import { getAllVerses } from '@/lib/data/verse-data-client';
import { searchVerses, searchSurahs, highlightText, SearchResult } from '@/lib/services/search-service';
import { SettingsService } from '@/lib/services/settings-service';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { Verse, Surah } from '@/lib/types';

type FilterType = 'both' | 'arabic' | 'transliteration' | 'tajik' | 'tj_2' | 'tj_3' | 'farsi' | 'russian';

export default function SearchPlaceholder() {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('both');
  const [surahs, setSurahs] = useState<any[]>([]);
  const [directNavigation, setDirectNavigation] = useState<{
    type: 'surah' | 'verse' | 'juz' | 'page';
    surahNumber?: number;
    verseNumber?: number;
    juzNumber?: number;
    pageNumber?: number;
    label: string;
    href: string;
  } | null>(null);
  const [recentNavigations, setRecentNavigations] = useState<Array<{
    label: string;
    href: string;
    type: 'surah' | 'verse' | 'juz' | 'page';
  }>>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const settingsService = SettingsService.getInstance();

  // Load recent navigations from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quran_recent_navigations');
      if (saved) {
        try {
          setRecentNavigations(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading recent navigations:', e);
        }
      }
    }
  }, []);

  // Save navigation to localStorage
  const saveNavigation = (label: string, href: string, type: 'surah' | 'verse' | 'juz' | 'page') => {
    if (typeof window !== 'undefined') {
      const newNav = { label, href, type };
      const updated = [
        newNav,
        ...recentNavigations.filter(nav => nav.href !== href)
      ].slice(0, 10);
      setRecentNavigations(updated);
      localStorage.setItem('quran_recent_navigations', JSON.stringify(updated));
    }
  };

  // Load surahs
  useEffect(() => {
    getAllSurahs().then(setSurahs).catch(console.error);
  }, []);

  // Parse special search patterns
  const parseSearchQuery = (query: string): {
    type: 'surah' | 'juz' | 'page' | 'verse' | 'text';
    surahNumber?: number;
    verseNumber?: number;
    juzNumber?: number;
    pageNumber?: number;
    textQuery?: string;
  } => {
    const trimmed = query.trim();
    
    // Verse reference patterns: "2:255", "2 255", "2.255", "сураи 2 оят 255"
    const versePatterns = [
      /^(\d+)[:.\s]+(\d+)$/, // "2:255", "2 255", "2.255"
      /^сураи\s+(\d+)\s+оят\s+(\d+)$/i, // "сураи 2 оят 255"
      /^(\d+)\s+оят\s+(\d+)$/i, // "2 оят 255"
    ];
    
    for (const pattern of versePatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return {
          type: 'verse',
          surahNumber: parseInt(match[1], 10),
          verseNumber: parseInt(match[2], 10),
        };
      }
    }
    
    // Juz pattern: "ҷузи 6", "juz 6", "ҷуз 6"
    const juzPattern = /^(?:ҷузи?|juz)\s+(\d+)$/i;
    const juzMatch = trimmed.match(juzPattern);
    if (juzMatch) {
      return {
        type: 'juz',
        juzNumber: parseInt(juzMatch[1], 10),
      };
    }
    
    // Page pattern: "саҳифаи 9", "page 9", "саҳифа 9"
    const pagePattern = /^(?:саҳифаи?|page)\s+(\d+)$/i;
    const pageMatch = trimmed.match(pagePattern);
    if (pageMatch) {
      return {
        type: 'page',
        pageNumber: parseInt(pageMatch[1], 10),
      };
    }
    
    // Surah name pattern: "Сураи бакара", "Ёсин", "бакара"
    const surahNamePattern = /^(?:сураи\s+)?(.+)$/i;
    const surahNameMatch = trimmed.match(surahNamePattern);
    if (surahNameMatch) {
      const surahName = surahNameMatch[1].trim();
      // Check if it matches a surah name
      const matchedSurah = surahs.find(s => 
        s.nameTajik.toLowerCase().includes(surahName.toLowerCase()) ||
        s.nameArabic.toLowerCase().includes(surahName.toLowerCase()) ||
        s.nameTajik.toLowerCase() === surahName.toLowerCase()
      );
      if (matchedSurah) {
        return {
          type: 'surah',
          surahNumber: matchedSurah.number,
        };
      }
    }
    
    // Default to text search
    return {
      type: 'text',
      textQuery: trimmed,
    };
  };

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim() || query.trim().length < 1) {
        setResults([]);
        setDirectNavigation(null);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setDirectNavigation(null);

      try {
        const parsed = parseSearchQuery(query);

        // Handle direct navigation cases
        if (parsed.type === 'verse' && parsed.surahNumber && parsed.verseNumber) {
          const verses = await getAllVerses();
          const verse = verses.find(v => 
            v.surahId === parsed.surahNumber && v.verseNumber === parsed.verseNumber
          );
          if (verse) {
            const surahName = getSurahName(parsed.surahNumber);
            setDirectNavigation({
              type: 'verse',
              surahNumber: parsed.surahNumber,
              verseNumber: parsed.verseNumber,
              label: `${surahName} - Оят ${parsed.verseNumber}`,
              href: `/surah/${parsed.surahNumber}?verse=${parsed.verseNumber}`,
            });
            setResults([]);
            setIsLoading(false);
            return;
          }
        } else if (parsed.type === 'surah' && parsed.surahNumber) {
          const matchedSurah = surahs.find(s => s.number === parsed.surahNumber);
          if (matchedSurah) {
            setDirectNavigation({
              type: 'surah',
              surahNumber: parsed.surahNumber,
              label: matchedSurah.nameTajik,
              href: `/surah/${parsed.surahNumber}`,
            });
            setResults([]);
            setIsLoading(false);
            return;
          }
        } else if (parsed.type === 'juz' && parsed.juzNumber) {
          const verses = await getAllVerses();
          const juzVerse = verses.find(v => v.juz === parsed.juzNumber);
          if (juzVerse) {
            setDirectNavigation({
              type: 'juz',
              juzNumber: parsed.juzNumber,
              surahNumber: juzVerse.surahId,
              verseNumber: juzVerse.verseNumber,
              label: `Ҷуз ${parsed.juzNumber}`,
              href: `/surah/${juzVerse.surahId}?verse=${juzVerse.verseNumber}`,
            });
            setResults([]);
            setIsLoading(false);
            return;
          }
        } else if (parsed.type === 'page' && parsed.pageNumber) {
          const verses = await getAllVerses();
          const pageVerse = verses.find(v => v.page === parsed.pageNumber);
          if (pageVerse) {
            setDirectNavigation({
              type: 'page',
              pageNumber: parsed.pageNumber,
              surahNumber: pageVerse.surahId,
              verseNumber: pageVerse.verseNumber,
              label: `Саҳифа ${parsed.pageNumber}`,
              href: `/surah/${pageVerse.surahId}?verse=${pageVerse.verseNumber}`,
            });
            setResults([]);
            setIsLoading(false);
            return;
          }
        } else {
          // Text search
          const verses = await getAllVerses();
          
          // Also search surahs
          const surahResults = searchSurahs(surahs, query);
          
          // Map filter to search service format
          const searchFilter = selectedFilter === 'tj_2' ? 'tj2' :
                             selectedFilter === 'tj_3' ? 'tj3' :
                             selectedFilter;

          const verseResults = searchVerses(verses, query, {
            language: searchFilter as any,
            maxResults: 50, // Limit results for inline display
          });

          setResults([...surahResults, ...verseResults]);
        }
        
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Хатоги дар ҷустуҷӯ');
        setResults([]);
        setDirectNavigation(null);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, selectedFilter, surahs]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setDirectNavigation(null);
    setError(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const getSurahName = (surahNumber: number): string => {
    const surah = surahs.find(s => s.number === surahNumber);
    return surah ? surah.nameTajik : `Сураи ${surahNumber}`;
  };

  const getMatchedText = (verse: Verse, matchedFields: string[]): string => {
    // Get the first matched field (prioritize the most relevant match)
    const matchedField = matchedFields[0];
    
    switch (matchedField) {
      case 'arabicText':
        return verse.arabicText;
      case 'transliteration':
        return verse.transliteration || '';
      case 'tajikText':
        return verse.tajikText;
      case 'tj2':
        return verse.tj2 || verse.tajikText;
      case 'tj3':
        return verse.tj3 || verse.tajikText;
      case 'farsi':
        return verse.farsi || verse.tajikText;
      case 'russian':
        return verse.russian || verse.tajikText;
      default:
        // Fallback: if no specific match, try to find any matching field
        if (matchedFields.includes('arabicText')) return verse.arabicText;
        if (matchedFields.includes('tajikText')) return verse.tajikText;
        if (matchedFields.includes('transliteration') && verse.transliteration) return verse.transliteration;
        return verse.tajikText || verse.arabicText;
    }
  };

  const getMatchedFieldLabel = (matchedField: string): string => {
    switch (matchedField) {
      case 'arabicText':
        return 'Арабӣ';
      case 'transliteration':
        return 'Транслитератсия';
      case 'tajikText':
        return 'Абдул Муҳаммад Оятӣ';
      case 'tj2':
        return 'Абуаломуддин (бо тафсир)';
      case 'tj3':
        return 'Pioneers of Translation Center';
      case 'farsi':
        return 'Форсӣ';
      case 'russian':
        return 'Эльмир Кулиев';
      default:
        return '';
    }
  };

  const showResults = isFocused && (query.length >= 1 || results.length > 0 || directNavigation !== null);
  const showSuggestions = isFocused && query.length === 0 && !isLoading;

  // Popular searches
  const popularSearches = [
    { query: '2:255', label: 'Оят-ал-Курси', href: '/surah/2?verse=255' },
    { query: 'Сураи Ёсин', label: 'Сураи Ёсин', href: '/surah/36' },
    { query: 'Сураи Ал-Фотиҳа', label: 'Сураи Ал-Фотиҳа', href: '/surah/1' },
    { query: 'ҷузи 30', label: 'Ҷуз 30', href: '/surah/78?verse=1' },
    { query: 'Сураи Ар-Раҳмон', label: 'Сураи Ар-Раҳмон', href: '/surah/55' },
  ];

  return (
    <div style={{
      marginBottom: '32px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      zIndex: 1000,
    }}>
      {/* Search Input */}
      <div
        onClick={() => {
          searchInputRef.current?.focus();
          setIsFocused(true);
        }}
        onTouchStart={() => {
          // Ensure focus on mobile tap
          if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
            searchInputRef.current.focus();
            setIsFocused(true);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '64px',
          padding: '0 12px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: (showResults || showSuggestions) ? '32px 32px 0 0' : '32px',
          border: `2px solid ${isFocused ? 'var(--color-primary)' : 'var(--color-primary-low-opacity)'}`,
          color: 'var(--color-text-primary)',
          fontSize: 'var(--font-size-lg)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease, border-radius 0.2s ease',
          position: 'relative',
          zIndex: showResults || showSuggestions ? 1001 : 1000,
          cursor: 'text',
        }}
      >
        <SearchIcon size={24} color={isFocused ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            // Delay to allow clicking on results
            // Longer delay on mobile to allow tapping on results
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const delay = isMobile ? 300 : 200;
            setTimeout(() => setIsFocused(false), delay);
          }}
          placeholder="Ҷустуҷӯ дар Қуръон..."
          style={{
            flex: 1,
            marginLeft: '12px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-size-lg)',
          }}
        />
        {query && (
          <button
            onClick={handleClear}
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
            <ClearIcon size={20} color="var(--color-text-secondary)" />
          </button>
        )}
      </div>

      {/* Suggestions Container */}
      {showSuggestions && (
        <div
          data-search-results
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '0 0 32px 32px',
            boxShadow: 'var(--elevation-4)',
            border: '2px solid var(--color-primary-low-opacity)',
            borderTop: 'none',
            zIndex: 1000,
            marginTop: '-2px', // Overlap with search input border
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking/tapping results
        >
           {/* Search Guide - Compact */}
           <div style={{ padding: '12px 16px', marginBottom: '12px' }}>
             <div style={{
               fontSize: '11px',
               fontWeight: 600,
               color: 'var(--color-text-secondary)',
               marginBottom: '8px',
               textTransform: 'uppercase',
               letterSpacing: '0.5px',
             }}>
               Чӣ гуна ҷустуҷӯ кардан мумкин аст:
             </div>
             <div style={{
               display: 'flex',
               flexDirection: 'column',
               gap: '6px',
               fontSize: '12px',
               color: 'var(--color-text-primary)',
             }}>
               <div style={{ textAlign: 'center' }}>• Матн: ҳар калимае дар Қуръон</div>
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(2, 1fr)',
                 gap: '6px 12px',
                 textAlign: 'center',
                 alignItems: 'start',
               }}>
                 <div style={{ whiteSpace: 'nowrap' }}>• Номи сура: "Сураи бакара"</div>
                 <div style={{ whiteSpace: 'nowrap' }}>• Оят: "2:255", "2 255"</div>
                 <div style={{ whiteSpace: 'nowrap' }}>• Ҷуз: "ҷузи 6"</div>
                 <div style={{ whiteSpace: 'nowrap' }}>• Саҳифа: "саҳифаи 9"</div>
               </div>
             </div>
           </div>

          {/* Popular Searches - Compact */}
          {popularSearches.length > 0 && (
            <div style={{ padding: '0 16px', marginBottom: recentNavigations.length > 0 ? '12px' : '0' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Ҷустуҷӯҳои машҳур:
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
              }}>
                {popularSearches.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setQuery(item.query)}
                    style={{
                      display: 'inline-block',
                      padding: '6px 10px',
                      backgroundColor: 'var(--color-surface-variant)',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: 'var(--color-text-primary)',
                      fontSize: '12px',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Navigations */}
          {recentNavigations.length > 0 && (
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Охирин навигатсияҳо:
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}>
                {recentNavigations.map((nav, index) => (
                  <Link
                    key={index}
                    href={nav.href}
                    onClick={() => saveNavigation(nav.label, nav.href, nav.type)}
                    style={{
                      display: 'block',
                      padding: '8px 10px',
                      backgroundColor: 'var(--color-surface-variant)',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: 'var(--color-text-primary)',
                      fontSize: '12px',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                    }}
                  >
                    {nav.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Container */}
      {showResults && !showSuggestions && (
        <div
          data-search-results
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '0 0 32px 32px',
            boxShadow: 'var(--elevation-4)',
            border: '2px solid var(--color-primary-low-opacity)',
            borderTop: 'none',
            zIndex: 1000,
            marginTop: '-2px', // Overlap with search input border
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking/tapping results
        >
          {isLoading && (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              Ҷустуҷӯ...
            </div>
          )}

          {error && (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: 'var(--color-error)',
            }}>
              {error}
            </div>
          )}

          {/* Direct Navigation */}
          {!isLoading && !error && directNavigation && (
            <Link
              href={directNavigation.href}
              onClick={() => saveNavigation(
                directNavigation.label,
                directNavigation.href,
                directNavigation.type
              )}
              style={{
                display: 'block',
                padding: '16px',
                textDecoration: 'none',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                borderRadius: '0 0 32px 32px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: 'var(--font-size-base)',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Рафтан ба {directNavigation.label} →
            </Link>
          )}

          {!isLoading && !error && !directNavigation && results.length === 0 && query.length >= 1 && (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}>
              Натиҷае ёфт нашуд
            </div>
          )}

          {!isLoading && !error && !directNavigation && results.length > 0 && (
            <div>
              {results.map((result, index) => {
                // Handle surah results
                if (result.type === 'surah') {
                  const surah = result.data as Surah;
                  return (
                    <Link
                      key={`surah-${surah.number}-${index}`}
                      href={`/surah/${surah.number}`}
                      onClick={() => saveNavigation(surah.nameTajik, `/surah/${surah.number}`, 'surah')}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: 'inherit',
                        borderBottom: index < results.length - 1 ? '1px solid var(--color-outline)' : 'none',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <div style={{
                          fontSize: 'var(--font-size-base)',
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                        }}>
                          {surah.nameTajik}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-secondary)',
                          backgroundColor: 'var(--color-surface-variant)',
                          padding: '2px 8px',
                          borderRadius: '8px',
                        }}>
                          Сура
                        </div>
                      </div>
                    </Link>
                  );
                }
                
                // Handle verse results
                if (result.type === 'verse') {
                  const verse = result.data as Verse;
                  const matchedText = getMatchedText(verse, result.matchedFields);
                  const matchedFieldLabel = result.matchedFields[0] ? getMatchedFieldLabel(result.matchedFields[0]) : '';
                  const isArabic = result.matchedFields[0] === 'arabicText';
                  
                  return (
                    <Link
                      key={`${verse.surahId}-${verse.verseNumber}-${index}`}
                      href={`/surah/${verse.surahId}?verse=${verse.verseNumber}`}
                      onClick={() => {
                        const label = `${getSurahName(verse.surahId)} - Оят ${verse.verseNumber}`;
                        const href = `/surah/${verse.surahId}?verse=${verse.verseNumber}`;
                        saveNavigation(label, href, 'verse');
                      }}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        textDecoration: 'none',
                        color: 'inherit',
                        borderBottom: index < results.length - 1 ? '1px solid var(--color-outline)' : 'none',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: matchedText ? '6px' : '0',
                      }}>
                        <div style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                        }}>
                          {getSurahName(verse.surahId)} - Оят {verse.verseNumber}
                          {verse.juz && ` • Ҷуз ${verse.juz}`}
                          {verse.page && ` • Саҳифа ${verse.page}`}
                        </div>
                        {matchedFieldLabel && (
                          <div style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-secondary)',
                            backgroundColor: 'var(--color-surface-variant)',
                            padding: '2px 8px',
                            borderRadius: '8px',
                          }}>
                            {matchedFieldLabel}
                          </div>
                        )}
                      </div>
                      {matchedText && (
                        <div
                          lang={isArabic ? 'ar' : undefined}
                          style={{
                            fontSize: isArabic ? '18px' : 'var(--font-size-base)',
                            color: 'var(--color-text-primary)',
                            lineHeight: '1.5',
                            direction: isArabic ? 'rtl' : 'ltr',
                            fontFamily: isArabic ? "'Amiri', 'Noto Naskh Arabic', 'Arabic Typesetting', serif" : 'inherit',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: highlightText(matchedText, query)
                          }}
                        />
                      )}
                    </Link>
                  );
                }
                
                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

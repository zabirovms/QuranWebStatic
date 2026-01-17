'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { getAllVerses, getVersesBySurah } from '@/lib/data/verse-data-client';
import { Surah, Verse } from '@/lib/types';
import { CloseIcon, SearchIcon, ClearIcon } from './Icons';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'surah-list' | 'verse' | 'juz' | 'page';

interface JuzInfo {
  juz: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
}

interface PageInfo {
  page: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
}

export default function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [juzList, setJuzList] = useState<JuzInfo[]>([]);
  const [pageList, setPageList] = useState<PageInfo[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('surah-list');
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [surahVerses, setSurahVerses] = useState<Verse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search queries for each tab
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [verseSearchQuery, setVerseSearchQuery] = useState('');
  const [juzSearchQuery, setJuzSearchQuery] = useState('');
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  
  // Cache data loading state - only load once
  const dataLoadedRef = useRef(false);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);
  
  // Filtered lists based on search queries
  const filteredSurahs = useMemo(() => {
    if (!surahSearchQuery.trim()) return surahs;
    const query = surahSearchQuery.toLowerCase();
    return surahs.filter(surah => 
      surah.nameTajik.toLowerCase().includes(query) ||
      surah.nameArabic.includes(query) ||
      surah.number.toString().includes(query)
    );
  }, [surahs, surahSearchQuery]);
  
  const filteredSurahVerses = useMemo(() => {
    if (!verseSearchQuery.trim()) return surahVerses;
    const query = verseSearchQuery.toLowerCase();
    return surahVerses.filter(verse => 
      verse.verseNumber.toString().includes(query) ||
      (verse.arabicText && verse.arabicText.includes(query)) ||
      (verse.tajikText && verse.tajikText.toLowerCase().includes(query))
    );
  }, [surahVerses, verseSearchQuery]);
  
  const filteredJuzList = useMemo(() => {
    if (!juzSearchQuery.trim()) return juzList;
    const query = juzSearchQuery.toLowerCase();
    return juzList.filter(juz => 
      juz.juz.toString().includes(query) ||
      juz.surahName.toLowerCase().includes(query) ||
      juz.ayahNumber.toString().includes(query)
    );
  }, [juzList, juzSearchQuery]);
  
  const filteredPageList = useMemo(() => {
    if (!pageSearchQuery.trim()) return pageList;
    const query = pageSearchQuery.toLowerCase();
    return pageList.filter(page => 
      page.page.toString().includes(query) ||
      page.surahName.toLowerCase().includes(query) ||
      page.ayahNumber.toString().includes(query)
    );
  }, [pageList, pageSearchQuery]);

  // Define loadData function before useEffect hooks that use it
  const loadData = async () => {
    // If already loaded, don't reload
    if (dataLoadedRef.current) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Load surahs first (lightweight)
      const surahsData = await getAllSurahs();
      setSurahs(surahsData);
      
      // Then load verses in background (heavy operation)
      // Only load if user might need juz/page tabs
      try {
        const versesData = await getAllVerses();
        // Build juz list (1-30)
        const juzMap = new Map<number, JuzInfo>();
        for (const verse of versesData) {
          if (verse.juz && !juzMap.has(verse.juz)) {
            const surah = surahsData.find(s => s.number === verse.surahId);
            juzMap.set(verse.juz, {
              juz: verse.juz,
              surahNumber: verse.surahId,
              surahName: surah?.nameTajik || `Сураи ${verse.surahId}`,
              ayahNumber: verse.verseNumber,
            });
          }
        }
        setJuzList(Array.from(juzMap.values()).sort((a, b) => a.juz - b.juz));

        // Build page list (1-604)
        const pageMap = new Map<number, PageInfo>();
        for (const verse of versesData) {
          if (verse.page && !pageMap.has(verse.page)) {
            const surah = surahsData.find(s => s.number === verse.surahId);
            pageMap.set(verse.page, {
              page: verse.page,
              surahNumber: verse.surahId,
              surahName: surah?.nameTajik || `Сураи ${verse.surahId}`,
              ayahNumber: verse.verseNumber,
            });
          }
        }
        setPageList(Array.from(pageMap.values()).sort((a, b) => a.page - b.page));
      } catch (versesError) {
        console.error('Error loading verses for juz/page lists:', versesError);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSurahVerses = async (surahNumber: number) => {
    setIsLoadingVerses(true);
    try {
      const verses = await getVersesBySurah(surahNumber);
      setSurahVerses(verses.sort((a, b) => a.verseNumber - b.verseNumber));
    } catch (error) {
      console.error('Error loading surah verses:', error);
      setSurahVerses([]);
    } finally {
      setIsLoadingVerses(false);
    }
  };

  // Extract current surah number from pathname if on surah page
  useEffect(() => {
    if (pathname && pathname.startsWith('/surah/')) {
      const match = pathname.match(/\/surah\/(\d+)/);
      if (match) {
        const surahNum = parseInt(match[1], 10);
        if (surahNum >= 1 && surahNum <= 114) {
          setSelectedSurah(surahNum);
        }
      }
    }
  }, [pathname]);

  // Load data only once on component mount, not every time drawer opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!dataLoadedRef.current && !loadingPromiseRef.current) {
      loadingPromiseRef.current = loadData().finally(() => {
        dataLoadedRef.current = true;
        loadingPromiseRef.current = null;
      });
    }
  }, []); // Empty dependency array - only run once

  // Load verses when surah is selected (for verse tab)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedSurah && isOpen && activeTab === 'verse') {
      loadSurahVerses(selectedSurah);
    }
  }, [selectedSurah, isOpen, activeTab]);

  const handleSurahClick = (surahNumber: number) => {
    setSelectedSurah(surahNumber);
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
          zIndex: 2000,
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
          maxWidth: '400px',
          backgroundColor: 'var(--color-background)',
          boxShadow: 'var(--elevation-8)',
          zIndex: 2001,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid var(--color-outline)',
            minHeight: '56px',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Навигатсия
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <CloseIcon size={24} color="var(--color-text-primary)" />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-outline)',
            backgroundColor: 'var(--color-background)',
          }}
        >
          {(['surah-list', 'verse', 'juz', 'page'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: activeTab === tab ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.2s ease',
              }}
            >
              {tab === 'surah-list' ? 'Сура' : tab === 'verse' ? 'Оят' : tab === 'juz' ? 'Ҷуз' : 'Саҳифа'}
              {activeTab === tab && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '40%',
                    height: '2px',
                    backgroundColor: 'var(--color-primary)',
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
          }}
        >
          {isLoading && surahs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              Боргирӣ карда истодааст...
            </div>
          ) : (
            <>
              {activeTab === 'surah-list' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: 0,
                }}>
                  {/* Search Input */}
                  <div style={{
                    position: 'relative',
                    marginBottom: 'var(--spacing-md)',
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <SearchIcon 
                        size={20} 
                        color="var(--color-text-secondary)" 
                      />
                    </div>
                    <input
                      type="text"
                      value={surahSearchQuery}
                      onChange={(e) => setSurahSearchQuery(e.target.value)}
                      placeholder="Ҷустуҷӯи сура..."
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        fontSize: 'var(--font-size-base)',
                        border: '1px solid var(--color-outline)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-outline)';
                      }}
                    />
                    {surahSearchQuery && (
                      <button
                        onClick={() => setSurahSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <ClearIcon size={18} color="var(--color-text-secondary)" />
                      </button>
                    )}
                  </div>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid var(--color-outline)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}>
                    {filteredSurahs.length === 0 ? (
                      <div style={{
                        padding: 'var(--spacing-xl)',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                      }}>
                        {surahSearchQuery ? 'Сура ёфт нашуд' : 'Боргирӣ карда истодааст...'}
                      </div>
                    ) : (
                      filteredSurahs.map((surah) => (
                        <Link
                          key={surah.number}
                          href={`/surah/${surah.number}`}
                          prefetch={true}
                          onClick={() => {
                            onClose();
                          }}
                          style={{
                            padding: 'var(--spacing-md)',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--color-outline)',
                            transition: 'background-color 0.2s ease',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 'var(--spacing-md)',
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div style={{
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 'var(--font-weight-semibold)',
                            color: 'var(--color-text-primary)',
                            flex: 1,
                          }}>
                            {surah.number}. {surah.nameTajik}
                          </div>
                          <div style={{
                            fontSize: 'var(--font-size-base)',
                            fontWeight: 'var(--font-weight-normal)',
                            color: 'var(--color-text-secondary)',
                            fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Arabic Typesetting', serif",
                            direction: 'rtl',
                            textAlign: 'right',
                          }}>
                            {surah.nameArabic}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'verse' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--spacing-md)',
                  height: '100%',
                  minHeight: 0,
                }}>
                  {/* Left Column - Surahs List */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}>
                    {/* Search Input for Surahs */}
                    <div style={{
                      position: 'relative',
                      marginBottom: 'var(--spacing-sm)',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <SearchIcon 
                          size={18} 
                          color="var(--color-text-secondary)" 
                        />
                      </div>
                      <input
                        type="text"
                        value={surahSearchQuery}
                        onChange={(e) => setSurahSearchQuery(e.target.value)}
                        placeholder="Ҷустуҷӯи сура..."
                        style={{
                          width: '100%',
                          padding: '8px 10px 8px 36px',
                          fontSize: 'var(--font-size-sm)',
                          border: '1px solid var(--color-outline)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-primary)',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-outline)';
                        }}
                      />
                      {surahSearchQuery && (
                        <button
                          onClick={() => setSurahSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                          }}
                        >
                          <ClearIcon size={16} color="var(--color-text-secondary)" />
                        </button>
                      )}
                    </div>
                    <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      border: '1px solid var(--color-outline)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface)',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}>
                      {filteredSurahs.length === 0 ? (
                        <div style={{
                          padding: 'var(--spacing-lg)',
                          textAlign: 'center',
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--font-size-sm)',
                        }}>
                          {surahSearchQuery ? 'Сура ёфт нашуд' : 'Боргирӣ карда истодааст...'}
                        </div>
                      ) : (
                        filteredSurahs.map((surah) => (
                          <div
                            key={surah.number}
                            onClick={() => handleSurahClick(surah.number)}
                            style={{
                              padding: 'var(--spacing-sm) var(--spacing-md)',
                              cursor: 'pointer',
                              backgroundColor: selectedSurah === surah.number
                                ? 'var(--color-primary-container-low-opacity)'
                                : 'transparent',
                              borderLeft: selectedSurah === surah.number
                                ? '3px solid var(--color-primary)'
                                : '3px solid transparent',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (selectedSurah !== surah.number) {
                                e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedSurah !== surah.number) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <div style={{
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: selectedSurah === surah.number
                                ? 'var(--font-weight-semibold)'
                                : 'var(--font-weight-normal)',
                              color: selectedSurah === surah.number
                                ? 'var(--color-primary)'
                                : 'var(--color-text-primary)',
                            }}>
                              {surah.number}. {surah.nameTajik}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column - Verses List */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}>
                    {/* Search Input for Verses */}
                    <div style={{
                      position: 'relative',
                      marginBottom: 'var(--spacing-sm)',
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <SearchIcon 
                          size={18} 
                          color="var(--color-text-secondary)" 
                        />
                      </div>
                      <input
                        type="text"
                        value={verseSearchQuery}
                        onChange={(e) => setVerseSearchQuery(e.target.value)}
                        placeholder="Ҷустуҷӯи оят..."
                        style={{
                          width: '100%',
                          padding: '8px 10px 8px 36px',
                          fontSize: 'var(--font-size-sm)',
                          border: '1px solid var(--color-outline)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-surface)',
                          color: 'var(--color-text-primary)',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-outline)';
                        }}
                      />
                      {verseSearchQuery && (
                        <button
                          onClick={() => setVerseSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                          }}
                        >
                          <ClearIcon size={16} color="var(--color-text-secondary)" />
                        </button>
                      )}
                    </div>
                    <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      border: '1px solid var(--color-outline)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface)',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}>
                      {isLoadingVerses ? (
                        <div style={{
                          padding: 'var(--spacing-lg)',
                          textAlign: 'center',
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--font-size-sm)',
                        }}>
                          Боргирӣ карда истодааст...
                        </div>
                      ) : surahVerses.length === 0 ? (
                        <div style={{
                          padding: 'var(--spacing-lg)',
                          textAlign: 'center',
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--font-size-sm)',
                        }}>
                          Сура интихоб нашудааст
                        </div>
                      ) : filteredSurahVerses.length === 0 ? (
                        <div style={{
                          padding: 'var(--spacing-lg)',
                          textAlign: 'center',
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--font-size-sm)',
                        }}>
                          {verseSearchQuery ? 'Оят ёфт нашуд' : 'Сура интихоб нашудааст'}
                        </div>
                      ) : (
                        filteredSurahVerses.map((verse) => (
                          <Link
                            key={verse.verseNumber}
                            href={`/surah/${verse.surahId}?verse=${verse.verseNumber}`}
                            prefetch={true}
                            onClick={() => {
                              onClose();
                            }}
                            style={{
                              padding: 'var(--spacing-sm) var(--spacing-md)',
                              cursor: 'pointer',
                              borderBottom: '1px solid var(--color-outline)',
                              transition: 'background-color 0.2s ease',
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'block',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              color: 'var(--color-text-primary)',
                              marginBottom: '4px',
                            }}>
                              Оят {verse.verseNumber}
                            </div>
                            {verse.arabicText && (
                              <div style={{
                                fontSize: 'var(--font-size-base)',
                                fontWeight: 'var(--font-weight-normal)',
                                color: 'var(--color-text-primary)',
                                fontFamily: "'Amiri', 'Noto Naskh Arabic', 'Arabic Typesetting', serif",
                                direction: 'rtl',
                                textAlign: 'right',
                                marginBottom: '4px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.8',
                              }}>
                                <span lang="ar">{verse.arabicText}</span>
                              </div>
                            )}
                            {verse.tajikText && (
                              <div style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-secondary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.4',
                              }}>
                                {verse.tajikText}
                              </div>
                            )}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'juz' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: 0,
                }}>
                  {/* Search Input */}
                  <div style={{
                    position: 'relative',
                    marginBottom: 'var(--spacing-md)',
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <SearchIcon 
                        size={20} 
                        color="var(--color-text-secondary)" 
                      />
                    </div>
                    <input
                      type="text"
                      value={juzSearchQuery}
                      onChange={(e) => setJuzSearchQuery(e.target.value)}
                      placeholder="Ҷустуҷӯи ҷуз..."
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        fontSize: 'var(--font-size-base)',
                        border: '1px solid var(--color-outline)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-outline)';
                      }}
                    />
                    {juzSearchQuery && (
                      <button
                        onClick={() => setJuzSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <ClearIcon size={18} color="var(--color-text-secondary)" />
                      </button>
                    )}
                  </div>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid var(--color-outline)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}>
                    {filteredJuzList.length === 0 ? (
                      <div style={{
                        padding: 'var(--spacing-xl)',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                      }}>
                        {juzSearchQuery ? 'Ҷуз ёфт нашуд' : 'Боргирӣ карда истодааст...'}
                      </div>
                    ) : (
                      filteredJuzList.map((juz) => (
                      <Link
                        key={juz.juz}
                        href={`/surah/${juz.surahNumber}?verse=${juz.ayahNumber}`}
                        prefetch={true}
                        onClick={() => {
                          onClose();
                        }}
                        style={{
                          padding: 'var(--spacing-md)',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--color-outline)',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 'var(--spacing-md)',
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{
                          fontSize: 'var(--font-size-base)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-primary)',
                        }}>
                          Ҷуз {juz.juz}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-secondary)',
                          textAlign: 'right',
                        }}>
                          {juz.surahName} - Оят {juz.ayahNumber}
                        </div>
                      </Link>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'page' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: 0,
                }}>
                  {/* Search Input */}
                  <div style={{
                    position: 'relative',
                    marginBottom: 'var(--spacing-md)',
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <SearchIcon 
                        size={20} 
                        color="var(--color-text-secondary)" 
                      />
                    </div>
                    <input
                      type="text"
                      value={pageSearchQuery}
                      onChange={(e) => setPageSearchQuery(e.target.value)}
                      placeholder="Ҷустуҷӯи саҳифа..."
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        fontSize: 'var(--font-size-base)',
                        border: '1px solid var(--color-outline)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-outline)';
                      }}
                    />
                    {pageSearchQuery && (
                      <button
                        onClick={() => setPageSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <ClearIcon size={18} color="var(--color-text-secondary)" />
                      </button>
                    )}
                  </div>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    border: '1px solid var(--color-outline)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}>
                    {filteredPageList.length === 0 ? (
                      <div style={{
                        padding: 'var(--spacing-xl)',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-sm)',
                      }}>
                        {pageSearchQuery ? 'Саҳифа ёфт нашуд' : 'Боргирӣ карда истодааст...'}
                      </div>
                    ) : (
                      filteredPageList.map((page) => (
                      <Link
                        key={page.page}
                        href={`/surah/${page.surahNumber}?verse=${page.ayahNumber}`}
                        prefetch={true}
                        onClick={() => {
                          onClose();
                        }}
                        style={{
                          padding: 'var(--spacing-md)',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--color-outline)',
                          transition: 'background-color 0.2s ease',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 'var(--spacing-md)',
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{
                          fontSize: 'var(--font-size-base)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-primary)',
                        }}>
                          Саҳифа {page.page}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-secondary)',
                          textAlign: 'right',
                        }}>
                          {page.surahName} - Оят {page.ayahNumber}
                        </div>
                      </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { getAllVerses } from '@/lib/data/verse-data-client';
import { Surah, Verse } from '@/lib/types';
import { BookmarkService, Bookmark } from '@/lib/services/bookmark-service';
import { useTopBar } from '@/lib/contexts/TopBarContext';

type Tab = 'surah' | 'juz' | 'page' | 'bookmarks';

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

export default function QuranPage() {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [activeTab, setActiveTab] = useState<Tab>('surah');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [juzList, setJuzList] = useState<JuzInfo[]>([]);
  const [pageList, setPageList] = useState<PageInfo[]>([]);
  const [isAscending, setIsAscending] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        console.log('QuranPage: Starting to load data...');
        const [surahsData, versesData] = await Promise.all([
          getAllSurahs(),
          getAllVerses(),
        ]);

        console.log('QuranPage: Surahs loaded:', surahsData?.length);
        console.log('QuranPage: Verses loaded:', versesData?.length);

        if (!surahsData || surahsData.length === 0) {
          throw new Error('No surahs data loaded.');
        }

        if (!versesData || versesData.length === 0) {
          throw new Error('No verses data loaded.');
        }

        setSurahs(surahsData);

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
        } catch (error) {
        console.error('Error loading data:', error);
        setLoadError(error instanceof Error ? error.message : 'Хатоги дар боргирии маълумот');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookmarks') {
      const bookmarkService = BookmarkService.getInstance();
      setBookmarks(bookmarkService.getAllBookmarks());
    }
  }, [activeTab]);

  const removeBookmark = (uniqueKey: string) => {
    const bookmarkService = BookmarkService.getInstance();
    bookmarkService.removeBookmark(uniqueKey);
    setBookmarks(bookmarkService.getAllBookmarks());
  };

  const sortedSurahs = isAscending 
    ? [...surahs].sort((a, b) => a.number - b.number)
    : [...surahs].sort((a, b) => b.number - a.number);

  const sortedJuz = isAscending ? juzList : [...juzList].reverse();
  const sortedPages = isAscending ? pageList : [...pageList].reverse();

  return (
    <div
      style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
        width: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Tabs - Fixed below Global TopBar */}
      <div style={{
        position: 'fixed',
        top: isTopBarVisible ? '56px' : '0px',
        left: 0,
        right: 0,
        display: 'flex',
        borderBottom: '1px solid var(--color-outline)',
        backgroundColor: 'var(--color-background)',
        zIndex: 1019,
        height: '48px',
        transition: 'top 0.3s ease-in-out',
      }}>
        {(['surah', 'juz', 'page', 'bookmarks'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              position: 'relative',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-primary)',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            {tab === 'surah' ? 'Сура' : tab === 'juz' ? 'Ҷузъ' : tab === 'page' ? 'Саҳифа' : 'Захираҳо'}
            {activeTab === tab && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40%',
                height: '2px',
                backgroundColor: 'var(--color-primary)',
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-primary)', fontSize: '1rem', fontWeight: '500' }}>
          Боргирӣ карда истодааст...
        </div>
      ) : loadError ? (
        <div style={{ 
          padding: '32px', 
          textAlign: 'center',
          color: 'var(--color-text-primary)',
        }}>
          <div style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: '500' }}>
            Хатоги: {loadError}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
            }}
          >
            Аз нав кӯшиш кардан
          </button>
          <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Лутфан консоли браузерро санҷед барои маълумоти бештар
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '0 80px', 
          paddingTop: isTopBarVisible ? 'calc(56px + 48px)' : 'calc(48px)',
          paddingBottom: 'calc(80px)',
          marginTop: '0',
          width: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}>
          {activeTab === 'surah' && (
            <div className="surahs-grid">
              {sortedSurahs.map((surah) => (
                <Link
                  key={surah.number}
                  href={`/surah/${surah.number}`}
                  style={{
                    display: 'block',
                    padding: '16px',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'inherit',
                    backgroundColor: 'var(--color-surface-variant)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      position: 'relative',
                      flexShrink: 0,
                    }}>
                      <img 
                        src="/surah-names-svg/circle.svg"
                        alt=""
                        style={{
                          width: '40px',
                          height: '40px',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          opacity: 0.6,
                          filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(201deg) brightness(95%) contrast(89%)',
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-primary)',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                      }}>
                        {surah.number}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '1rem', 
                        fontWeight: '500',
                        marginBottom: '4px',
                      }}>
                        Сураи {surah.nameTajik}
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                      }}>
                        <span>{surah.revelationType}</span>
                        <span>•</span>
                        <span>{surah.versesCount} оят</span>
                      </div>
                    </div>
                    <div style={{
                      width: '90px',
                      height: '45px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}>
                      <img 
                        src={`/surah-names-svg/${String(surah.number).padStart(3, '0')}.svg`}
                        alt={surah.nameArabic}
                        className="surah-name-svg"
                        style={{
                          width: '90px',
                          height: '45px',
                          objectFit: 'contain',
                          filter: 'var(--surah-svg-filter, none)',
                        }}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target || !target.parentElement) return; // Safety check
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          // Double-check parent is still in DOM
                          if (parent && parent.parentNode && document.body.contains(parent)) {
                            const fallback = document.createElement('div');
                            fallback.style.cssText = `font-size: 1.1rem; font-weight: bold; color: var(--color-text-primary); direction: rtl; text-align: right;`;
                            fallback.textContent = surah.nameArabic;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'juz' && (
            <div className="surahs-grid">
              {sortedJuz.map((juz) => {
                const surah = surahs.find(s => s.number === juz.surahNumber);
                return (
                  <Link
                    key={juz.juz}
                    href={`/surah/${juz.surahNumber}?verse=${juz.ayahNumber}`}
                    style={{
                      display: 'block',
                      padding: '16px',
                      border: '1px solid var(--color-outline)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'inherit',
                      backgroundColor: 'var(--color-surface-variant)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        position: 'relative',
                        flexShrink: 0,
                      }}>
                        <img 
                          src="/surah-names-svg/circle.svg"
                          alt=""
                          style={{
                            width: '40px',
                            height: '40px',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            opacity: 0.6,
                            filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(201deg) brightness(95%) contrast(89%)',
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text-primary)',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                        }}>
                          {juz.juz}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '1rem', 
                          fontWeight: '500',
                          marginBottom: '4px',
                        }}>
                          Ҷузъи {juz.juz}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                        }}>
                          <span>{juz.surahName}</span>
                          <span>•</span>
                          <span>оят {juz.ayahNumber}</span>
                        </div>
                      </div>
                      {surah && (
                        <div style={{
                          width: '90px',
                          height: '45px',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}>
                          <img 
                            src={`/surah-names-svg/${String(surah.number).padStart(3, '0')}.svg`}
                            alt={surah.nameArabic}
                            className="surah-name-svg"
                            style={{
                              width: '90px',
                              height: '45px',
                              objectFit: 'contain',
                              filter: 'var(--surah-svg-filter, none)',
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {activeTab === 'page' && (
            <div className="surahs-grid">
              {sortedPages.map((page) => {
                const surah = surahs.find(s => s.number === page.surahNumber);
                return (
                  <Link
                    key={page.page}
                    href={`/surah/${page.surahNumber}?verse=${page.ayahNumber}`}
                    style={{
                      display: 'block',
                      padding: '16px',
                      border: '1px solid var(--color-outline)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'inherit',
                      backgroundColor: 'var(--color-surface-variant)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        position: 'relative',
                        flexShrink: 0,
                      }}>
                        <img 
                          src="/surah-names-svg/circle.svg"
                          alt=""
                          style={{
                            width: '40px',
                            height: '40px',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            opacity: 0.6,
                            filter: 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(201deg) brightness(95%) contrast(89%)',
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text-primary)',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                        }}>
                          {page.page}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '1rem', 
                          fontWeight: '500',
                          marginBottom: '4px',
                        }}>
                          Саҳифаи {page.page}
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: 'var(--color-text-secondary)',
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                        }}>
                          <span>{page.surahName}</span>
                          <span>•</span>
                          <span>оят {page.ayahNumber}</span>
                        </div>
                      </div>
                      {surah && (
                        <div style={{
                          width: '90px',
                          height: '45px',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}>
                          <img 
                            src={`/surah-names-svg/${String(surah.number).padStart(3, '0')}.svg`}
                            alt={surah.nameArabic}
                            className="surah-name-svg"
                            style={{
                              width: '90px',
                              height: '45px',
                              objectFit: 'contain',
                              filter: 'var(--surah-svg-filter, none)',
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {activeTab === 'bookmarks' && (
            <div style={{ padding: '16px' }}>
              {bookmarks.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '64px 16px',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔖</div>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                    color: 'var(--color-text-primary)',
                  }}>
                    Захираҳо холӣ аст
                  </h2>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-secondary)',
                  }}>
                    Оятҳоро захира кунед ва инҷо дида мешаванд
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}>
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-outline)',
                        borderRadius: '12px',
                        position: 'relative',
                        boxShadow: 'var(--elevation-1)',
                      }}
                    >
                      <button
                        onClick={() => removeBookmark(bookmark.uniqueKey)}
                        style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          background: 'none',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          color: 'var(--color-text-secondary)',
                          width: '32px',
                          height: '32px',
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
                        title="Нест кардан"
                      >
                        ×
                      </button>
                      <Link
                        href={`/surah/${bookmark.surahNumber}?verse=${bookmark.verseNumber}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
                      >
                        <div style={{
                          fontSize: '1.125rem',
                          fontFamily: 'serif',
                          direction: 'rtl',
                          marginBottom: '12px',
                          color: 'var(--color-primary)',
                        }}>
                          <span lang="ar">{bookmark.arabicText}</span>
                        </div>
                        <div style={{
                          fontSize: '1rem',
                          lineHeight: '1.5',
                          marginBottom: '8px',
                          color: 'var(--color-text-primary)',
                        }}>
                          {bookmark.tajikText}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-primary)',
                          fontWeight: 'bold',
                        }}>
                          Сураи {bookmark.surahNumber}:{bookmark.verseNumber}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FloatingActionButton for sorting */}
      {activeTab !== 'bookmarks' && (
      <button
        onClick={() => setIsAscending(!isAscending)}
        style={{
          position: 'fixed',
            bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          border: 'none',
            margin: 0,
            padding: 0,
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          zIndex: 100,
            pointerEvents: 'auto',
            lineHeight: 1,
            minWidth: '56px',
            minHeight: '56px',
            maxWidth: '56px',
            maxHeight: '56px',
        }}
        title={isAscending ? 'Ҷобаҷо кардан баръакс' : 'Ҷобаҷо кардан мустақим'}
      >
        {isAscending ? '↓' : '↑'}
      </button>
      )}
    </div>
  );
}

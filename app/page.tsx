import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllDuas } from '@/lib/data/dua-data';
import { getAllTasbeehs } from '@/lib/data/tasbeeh-data';
import { getAllQuotedVerses } from '@/lib/data/quoted-verse-data';
import { getAllAsmaulHusna } from '@/lib/data/asmaul-husna-data';
import { getProphetSummaries } from '@/lib/data/prophet-data';
import { getAllLiveStreams } from '@/lib/data/live-stream-data';
import { getAllSurahs } from '@/lib/data/surah-data';
import FeaturedSurahCard from '@/components/FeaturedSurahCard';
import FeaturedProphetCard from '@/components/FeaturedProphetCard';
import SearchPlaceholder from '@/components/SearchPlaceholder';
import YouTubeVideosSection from '@/components/YouTubeVideosSection';
import GallerySection from '@/components/GallerySection';
import AllSurahsList from '@/components/AllSurahsList';
import MobileAppBanner from '@/components/MobileAppBanner';

export const metadata: Metadata = {
  title: 'Қуръон бо Тафсири Осонбаён',
  description: 'Хондани Қуръони Карим бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ. Дуоҳо, зикрҳо, тиловат, Қоидаи Бағдодӣ, Фарзи Айн, номҳои мубораки Аллоҳ, паёмбарон ва маводҳои дигар.',
  alternates: {
    canonical: 'https://www.quran.tj/',
  },
  openGraph: {
    title: 'Қуръон бо Тафсири Осонбаён',
    description: 'Хондани Қуръони Карим бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ.',
    type: 'website',
      url: 'https://www.quran.tj/',
  },
  twitter: {
    card: 'summary',
    title: 'Қуръон бо Тафсири Осонбаён',
    description: 'Хондани Қуръони Карим бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ.',
  },
};

// Featured surahs
const featuredSurahs = [
  { name: 'Сураи Ал-Каҳф', surahNumber: 18, isVerse: false },
  { name: 'Сураи Ёсин', surahNumber: 36, isVerse: false },
  { name: 'Сураи Ал-Мулк', surahNumber: 67, isVerse: false },
  { name: 'Оят-ал-Курси', surahNumber: 2, verseNumber: 255, isVerse: true },
  { name: 'Сураи Ар-Раҳмон', surahNumber: 55, isVerse: false },
  { name: 'Сураи Ал-Фотиҳа', surahNumber: 1, isVerse: false },
];

export default async function HomePage() {
  const duas = await getAllDuas();
  const tasbeehs = await getAllTasbeehs();
  const quotedVerses = await getAllQuotedVerses();
  const asmaulHusna = await getAllAsmaulHusna();
  const prophets = await getProphetSummaries();
  const liveStreams = await getAllLiveStreams();
  const allSurahs = await getAllSurahs();
  
  const displayDuas = duas.length > 0 ? duas.slice(0, 5) : [];
  const displayTasbeehs = tasbeehs.length > 0 ? tasbeehs.slice(0, 5) : [];
  const displayQuotedVerses = quotedVerses.length > 0 ? quotedVerses.slice(0, 5) : [];
  const displayAsmaulHusna = asmaulHusna.length > 0 ? asmaulHusna.slice(0, 10) : [];
  
  // Featured prophets: Muhammad, Ibrahim, Musa, Isa, Nuh, Yusuf, Dawood, Sulayman
  const featuredProphetNames = [
    'Муҳаммад', 'Иброҳим', 'Мусо', 'Исо', 'Нӯҳ', 'Юсуф', 'Довуд', 'Сулаймон',
  ];
  const featuredProphets = prophets.filter((p) => {
    return featuredProphetNames.some((name) => p.name.includes(name));
  }).slice(0, 8);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      <div style={{ 
        padding: '16px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Mobile App Banner */}
        <MobileAppBanner />

        {/* Search Placeholder */}
        <SearchPlaceholder />

        {/* CTA Button to Surahs */}
        <div style={{ 
                  display: 'flex',
          justifyContent: 'center',
          marginTop: '16px',
          marginBottom: '24px',
        }}>
          <Link 
            href="/quran"
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 24px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-semibold)',
              border: '2px solid var(--color-primary-low-opacity)',
            }}
          >
            Ба Сураҳо
          </Link>
              </div>

        {/* Featured Surahs Section */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 4px',
            marginBottom: '8px',
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0,
            }}>
              Сураҳои машҳур
            </h2>
            <Link href="/quran" style={{ 
              color: 'var(--color-primary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}>ҳама</span>
              <span>→</span>
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div 
              className="scrollable-container"
              style={{ 
                display: 'inline-flex',
                gap: '16px',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '8px 12px',
                maxWidth: '100%',
              }}
            >
              {featuredSurahs.map((surah) => (
                <FeaturedSurahCard
                  key={`${surah.surahNumber}-${surah.verseNumber || ''}`}
                  surah={surah}
                />
              ))}
            </div>
          </div>
              </div>

        {/* Quoted Verses Section */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 12px',
            marginBottom: '12px',
            maxWidth: '100%',
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0,
            }}>
              Иқтибосҳо аз Қуръон
            </h2>
            <Link href="/quoted-verses" style={{ 
              color: 'var(--color-primary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}>ҳама</span>
              <span>→</span>
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div 
              className="scrollable-container"
              style={{ 
                display: 'inline-flex',
                gap: '16px',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '8px 12px',
                maxWidth: '100%',
              }}
            >
              {displayQuotedVerses.length > 0 ? displayQuotedVerses.map((verse, index) => (
                <Link
                  key={index}
                  href={`/quoted-verses?ref=${encodeURIComponent(verse.ref)}`}
                  className="scrollable-container"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '280px',
                    maxWidth: '280px',
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'rgba(74, 144, 226, 0.1)',
                    overflowY: 'auto',
                    maxHeight: '200px',
                  }}
                >
                  <div style={{
                    fontSize: '32px',
                    textAlign: 'center',
                    marginBottom: '6px',
                    color: 'var(--color-primary-low-opacity)',
                  }}>
                    "
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    textAlign: 'center',
                    marginBottom: '6px',
                    flex: 1,
                  }}>
                    «{verse.tajik}»
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: 'var(--color-primary)',
                    fontWeight: 'bold',
                  }}>
                    <span>{verse.ref}</span>
                    <span>→</span>
                  </div>
                </Link>
              )) : (
                <div style={{ padding: '16px', color: 'var(--color-text-secondary)', fontSize: '0.875rem', minWidth: '280px' }}>
                  Иқтибосҳо боргирӣ карда намешаванд...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tasbeeh Section */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{
            padding: '16px',
            border: '1px solid var(--color-outline)',
            borderRadius: '16px',
            background: `linear-gradient(to bottom right, var(--color-primary-container-low-opacity), var(--color-primary-container-low-opacity))`,
            maxWidth: '100%',
            margin: '0 auto',
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-primary)',
              }}>
                Зикрҳо
              </h2>
              <Link href="/tasbeeh" style={{ 
                color: 'var(--color-primary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.875rem',
              }}>
                <span>тасбеҳгӯяк</span>
                <span>→</span>
              </Link>
            </div>
            <div 
              className="scrollable-container"
              style={{ 
                display: 'flex',
                gap: '16px',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '8px 12px',
              }}
            >
              {displayTasbeehs.map((tasbeeh, index) => (
                <Link
                  key={index}
                  href={`/tasbeeh?selectedIndex=${index}`}
                  className="scrollable-container"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '160px',
                    maxWidth: '160px',
                    padding: '16px',
                    border: '1px solid rgba(74, 144, 226, 0.3)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'rgba(74, 144, 226, 0.1)',
                    overflowY: 'auto',
                    maxHeight: '120px',
                  }}
                >
                  <div style={{
                    fontSize: '18px',
                    fontFamily: 'serif',
                    textAlign: 'center',
                    marginBottom: '6px',
                    direction: 'rtl',
                  }}>
                    <span lang="ar">{tasbeeh.arabic}</span>
                  </div>
                  <div style={{
                    fontSize: '11px',
                    textAlign: 'center',
                    color: 'var(--color-text-secondary)',
                    fontWeight: '500',
                  }}>
                    {tasbeeh.tajikTransliteration}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Prophets Section */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 12px',
            marginBottom: '12px',
            maxWidth: '100%',
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0,
            }}>
              Паёмбарон дар Қуръон
            </h2>
            <Link href="/prophets" style={{ 
              color: 'var(--color-primary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}>ҳама</span>
              <span>→</span>
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div 
              className="scrollable-container"
              style={{ 
                display: 'inline-flex',
                gap: '16px',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '8px 12px',
                maxWidth: '100%',
              }}
            >
              {featuredProphets.map((prophet, index) => (
                <FeaturedProphetCard
                  key={index}
                  prophet={prophet}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Duas Section */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 12px',
            marginBottom: '12px',
            maxWidth: '100%',
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0,
            }}>
              Дуоҳо
            </h2>
            <Link href="/duas" style={{ 
              color: 'var(--color-primary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}>ҳама</span>
              <span>→</span>
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div 
              className="scrollable-container"
              style={{ 
                display: 'inline-flex',
                gap: '16px',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '8px 12px',
                maxWidth: '100%',
              }}
            >
              {displayDuas.map((dua, index) => (
                <Link
                  key={index}
                  href={`/duas/rabbano?surah=${dua.surah}&verse=${dua.verse}`}
                  className="scrollable-container"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '300px',
                    maxWidth: '300px',
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'rgba(74, 144, 226, 0.1)',
                    overflowY: 'auto',
                    maxHeight: '200px',
                  }}
                >
                  <div style={{
                    fontSize: '32px',
                    textAlign: 'center',
                    marginBottom: '6px',
                    color: 'var(--color-primary)',
                  }}>
                    🕌
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    textAlign: 'center',
                    marginBottom: '6px',
                    flex: 1,
                  }}>
                    «{dua.tajik}»
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: 'var(--color-primary)',
                    fontWeight: 'bold',
                  }}>
                    <span>Сураи {dua.surah}:{dua.verse}</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Asmaul Husna Section */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{
            padding: '16px',
            border: '1px solid var(--color-outline)',
            borderRadius: '16px',
            background: `linear-gradient(to bottom right, var(--color-primary-container-low-opacity), var(--color-primary-container-low-opacity))`,
            maxWidth: '100%',
            margin: '0 auto',
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-primary)',
              }}>
                Асмоул Ҳусно
              </h2>
              <Link href="/asmaul-husna" style={{ 
                color: 'var(--color-primary)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                }}>ҳама</span>
                <span>→</span>
              </Link>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div 
                className="scrollable-container"
                style={{ 
                  display: 'inline-flex',
                  gap: '16px',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: '8px 12px',
                  maxWidth: '100%',
                }}
              >
                {displayAsmaulHusna.map((name, index) => (
                  <Link
                    key={index}
                    href="/asmaul-husna"
                    className="scrollable-container"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: '180px',
                      maxWidth: '180px',
                      padding: '16px',
                      border: '1px solid rgba(74, 144, 226, 0.3)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: 'inherit',
                      background: 'rgba(74, 144, 226, 0.1)',
                      overflowY: 'auto',
                      maxHeight: '150px',
                    }}
                  >
                    <div style={{
                      fontSize: '20px',
                      fontFamily: 'serif',
                      textAlign: 'center',
                      marginBottom: '6px',
                      direction: 'rtl',
                      fontWeight: 'bold',
                    }}>
                      {name.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      textAlign: 'center',
                      color: 'var(--color-primary)',
                      fontWeight: '600',
                      marginBottom: '6px',
                    }}>
                      {name.tajik.transliteration}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      textAlign: 'center',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {name.tajik.meaning}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Streams Section */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 4px',
            marginBottom: '8px',
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0,
            }}>
              Пахшҳои зинда
            </h2>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div 
              className="scrollable-container"
              style={{ 
                display: 'inline-flex',
                gap: '16px',
                overflowX: 'auto',
                overflowY: 'hidden',
                padding: '8px 12px',
                maxWidth: '100%',
              }}
            >
              {liveStreams.map((stream, index) => (
                <Link
                  key={index}
                  href={`/live/${stream.id}`}
                  className="scrollable-container"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '280px',
                    maxWidth: '280px',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: `linear-gradient(135deg, rgba(46, 125, 50, 0.9), rgba(46, 125, 50, 0.65))`,
                    padding: '20px',
                    position: 'relative',
                    overflowY: 'auto',
                    maxHeight: '200px',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'auto',
                  }}>
                    <div style={{
                      padding: '4px 10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#ff5252',
                      }} />
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#fff',
                        letterSpacing: '0.5px',
                      }}>
                        {stream.badge || 'LIVE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '28px', color: '#fff' }}>▶</div>
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#fff',
                      margin: '0 0 6px 0',
                      lineHeight: '1.2',
                    }}>
                      {stream.title}
                    </h3>
                    {stream.description && (
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        margin: '0 0 10px 0',
                        lineHeight: '1.3',
                      }}>
                        {stream.description}
                      </p>
                    )}
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <span style={{ fontSize: '18px' }}>📺</span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: '#fff',
                        fontWeight: '600',
                      }}>
                        Пахшро кушодан
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* YouTube Videos Section */}
        <YouTubeVideosSection />

        {/* Gallery Section */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 16px',
            marginBottom: '8px',
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold',
              margin: 0,
            }}>
              Галерея
            </h2>
            <Link href="/gallery" style={{ 
              color: 'var(--color-primary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}>ҳама</span>
              <span>→</span>
            </Link>
          </div>
          <GallerySection />
        </div>

        {/* All Surahs Section */}
        <AllSurahsList surahs={allSurahs} />
      </div>
    </div>
  );
}

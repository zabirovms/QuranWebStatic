import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getHomeFeaturedContent } from '@/lib/data/home-featured';
import FeaturedSurahCard from '@/components/FeaturedSurahCard';
import FeaturedProphetCard from '@/components/FeaturedProphetCard';
import SearchPlaceholderStatic from '@/components/SearchPlaceholderStatic';
const SearchPlaceholder = dynamic(() => import('@/components/SearchPlaceholder'), {
  ssr: false,
  loading: () => <SearchPlaceholderStatic />,
});
import HeroCTAButton from '@/components/HeroCTAButton';
import SectionLink from '@/components/SectionLink';
import HoverableCard from '@/components/HoverableCard';
import HoverableTasbeehCard from '@/components/HoverableTasbeehCard';
import HoverableAsmaulHusnaCard from '@/components/HoverableAsmaulHusnaCard';
import HoverableLiveStreamCard from '@/components/HoverableLiveStreamCard';

// Code-split heavy components below the fold (Phase 2, Section 3.1)
const PrayerTimesSection = dynamic(() => import('@/components/PrayerTimesSection'), {
  ssr: false,
  loading: () => (
    <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(12px, 3vw, 24px)',
        boxShadow: 'var(--elevation-2)',
        border: '1px solid var(--color-outline)',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{
            width: '140px',
            height: '28px',
            backgroundColor: 'var(--color-surface-variant)',
            borderRadius: 'var(--radius-sm)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            width: '60px',
            height: '20px',
            backgroundColor: 'var(--color-surface-variant)',
            borderRadius: 'var(--radius-sm)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
        }}>
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={index}
              style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-outline)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              <div style={{
                width: '60px',
                height: '16px',
                backgroundColor: 'var(--color-surface-variant)',
                borderRadius: 'var(--radius-sm)',
                margin: '0 auto 8px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{
                width: '50px',
                height: '24px',
                backgroundColor: 'var(--color-surface-variant)',
                borderRadius: 'var(--radius-sm)',
                margin: '0 auto',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}} />
      </div>
    </div>
  ),
});

const YouTubeVideosSection = dynamic(() => import('@/components/YouTubeVideosSection'), {
  ssr: false,
  loading: () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '100px',
          height: '28px',
          backgroundColor: 'var(--color-surface-variant)',
          borderRadius: 'var(--radius-sm)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-surface-variant)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div 
          className="scrollable-container"
          style={{ 
            display: 'inline-flex',
            gap: '12px',
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '8px 4px',
            maxWidth: '100%',
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '280px',
                minWidth: '280px',
                flexShrink: 0,
                height: '200px',
                borderRadius: '12px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-outline)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              <div style={{
                height: '140px',
                width: '100%',
                backgroundColor: 'var(--color-surface-variant)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{
                padding: '12px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <div style={{
                  width: '100%',
                  height: '16px',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-sm)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  width: '60%',
                  height: '14px',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-sm)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}} />
    </div>
  ),
});

const GallerySection = dynamic(() => import('@/components/GallerySection'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div 
        className="scrollable-container"
        style={{
          height: '310px',
          display: 'inline-flex',
          gap: '12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '8px 12px',
          maxWidth: '100%',
        }}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              minWidth: '200px',
              maxWidth: '200px',
              height: '280px',
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: 'var(--color-surface-variant)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--color-surface-variant)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}} />
    </div>
  ),
});

const AllSurahsList = dynamic(() => import('@/components/AllSurahsList'), {
  ssr: false,
  loading: () => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 4px',
        marginBottom: '8px',
      }}>
        <div style={{
          width: '140px',
          height: '28px',
          backgroundColor: 'var(--color-surface-variant)',
          borderRadius: 'var(--radius-sm)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>
      <div className="surahs-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={{
              display: 'block',
              padding: '16px',
              border: '1px solid var(--color-outline)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--elevation-1)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-surface-variant)',
                flexShrink: 0,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  width: '120px',
                  height: '20px',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '8px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  width: '80px',
                  height: '16px',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-sm)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              </div>
              <div style={{
                width: '90px',
                height: '45px',
                backgroundColor: 'var(--color-surface-variant)',
                borderRadius: 'var(--radius-sm)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            </div>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}} />
    </div>
  ),
});

const HadithSection = dynamic(() => import('@/components/HadithSection'), {
  ssr: false,
  loading: () => (
    <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(12px, 3vw, 24px)',
        boxShadow: 'var(--elevation-2)',
        border: '1px solid var(--color-outline)',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{
            width: '140px',
            height: '28px',
            backgroundColor: 'var(--color-surface-variant)',
            borderRadius: 'var(--radius-sm)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            width: '60px',
            height: '20px',
            backgroundColor: 'var(--color-surface-variant)',
            borderRadius: 'var(--radius-sm)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div 
            className="scrollable-container"
            style={{ 
              display: 'inline-flex',
              gap: 'clamp(12px, 2vw, 16px)',
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: 'clamp(6px, 1vw, 12px) clamp(8px, 1.5vw, 12px)',
              maxWidth: '100%',
            }}
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                style={{
                  display: 'block',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'clamp(16px, 4vw, 20px)',
                  boxShadow: 'var(--elevation-1)',
                  border: '1px solid var(--color-outline)',
                  position: 'relative',
                  minWidth: 'min(280px, 100%)',
                  maxWidth: 'min(280px, 100%)',
                  flexShrink: 0,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-variant)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  width: '180px',
                  height: '24px',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '12px',
                  marginRight: '50px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-outline-variant)',
                }}>
                  <div style={{
                    width: '60px',
                    height: '16px',
                    backgroundColor: 'var(--color-surface-variant)',
                    borderRadius: 'var(--radius-sm)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                  <div style={{
                    width: '60px',
                    height: '16px',
                    backgroundColor: 'var(--color-surface-variant)',
                    borderRadius: 'var(--radius-sm)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}} />
      </div>
    </div>
  ),
});

export const metadata: Metadata = {
  title: 'Қуръон бо Тафсири Осонбаён',
  description: 'Хондани Қуръони Карим бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ. Дуоҳо, зикрҳо, тиловат, Қоидаи Бағдодӣ, Фарзи Айн, ва маводҳои дигар.',
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
  const {
    displayDuas,
    displayTasbeehs,
    displayQuotedVerses,
    displayAsmaulHusna,
    featuredProphets,
    liveStreams,
    allSurahs,
  } = await getHomeFeaturedContent();

  return (
    <div 
      className="home-page-wrapper"
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Hero Header with Gradient */}
      <div 
        className="hero-section"
        style={{
          color: 'var(--color-on-primary)',
          padding: 'clamp(24px, 5vw, 40px) clamp(4px, 1vw, 8px) clamp(16px, 4vw, 24px)',
          boxShadow: 'var(--elevation-2)',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'visible',
          zIndex: 10,
        }}
      >
        {/* Background Image Container - with overflow hidden to contain image */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            zIndex: 0,
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image
              src="/alquran.svg"
              alt=""
              priority
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              aria-hidden
              sizes="100vw"
            />
          </div>
        </div>
        {/* Overlay to ensure text readability */}
        <div 
          className="hero-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-variant) 100%)',
            opacity: 0.75,
            zIndex: 1,
          }} 
        />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10000,
        }}>
          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontWeight: '700',
            marginBottom: 'clamp(16px, 3vw, 24px)',
            letterSpacing: '-0.5px',
            marginTop: '0',
            marginLeft: 0,
            marginRight: 0,
          }}>
            Қуръон бо Тафсири Осонбаён
          </h1>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto clamp(12px, 2vw, 16px)',
          }}>
            {/* Static shell is rendered on the server; full search behavior hydrates on client */}
            <SearchPlaceholder />
          </div>
          <HeroCTAButton />
        </div>
      </div>

      <div 
        className="home-content-background"
        style={{ 
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ 
          padding: '0 clamp(8px, 1vw, 12px) clamp(24px, 6vw, 40px)',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
        {/* Featured Surahs Section */}
        <div style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <div             style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(12px, 3vw, 24px)',
              boxShadow: 'var(--elevation-2)',
              border: '1px solid var(--color-outline)',
            }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'clamp(12px, 2vw, 16px)',
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
                Сураҳои машҳур
              </h2>
              <SectionLink href="/quran">
                <span>ҳама</span>
                <span>→</span>
              </SectionLink>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div 
                className="scrollable-container"
                style={{ 
                  display: 'inline-flex',
                  gap: 'clamp(12px, 2vw, 16px)',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: 'clamp(6px, 1vw, 12px) clamp(8px, 1.5vw, 12px)',
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
        </div>

        {/* Quoted Verses Section */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div             style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(12px, 3vw, 24px)',
              boxShadow: 'var(--elevation-2)',
              border: '1px solid var(--color-outline)',
            }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'clamp(12px, 2vw, 16px)',
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
                Иқтибосҳо аз Қуръон
              </h2>
              <SectionLink href="/quoted-verses">
                <span>ҳама</span>
                <span>→</span>
              </SectionLink>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div 
                className="scrollable-container"
                style={{ 
                  display: 'inline-flex',
                  gap: 'clamp(12px, 2vw, 16px)',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: 'clamp(6px, 1vw, 12px) clamp(8px, 1.5vw, 12px)',
                  maxWidth: '100%',
                }}
              >
                {displayQuotedVerses.length > 0 ? displayQuotedVerses.map((verse, index) => (
                  <HoverableCard
                    key={index}
                    href={`/quoted-verses?ref=${encodeURIComponent(verse.ref)}`}
                    className="scrollable-container"
                  >
                    <div style={{
                      fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                      lineHeight: '1.5',
                      textAlign: 'center',
                      marginBottom: 'clamp(8px, 2vw, 12px)',
                      flex: 1,
                      color: 'var(--color-text-primary)',
                    }}>
                      «{verse.tajik}»
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '10px',
                      color: 'var(--color-primary)',
                      fontWeight: 'bold',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--color-outline-variant)',
                    }}>
                      <span>{verse.ref}</span>
                      <span>→</span>
                    </div>
                  </HoverableCard>
                )) : (
                  <div style={{ 
                    padding: 'clamp(16px, 4vw, 24px)', 
                    color: 'var(--color-text-secondary)', 
                    fontSize: '0.875rem', 
                    minWidth: 'min(280px, 100%)',
                    textAlign: 'center',
                  }}>
                    Иқтибосҳо боргирӣ карда намешаванд...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prayer Times Section */}
        <PrayerTimesSection />

        {/* YouTube Videos Section */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div             style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(12px, 3vw, 24px)',
              boxShadow: 'var(--elevation-2)',
              border: '1px solid var(--color-outline)',
            }}>
            <YouTubeVideosSection />
          </div>
        </div>

        {/* Featured Prophets Section */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div             style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(12px, 3vw, 24px)',
              boxShadow: 'var(--elevation-2)',
              border: '1px solid var(--color-outline)',
            }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'clamp(12px, 2vw, 16px)',
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
                Паёмбарон дар Қуръон
              </h2>
              <SectionLink href="/prophets">
                <span>ҳама</span>
                <span>→</span>
              </SectionLink>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div 
                className="scrollable-container"
                style={{ 
                  display: 'inline-flex',
                  gap: 'clamp(12px, 2vw, 16px)',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: 'clamp(6px, 1vw, 12px) clamp(8px, 1.5vw, 12px)',
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
        </div>

        {/* Duas Section */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div             style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(12px, 3vw, 24px)',
              boxShadow: 'var(--elevation-2)',
              border: '1px solid var(--color-outline)',
            }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'clamp(12px, 2vw, 16px)',
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
                Дуоҳо
              </h2>
              <SectionLink href="/duas">
                <span>ҳама</span>
                <span>→</span>
              </SectionLink>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div 
                className="scrollable-container"
                style={{ 
                  display: 'inline-flex',
                  gap: 'clamp(12px, 2vw, 16px)',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: 'clamp(6px, 1vw, 12px) clamp(8px, 1.5vw, 12px)',
                  maxWidth: '100%',
                }}
              >
              {displayDuas.map((dua, index) => (
                <HoverableCard
                  key={index}
                  href={`/duas/rabbano?surah=${dua.surah}&verse=${dua.verse}`}
                  className="scrollable-container"
                  minWidth="clamp(240px, 40vw, 300px)"
                  maxWidth="clamp(240px, 40vw, 300px)"
                >
                  <div style={{
                    fontSize: 'clamp(24px, 5vw, 32px)',
                    textAlign: 'center',
                    marginBottom: 'clamp(6px, 1vw, 8px)',
                  }}>
                    🕌
                  </div>
                  <div style={{
                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                    lineHeight: '1.5',
                    textAlign: 'center',
                    marginBottom: 'clamp(8px, 2vw, 12px)',
                    flex: 1,
                    color: 'var(--color-text-primary)',
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
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-outline-variant)',
                  }}>
                    <span>Сураи {dua.surah}:{dua.verse}</span>
                    <span>→</span>
                  </div>
                </HoverableCard>
              ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hadith Section */}
        <HadithSection />

        {/* Live Streams Section */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div             style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(12px, 3vw, 24px)',
              boxShadow: 'var(--elevation-2)',
              border: '1px solid var(--color-outline)',
            }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'clamp(12px, 2vw, 16px)',
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
                Пахшҳои зинда
              </h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div 
                className="scrollable-container"
                style={{ 
                  display: 'inline-flex',
                  gap: 'clamp(12px, 2vw, 16px)',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: 'clamp(6px, 1vw, 12px) clamp(8px, 1.5vw, 12px)',
                  maxWidth: '100%',
                }}
              >
              {liveStreams.map((stream, index) => (
                <HoverableLiveStreamCard
                  key={index}
                  id={stream.id}
                  title={stream.title}
                  description={stream.description}
                  badge={stream.badge}
                />
              ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tasbeeh Section */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div style={{
            padding: 'clamp(12px, 3vw, 24px)',
            border: '1px solid var(--color-outline)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--elevation-2)',
            maxWidth: '100%',
            margin: '0 auto',
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'clamp(12px, 2vw, 16px)',
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
                Зикрҳо
              </h2>
              <SectionLink href="/tasbeeh">
                <span>тасбеҳгӯяк</span>
                <span>→</span>
              </SectionLink>
            </div>
            <div 
              className="scrollable-container"
            style={{ 
              display: 'flex',
              gap: 'clamp(12px, 2vw, 16px)',
              overflowX: 'auto',
              overflowY: 'hidden',
              padding: 'clamp(6px, 1vw, 12px) clamp(8px, 1.5vw, 12px)',
            }}
            >
              {displayTasbeehs.map((tasbeeh, index) => (
                <HoverableTasbeehCard
                  key={index}
                  href={`/tasbeeh?selectedIndex=${index}`}
                  arabic={tasbeeh.arabic}
                  tajikTransliteration={tasbeeh.tajikTransliteration}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div             style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'clamp(12px, 3vw, 24px)',
              boxShadow: 'var(--elevation-2)',
              border: '1px solid var(--color-outline)',
            }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'clamp(12px, 2vw, 16px)',
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
                Галерея
              </h2>
              <SectionLink href="/gallery">
                <span>ҳама</span>
                <span>→</span>
              </SectionLink>
            </div>
            <GallerySection />
          </div>
        </div>

        {/* Asmaul Husna Section */}
        <div style={{ marginBottom: 'clamp(16px, 3vw, 32px)' }}>
          <div style={{
            padding: 'clamp(12px, 3vw, 24px)',
            border: '1px solid var(--color-outline)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--elevation-2)',
            maxWidth: '100%',
            margin: '0 auto',
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'clamp(12px, 2vw, 16px)',
            }}>
              <h2 style={{ 
                fontSize: 'clamp(1.125rem, 4vw, 1.5rem)', 
                fontWeight: 'bold',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
                Асмоул Ҳусно
              </h2>
              <SectionLink href="/asmaul-husna">
                <span>ҳама</span>
                <span>→</span>
              </SectionLink>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <div 
                className="scrollable-container"
                style={{ 
                  display: 'inline-flex',
                  gap: 'clamp(12px, 2vw, 16px)',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  padding: 'clamp(6px, 1vw, 12px) clamp(8px, 1.5vw, 12px)',
                  maxWidth: '100%',
                }}
              >
                {displayAsmaulHusna.map((name, index) => (
                  <HoverableAsmaulHusnaCard
                    key={index}
                    name={name.name}
                    transliteration={name.tajik.transliteration}
                    meaning={name.tajik.meaning}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All Surahs Section */}
        <AllSurahsList surahs={allSurahs} />
        </div>
      </div>
    </div>
  );
}

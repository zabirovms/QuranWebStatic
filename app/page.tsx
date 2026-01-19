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
import HeroCTAButton from '@/components/HeroCTAButton';
import SectionLink from '@/components/SectionLink';
import HoverableCard from '@/components/HoverableCard';
import HoverableTasbeehCard from '@/components/HoverableTasbeehCard';
import HoverableAsmaulHusnaCard from '@/components/HoverableAsmaulHusnaCard';
import HoverableLiveStreamCard from '@/components/HoverableLiveStreamCard';
import PrayerTimesSection from '@/components/PrayerTimesSection';
import HadithSection from '@/components/HadithSection';

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
          background: `linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-variant) 100%)`,
          backgroundImage: `url('/alquran.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: 'var(--color-on-primary)',
          padding: 'clamp(24px, 5vw, 40px) clamp(4px, 1vw, 8px) clamp(16px, 4vw, 24px)',
          boxShadow: 'var(--elevation-2)',
          marginBottom: '40px',
          position: 'relative',
        }}
      >
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
            opacity: 0.85,
            zIndex: 0,
          }} 
        />
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 100,
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
        }}
      >
        <div style={{ 
          padding: '0 clamp(8px, 1vw, 12px) clamp(24px, 6vw, 40px)',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 2,
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

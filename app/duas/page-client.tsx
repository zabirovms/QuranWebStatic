'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowForwardIosIcon } from '@/components/Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { Dua } from '@/lib/types';
import { getSurahName } from '@/lib/utils/surah-names';

interface DuasPageClientProps {
  rabbanoCount: number;
  prophetsCount: number;
  uniqueProphetsCount: number;
  sampleRabbanoDuas: Dua[];
  sampleProphetsDuas: Dua[];
}

export default function DuasPageClient({
  rabbanoCount,
  prophetsCount,
  uniqueProphetsCount,
  sampleRabbanoDuas,
  sampleProphetsDuas,
}: DuasPageClientProps) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Add structured data for SEO
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Remove existing script if any
    if (scriptRef.current && scriptRef.current.isConnected) {
      scriptRef.current.remove();
    }

    const baseUrl = 'https://www.quran.tj';
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${baseUrl}/duas`,
      name: 'Дуоҳои Қуръон',
      description: `Рӯйхати пурраи ${rabbanoCount} дуои Раббано ва ${prophetsCount} дуои паёмбарон аз Қуръони Карим. Хондани дуоҳо бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ.`,
      inLanguage: 'tg',
      about: {
        '@type': 'Thing',
        name: 'Quranic Duas',
      },
      mainEntity: [
        {
          '@type': 'ItemList',
          name: 'Дуоҳои Раббано',
          numberOfItems: rabbanoCount,
          itemListElement: {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'WebPage',
              name: 'Дуоҳои Раббано',
              url: `${baseUrl}/duas/rabbano`,
            },
          },
        },
        {
          '@type': 'ItemList',
          name: 'Дуоҳои Паёмбарон',
          numberOfItems: prophetsCount,
          itemListElement: {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@type': 'WebPage',
              name: 'Дуоҳои Паёмбарон',
              url: `${baseUrl}/duas/prophets`,
            },
          },
        },
      ],
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Асосӣ',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Дуоҳо',
            item: `${baseUrl}/duas`,
          },
        ],
      },
    };

    try {
      if (document.head) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', 'duas');
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
        scriptRef.current = script;
      }
    } catch (error) {
      console.warn('Error adding structured data:', error);
    }

    return () => {
      if (scriptRef.current && scriptRef.current.isConnected) {
        try {
          scriptRef.current.remove();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [rabbanoCount, prophetsCount]);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      {/* Hero Section */}
      <div style={{
        background: `linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-variant) 100%)`,
        color: 'var(--color-on-primary)',
        padding: 'clamp(40px, 8vw, 60px) clamp(16px, 4vw, 20px) clamp(24px, 6vw, 40px)',
        boxShadow: 'var(--elevation-2)',
        marginBottom: 'var(--spacing-2xl)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: 'clamp(24px, 5vw, 36px)',
            fontWeight: '700',
            marginBottom: '8px',
            letterSpacing: '-0.5px',
            margin: 0,
          }}>
            Дуоҳои Қуръон
          </h1>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 18px)',
            opacity: 0.9,
            marginBottom: '24px',
          }}>
            Дуоҳои Раббано ва Паёмбарон аз Қуръони Карим
          </div>
          
          {/* Statistics */}
          <div style={{
            display: 'flex',
            gap: 'clamp(12px, 3vw, 20px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
            }}>
              <strong>{rabbanoCount}</strong> дуои Раббано
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
            }}>
              <strong>{prophetsCount}</strong> дуои паёмбарон
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
            }}>
              <strong>{uniqueProphetsCount}</strong> паёмбар
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main style={{ 
        paddingLeft: 'var(--spacing-lg)',
        paddingRight: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-2xl)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Category Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-xl)',
          marginBottom: 'var(--spacing-2xl)',
          alignItems: 'stretch',
        }}>
          <CategoryCard
            title="Дуоҳои Раббано"
            description="Дуоҳое, ки ба калимаи 'Раббано' оғоз мешаванд. Ин дуоҳо дар Қуръони Карим омадаанд ва барои дуо кардан ва ёд кардан муфиданд."
            icon="📖"
            href="/duas/rabbano"
            count={rabbanoCount}
            sampleDuas={sampleRabbanoDuas}
          />
          
          <CategoryCard
            title="Дуоҳои Паёмбарон"
            description="Дуоҳои паёмбарони Аллоҳ дар Қуръони Карим. Дуоҳои Муҳаммад (с), Иброҳим, Мусо, Исо ва дигар паёмбарон."
            icon="🕌"
            href="/duas/prophets"
            count={prophetsCount}
            sampleDuas={sampleProphetsDuas}
          />
        </div>

        {/* Information Section */}
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-2xl)',
          boxShadow: 'var(--elevation-1)',
          marginTop: 'var(--spacing-2xl)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-lg)',
            textAlign: 'center',
          }}>
            Дар бораи дуоҳои Қуръон
          </h2>
          <div style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-relaxed)',
            textAlign: 'center',
          }}>
            <p style={{ marginBottom: 'var(--spacing-md)' }}>
              Қуръони Карим дорои дуоҳои зиёдест, ки барои муъминон роҳнамоӣ ва ибодат мебошанд. 
              Ин дуоҳо ба ду гурӯҳ тақсим мешаванд:
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 auto var(--spacing-md)',
              maxWidth: '600px',
            }}>
              <li style={{ 
                marginBottom: 'var(--spacing-sm)',
                textAlign: 'center',
              }}>
                <strong>Дуоҳои Раббано:</strong> Дуоҳое, ки ба калимаи "Раббано" (Эй Парвардигори мо) оғоз мешаванд
              </li>
              <li style={{ 
                marginBottom: 'var(--spacing-sm)',
                textAlign: 'center',
              }}>
                <strong>Дуоҳои Паёмбарон:</strong> Дуоҳои паёмбарони Аллоҳ, ки дар Қуръон зикр шудаанд
              </li>
            </ul>
            <p>
              Ҳамаи ин дуоҳо бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ дар дастрасанд.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// Enhanced Category Card Component
function CategoryCard({
  title,
  description,
  icon,
  href,
  count,
  sampleDuas,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  count: number;
  sampleDuas: Dua[];
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: 'var(--spacing-2xl)',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--color-surface)',
          boxShadow: 'var(--elevation-2)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid var(--color-outline)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--elevation-4)';
          e.currentTarget.style.borderColor = 'var(--color-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--elevation-2)';
          e.currentTarget.style.borderColor = 'var(--color-outline)';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          {/* Icon Container */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--color-primary-container-low-opacity)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          {/* Title and Count */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-primary)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              {count} дуо
            </div>
          </div>

          {/* Arrow */}
          <ArrowForwardIosIcon
            size={24}
            color="var(--color-primary)"
          />
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-lg)',
            lineHeight: 'var(--line-height-relaxed)',
          }}
        >
          {description}
        </div>

        {/* Sample Duas Preview */}
        {sampleDuas.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--color-outline-variant)',
            paddingTop: 'var(--spacing-lg)',
            marginTop: 'auto',
          }}>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-md)',
            }}>
              Намунаҳо:
            </div>
            {sampleDuas.map((dua, index) => (
              <div
                key={`${dua.surah}-${dua.verse}-${index}`}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm)',
                  background: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-sm)',
                  lineHeight: 'var(--line-height-normal)',
                }}
              >
                <div style={{
                  direction: 'rtl',
                  textAlign: 'right',
                  fontFamily: 'Amiri, serif',
                  fontSize: 'var(--font-size-base)',
                  marginBottom: '4px',
                  color: 'var(--color-text-primary)',
                }}>
                  {dua.arabic}
                </div>
                {dua.transliteration && (
                  <div style={{
                    direction: 'ltr',
                    textAlign: 'left',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    fontStyle: 'italic',
                    marginBottom: '4px',
                  }}>
                    {dua.transliteration}
                  </div>
                )}
                <div style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {getSurahName(dua.surah)} {dua.surah}:{dua.verse}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

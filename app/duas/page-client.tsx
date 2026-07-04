'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowForwardIosIcon } from '@/components/Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';

interface CategoryItem {
  slug: string;
  title: string;
  description: string;
  icon: string;
  count: number;
  accentIndex: number;
  customRoute?: string;
}

interface DuasPageClientProps {
  categories: CategoryItem[];
  rabbanoCount: number;
  prophetsCount: number;
  uniqueProphetsCount: number;
}

// Map accent index to color palette for premium styled cards
function getAccentColor(index: number): string {
  const colors = [
    'var(--color-primary)',      // 0: Blue/Primary
    'var(--color-tertiary)',     // 1: Purple/Tertiary
    'var(--color-secondary)',    // 2: Orange/Secondary
    '#2E8B57',                   // 3: Sea Green
    '#008080',                   // 4: Teal
    '#B8860B',                   // 5: Dark Gold
  ];
  return colors[index % colors.length];
}

export default function DuasPageClient({
  categories,
  rabbanoCount,
  prophetsCount,
  uniqueProphetsCount,
}: DuasPageClientProps) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Add structured data for SEO (CollectionPage containing all category subpages)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (scriptRef.current && scriptRef.current.isConnected) {
      scriptRef.current.remove();
    }

    const baseUrl = 'https://www.quran.tj';
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${baseUrl}/duas`,
      name: 'Дуо ва зикрҳо',
      description: 'Маҷмӯаи мукаммали дуоҳои Қуръон, дуоҳои набавӣ ва зикрҳои субҳу шом бо тарҷума ва тафсири тоҷикӣ.',
      inLanguage: 'tg',
      mainEntity: categories.map((cat, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebPage',
          name: cat.title,
          url: `${baseUrl}${cat.customRoute || `/duas/${cat.slug}`}`,
        }
      })),
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
        script.setAttribute('data-seo', 'duas-list');
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
        } catch (_) {}
      }
    };
  }, [categories]);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      {/* Hero Header Banner */}
      <div style={{
        background: `linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-variant) 100%)`,
        color: 'var(--color-on-primary)',
        padding: 'clamp(40px, 8vw, 60px) clamp(16px, 4vw, 20px) clamp(24px, 6vw, 40px)',
        boxShadow: 'var(--elevation-2)',
        marginBottom: '2rem',
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
            Дуо ва зикрҳо
          </h1>
          <div style={{
            fontSize: 'clamp(14px, 3vw, 17px)',
            opacity: 0.95,
            marginBottom: '24px',
          }}>
            Одоби дуо, дуоҳои Қуръониву набавӣ ва зикрҳои рӯзона бо забони тоҷикӣ
          </div>
          
          {/* Statistics summary */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: '500',
            }}>
              <strong>{rabbanoCount}</strong> дуои Раббано
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: '500',
            }}>
              <strong>{prophetsCount}</strong> дуои набавӣ
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: '500',
            }}>
              <strong>{uniqueProphetsCount}</strong> паёмбар
            </div>
          </div>
        </div>
      </div>

      {/* Main List Grid */}
      <main style={{ 
        paddingLeft: 'var(--spacing-lg)',
        paddingRight: 'var(--spacing-lg)',
        paddingBottom: '3rem',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          color: 'var(--color-primary)',
          fontWeight: 'bold',
          marginBottom: '1.25rem',
        }}>
          Феҳристи дуоҳо
        </h2>

        {/* 9 Categories Color-Coded Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '3rem',
        }}>
          {categories.map((category) => {
            const accent = getAccentColor(category.accentIndex);
            return (
              <Link
                key={category.slug}
                href={category.customRoute || `/duas/${category.slug}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '22px',
                    padding: '16px 14px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--elevation-1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--elevation-3)';
                    e.currentTarget.style.borderColor = accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--elevation-1)';
                    e.currentTarget.style.borderColor = 'var(--color-outline)';
                  }}
                >
                  {/* Category Card Inner Content */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      {/* Left Accent indicator stripe */}
                      <div
                        style={{
                          width: '4px',
                          height: '42px',
                          borderRadius: '4px',
                          backgroundColor: accent,
                        }}
                      />

                      {/* Icon container */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          backgroundColor: `${accent}1F`, // 12% opacity
                          border: `1px solid ${accent}4D`, // 30% opacity
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '22px',
                        }}
                      >
                        {category.icon}
                      </div>

                      {/* Title & Count Badge */}
                      <div style={{ flex: 1 }}>
                        <h3
                          style={{
                            fontSize: '15px',
                            fontWeight: 'bold',
                            color: 'var(--color-text-primary)',
                            margin: '0 0 3px 0',
                            lineHeight: '1.2',
                          }}
                        >
                          {category.title}
                        </h3>
                        
                        {/* Count Badge */}
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: `${accent}1A`, // 10% opacity
                            border: `1px solid ${accent}33`, // 20% opacity
                            borderRadius: '12px',
                            padding: '1px 8px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: accent,
                          }}
                        >
                          {category.count} дуо
                        </span>
                      </div>
                      
                      <ArrowForwardIosIcon size={14} color={accent} />
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: '1.5',
                        margin: 0,
                      }}
                    >
                      {category.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Informative text below grid */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          border: '1px solid var(--color-outline)',
          boxShadow: 'var(--elevation-1)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'bold',
            color: 'var(--color-text-primary)',
            marginBottom: '0.75rem',
            textAlign: 'center',
          }}>
            Дуо ва зикрҳои шаръӣ
          </h2>
          <p style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            textAlign: 'center',
            margin: 0,
          }}>
            Ҳамаи дуоҳо ва зикрҳои пешниҳодшуда аз сарчашмаҳои муътамади исломӣ (оятҳои Қуръон ва ҳадисҳои саҳеҳ) ҷамъоварӣ шуда, дорои матни арабӣ, транскрипсия, тарҷумаи тоҷикӣ ва дар аксари зикрҳо дорои қироати аудиоӣ мебошанд.
          </p>
        </div>
      </main>
    </div>
  );
}

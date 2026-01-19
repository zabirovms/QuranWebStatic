'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { SchoolIcon, RecordVoiceOverIcon, PercentIcon, BookIcon, ArrowForwardIosIcon } from '@/components/Icons';

export default function LearnWordsPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return true; // Default to mobile on SSR
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const iconSize = isMobile ? 24 : 32;
  const arrowSize = isMobile ? 14 : 16;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      <main style={{
        padding: `clamp(12px, 3vw, var(--spacing-lg)) clamp(8px, 2vw, 4px)`,
        paddingTop: isTopBarVisible ? 'clamp(56px, 8vw, calc(56px + var(--spacing-md)))' : 'clamp(12px, 3vw, var(--spacing-md))',
        maxWidth: '900px',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Menu Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(12px, 3vw, var(--spacing-lg))',
        }}>
          {/* Қоидаи Бағдодӣ */}
          <Link
            href="/qaida"
            className="card"
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: '12px',
              boxShadow: 'var(--elevation-2)',
            }}
          >
            <div style={{
              padding: 'clamp(12px, 3vw, 20px)',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(12px, 3vw, var(--spacing-lg))',
            }}>
              <div style={{
                padding: 'clamp(8px, 2vw, 12px)',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <SchoolIcon size={iconSize} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'clamp(4px, 1vw, var(--spacing-sm))',
                  gap: '8px',
                }}>
                  <h3 style={{
                    fontSize: 'clamp(1rem, 4vw, var(--font-size-xl))',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: '1.3',
                  }}>
                    Қоидаи Бағдодӣ
                  </h3>
                </div>
                <p style={{
                  fontSize: 'clamp(0.875rem, 3vw, var(--font-size-base))',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  Омӯхтани хондани Қуръон аз сифр (алифбо) то сураҳо
                </p>
              </div>
              <ArrowForwardIosIcon size={arrowSize} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
            </div>
          </Link>

          {/* Таҷвид - Coming Soon */}
          <div
            className="card"
            style={{
              borderRadius: '12px',
              boxShadow: 'var(--elevation-2)',
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
          >
            <div style={{
              padding: 'clamp(12px, 3vw, 20px)',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(12px, 3vw, var(--spacing-lg))',
            }}>
              <div style={{
                padding: 'clamp(8px, 2vw, 12px)',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <RecordVoiceOverIcon size={iconSize} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'clamp(4px, 1vw, var(--spacing-sm))',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}>
                  <h3 style={{
                    fontSize: 'clamp(1rem, 4vw, var(--font-size-xl))',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: '1.3',
                  }}>
                    Таҷвид
                  </h3>
                  <div style={{
                    padding: 'clamp(3px, 1vw, 4px) clamp(6px, 1.5vw, 8px)',
                    backgroundColor: 'var(--color-secondary)',
                    opacity: 0.2,
                    borderRadius: '8px',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 'clamp(0.7rem, 2vw, var(--font-size-xs))',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-secondary)',
                    }}>
                      Ба наздикӣ
                    </span>
                  </div>
                </div>
                <p style={{
                  fontSize: 'clamp(0.875rem, 3vw, var(--font-size-base))',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  Қоидаҳои асосии талаффуз барои дуруст хондан ва қироат кардани Қуръон
                </p>
              </div>
            </div>
          </div>

          {/* 85% калимаҳои Қуръон */}
          <Link
            href="/vocabulary"
            className="card"
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: '12px',
              boxShadow: 'var(--elevation-2)',
            }}
          >
            <div style={{
              padding: 'clamp(12px, 3vw, 20px)',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(12px, 3vw, var(--spacing-lg))',
            }}>
              <div style={{
                padding: 'clamp(8px, 2vw, 12px)',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <PercentIcon size={iconSize} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'clamp(4px, 1vw, var(--spacing-sm))',
                  gap: '8px',
                }}>
                  <h3 style={{
                    fontSize: 'clamp(1rem, 4vw, var(--font-size-xl))',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: '1.3',
                  }}>
                    85% калимаҳои Қуръон
                  </h3>
                </div>
                <p style={{
                  fontSize: 'clamp(0.875rem, 3vw, var(--font-size-base))',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  Бо омӯхтани ҳудудан 750 калимаи асосӣ, шумо метавонед зиёда аз 85%-и Қуръонро бифаҳмед.
                </p>
              </div>
              <ArrowForwardIosIcon size={arrowSize} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
            </div>
          </Link>

          {/* Омӯзиши калимаҳо */}
          <div
            className="card"
            style={{
              borderRadius: '12px',
              boxShadow: 'var(--elevation-2)',
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
          >
            <div style={{
              padding: 'clamp(12px, 3vw, 20px)',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(12px, 3vw, var(--spacing-lg))',
            }}>
              <div style={{
                padding: 'clamp(8px, 2vw, 12px)',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <BookIcon size={iconSize} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'clamp(4px, 1vw, var(--spacing-sm))',
                  gap: '8px',
                }}>
                  <h3 style={{
                    fontSize: 'clamp(1rem, 4vw, var(--font-size-xl))',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: '1.3',
                  }}>
                    Омӯзиши калимаҳо
                  </h3>
                </div>
                <p style={{
                  fontSize: 'clamp(0.875rem, 3vw, var(--font-size-base))',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  Омӯзиши калимаҳои Қуръон аз сураҳои интихобшуда
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

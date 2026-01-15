'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { SchoolIcon, RecordVoiceOverIcon, PercentIcon, BookIcon, ArrowForwardIosIcon } from '@/components/Icons';

export default function LearnWordsPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      <main style={{
        padding: 'var(--spacing-lg) 4px',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Menu Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
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
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-lg)',
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <SchoolIcon size={32} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}>
                    Қоидаи Бағдодӣ
                  </h3>
                </div>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  Омӯхтани хондани Қуръон аз сифр (алифбо) то сураҳо
                </p>
              </div>
              <ArrowForwardIosIcon size={16} color="var(--color-text-secondary)" />
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
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-lg)',
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <RecordVoiceOverIcon size={32} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}>
                    Таҷвид
                  </h3>
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--color-secondary)',
                    opacity: 0.2,
                    borderRadius: '8px',
                  }}>
                    <span style={{
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-secondary)',
                    }}>
                      Ба наздикӣ
                    </span>
                  </div>
                </div>
                <p style={{
                  fontSize: 'var(--font-size-base)',
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
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-lg)',
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PercentIcon size={32} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}>
                    85% калимаҳои Қуръон
                  </h3>
                </div>
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: '1.5',
                }}>
                  Бо омӯхтани ҳудудан 750 калимаи асосӣ, шумо метавонед зиёда аз 85%-и Қуръонро бифаҳмед.
                </p>
              </div>
              <ArrowForwardIosIcon size={16} color="var(--color-text-secondary)" />
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
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-lg)',
            }}>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BookIcon size={32} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-sm)',
                }}>
                  <h3 style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}>
                    Омӯзиши калимаҳо
                  </h3>
                </div>
                <p style={{
                  fontSize: 'var(--font-size-base)',
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

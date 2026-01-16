'use client';

import Link from 'next/link';
import { Surah } from '@/lib/types';

interface AllSurahsListProps {
  surahs: Surah[];
}

export default function AllSurahsList({ surahs }: AllSurahsListProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
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
          Ҳамаи Сураҳо
        </h2>
      </div>
      <div className="surahs-grid">
        {surahs.map((surah) => (
          <Link
            key={surah.number}
            href={`/surah/${surah.number}`}
            style={{
              display: 'block',
              padding: '16px',
              border: '1px solid var(--color-outline)',
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
              color: 'inherit',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--elevation-1)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--elevation-4)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--elevation-1)';
              e.currentTarget.style.borderColor = 'var(--color-outline)';
              e.currentTarget.style.backgroundColor = 'var(--color-surface)';
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
                    if (!target || !target.parentElement) return;
                    target.style.display = 'none';
                    const parent = target.parentElement;
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
    </div>
  );
}

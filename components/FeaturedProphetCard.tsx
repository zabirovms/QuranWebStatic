'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FeaturedProphetCardProps {
  prophet: {
    name: string;
    nameArabic?: string;
  };
}

export default function FeaturedProphetCard({ prophet }: FeaturedProphetCardProps) {
  const [imageError, setImageError] = useState(false);

  const getProphetSvgPath = (name: string) => {
    if (name.includes('Муҳаммад') || name.includes('Muhammad')) {
      return '/images/Prophet_Muhammad_SAW.svg';
    } else if (name.includes('Иброҳим') || name.includes('Ibrahim') || name.includes('Abraham')) {
      return '/images/Prophet_Ibrahim_A.svg';
    } else if (name.includes('Мусо') || name.includes('Musa') || name.includes('Moses')) {
      return '/images/Prophet_Musa_A.svg';
    } else if (name.includes('Исо') || name.includes('Isa') || name.includes('Jesus')) {
      return '/images/Prophet_Isa_A.svg';
    } else if (name.includes('Нӯҳ') || name.includes('Nooh') || name.includes('Nuh') || name.includes('Нуҳ')) {
      return '/images/Prophet_Nooh_A.svg';
    } else if (name.includes('Юсуф') || name.includes('Yusuf') || name.includes('Joseph')) {
      return '/images/Prophet_Yusuf_A.svg';
    } else if (name.includes('Довуд') || name.includes('Dawood') || name.includes('David')) {
      return '/images/Prophet_Dawood_A.svg';
    } else if (name.includes('Сулаймон') || name.includes('Sulayman') || name.includes('Solomon')) {
      return '/images/Prophet_Sulayman_A.svg';
    }
    return null;
  };

  const getProphetColor = (name: string) => {
    if (name.includes('Муҳаммад') || name.includes('Muhammad')) {
      return '#003366'; // Dark blue
    } else if (name.includes('Иброҳим') || name.includes('Ibrahim') || name.includes('Abraham')) {
      return '#17320B'; // Dark green
    } else if (name.includes('Мусо') || name.includes('Musa') || name.includes('Moses')) {
      return '#5CA3FF'; // Light blue
    } else if (name.includes('Исо') || name.includes('Isa') || name.includes('Jesus')) {
      return '#10BB82'; // Teal/green
    } else if (name.includes('Нӯҳ') || name.includes('Nooh') || name.includes('Nuh') || name.includes('Нуҳ')) {
      return '#4B961A'; // Green
    } else if (name.includes('Юсуф') || name.includes('Yusuf') || name.includes('Joseph')) {
      return '#401268'; // Dark purple
    } else if (name.includes('Довуд') || name.includes('Dawood') || name.includes('David')) {
      return '#FF66C4'; // Pink
    } else if (name.includes('Сулаймон') || name.includes('Sulayman') || name.includes('Solomon')) {
      return '#FFD21F'; // Yellow
    }
    return 'var(--color-primary)'; // Default
  };

  const svgPath = getProphetSvgPath(prophet.name);
  const prophetColor = getProphetColor(prophet.name);
  const borderColor = `${prophetColor}66`; // 40% opacity

  if (!svgPath) return null;

  return (
    <Link
      href={`/prophets?prophet=${encodeURIComponent(prophet.name)}`}
      className="card card-elevation-2 surah-card"
      style={{
        display: 'block',
        minWidth: '160px',
        height: '120px',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        textDecoration: 'none',
        color: 'inherit',
        padding: 0,
        overflow: 'hidden',
        boxShadow: 'var(--elevation-1)',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--elevation-4)';
        e.currentTarget.style.borderColor = prophetColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--elevation-1)';
        e.currentTarget.style.borderColor = borderColor;
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {!imageError ? (
          <img
            src={svgPath}
            alt={prophet.name}
            className="surah-name-svg"
            style={{
              width: '160px',
              height: '120px',
              objectFit: 'contain',
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            fontSize: '0.9rem',
            fontWeight: '500',
            padding: '12px',
            textAlign: 'center',
          }}>
            <div>{prophet.name}</div>
            {prophet.nameArabic && (
              <div style={{
                fontSize: '1rem',
                fontFamily: 'serif',
                direction: 'rtl',
                color: 'var(--color-primary)',
                marginTop: '4px',
              }}>
                {prophet.nameArabic}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}



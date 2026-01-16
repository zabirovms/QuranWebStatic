'use client';

import Link from 'next/link';

interface HoverableLiveStreamCardProps {
  id: string;
  title: string;
  description?: string;
  badge?: string;
}

export default function HoverableLiveStreamCard({ 
  id, 
  title, 
  description, 
  badge 
}: HoverableLiveStreamCardProps) {
  return (
    <Link
      href={`/live/${id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '280px',
        maxWidth: '280px',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        color: 'inherit',
        background: `linear-gradient(135deg, rgba(46, 125, 50, 0.95), rgba(46, 125, 50, 0.7))`,
        padding: '24px',
        position: 'relative',
        overflowY: 'auto',
        maxHeight: '220px',
        boxShadow: 'var(--elevation-2)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--elevation-4)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--elevation-2)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'auto',
      }}>
        <div style={{
          padding: '6px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#ff5252',
            boxShadow: '0 0 8px rgba(255, 82, 82, 0.6)',
          }} />
          <span style={{
            fontSize: '0.75rem',
            color: '#fff',
            letterSpacing: '0.5px',
            fontWeight: '600',
          }}>
            {badge || 'LIVE'}
          </span>
        </div>
        <div style={{ fontSize: '28px', color: '#fff' }}>▶</div>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#fff',
          margin: '0 0 8px 0',
          lineHeight: '1.3',
        }}>
          {title}
        </h3>
        {description && (
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 12px 0',
            lineHeight: '1.4',
          }}>
            {description}
          </p>
        )}
        <div style={{
          padding: '10px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 'var(--radius-md)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
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
  );
}

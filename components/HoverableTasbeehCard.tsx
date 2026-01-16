'use client';

import Link from 'next/link';

interface HoverableTasbeehCardProps {
  href: string;
  arabic: string;
  tajikTransliteration: string;
}

export default function HoverableTasbeehCard({ 
  href, 
  arabic, 
  tajikTransliteration 
}: HoverableTasbeehCardProps) {
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '160px',
        maxWidth: '160px',
        padding: '20px',
        border: '1px solid var(--color-outline)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        color: 'inherit',
        background: 'var(--color-surface)',
        overflowY: 'auto',
        maxHeight: '140px',
        boxShadow: 'var(--elevation-1)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--elevation-4)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--elevation-1)';
        e.currentTarget.style.borderColor = 'var(--color-outline)';
      }}
    >
      <div style={{
        fontSize: '20px',
        fontFamily: 'serif',
        textAlign: 'center',
        marginBottom: '8px',
        direction: 'rtl',
        color: 'var(--color-primary)',
      }}>
        <span lang="ar">{arabic}</span>
      </div>
      <div style={{
        fontSize: '12px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontWeight: '500',
      }}>
        {tajikTransliteration}
      </div>
    </Link>
  );
}

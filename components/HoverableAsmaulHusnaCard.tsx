'use client';

import Link from 'next/link';

interface HoverableAsmaulHusnaCardProps {
  name: string;
  transliteration: string;
  meaning: string;
}

export default function HoverableAsmaulHusnaCard({ 
  name, 
  transliteration, 
  meaning 
}: HoverableAsmaulHusnaCardProps) {
  return (
    <Link
      href="/asmaul-husna"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: '180px',
        maxWidth: '180px',
        padding: '20px',
        border: '1px solid var(--color-outline)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        color: 'inherit',
        background: 'var(--color-surface)',
        overflowY: 'auto',
        maxHeight: '160px',
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
        fontSize: '22px',
        fontFamily: 'serif',
        textAlign: 'center',
        marginBottom: '8px',
        direction: 'rtl',
        fontWeight: 'bold',
        color: 'var(--color-primary)',
      }}>
        {name}
      </div>
      <div style={{
        fontSize: '12px',
        textAlign: 'center',
        color: 'var(--color-primary)',
        fontWeight: '600',
        marginBottom: '6px',
      }}>
        {transliteration}
      </div>
      <div style={{
        fontSize: '11px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.4',
      }}>
        {meaning}
      </div>
    </Link>
  );
}

'use client';

import Link from 'next/link';

export default function HeroCTAButton() {
  return (
    <Link 
      href="/quran"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px 32px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: 'var(--color-on-primary)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        fontSize: 'var(--font-size-lg)',
        fontWeight: 'var(--font-weight-semibold)',
        border: '2px solid rgba(255,255,255,0.3)',
        transition: 'all 0.2s ease',
        backdropFilter: 'blur(10px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      Ба Сураҳо
    </Link>
  );
}

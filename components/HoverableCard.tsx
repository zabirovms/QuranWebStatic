'use client';

import Link from 'next/link';

interface HoverableCardProps {
  href: string;
  children: React.ReactNode;
  minWidth?: string;
  maxWidth?: string;
  className?: string;
}

export default function HoverableCard({ 
  href, 
  children, 
  minWidth = 'min(280px, 100%)',
  maxWidth = 'min(280px, 100%)',
  className = ''
}: HoverableCardProps) {
  return (
    <Link
      href={href}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth,
        maxWidth,
        padding: 'clamp(12px, 3vw, 24px)',
        border: '1px solid var(--color-outline)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        color: 'inherit',
        background: 'var(--color-surface)',
        overflowY: 'auto',
        maxHeight: 'clamp(160px, 25vw, 200px)',
        boxShadow: 'var(--elevation-1)',
        transition: 'all 0.2s ease',
        position: 'relative',
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
      {children}
    </Link>
  );
}

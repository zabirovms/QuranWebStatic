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
      className={`hoverable-card ${className}`}
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
        position: 'relative',
      }}
    >
      {children}
    </Link>
  );
}

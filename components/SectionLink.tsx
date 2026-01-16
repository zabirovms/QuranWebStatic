'use client';

import Link from 'next/link';

interface SectionLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function SectionLink({ href, children }: SectionLinkProps) {
  return (
    <Link 
      href={href} 
      style={{ 
        color: 'var(--color-primary)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-semibold)',
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      {children}
    </Link>
  );
}

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
      className="section-link"
      style={{ 
        color: 'var(--color-primary)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-semibold)',
      }}
    >
      {children}
    </Link>
  );
}

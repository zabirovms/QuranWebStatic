'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowBackIcon, ArrowForwardIosIcon } from '@/components/Icons';
import { useTopBar } from '@/lib/contexts/TopBarContext';

export default function DuasMenuPage() {
  const router = useRouter();
  const { isVisible: isTopBarVisible } = useTopBar();

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      {/* Content */}
      <main style={{ 
        paddingLeft: 'var(--spacing-lg)',
        paddingRight: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-lg)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <CategoryCard
          title="Дуоҳои Раббано"
          description="Дуоҳое, ки ба раббано оғоз мешаванд"
          icon="📖"
          href="/duas/rabbano"
        />
        <div style={{ height: 'var(--spacing-md)' }} />
        <CategoryCard
          title="Дуоҳои Паёбарон"
          description="Дуоҳои паёмбарон дар Қуръон"
          icon="🕌"
          href="/duas/prophets"
        />
      </main>

    </div>
  );
}

// Category Card Component
function CategoryCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: 'var(--radius-xl)',
          background: `linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(74, 144, 226, 0.05) 100%)`,
          boxShadow: 'var(--elevation-2)',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
          {/* Icon Container */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(74, 144, 226, 0.1)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: '4px',
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 'var(--font-size-md)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {description}
            </div>
          </div>

          {/* Arrow */}
          <ArrowForwardIosIcon
            size={20}
            color="var(--color-text-secondary)"
          />
        </div>
      </div>
    </Link>
  );
}

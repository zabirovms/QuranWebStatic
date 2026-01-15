'use client';

import { useTopBar } from '@/lib/contexts/TopBarContext';
import { farziAynContent } from './content';

/**
 * Client wrapper for TopBar visibility
 * The actual content is static and SEO-friendly
 */
export default function FarziAynPageWrapper() {
  const { isVisible: isTopBarVisible } = useTopBar();

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--color-background)',
    }}>
      <main style={{
        padding: 'var(--spacing-lg)',
        paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: '"Palatino Linotype", serif',
        fontSize: '14pt',
        lineHeight: '200%',
        color: 'var(--color-text-primary)',
      }}>
        <div 
          style={{ direction: 'ltr', textAlign: 'left' }}
          dangerouslySetInnerHTML={{ __html: farziAynContent }}
        />
      </main>
    </div>
  );
}

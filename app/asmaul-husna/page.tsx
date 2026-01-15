'use client';

import { useEffect, useState } from 'react';
import { getAllAsmaulHusna } from '@/lib/data/asmaul-husna-data-client';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { AsmaulHusna } from '@/lib/data/asmaul-husna-data-client';

export default function AsmaulHusnaPage() {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [names, setNames] = useState<AsmaulHusna[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllAsmaulHusna();
        setNames(data);
      } catch (error) {
        console.error('Error loading Asmaul Husna:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div>Боргирӣ...</div>
      </div>
    );
  }

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
      }}>
        <h1 style={{ 
          fontSize: 'var(--font-size-2xl)', 
          fontWeight: 'var(--font-weight-bold)',
          marginBottom: 'var(--spacing-xl)',
          color: 'var(--color-text-primary)',
        }}>
          Асмоул Ҳусно
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 'var(--spacing-md)',
        }}>
          {names.map((name, index) => (
            <div
              key={index}
              style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-outline)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                boxShadow: 'var(--elevation-1)',
              }}
            >
              <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                borderRadius: '20px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--spacing-sm)',
              }}>
                {name.number}
              </div>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontFamily: 'serif',
                direction: 'rtl',
                fontWeight: 'var(--font-weight-bold)',
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--color-text-primary)',
              }}>
                {name.name}
              </div>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                marginBottom: '4px',
              }}>
                {name.tajik.transliteration}
              </div>
              <div style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
              }}>
                {name.tajik.meaning}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}



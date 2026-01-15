'use client';

import { useState } from 'react';

interface TafsirProps {
  tafsir: string;
  defaultExpanded?: boolean;
}

export default function Tafsir({ tafsir, defaultExpanded = false }: TafsirProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!tafsir) return null;

  return (
    <div style={{
      marginTop: '0.75rem',
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px 8px',
          cursor: 'pointer',
          color: 'var(--color-primary)',
          fontSize: '0.75rem',
          fontWeight: '600',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>{isExpanded ? '▼' : '▶'}</span>
        <span>тафсир</span>
      </button>
      
      {isExpanded && (
        <div style={{
          marginTop: '8px',
          padding: '12px',
          backgroundColor: 'var(--color-primary-container-low-opacity)',
          borderRadius: '8px',
          borderLeft: '3px solid var(--color-primary)',
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: 'var(--color-primary)',
            marginBottom: '6px',
          }}>
            Тафсир:
          </div>
          <div style={{
            fontSize: '0.875rem',
            lineHeight: '1.6',
            color: 'var(--color-text-primary)',
          }}>
            {tafsir}
          </div>
        </div>
      )}
    </div>
  );
}


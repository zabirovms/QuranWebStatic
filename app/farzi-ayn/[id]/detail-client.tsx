'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { FarziAynSection } from '@/lib/types/farzi-ayn';
import FarziAynBlockRenderer from '@/components/FarziAynBlockRenderer';

interface DetailPageClientProps {
  section: FarziAynSection;
  previousSection: FarziAynSection | null;
  nextSection: FarziAynSection | null;
  currentIndex: number;
  totalSections: number;
  catColor: string;
  catName: string;
}

export default function DetailPageClient({
  section,
  previousSection,
  nextSection,
  currentIndex,
  totalSections,
  catColor,
  catName,
}: DetailPageClientProps) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [fontSize, setFontSize] = useState(18); // Default font size from mobile app

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        style={{
          flex: 1,
          padding: 'var(--spacing-lg)',
          paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
          paddingBottom: '80px', // Extra padding for the bottom navigator
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Back navigation & font controller row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <Link
            href="/farzi-ayn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--font-size-base)',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>←</span> Бозгашт
          </Link>

          {/* Inline Font Size Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-outline)',
              borderRadius: '20px',
              padding: '2px 8px',
              boxShadow: 'var(--elevation-1)',
            }}
          >
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              disabled={fontSize <= 14}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                padding: '6px 10px',
                fontSize: '1rem',
                color: 'var(--color-primary)',
                opacity: fontSize <= 14 ? 0.3 : 1,
              }}
              title="Кам кардани андозаи ҳуруф"
            >
              A-
            </button>
            <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '0 4px', color: 'var(--color-text-secondary)' }}>
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(Math.min(30, fontSize + 2))}
              disabled={fontSize >= 30}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                padding: '6px 10px',
                fontSize: '1rem',
                color: 'var(--color-primary)',
                opacity: fontSize >= 30 ? 0.3 : 1,
              }}
              title="Зиёд кардани андозаи ҳуруф"
            >
              A+
            </button>
          </div>
        </div>

        {/* Section Header */}
        <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-outline)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: catColor,
                backgroundColor: `${catColor}1f`,
                padding: '3px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {catName}
            </span>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Мавзӯи {currentIndex + 1}
            </span>
          </div>
          
          <h1
            className="headline-large"
            style={{
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              margin: 0,
              fontSize: '1.75rem',
              lineHeight: '1.3',
            }}
          >
            {section.title}
          </h1>
        </div>

        {/* Render Content Blocks with dynamic font size override */}
        <div style={{ fontSize: `${fontSize}px` }}>
          {section.content.map((block, index) => (
            <FarziAynBlockRenderer key={index} block={block} category={section.category} />
          ))}
        </div>
      </main>

      {/* Floating Bottom Navigator (mimics the mobile app page indicator controls) */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-outline)',
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.05)',
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '12px var(--spacing-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* Previous Button */}
          {previousSection ? (
            <Link
              href={`/farzi-ayn/${previousSection.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                color: 'var(--color-primary)',
                fontWeight: 'bold',
                textDecoration: 'none',
              }}
              title={`Қаблан: ${previousSection.title}`}
            >
              ‹
            </Link>
          ) : (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-outline-variant)',
                color: 'var(--color-text-disabled)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'not-allowed',
                opacity: 0.5,
              }}
            >
              ‹
            </div>
          )}

          {/* Current Index Indicator */}
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-md)',
                color: 'var(--color-text-primary)',
              }}
            >
              {currentIndex + 1} / {totalSections}
            </span>
          </div>

          {/* Next Button */}
          {nextSection ? (
            <Link
              href={`/farzi-ayn/${nextSection.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-container-low-opacity)',
                color: 'var(--color-primary)',
                fontWeight: 'bold',
                textDecoration: 'none',
              }}
              title={`Баъдан: ${nextSection.title}`}
            >
              ›
            </Link>
          ) : (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-outline-variant)',
                color: 'var(--color-text-disabled)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'not-allowed',
                opacity: 0.5,
              }}
            >
              ›
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

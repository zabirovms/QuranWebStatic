'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { AsmaulHusna } from '@/lib/data/asmaul-husna-data';

interface DetailPageClientProps {
  name: AsmaulHusna;
  previousName: AsmaulHusna;
  nextName: AsmaulHusna;
  currentIndex: number;
  totalNames: number;
}

interface ReferenceItem {
  surah: number;
  verse: number;
  label: string;
}

/**
 * Parses Quran verse references from a string formatted like "(2:163) (20:98)".
 */
function parseReferences(foundText: string): ReferenceItem[] {
  if (!foundText) return [];
  const regex = /\((\d+)\s*:\s*(\d+)\)/g;
  const matches: ReferenceItem[] = [];
  let match;
  while ((match = regex.exec(foundText)) !== null) {
    matches.push({
      surah: parseInt(match[1]),
      verse: parseInt(match[2]),
      label: `${match[1]}:${match[2]}`,
    });
  }
  return matches;
}

export default function DetailPageClient({
  name,
  previousName,
  nextName,
  currentIndex,
  totalNames,
}: DetailPageClientProps) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [fontSize, setFontSize] = useState(18); // matches app default font size
  
  const referenceChips = parseReferences(name.found);

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
          paddingBottom: '80px', // padding for bottom navigator
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Navigation & Controls header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <Link
            href="/asmaul-husna"
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

          {/* Font Controller */}
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

        {/* Name Detail Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '1.5rem',
          }}
        >
          {/* Index Circle Badge */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-container-low-opacity)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            {name.id}
          </div>
          
          <h1
            className="headline-large"
            style={{
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              margin: 0,
              fontSize: '1.85rem',
            }}
          >
            {name.tajik.transliteration}
          </h1>
        </div>

        {/* Large Calligraphy Card (replicates the mobile app card) */}
        <div
          style={{
            width: '100%',
            padding: '2.5rem 1.5rem',
            marginBottom: '2rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, var(--color-primary-container-low-opacity) 0%, rgba(212,175,55,0.02) 100%)',
            border: '1px solid var(--color-outline)',
            display: 'flex',
            justifyContent: 'center',
            boxShadow: 'var(--elevation-1)',
          }}
        >
          <div
            className="arabic-text"
            style={{
              fontSize: '68px',
              fontWeight: 'bold',
              color: 'var(--color-primary)',
              lineHeight: '1.1',
              textAlign: 'center',
              fontFamily: 'Amiri, serif',
            }}
          >
            {name.arabic}
          </div>
        </div>

        {/* Detailed Explanation Text with dynamic font size */}
        <div
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.8',
            color: 'var(--color-text-primary)',
            marginBottom: '2.5rem',
          }}
        >
          {name.description.split('\n\n').map((paragraph, index) => (
            <p key={index} style={{ marginBottom: '1.25rem' }}>
              {paragraph.trim()}
            </p>
          ))}
        </div>

        {/* References Section */}
        {name.found && (
          <div
            style={{
              borderTop: '1px solid var(--color-outline)',
              paddingTop: '1.5rem',
              marginBottom: '1rem',
            }}
          >
            <h3
              className="title-medium"
              style={{
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.75rem',
              }}
            >
              Зикри ин ном дар оятҳои Қуръон:
            </h3>
            
            {referenceChips.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {referenceChips.map((chip, index) => (
                  <Link
                    key={index}
                    href={`/surah/${chip.surah}/${chip.verse}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      backgroundColor: 'var(--color-primary-container-low-opacity)',
                      border: '1px solid var(--color-outline)',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                      gap: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-outline)';
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-container-low-opacity)';
                    }}
                  >
                    <span>📖 {chip.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--color-outline-variant)',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {name.found.replace('(', '').replace(')', '')}
              </span>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Navigator (Loop cycle navigation through 99 names) */}
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
          {/* Previous Name Link */}
          <Link
            href={`/asmaul-husna/${previousName.slug}`}
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
            title={`Қаблан: ${previousName.tajik.transliteration}`}
          >
            ‹
          </Link>

          {/* Current Page Index */}
          <div style={{ textAlign: 'center' }}>
            <span
              style={{
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-md)',
                color: 'var(--color-text-primary)',
              }}
            >
              {currentIndex + 1} / {totalNames}
            </span>
          </div>

          {/* Next Name Link */}
          <Link
            href={`/asmaul-husna/${nextName.slug}`}
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
            title={`Баъдан: ${nextName.tajik.transliteration}`}
          >
            ›
          </Link>
        </div>
      </div>
    </div>
  );
}

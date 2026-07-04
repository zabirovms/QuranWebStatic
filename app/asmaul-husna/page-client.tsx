'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { AsmaulHusna, AsmaulHusnaIntro } from '@/lib/data/asmaul-husna-data';

interface AsmaulHusnaPageClientProps {
  names: AsmaulHusna[];
  intro: AsmaulHusnaIntro | null;
}

export default function AsmaulHusnaPageClient({ names, intro }: AsmaulHusnaPageClientProps) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter names based on Tajik transliteration, Arabic text, short meaning, or description
  const filteredNames = names.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.tajik.transliteration.toLowerCase().includes(q) ||
      n.arabic.includes(q) ||
      n.shortMeaning.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.found.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <main
        style={{
          padding: 'var(--spacing-lg)',
          paddingTop: isTopBarVisible ? 'calc(56px + var(--spacing-md))' : 'var(--spacing-md)',
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="display-medium" style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem' }}>
            {intro?.title || 'Асмоул Ҳусно'}
          </h1>
          <p className="body-large" style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            {intro?.subtitle || '99 Номҳои зебои Аллоҳ ва шарҳи онҳо'}
          </p>
        </div>

        {/* Introduction Section (Statically Rendered, full of searchable Tajik texts) */}
        {intro && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            {/* Muqaddima (Introduction) Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-outline)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                boxShadow: 'var(--elevation-1)',
              }}
            >
              <h2
                className="headline-small"
                style={{
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-primary)',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--color-outline)',
                  paddingBottom: '0.5rem',
                }}
              >
                {intro.introduction.title}
              </h2>
              <p
                className="body-large"
                style={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '1rem',
                  color: 'var(--color-primary)',
                }}
              >
                {intro.introduction.bismillah}
              </p>
              <p
                className="body-large"
                style={{
                  lineHeight: '1.7',
                  whiteSpace: 'pre-line',
                  color: 'var(--color-text-primary)',
                }}
              >
                {intro.introduction.content}
              </p>
            </div>

            {/* Hadiths and Benefits Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Hadith (Virtue) Card */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--elevation-1)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h3
                  className="title-large"
                  style={{
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: '1rem',
                  }}
                >
                  {intro.virtue.title}
                </h3>
                <div
                  style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: 'var(--color-primary-container-low-opacity)',
                    borderRadius: 'var(--radius-lg)',
                    borderLeft: '4px solid var(--color-primary)',
                    marginBottom: '1rem',
                  }}
                >
                  <p
                    className="body-medium"
                    style={{
                      fontWeight: 'bold',
                      color: 'var(--color-primary)',
                      marginBottom: '6px',
                    }}
                  >
                    {intro.virtue.hadith_narrator}
                  </p>
                  <p
                    className="body-large"
                    style={{
                      fontStyle: 'italic',
                      lineHeight: '1.6',
                      fontWeight: 500,
                      marginBottom: '6px',
                    }}
                  >
                    {intro.virtue.hadith_text}
                  </p>
                  <p
                    className="body-small"
                    style={{
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                    }}
                  >
                    {intro.virtue.hadith_source}
                  </p>
                </div>
                <p className="body-medium" style={{ lineHeight: '1.5', margin: 0 }}>
                  {intro.virtue.appeal}
                </p>
              </div>

              {/* Benefit Card */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  boxShadow: 'var(--elevation-1)',
                }}
              >
                <h3
                  className="title-large"
                  style={{
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: '1rem',
                  }}
                >
                  {intro.benefit.title}
                </h3>
                <p
                  className="body-medium"
                  style={{
                    fontWeight: 'bold',
                    color: 'var(--color-text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  {intro.benefit.quote_author}
                </p>
                <blockquote
                  style={{
                    borderLeft: '3px solid var(--color-outline)',
                    paddingLeft: '12px',
                    margin: '0 0 1rem 0',
                    fontStyle: 'italic',
                    color: 'var(--color-primary)',
                    fontSize: '1.05rem',
                  }}
                >
                  {intro.benefit.quote_text}
                </blockquote>
                <p
                  className="body-medium"
                  style={{
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line',
                    margin: 0,
                  }}
                >
                  {intro.benefit.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Input Bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '14px',
              border: '1px solid var(--color-outline)',
              padding: '0.5rem 1rem',
              boxShadow: 'var(--elevation-1)',
            }}
          >
            <span style={{ fontSize: '1.25rem', marginRight: '0.75rem', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              placeholder="Ҷустуҷӯи номҳо ва маъноҳо..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: 'var(--font-size-md)',
                color: 'var(--color-text-primary)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  opacity: 0.5,
                  padding: '0.25rem',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 99 Names Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: '14px',
          }}
        >
          {filteredNames.map((name) => (
            <Link key={name.id} href={`/asmaul-husna/${name.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                className="card"
                style={{
                  padding: '16px 12px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: '16px',
                  textAlign: 'center',
                  boxShadow: 'var(--elevation-1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--elevation-4)';
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--elevation-1)';
                  e.currentTarget.style.borderColor = 'var(--color-outline)';
                }}
              >
                {/* Number Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'var(--color-primary-container-low-opacity)',
                    color: 'var(--color-primary)',
                    borderRadius: '50%',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    alignSelf: 'flex-start',
                    marginBottom: '4px',
                  }}
                >
                  {name.id}
                </div>

                {/* Arabic Calligraphy (Large and prominent) */}
                <div
                  className="arabic-text"
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: 'var(--color-primary)',
                    margin: '12px 0 6px 0',
                    lineHeight: '1.2',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {name.arabic}
                </div>

                {/* Tajik Transliterated Name */}
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'var(--color-text-primary)',
                    marginBottom: '4px',
                    lineHeight: '1.3',
                  }}
                >
                  {name.tajik.transliteration}
                </div>

                {/* Short Meaning */}
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.3',
                    minHeight: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {name.shortMeaning}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

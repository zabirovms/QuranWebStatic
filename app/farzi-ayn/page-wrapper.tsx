'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { FarziAynSection } from '@/lib/types/farzi-ayn';
import FarziAynBlockRenderer, { getCategoryColor, getCategoryName } from '@/components/FarziAynBlockRenderer';

interface FarziAynPageWrapperProps {
  sections: FarziAynSection[];
}

export default function FarziAynPageWrapper({ sections }: FarziAynPageWrapperProps) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [searchQuery, setSearchQuery] = useState('');

  // Client-side search matching similar to the Flutter app
  const filteredSections = sections.filter((section) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    if (section.title.toLowerCase().includes(q)) return true;
    
    return section.content.some((block) => {
      if (block.type === 'paragraph' && block.text.toLowerCase().includes(q)) {
        return true;
      }
      if (block.type === 'list' && block.listItems.some(item => item.toLowerCase().includes(q))) {
        return true;
      }
      if (block.type === 'poetry' && block.lines.some(line => line.toLowerCase().includes(q))) {
        return true;
      }
      if (block.type === 'arabic_verse' && block.verses.some(v => 
        v.transliteration.toLowerCase().includes(q) || v.translation.toLowerCase().includes(q)
      )) {
        return true;
      }
      if (block.type === 'qna' && block.qnaItems.some(item => 
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
      )) {
        return true;
      }
      return false;
    });
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
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="display-medium" style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem' }}>
            Фарзи Айн
          </h1>
          <p className="body-large" style={{ color: 'var(--color-text-secondary)' }}>
            Омӯзиши аҳкоми шаръӣ, ақида ва одоб барои ҳар як мусулмон
          </p>
        </div>

        {/* Search Bar - styled to match modern mobile interface */}
        <div style={{ marginBottom: '2rem' }}>
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
              placeholder="Ҷустуҷӯи мавзӯъҳо ва матнҳо..."
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

        {/* Cards Grid - Table of Contents */}
        <h2 className="headline-small" style={{ marginBottom: '1rem', fontWeight: 'var(--font-weight-semibold)' }}>
          Феҳрасти мавзӯъҳо
        </h2>
        
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
            marginBottom: '4rem',
          }}
        >
          {filteredSections.map((section, index) => {
            const catColor = getCategoryColor(section.category);
            const catName = getCategoryName(section.category);
            const originalIndex = sections.findIndex(s => s.id === section.id);

            return (
              <Link
                key={section.id}
                href={`/farzi-ayn/${section.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  className="card"
                  style={{
                    padding: '16px',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '14px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--elevation-4)';
                    e.currentTarget.style.borderColor = catColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--elevation-2)';
                    e.currentTarget.style.borderColor = 'var(--color-outline)';
                  }}
                >
                  {/* Number Indicator */}
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: `${catColor}1c`, // ~11% opacity hex suffix
                      color: catColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      marginRight: '12px',
                      flexShrink: 0,
                    }}
                  >
                    {originalIndex + 1}
                  </div>

                  {/* Title and Badge */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      className="title-medium"
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: '15px',
                        lineHeight: '1.4',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {section.title}
                    </h3>
                    <div style={{ marginTop: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: catColor,
                          backgroundColor: `${catColor}1f`, // ~12% opacity
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {catName}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginLeft: '8px', opacity: 0.5 }}>
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Complete Book Reading Section for SEO & Print */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-outline)', margin: '3rem 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="headline-large" style={{ fontWeight: 'var(--font-weight-bold)' }}>
            Хондани пурраи китоб
          </h2>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Ҷамеъи бобҳо ({sections.length})
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-outline)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem',
            boxShadow: 'var(--elevation-1)',
          }}
        >
          {sections.map((section, index) => {
            const catColor = getCategoryColor(section.category);
            const catName = getCategoryName(section.category);

            return (
              <div 
                key={section.id} 
                id={section.id}
                style={{ 
                  marginBottom: index === sections.length - 1 ? 0 : '3rem',
                  scrollMarginTop: isTopBarVisible ? '80px' : '30px'
                }}
              >
                {/* Header for each book section */}
                <div style={{ borderBottom: '1px solid var(--color-outline)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.675rem',
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
                      Мавзӯи {index + 1}
                    </span>
                  </div>
                  <h3 className="headline-small" style={{ fontWeight: 'var(--font-weight-semibold)', margin: 0 }}>
                    {section.title}
                  </h3>
                </div>

                {/* Render content blocks */}
                <div>
                  {section.content.map((block, bIndex) => (
                    <FarziAynBlockRenderer key={bIndex} block={block} category={section.category} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

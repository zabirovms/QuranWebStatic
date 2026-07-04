import React from 'react';
import { FarziAynContentBlock, FarziAynSection } from '@/lib/types/farzi-ayn';

interface FarziAynBlockRendererProps {
  block: FarziAynContentBlock;
  category: string;
}

/**
 * Returns a theme-compatible semantic color for each Farzi Ayn category.
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'intro':
      return 'var(--color-primary)';
    case 'belief':
      return '#0d9488'; // Teal (Tailwind teal-600)
    case 'etiquette':
      return '#7c3aed'; // Violet (Tailwind violet-600)
    case 'wudu':
      return '#2563eb'; // Blue (Tailwind blue-600)
    case 'ghusl':
      return '#4f46e5'; // Indigo (Tailwind indigo-600)
    case 'prayer':
      return '#16a34a'; // Green (Tailwind green-600)
    case 'fasting':
      return '#ea580c'; // Orange (Tailwind orange-600)
    case 'zakat':
      return '#d97706'; // Amber (Tailwind amber-600)
    case 'surah':
      return '#dc2626'; // Red (Tailwind red-600)
    case 'qa':
      return '#db2777'; // Pink (Tailwind pink-600)
    default:
      return 'var(--color-primary)';
  }
}

/**
 * Returns a Tajik display name for each Farzi Ayn category.
 */
export function getCategoryName(category: string): string {
  switch (category) {
    case 'intro':
      return 'Муқаддима';
    case 'belief':
      return 'Ақида';
    case 'etiquette':
      return 'Одоб';
    case 'wudu':
      return 'Таҳорат';
    case 'ghusl':
      return 'Ғусл';
    case 'prayer':
      return 'Намоз';
    case 'fasting':
      return 'Рӯза';
    case 'zakat':
      return 'Закот';
    case 'surah':
      return 'Сураҳо';
    case 'qa':
      return 'Саволу Ҷавоб';
    default:
      if (!category) return '';
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

/**
 * Safely parses quotes wrapped in « and » and wraps them in HTML <strong> tags.
 */
export function renderStyledText(text: string): React.ReactNode {
  if (!text.includes('«')) {
    return text;
  }

  const parts = [];
  const regex = /«([^»]*)»/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Append preceding plain text
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Append bold quoted text
    parts.push(
      <strong key={match.index} style={{ fontWeight: 'var(--font-weight-bold)' }}>
        «{match[1]}»
      </strong>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts}</>;
}

export default function FarziAynBlockRenderer({ block, category }: FarziAynBlockRendererProps) {
  const catColor = getCategoryColor(category);

  switch (block.type) {
    case 'paragraph':
      return (
        <p className="body-large" style={{ marginBottom: '1.25rem', lineHeight: '1.8' }}>
          {renderStyledText(block.text)}
        </p>
      );

    case 'list':
      return (
        <ul style={{ listStyleType: 'none', paddingLeft: 0, marginBottom: '1.25rem' }}>
          {block.listItems.map((item, index) => (
            <li
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '0.625rem',
                lineHeight: '1.6',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  minWidth: '8px',
                  borderRadius: '50%',
                  backgroundColor: catColor,
                  marginRight: '0.75rem',
                  marginTop: '0.5rem',
                }}
              />
              <span className="body-large" style={{ flex: 1 }}>{renderStyledText(item)}</span>
            </li>
          ))}
        </ul>
      );

    case 'poetry':
      return (
        <div
          style={{
            margin: '1.5rem 0',
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--color-outline-variant)',
            borderRadius: 'var(--radius-lg)',
            borderTop: '1px solid var(--color-outline)',
            borderBottom: '1px solid var(--color-outline)',
            textAlign: 'center',
          }}
        >
          {block.lines.map((line, index) => (
            <p
              key={index}
              className="body-large"
              style={{
                margin: '0.25rem 0',
                fontStyle: 'italic',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              {line}
            </p>
          ))}
        </div>
      );

    case 'arabic_verse':
      return (
        <div
          style={{
            margin: '1.5rem 0',
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--color-primary-container-low-opacity)',
            borderRadius: 'var(--radius-xl)',
            borderLeft: `4.5px solid ${catColor}`,
          }}
        >
          {block.verses.map((verse, index) => (
            <div key={index}>
              {index > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '1rem 0',
                  }}
                >
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline)', opacity: 0.3 }} />
                  <span
                    style={{
                      padding: '0 0.75rem',
                      color: catColor,
                      fontSize: '0.75rem',
                      opacity: 0.5,
                    }}
                  >
                    ✦
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline)', opacity: 0.3 }} />
                </div>
              )}
              {/* Cyrillic Arabic Transliteration */}
              <p
                className="title-large"
                style={{
                  fontWeight: 'var(--font-weight-bold)',
                  marginBottom: '0.5rem',
                  lineHeight: '1.5',
                  color: 'var(--color-text-primary)',
                }}
              >
                {verse.transliteration}
              </p>
              {/* Translation */}
              <p
                className="body-medium"
                style={{
                  lineHeight: '1.5',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {verse.translation}
              </p>
            </div>
          ))}
        </div>
      );

    case 'qna':
      return (
        <div style={{ margin: '1.5rem 0' }}>
          {block.qnaItems.map((item, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              {/* Question container */}
              <div
                style={{
                  backgroundColor: 'var(--color-primary-container-low-opacity)',
                  padding: '0.75rem 1rem',
                  borderTopLeftRadius: 'var(--radius-lg)',
                  borderTopRightRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontWeight: 900,
                    color: catColor,
                    marginRight: '0.5rem',
                  }}
                >
                  С:
                </span>
                <strong
                  className="body-large"
                  style={{
                    color: 'var(--color-text-primary)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {item.question}
                </strong>
              </div>
              {/* Answer container */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: '1rem',
                  borderBottomLeftRadius: 'var(--radius-lg)',
                  borderBottomRightRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-outline)',
                  borderTop: 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontWeight: 900,
                    color: '#16a34a', // App uses green for answer label
                    marginRight: '0.5rem',
                  }}
                >
                  Ҷ:
                </span>
                <p
                  className="body-large"
                  style={{
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: '1.6',
                  }}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

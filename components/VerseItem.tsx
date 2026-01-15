'use client';

import { useState, useEffect, useRef } from 'react';
import { Verse } from '@/lib/types';
import { SettingsService } from '@/lib/services/settings-service';
import { BookmarkService } from '@/lib/services/bookmark-service';
import { PlayArrowIcon, PauseIcon, BookmarkIcon, CopyIcon, ShareIcon, TranslateIcon } from './Icons';
import TranslationDropdown from './TranslationDropdown';

interface VerseItemProps {
  verse: Verse;
  surahNumber: number;
  highlight?: boolean;
  scrollIntoView?: boolean;
  isPlaying?: boolean;
  plainCardsMode?: boolean;
  showExtraActions?: boolean;
  showTransliteration?: boolean;
  showTranslation?: boolean;
  showOnlyArabic?: boolean;
  isWordByWordMode?: boolean;
  translationLanguage?: string;
  onPlayAudio?: () => void;
}

type TranslationLanguage = 'tajik' | 'tj2' | 'tj3' | 'farsi' | 'russian';

export default function VerseItem({ 
  verse, 
  surahNumber, 
  highlight = false,
  scrollIntoView = false,
  isPlaying = false,
  plainCardsMode = false,
  showExtraActions = true,
  showTransliteration: propShowTransliteration,
  showTranslation: propShowTranslation,
  showOnlyArabic: propShowOnlyArabic,
  isWordByWordMode: propIsWordByWordMode,
  translationLanguage: propTranslationLanguage,
  onPlayAudio,
}: VerseItemProps) {
  const settingsService = SettingsService.getInstance();
  const bookmarkService = BookmarkService.getInstance();
  
  // Use props if provided, otherwise fall back to SettingsService (for backward compatibility)
  const settings = settingsService.getSettings();
  const showTransliteration = propShowTransliteration !== undefined 
    ? propShowTransliteration && !propIsWordByWordMode && !propShowOnlyArabic
    : settings.showTransliteration && !settings.wordByWordMode && !settings.showOnlyArabic;
  const showTranslation = propShowTranslation !== undefined
    ? propShowTranslation && !propShowOnlyArabic && !propIsWordByWordMode
    : settings.showTranslation && !settings.showOnlyArabic && !settings.wordByWordMode;
  const arabicOnly = propShowOnlyArabic !== undefined ? propShowOnlyArabic : settings.showOnlyArabic;
  const isWordByWordMode = propIsWordByWordMode !== undefined ? propIsWordByWordMode : settings.wordByWordMode;
  
  const translationLang = propTranslationLanguage || settings.translationLanguage;
  const selectedTranslation: TranslationLanguage = 
    translationLang === 'tj_2' ? 'tj2' :
    translationLang === 'tj_3' ? 'tj3' :
    translationLang === 'farsi' ? 'farsi' :
    translationLang === 'russian' ? 'russian' :
    'tajik';
  
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const verseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const uniqueKey = `${surahNumber}:${verse.verseNumber}`;
    setIsBookmarked(bookmarkService.isBookmarked(uniqueKey));
  }, [surahNumber, verse.verseNumber, bookmarkService]);

  useEffect(() => {
    if (scrollIntoView && verseRef.current) {
      verseRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [scrollIntoView]);

  const availableTranslations: { key: TranslationLanguage; label: string }[] = [];
  if (verse.tajikText) availableTranslations.push({ key: 'tajik', label: 'Абдул Муҳаммад Оятӣ' });
  if (verse.tj2) availableTranslations.push({ key: 'tj2', label: 'Абуаломуддин (бо тафсир)' });
  if (verse.tj3) availableTranslations.push({ key: 'tj3', label: 'Pioneers of Translation Center' });
  if (verse.farsi) availableTranslations.push({ key: 'farsi', label: 'Форсӣ' });
  if (verse.russian) availableTranslations.push({ key: 'russian', label: 'Эльмир Кулиев' });

  const getTranslationText = () => {
    switch (selectedTranslation) {
      case 'tajik':
        return verse.tajikText;
      case 'tj2':
        return verse.tj2;
      case 'tj3':
        return verse.tj3;
      case 'farsi':
        return verse.farsi;
      case 'russian':
        return verse.russian;
      default:
        return verse.tajikText;
    }
  };

  const handleTranslationSelected = (translation: string) => {
    settingsService.setTranslationLanguage(translation);
    // Force re-render by updating state
    window.location.reload();
  };

  // Convert verse number to Arabic-Indic numerals
  const convertToArabicNumerals = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    if (num === 0) return arabicNumerals[0];
    let result = '';
    let n = num;
    while (n > 0) {
      result = arabicNumerals[n % 10] + result;
      n = Math.floor(n / 10);
    }
    return result;
  };

  const getArabicTextWithEndSymbol = () => {
    const arabicVerseNumber = convertToArabicNumerals(verse.verseNumber);
    const cleanArabicText = verse.arabicText.trim();
    // Add space before the end symbol and put numbers inside the symbol
    return `${cleanArabicText} \u06dd${arabicVerseNumber}`;
  };

  const handleBookmark = () => {
    const newState = bookmarkService.toggleBookmark(
      surahNumber,
      verse.verseNumber,
      verse.arabicText,
      verse.tajikText
    );
    setIsBookmarked(newState);
  };

  const handleCopy = async () => {
    const cleanArabicText = verse.arabicText.trim();
    const translationText = getTranslationText();
    const text = translationText 
      ? `${cleanArabicText}\n\n${translationText}\n\n(Қуръон ${surahNumber}:${verse.verseNumber})`
      : `${cleanArabicText}\n\n(Қуръон ${surahNumber}:${verse.verseNumber})`;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        // Use remove() which is safer and handles null cases
        if (textArea && textArea.parentNode) {
          textArea.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        // Use remove() which is safer and handles null cases
        if (textArea && textArea.parentNode) {
          textArea.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
    }
  };

  const handleShare = async () => {
    const cleanArabicText = verse.arabicText.trim();
    const translationText = getTranslationText();
    const text = translationText 
      ? `${cleanArabicText}\n\n${translationText}\n\n(Қуръон ${surahNumber}:${verse.verseNumber})`
      : `${cleanArabicText}\n\n(Қуръон ${surahNumber}:${verse.verseNumber})`;
    
    if (navigator.share) {
      try {
        await navigator.share({ 
          text,
          title: `Қуръон ${surahNumber}:${verse.verseNumber}`
        });
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
          // Fallback to copy
          handleCopy();
        }
      }
    } else {
      // Fallback to copy if share API is not available
      handleCopy();
    }
  };

  const isHighlighted = highlight || isPlaying;
  const cardStyle = plainCardsMode ? {
    backgroundColor: isHighlighted ? 'var(--color-primary-container-low-opacity)' : 'transparent',
    borderRadius: '0',
    border: 'none',
    boxShadow: 'none',
  } : {
    backgroundColor: isHighlighted 
      ? 'var(--color-primary-container-low-opacity)' 
      : 'var(--color-surface)',
    borderRadius: 'var(--radius-xl)',
    border: isHighlighted
      ? '2px solid var(--color-primary-low-opacity)'
      : '1px solid var(--color-outline)',
    boxShadow: isHighlighted
      ? 'var(--elevation-4)'
      : 'var(--elevation-1)',
  };

  return (
    <div
      ref={verseRef}
      style={{
        margin: plainCardsMode ? '0' : 'calc(var(--spacing-xl) * 2) var(--spacing-md)',
        padding: 'var(--spacing-md) var(--spacing-md)',
        ...cardStyle,
        transition: 'all var(--transition-base)',
      }}
    >
          {/* Arabic Text */}
          <div
            className="arabic-text"
            style={{
              direction: 'rtl',
              textAlign: 'right',
              unicodeBidi: 'bidi-override',
              fontSize: 'var(--font-size-2xl)',
              lineHeight: '1.4',
              marginBottom: 'var(--spacing-sm)',
              fontFamily: 'Amiri, serif',
              color: 'var(--color-text-primary)',
            }}
          >
            <span lang="ar">{getArabicTextWithEndSymbol()}</span>
          </div>

          {/* Transliteration */}
          {!arabicOnly && showTransliteration && verse.transliteration && (
            <div style={{
              marginBottom: 'var(--spacing-sm)',
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
            }}>
              {verse.transliteration}
            </div>
          )}

          {/* Translation */}
          {!arabicOnly && showTranslation && getTranslationText() && (
            <div
              style={{
                direction: 'ltr',
                textAlign: 'left',
                fontSize: 'var(--font-size-md)',
                lineHeight: '1.6',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--spacing-sm)',
                letterSpacing: '0.3px',
              }}
            >
              {getTranslationText()}
            </div>
          )}

          {/* Tafsir */}
          {!arabicOnly && verse.tafsir && isTafsirOpen && (
            <div style={{
              marginTop: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-sm)',
              padding: '12px',
              backgroundColor: 'var(--color-primary-container-low-opacity)',
              borderRadius: '8px',
              borderLeft: '3px solid var(--color-primary)',
            }}>
              <div style={{
                fontSize: 'var(--font-size-base)',
                lineHeight: '1.6',
                color: 'var(--color-text-primary)',
              }}>
                {verse.tafsir}
              </div>
            </div>
          )}

          {/* Action Row - matches Flutter exactly */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 'var(--spacing-sm)',
            flexWrap: 'wrap',
            gap: 'var(--spacing-xs)',
            position: 'relative',
          }}>
            {/* Verse reference at bottom-left */}
            <span style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-secondary)',
            }}>
              {surahNumber}:{verse.verseNumber}
            </span>

            {/* Play/Pause button (always visible) */}
            <ActionButton
              icon={isPlaying ? <PauseIcon size={16} color="var(--color-text-secondary)" /> : <PlayArrowIcon size={16} color="var(--color-text-secondary)" />}
              tooltip={isPlaying ? 'Пауза' : 'Play Audio'}
              onClick={onPlayAudio}
            />

            {/* Extra actions (only if showExtraActions) */}
            {showExtraActions && (
              <>
                <ActionButton
                  icon={<BookmarkIcon size={16} color="var(--color-text-secondary)" filled={isBookmarked} />}
                  tooltip={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
                  onClick={handleBookmark}
                />
                <ActionButton
                  icon={<CopyIcon size={16} color="var(--color-text-secondary)" />}
                  tooltip={copied ? 'Нусхабардорӣ шуд!' : 'Нусхабардорӣ'}
                  onClick={handleCopy}
                />
                <ActionButton
                  icon={<ShareIcon size={16} color="var(--color-text-secondary)" />}
                  tooltip="Мубодила"
                  onClick={handleShare}
                />
                <div style={{ position: 'relative' }}>
                  <TranslationDropdown
                    currentTranslation={translationLang}
                    onTranslationSelected={handleTranslationSelected}
                    trigger={
                      <ActionButton
                        icon={<TranslateIcon size={16} color="var(--color-text-secondary)" />}
                        tooltip="Интихоби тарҷума"
                        onClick={() => {}}
                      />
                    }
                  />
                </div>
              </>
            )}

            <div style={{ flex: 1, minWidth: '8px' }} />

            {/* Tafsir toggle (text button on the right) */}
            {verse.tafsir && (
              <button
                onClick={() => setIsTafsirOpen(!isTafsirOpen)}
                style={{
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-secondary)',
                  fontStyle: 'italic',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {isTafsirOpen ? 'тафсир ▲' : 'тафсир'}
              </button>
            )}
          </div>


      {/* Horizontal divider in plain mode */}
      {plainCardsMode && (
        <div style={{
          height: '1px',
          backgroundColor: 'var(--color-outline)',
          opacity: 0.2,
          margin: '0 var(--spacing-lg)',
        }} />
      )}
    </div>
  );
}

function ActionButton({ icon, tooltip, onClick }: {
  icon: React.ReactNode;
  tooltip: string;
  onClick?: () => void;
}) {
  return (
    <div
      title={tooltip}
      onClick={onClick}
      style={{
        padding: '4px',
        borderRadius: 'var(--radius-sm)',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color var(--transition-base)',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = 'var(--color-surface-variant)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {icon}
    </div>
  );
}

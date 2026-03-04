'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getWordsForVerse, buildWordAudioUrl } from '@/lib/data/word-by-word-data-client';
import { wordAudioService } from '@/lib/services/word-audio-service';
import { getAudioService } from '@/lib/services/audio-service';
import { SettingsService } from '@/lib/services/settings-service';
import { getAlignmentForVerse, getWordStartTime, hasAlignmentData } from '@/lib/data/alignment-data-client';

interface ClickableArabicTextProps {
  arabicText: string;
  surahNumber: number;
  verseNumber: number;
  className?: string;
  style?: React.CSSProperties;
}

interface WordData {
  id: number;
  surah: string;
  ayah: string;
  word: string;
  location: string;
  text: string;
}

export default function ClickableArabicText({
  arabicText,
  surahNumber,
  verseNumber,
  className,
  style,
}: ClickableArabicTextProps) {
  const [words, setWords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingWord, setPlayingWord] = useState<number | null>(null);
  const [highlightedWord, setHighlightedWord] = useState<number | null>(null);
  const lastPlayingWordRef = useRef<number | null>(null);
  const lastHighlightedWordRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasPreloadedAlignmentRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadWords = async () => {
      try {
        setIsLoading(true);
        const wordData = await getWordsForVerse(surahNumber, verseNumber);
        if (mounted) {
          setWords(wordData);
          setIsLoading(false);
        }
      } catch (error) {
        // Silently handle errors - don't spam console or affect other functionality
        // This component is always rendered for clickable words feature, errors are expected
        // if word-by-word data isn't available
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadWords();

    // Preload alignment when this verse becomes visible so word tap only does seek/play (better INP)
    let observer: IntersectionObserver | null = null;
    const el = containerRef.current;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting || !mounted || hasPreloadedAlignmentRef.current) return;
          hasPreloadedAlignmentRef.current = true;
          const reciterId = SettingsService.getInstance().getSettings().audioEdition;
          if (reciterId && hasAlignmentData(reciterId)) {
            getAlignmentForVerse(reciterId, surahNumber, verseNumber).catch(() => {});
          }
        },
        { rootMargin: '200px', threshold: 0 }
      );
      observer.observe(el);
    }

    // Subscribe to word audio state (for clicked words)
    const unsubscribeWordAudio = wordAudioService.subscribe((state) => {
      if (!mounted) return;
      const next =
        state.currentSurah === surahNumber && state.currentVerse === verseNumber
          ? state.currentWord
          : null;
      if (lastPlayingWordRef.current === next) return;
      lastPlayingWordRef.current = next;
      setPlayingWord(next);
    });

    // Subscribe to main audio service (for verse playback highlighting)
    const audioService = getAudioService();
    const unsubscribeAudio = audioService.subscribe((state) => {
      if (!mounted) return;
      const isVersePlaying =
        state.isPlaying &&
        state.currentSurahNumber === surahNumber &&
        state.currentVerseNumber === verseNumber;
      const nextHighlight =
        isVersePlaying && state.currentWordNumber !== null
          ? state.currentWordNumber
          : null;
      // Only set state when value actually changed (avoids re-renders for non-playing verses)
      if (lastHighlightedWordRef.current !== nextHighlight) {
        lastHighlightedWordRef.current = nextHighlight;
        setHighlightedWord(nextHighlight);
      }
      if (isVersePlaying && lastPlayingWordRef.current !== null) {
        lastPlayingWordRef.current = null;
        setPlayingWord(null);
      }
    });

    return () => {
      mounted = false;
      observer?.disconnect();
      unsubscribeWordAudio();
      unsubscribeAudio();
    };
  }, [surahNumber, verseNumber]);

  const handleWordClick = (wordNumber: number) => {
    // 1. Immediate feedback so the next paint shows the tapped word as "playing" (better INP)
    lastPlayingWordRef.current = wordNumber;
    setPlayingWord(wordNumber);
    setHighlightedWord(null);

    // 2. Defer all heavy work (alignment load, seek, play) so the browser can paint first
    const runHeavyWork = async () => {
      const audioService = getAudioService();
      const currentState = audioService.getState();
      const isVersePlaying =
        currentState.isPlaying &&
        currentState.currentSurahNumber === surahNumber &&
        currentState.currentVerseNumber === verseNumber;

      if (isVersePlaying) {
        try {
          const reciterId = currentState.currentEdition;
          if (reciterId && hasAlignmentData(reciterId)) {
            const alignment = await getAlignmentForVerse(reciterId, surahNumber, verseNumber);
            if (alignment) {
              const wordStartTime = getWordStartTime(alignment, wordNumber);
              if (wordStartTime !== null) {
                audioService.seekTo(wordStartTime);
                return;
              }
            }
          }
          console.debug('Alignment data not available, falling back to individual word audio');
        } catch (error) {
          console.error('Failed to seek to word position:', error);
        }
      }

      try {
        const audioUrl = buildWordAudioUrl(surahNumber, verseNumber, wordNumber);
        await wordAudioService.playWord(surahNumber, verseNumber, wordNumber, audioUrl);
      } catch (error) {
        console.error('Failed to play word audio:', error);
      }
    };

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        runHeavyWork();
      });
    } else {
      setTimeout(runHeavyWork, 0);
    }
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

  // Render words as clickable spans
  // Since arabicText is constructed from word data, render words directly in order
  const renderClickableWords = useMemo(() => {
    if (isLoading || words.length === 0) {
      // Fallback to plain text if words not loaded
      return <span lang="ar">{arabicText}</span>;
    }
    
    // Filter out verse number markers from words
    const verseWords = words.filter((word) => {
      const text = word.text.trim();
      const isVerseNumber = /^[\u0660-\u0669]+$/.test(text);
      return !isVerseNumber;
    });
    
    // Render words directly in order - they should match the original text exactly
    // since the original text is constructed from these same words
    const elements: React.ReactNode[] = [];
    
    for (let i = 0; i < verseWords.length; i++) {
      const word = verseWords[i];
      const wordText = word.text.trim();
      const wordNumber = parseInt(word.word);
      const isPlaying = playingWord === wordNumber;
      const isHighlighted = highlightedWord === wordNumber;
      // Highlight if either playing (clicked) or highlighted (during verse playback)
      const shouldHighlight = isPlaying || isHighlighted;
      
      // Add clickable word
      elements.push(
        <span
          key={`word-${wordNumber}`}
          lang="ar"
          onClick={() => handleWordClick(wordNumber)}
          style={{
            display: 'inline',
            cursor: 'pointer',
            color: shouldHighlight
              ? 'var(--color-word-highlight, var(--color-primary))'
              : 'var(--color-text-primary)',
            fontWeight: 'var(--font-weight-normal)',
            textDecoration: 'none',
            transition: 'color var(--transition-base)',
            padding: '0',
            margin: '0',
            // Ensure words don't break apart
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            if (!shouldHighlight) {
              e.currentTarget.style.color = 'var(--color-word-hover, var(--color-word-highlight, var(--color-primary)))';
            }
          }}
          onMouseLeave={(e) => {
            if (!shouldHighlight) {
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }
          }}
          title={`Click to hear word ${wordNumber}`}
        >
          {wordText}
        </span>
      );
      
      // Add space between words (Arabic text uses spaces between words)
      // Only add space if not the last word
      if (i < verseWords.length - 1) {
        elements.push(<span key={`space-${i}`}> </span>);
      }
    }
    
    // Add verse number symbol at the end with verse number inside
    const arabicVerseNumber = convertToArabicNumerals(verseNumber);
    elements.push(
      <span key="verse-number" lang="ar">
        {' '}
        {'\u06dd'}{arabicVerseNumber}
      </span>
    );
    
    return <>{elements}</>;
  }, [words, arabicText, isLoading, playingWord, highlightedWord, surahNumber, verseNumber]);

  return (
    <span
      ref={containerRef}
      className={className}
      style={{
        ...style,
        display: 'inline',
      }}
      lang="ar"
    >
      {renderClickableWords}
    </span>
  );
}

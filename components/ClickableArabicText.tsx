'use client';

import { useState, useEffect, useMemo } from 'react';
import { getWordsForVerse, buildWordAudioUrl } from '@/lib/data/word-by-word-data-client';
import { wordAudioService } from '@/lib/services/word-audio-service';
import { getAudioService } from '@/lib/services/audio-service';
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

    // Subscribe to word audio state (for clicked words)
    const unsubscribeWordAudio = wordAudioService.subscribe((state) => {
      if (mounted) {
        if (
          state.currentSurah === surahNumber &&
          state.currentVerse === verseNumber
        ) {
          setPlayingWord(state.currentWord);
        } else {
          setPlayingWord(null);
        }
      }
    });

    // Subscribe to main audio service (for verse playback highlighting)
    const audioService = getAudioService();
    const unsubscribeAudio = audioService.subscribe((state) => {
      if (mounted) {
        // Check if verse is playing and matches current verse
        const isVersePlaying = 
          state.isPlaying &&
          state.currentSurahNumber === surahNumber &&
          state.currentVerseNumber === verseNumber;
        
        if (isVersePlaying && state.currentWordNumber !== null) {
          // Verse is playing - clear clicked word highlight and use playback highlight
          setPlayingWord(null); // Clear any clicked word highlight
          setHighlightedWord(state.currentWordNumber);
        } else {
          // Verse is not playing - clear playback highlight
          setHighlightedWord(null);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribeWordAudio();
      unsubscribeAudio();
    };
  }, [surahNumber, verseNumber]);

  const handleWordClick = async (wordNumber: number) => {
    const audioService = getAudioService();
    const currentState = audioService.getState();
    
    // Check if verse is currently playing and matches this verse
    // Note: Full surah playback is not supported for seeking (we don't track current verse)
    const isVersePlaying = 
      currentState.isPlaying &&
      currentState.currentSurahNumber === surahNumber &&
      currentState.currentVerseNumber === verseNumber;
    
    // If verse is playing, seek to the word's position instead of playing individual word audio
    if (isVersePlaying) {
      // Clear playback highlight temporarily - it will resume when seeking completes
      setHighlightedWord(null);
      
      try {
        const reciterId = currentState.currentEdition;
        
        // Check if alignment data is available for this reciter
        if (reciterId && hasAlignmentData(reciterId)) {
          // Get alignment data for the current verse
          const alignment = await getAlignmentForVerse(reciterId, surahNumber, verseNumber);
          
          if (alignment) {
            // Get the start time for this word
            const wordStartTime = getWordStartTime(alignment, wordNumber);
            
            if (wordStartTime !== null) {
              // Seek to the word's start time in the current verse audio
              // The playback highlight will resume automatically via the audio service subscription
              audioService.seekTo(wordStartTime);
              return;
            }
          }
        }
        
        // If alignment data is not available or seeking failed, fall back to individual word audio
        console.debug('Alignment data not available, falling back to individual word audio');
      } catch (error) {
        console.error('Failed to seek to word position:', error);
        // Fall through to play individual word audio
      }
    }
    
    // If nothing is playing, or seeking failed, play individual word audio
    // Clear any playback highlight when clicking a word
    setHighlightedWord(null);
    
    try {
      const audioUrl = buildWordAudioUrl(surahNumber, verseNumber, wordNumber);
      await wordAudioService.playWord(surahNumber, verseNumber, wordNumber, audioUrl);
    } catch (error) {
      console.error('Failed to play word audio:', error);
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
              ? 'var(--color-primary)'
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
              e.currentTarget.style.color = 'var(--color-primary)';
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

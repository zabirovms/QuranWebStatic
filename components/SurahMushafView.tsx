'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { PlaybackState } from '@/lib/services/audio-service';
import { getAudioService } from '@/lib/services/audio-service';
import { wordAudioService } from '@/lib/services/word-audio-service';
import { getAlignmentForVerse, getWordStartTime, hasAlignmentData } from '@/lib/data/alignment-data-client';
import { getMushafPages, MushafPageLine } from '@/lib/data/mushaf-layout-client';
import { getQpcV4Index } from '@/lib/data/qpc-v4-client';
import { buildWordAudioUrl } from '@/lib/data/word-by-word-data-client';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SurahMushafViewProps {
  surahNumber: number;
  playbackState: PlaybackState | null;
  onPlayVerse: (verseNumber: number) => void;
}

interface WordKey {
  surah: number;
  ayah: number;
  word: number;
}

interface PlayingWord {
  ayah: number;
  word: number;
}

// QCF4001_COLOR (woff2/pN.woff2) maps U+FC41..U+FC64. qpc-v4.json may store either:
// - PUA U+F741.. (add 0x500 → U+FC41) or
// - font range U+FC41.. (use as-is). Only remap when in PUA range.
const QPC_FONT_START = 0xfc41;
const QPC_PUA_START = 0xf741;
const QPC_TO_FONT_OFFSET = 0x500;

function glyphToFontCodePoint(glyph: unknown): number {
  try {
    if (typeof glyph !== 'string' || glyph.length === 0) return QPC_FONT_START;
    const cp = glyph.codePointAt(0) ?? 0;
    if (cp >= QPC_FONT_START && cp <= 0xfc64) return cp; // already font range
    if (cp >= QPC_PUA_START && cp <= 0xf765) return cp + QPC_TO_FONT_OFFSET; // PUA → font
    return cp;
  } catch {
    return QPC_FONT_START;
  }
}

export default function SurahMushafView({
  surahNumber,
  playbackState,
  onPlayVerse,
}: SurahMushafViewProps) {
  const [lines, setLines] = useState<MushafPageLine[] | null>(null);
  const [idToGlyph, setIdToGlyph] = useState<Map<number, string> | null>(null);
  const [idToLocation, setIdToLocation] = useState<any>(null);

  const [playingWord, setPlayingWord] = useState<PlayingWord | null>(null);
  const [highlightedWord, setHighlightedWord] = useState<PlayingWord | null>(null);
  const [hoveredWord, setHoveredWord] = useState<PlayingWord | null>(null);
  const [hoveredAyah, setHoveredAyah] = useState<number | null>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  const [fontsReady, setFontsReady] = useState<Set<number>>(new Set());

  // Load layout + qpc index once
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [pages, qpc] = await Promise.all([getMushafPages(), getQpcV4Index()]);
        if (!mounted) return;

        // Filter lines that belong to this surah (ayah only; no surah_name, no basmallah)
        const relevant: MushafPageLine[] = [];

        for (const line of pages) {
          if (line.line_type === 'surah_name' || line.line_type === 'basmallah') continue;

          if (line.first_word_id && typeof line.first_word_id === 'number') {
            const loc = qpc.idToLocation.get(line.first_word_id);
            if (loc && loc.surah === surahNumber) {
              relevant.push(line);
            }
          }
        }

        setLines(relevant);
        setIdToGlyph(qpc.idToGlyph);
        setIdToLocation(qpc.idToLocation);
      } catch (e) {
        console.error('Failed to load mushaf layout/qpc index:', e);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [surahNumber]);

  // Dynamically load page fonts p{page}.woff2 as FontFace (like QUL does)
  useEffect(() => {
    if (!lines || typeof window === 'undefined' || typeof document === 'undefined') return;

    const pages = new Set<number>();
    for (const line of lines) {
      pages.add(line.page_number);
    }

    const toLoad = Array.from(pages).filter((p) => !loadedPagesRef.current.has(p));
    if (!toLoad.length) return;

    (async () => {
      for (const page of toLoad) {
        const fontName = `p${page}-v4`;
        try {
          const face = new FontFace(
            fontName,
            `url(/woff2/p${page}.woff2) format("woff2")`,
          );
          await face.load();
          (document as any).fonts.add(face);
          loadedPagesRef.current.add(page);
          setFontsReady((prev) => new Set(prev).add(page));
        } catch (e) {
          console.warn(`[Mushaf] Local font p${page}.woff2 failed:`, e);
        }
      }
    })();
  }, [lines]);

  // Refs to avoid setState when value unchanged (reduces re-renders during playback)
  const lastPlayingWordRef = useRef<PlayingWord | null>(null);
  const lastHighlightedWordRef = useRef<PlayingWord | null>(null);

  const playingWordEqual = (a: PlayingWord | null, b: PlayingWord | null) =>
    a === b || (a != null && b != null && a.ayah === b.ayah && a.word === b.word);

  // Subscribe to word audio + main audio service for word highlighting
  useEffect(() => {
    let mounted = true;

    const unsubscribeWordAudio = wordAudioService.subscribe((state) => {
      if (!mounted) return;
      const next =
        state.currentSurah === surahNumber && state.currentVerse != null && state.currentWord != null
          ? { ayah: state.currentVerse, word: state.currentWord }
          : null;
      if (playingWordEqual(lastPlayingWordRef.current, next)) return;
      lastPlayingWordRef.current = next;
      setPlayingWord(next);
    });

    const audio = getAudioService();
    const unsubscribeAudio = audio.subscribe((state) => {
      if (!mounted) return;

      const isVersePlaying =
        state.isPlaying &&
        state.currentSurahNumber === surahNumber &&
        state.currentVerseNumber != null;

      const next =
        isVersePlaying && state.currentWordNumber != null
          ? { ayah: state.currentVerseNumber!, word: state.currentWordNumber }
          : null;
      if (playingWordEqual(lastHighlightedWordRef.current, next)) return;
      lastHighlightedWordRef.current = next;
      setHighlightedWord(next);
    });

    return () => {
      mounted = false;
      unsubscribeWordAudio();
      unsubscribeAudio();
    };
  }, [surahNumber]);

  const requiredPages = useMemo(() => {
    if (!lines) return new Set<number>();
    const set = new Set<number>();
    for (const line of lines) set.add(line.page_number);
    return set;
  }, [lines]);

  const handleWordClick = async (key: WordKey) => {
    const audio = getAudioService();
    const state = audio.getState();

    const isVersePlaying =
      state.isPlaying &&
      state.currentSurahNumber === key.surah &&
      state.currentVerseNumber === key.ayah;

    // If verse is playing and alignment exists, seek into verse
    if (isVersePlaying) {
      try {
        const reciterId = state.currentEdition;
        if (reciterId && hasAlignmentData(reciterId)) {
          const alignment = await getAlignmentForVerse(reciterId, key.surah, key.ayah);
          if (alignment) {
            const wordStartTime = getWordStartTime(alignment, key.word);
            if (wordStartTime != null) {
              setHighlightedWord(null);
              audio.seekTo(wordStartTime);
              return;
            }
          }
        }
      } catch (e) {
        console.error('Failed to seek to word position in mushaf view:', e);
      }
    }

    // Fallback: play individual word audio (same behavior as translation mode)
    try {
      setHighlightedWord(null);
      const audioUrl = buildWordAudioUrl(key.surah, key.ayah, key.word);
      await wordAudioService.playWord(key.surah, key.ayah, key.word, audioUrl);
    } catch (e) {
      console.error('Failed to play word audio in mushaf view:', e);
    }
  };

  if (!lines || !idToGlyph || !idToLocation) {
    return (
      <div
        style={{
          minHeight: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const fontsReadyForLines = requiredPages.size > 0 && [...requiredPages].every((p) => fontsReady.has(p));
  if (!fontsReadyForLines) {
    return (
      <div
        style={{
          minHeight: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const currentVerse = playbackState?.currentSurahNumber === surahNumber
    ? playbackState.currentVerseNumber
    : null;

  return (
    <div
      style={{
        padding: '0 var(--spacing-md)',
        maxWidth: '36rem',
        margin: '0 auto',
      }}
    >
      {lines.map((line, i) => {
        const prevPage = i > 0 ? lines[i - 1].page_number : 0;
        const nextPage = i < lines.length - 1 ? lines[i + 1].page_number : null;
        const isFirstLineOnPage = i === 0 || line.page_number !== prevPage;
        const isLastLineOnPage = i === lines.length - 1 || line.page_number !== nextPage;

        // Override layout for specific cases: e.g. make Baqarah page 2, line 5 centered like the first two lines
        const isCentered =
          line.is_centered === 1 ||
          (line.page_number === 2 && line.line_number === 5);

        const baseStyle: React.CSSProperties = {
          fontFamily: `p${line.page_number}-v4, p1-v4, serif`,
          fontSize: 'clamp(1.35rem, 3.8vw, 1.75rem)',
          lineHeight: 1.5,
          direction: 'rtl',
          marginBottom: '0.25rem',
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: isCentered ? 'center' : 'space-between',
          alignItems: 'center',
          width: '100%',
          gap: '0.15em',
        };

        if (!line.first_word_id || !line.last_word_id) return null;
        if (typeof line.first_word_id !== 'number' || typeof line.last_word_id !== 'number') {
          return null;
        }

        const wordIds: number[] = [];
        for (let id = line.first_word_id; id <= line.last_word_id; id++) {
          wordIds.push(id);
        }

        // Group words by ayah so we can know which verse each run belongs to
        const groups: { ayah: number; words: { id: number; glyph: string; key: WordKey }[] }[] = [];
        for (const id of wordIds) {
          const loc = idToLocation.get(id);
          const glyph = idToGlyph.get(id);
          if (!loc || !glyph) continue;
          if (loc.surah !== surahNumber) continue;
          const last = groups[groups.length - 1];
          const entry = {
            id,
            glyph,
            key: { surah: loc.surah, ayah: loc.ayah, word: loc.word },
          };
          if (!last || last.ayah !== loc.ayah) {
            groups.push({ ayah: loc.ayah, words: [entry] });
          } else {
            last.words.push(entry);
          }
        }

        if (groups.length === 0) return null;

        const lineContent = (
          <div style={baseStyle}>
            {(groups || []).map((group, gi) => {
              const verseIsPlaying = currentVerse === group.ayah;
              const verseIsHovered = hoveredAyah === group.ayah;
              const verseIsHighlighted = verseIsPlaying || verseIsHovered;
              const words = Array.isArray(group.words) ? group.words : [];
              return (
                <span key={`g-${gi}`} style={{ display: 'contents' }}>
                  {words.map((w, wi) => {
                    const fontGlyph = String.fromCodePoint(glyphToFontCodePoint(w.glyph));
                    const isPlaying =
                      playingWord &&
                      playingWord.ayah === w.key.ayah &&
                      playingWord.word === w.key.word;
                    const isHighlighted =
                      highlightedWord &&
                      highlightedWord.ayah === w.key.ayah &&
                      highlightedWord.word === w.key.word;

                    const isHoveredWord =
                      hoveredWord &&
                      hoveredWord.ayah === w.key.ayah &&
                      hoveredWord.word === w.key.word;

                    const shouldHighlightWord =
                      isPlaying || isHighlighted || isHoveredWord || verseIsHighlighted;

                    const isAyahMarker = wi === words.length - 1;

                    return (
                      <span
                        key={w.id}
                        data-verse-number={wi === 0 ? group.ayah : undefined}
                        style={{
                          // Whole glyph (word or ayah marker) is interactive
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          if (!isAyahMarker) return;
                          e.stopPropagation();
                          onPlayVerse(group.ayah);
                        }}
                        onMouseEnter={
                          isAyahMarker
                            ? () => setHoveredAyah(group.ayah)
                            : undefined
                        }
                        onMouseLeave={
                          isAyahMarker
                            ? () => {
                                setHoveredAyah((prev) =>
                                  prev === group.ayah ? null : prev,
                                );
                              }
                            : undefined
                        }
                      >
                        <span
                          onClick={
                            isAyahMarker
                              ? undefined
                              : (e) => {
                                  e.stopPropagation();
                                  handleWordClick(w.key);
                                }
                          }
                          onMouseEnter={
                            isAyahMarker
                              ? undefined
                              : () =>
                                  setHoveredWord({
                                    ayah: w.key.ayah,
                                    word: w.key.word,
                                  })
                          }
                          onMouseLeave={
                            isAyahMarker
                              ? undefined
                              : () =>
                                  setHoveredWord((prev) =>
                                    prev &&
                                    prev.ayah === w.key.ayah &&
                                    prev.word === w.key.word
                                      ? null
                                      : prev,
                                  )
                          }
                          style={{
                            fontFamily: `p${line.page_number}-v4, p1-v4, serif`,
                            color: shouldHighlightWord
                              ? 'var(--color-word-highlight, var(--color-primary))'
                              : 'var(--color-text-primary)',
                            // Text itself is also clickable/hoverable in all cases
                            cursor: 'pointer',
                            transition: 'color var(--transition-base)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {fontGlyph}
                        </span>
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </div>
        );

        return (
          <Fragment key={`${line.page_number}-${line.line_number}`}>
            {lineContent}
            {isLastLineOnPage && (
              <div
                style={{
                  marginTop: '0.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-on-surface-variant, #666)',
                    fontWeight: 500,
                  }}
                >
                  {line.page_number}
                </span>
                <div
                  style={{
                    width: '100%',
                    borderTop: '1px solid var(--color-outline-variant, #ccc)',
                  }}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}


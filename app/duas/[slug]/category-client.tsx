'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTopBar } from '@/lib/contexts/TopBarContext';
import { DuaCategoryData, CategoryDuaItem } from '@/lib/data/dua-categories-data';

interface CategoryClientProps {
  slug: string;
  initialData: DuaCategoryData;
}

export default function CategoryClient({ slug, initialData }: CategoryClientProps) {
  const { isVisible: isTopBarVisible } = useTopBar();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio playback state
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioBuffering, setAudioBuffering] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Filter duas list
  const filteredDuas = initialData.duas.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.tajik.toLowerCase().includes(q) ||
      d.arabic.toLowerCase().includes(q) ||
      d.reference.toLowerCase().includes(q)
    );
  });

  // Handle Play/Pause
  const handlePlayPause = (dua: CategoryDuaItem) => {
    if (!dua.audio_url) return;

    if (!audioRef.current) {
      // Create new audio element
      const audio = new Audio();
      audio.src = dua.audio_url;
      audioRef.current = audio;

      // Attach audio events
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
      audio.addEventListener('timeupdate', () => {
        setAudioCurrentTime(audio.currentTime);
      });
      audio.addEventListener('playing', () => {
        setAudioBuffering(false);
      });
      audio.addEventListener('waiting', () => {
        setAudioBuffering(true);
      });
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setAudioCurrentTime(0);
      });
    }

    if (playingId === dua.id) {
      // Pause current audio
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      // Stop and switch audio source
      setAudioBuffering(true);
      audioRef.current.pause();
      audioRef.current.src = dua.audio_url;
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setPlayingId(dua.id);
        })
        .catch((err) => {
          console.error('Audio play failed:', err);
          setAudioBuffering(false);
          setPlayingId(null);
        });
    }
  };

  // Skip progress bar
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>, duration: number) => {
    if (audioRef.current && playingId !== null) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  // Helper: Format time seconds -> "MM:SS"
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Navigation back and header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Link
            href="/duas"
            style={{
              color: 'var(--color-primary)',
              fontWeight: 'var(--font-weight-medium)',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>←</span> Феҳрист
          </Link>
          
          <span
            style={{
              backgroundColor: 'var(--color-primary-container-low-opacity)',
              color: 'var(--color-primary)',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 'bold',
            }}
          >
            {initialData.total} зикру дуо
          </span>
        </div>

        <h1
          className="headline-large"
          style={{
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: '1.5rem',
            fontSize: '1.75rem',
          }}
        >
          {initialData.category_name_tajik}
        </h1>

        {/* Search bar inside category */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-outline)',
              padding: '0.4rem 0.8rem',
              boxShadow: 'var(--elevation-1)',
            }}
          >
            <span style={{ fontSize: '1rem', marginRight: '0.5rem', opacity: 0.5 }}>🔍</span>
            <input
              type="text"
              placeholder="Ҷустуҷӯ дар ин мавзӯъ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
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
                  opacity: 0.5,
                  padding: '2px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Duas list cards stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredDuas.length > 0 ? (
            filteredDuas.map((dua, index) => {
              const isCurrentPlaying = playingId === dua.id;
              return (
                <div
                  key={dua.id}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-outline)',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    boxShadow: isCurrentPlaying ? 'var(--elevation-3)' : 'var(--elevation-1)',
                    borderColor: isCurrentPlaying ? 'var(--color-primary)' : 'var(--color-outline)',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                  }}
                >
                  {/* Top bar with count index */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--color-primary-container-low-opacity)',
                        color: 'var(--color-primary)',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {index + 1} / {initialData.total}
                    </span>
                  </div>

                  {/* Arabic text block (RTL, large) */}
                  {dua.arabic && (
                    <div
                      className="arabic-text"
                      style={{
                        direction: 'rtl',
                        textAlign: 'right',
                        fontSize: '24px',
                        lineHeight: '1.9',
                        fontWeight: 'bold',
                        color: 'var(--color-primary)',
                        marginBottom: '1rem',
                        fontFamily: 'Amiri, serif',
                      }}
                    >
                      <span lang="ar">{dua.arabic}</span>
                    </div>
                  )}

                  {/* Tajik definition block */}
                  <div
                    style={{
                      fontSize: '16px',
                      lineHeight: '1.65',
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'pre-line',
                      marginBottom: '1rem',
                    }}
                  >
                    {dua.tajik}
                  </div>

                  {/* Reference indicator */}
                  {dua.reference && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        fontStyle: 'italic',
                        marginBottom: '1rem',
                      }}
                    >
                      Сарчашма: {dua.reference}
                    </div>
                  )}

                  {/* Premium audio player inline row */}
                  {dua.audio_url && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-background)',
                        borderRadius: '12px',
                        border: '1px solid var(--color-outline)',
                        marginTop: '0.5rem',
                      }}
                    >
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => handlePlayPause(dua)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'var(--color-on-primary)',
                          boxShadow: 'var(--elevation-1)',
                          flexShrink: 0,
                          position: 'relative',
                        }}
                      >
                        {isCurrentPlaying && audioBuffering ? (
                          // Buffering spinner
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid var(--color-on-primary)',
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite',
                            }}
                          />
                        ) : isCurrentPlaying ? (
                          // Pause SVG icon
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="5" y="4" width="4" height="16" rx="1" />
                            <rect x="15" y="4" width="4" height="16" rx="1" />
                          </svg>
                        ) : (
                          // Play SVG icon
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      {/* Timeline Slider Progress track */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          type="range"
                          min="0"
                          max={isCurrentPlaying ? audioDuration : 100}
                          value={isCurrentPlaying ? audioCurrentTime : 0}
                          onChange={(e) => handleProgressChange(e, audioDuration)}
                          disabled={!isCurrentPlaying}
                          style={{
                            width: '100%',
                            accentColor: 'var(--color-primary)',
                            cursor: isCurrentPlaying ? 'pointer' : 'default',
                            height: '4px',
                          }}
                        />
                        
                        {/* Time labels */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                          <span>{isCurrentPlaying ? formatTime(audioCurrentTime) : '0:00'}</span>
                          <span>{isCurrentPlaying ? formatTime(audioDuration) : '0:00'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🔍</div>
              <p>Ҳеҷ дуое ба ин нишондод ёфт нашуд.</p>
            </div>
          )}
        </div>
      </main>

      {/* Buffering keyframe spinner styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

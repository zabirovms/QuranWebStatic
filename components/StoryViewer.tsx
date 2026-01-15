'use client';

import { useState, useEffect, useRef } from 'react';
import { Story, StorySlide } from '@/lib/types/story';
import { Reciter } from '@/lib/data/reciter-data-client';
import { markStoryAsRead } from '@/lib/data/story-data-client';
import { buildVerseAudioUrl } from '@/lib/utils/audio-helper';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface StoryViewerProps {
  story: Story;
  reciter: Reciter;
  onClose?: () => void;
}

// Audio service for verse playback
class StoryAudioService {
  private audio: HTMLAudioElement | null = null;
  private positionInterval: NodeJS.Timeout | null = null;
  private onPositionUpdate: ((position: number) => void) | null = null;
  private onStateUpdate: ((state: 'idle' | 'loading' | 'buffering' | 'ready' | 'completed') => void) | null = null;

  setPositionListener(callback: (position: number) => void) {
    this.onPositionUpdate = callback;
  }

  setStateListener(callback: (state: 'idle' | 'loading' | 'buffering' | 'ready' | 'completed') => void) {
    this.onStateUpdate = callback;
  }

  async playVerse(surahNumber: number, verseNumber: number, edition: string): Promise<void> {
    // Stop any existing audio
    this.stop();

    // Create audio element
    this.audio = new Audio();
    
    // Build verse-by-verse audio URL (using Al-Quran Cloud API format)
    const audioUrl = buildVerseAudioUrl(edition, surahNumber, verseNumber);
    
    // Set up event listeners
    this.audio.addEventListener('loadedmetadata', () => {
      if (this.onStateUpdate) {
        this.onStateUpdate('ready');
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.onStateUpdate) {
        this.onStateUpdate('completed');
      }
    });

    this.audio.addEventListener('waiting', () => {
      if (this.onStateUpdate) {
        this.onStateUpdate('buffering');
      }
    });

    this.audio.addEventListener('loadstart', () => {
      if (this.onStateUpdate) {
        this.onStateUpdate('loading');
      }
    });

    // Start position polling
    this.startPositionPolling();

    // Load and play
    this.audio.src = audioUrl;
    try {
      await this.audio.play();
    } catch (error) {
      console.error('[StoryAudio] Failed to play:', error);
      throw error;
    }
  }

  private startPositionPolling() {
    this.stopPositionPolling();
    this.positionInterval = setInterval(() => {
      if (this.audio && this.onPositionUpdate) {
        const position = this.audio.currentTime * 1000; // Convert to milliseconds
        this.onPositionUpdate(position);
      }
    }, 100); // Update every 100ms
  }

  private stopPositionPolling() {
    if (this.positionInterval) {
      clearInterval(this.positionInterval);
      this.positionInterval = null;
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  resume(): void {
    if (this.audio) {
      this.audio.play().catch(err => console.error('[StoryAudio] Failed to resume:', err));
    }
  }

  stop(): void {
    this.stopPositionPolling();
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
      this.audio = null;
    }
  }

  get position(): number {
    return this.audio ? this.audio.currentTime * 1000 : 0; // milliseconds
  }

  get duration(): number | null {
    return this.audio && this.audio.duration ? this.audio.duration * 1000 : null; // milliseconds
  }

  get isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  get processingState(): 'idle' | 'loading' | 'buffering' | 'ready' | 'completed' {
    if (!this.audio) return 'idle';
    if (this.audio.ended) return 'completed';
    if (this.audio.readyState >= 2) return 'ready';
    return 'loading';
  }
}

export default function StoryViewer({ story, reciter, onClose }: StoryViewerProps) {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isHorizontalDrag, setIsHorizontalDrag] = useState(false);
  const [horizontalDragDistance, setHorizontalDragDistance] = useState(0);
  const [lastTapPosition, setLastTapPosition] = useState<{ x: number; y: number } | null>(null);
  const [audioPosition, setAudioPosition] = useState(0); // milliseconds
  const [audioDuration, setAudioDuration] = useState<number | null>(null); // milliseconds
  const [progressValue, setProgressValue] = useState(0); // 0-1
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimationRef = useRef<number | null>(null);
  const audioServiceRef = useRef<StoryAudioService | null>(null);
  const fadeInRef = useRef(true);

  useEffect(() => {
    // Initialize audio service
    audioServiceRef.current = new StoryAudioService();
    
    // Set up audio listeners
    audioServiceRef.current.setPositionListener((position) => {
      setAudioPosition(position);
      // Update progress based on audio position
      // Use a ref to get the latest audioDuration without causing re-renders
      const currentDuration = audioServiceRef.current?.duration;
      if (currentDuration && currentDuration > 0) {
        const progress = position / currentDuration;
        setProgressValue(Math.min(1, Math.max(0, progress)));
      }
    });

    audioServiceRef.current.setStateListener((state) => {
      if (state === 'completed') {
        // Audio finished - navigate to next slide
        navigateForward();
      }
    });
    
    // Fade in animation
    fadeInRef.current = true;
    const timer = setTimeout(() => {
      fadeInRef.current = false;
    }, 300);

    return () => {
      clearTimeout(timer);
      if (progressAnimationRef.current) {
        cancelAnimationFrame(progressAnimationRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      audioServiceRef.current?.stop();
    };
  }, []); // Only run once on mount

  useEffect(() => {
    // Mark story as read when reaching the last slide
    if (currentSlideIndex === story.slides.length - 1) {
      markStoryAsRead(story.id);
    }
  }, [currentSlideIndex, story.id, story.slides.length]);

  useEffect(() => {
    // Reset progress when slide changes
    setProgressValue(0);
    setAudioPosition(0);
    setAudioDuration(null);

    // Play current verse audio when slide changes
    const currentSlide = story.slides[currentSlideIndex];
    if (currentSlide && currentSlide.surahNumber && currentSlide.verseNumber) {
      playCurrentVerse(currentSlide.surahNumber, currentSlide.verseNumber);
    } else {
      // No verse to play, use default duration
      setAudioDuration(5000);
      startSlideProgress(5000);
    }
  }, [currentSlideIndex, story.slides]);

  const playCurrentVerse = async (surahNumber: number, verseNumber: number) => {
    if (!audioServiceRef.current) return;
    
    try {
      await audioServiceRef.current.playVerse(surahNumber, verseNumber, reciter.id);
      // Wait a bit for duration to be available
      setTimeout(() => {
        const duration = audioServiceRef.current?.duration;
        if (duration && duration > 0) {
          setAudioDuration(duration);
          startSlideProgress(duration);
        } else {
          // Fallback to default duration
          setAudioDuration(5000);
          startSlideProgress(5000);
        }
      }, 100);
    } catch (error) {
      console.error('[StoryViewer] Failed to play verse audio:', error);
      // Use default duration on error
      setAudioDuration(5000);
      startSlideProgress(5000);
    }
  };

  const startSlideProgress = (durationMs: number) => {
    if (isPaused) return;
    
    // Cancel any existing animation
    if (progressAnimationRef.current) {
      cancelAnimationFrame(progressAnimationRef.current);
    }

    // If we have audio, progress is driven by audio position updates
    // Otherwise, use animation frame for fallback
    if (!audioServiceRef.current?.isPlaying) {
      const startTime = Date.now();
      const startProgress = progressValue;

      const animate = () => {
        if (isPaused) return;
        
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(1, startProgress + (elapsed / durationMs));
        
        setProgressValue(newProgress);

        if (newProgress < 1 && !isPaused) {
          progressAnimationRef.current = requestAnimationFrame(animate);
        } else if (newProgress >= 1) {
          // Auto-advance to next slide
          navigateForward();
        }
      };

      progressAnimationRef.current = requestAnimationFrame(animate);
    }
  };

  const navigateForward = () => {
    audioServiceRef.current?.stop();
    setAudioPosition(0);
    setAudioDuration(null);
    setProgressValue(0);

    if (currentSlideIndex < story.slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setIsPaused(false);
    } else {
      // End of story - close
      handleClose();
    }
  };

  const navigateBackward = () => {
    audioServiceRef.current?.stop();
    setAudioPosition(0);
    setAudioDuration(null);
    setProgressValue(0);

    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setIsPaused(false);
    }
  };

  const handleClose = () => {
    audioServiceRef.current?.stop();
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    }, 300);
  };

  const handleTapDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging || isHorizontalDrag) {
      setLastTapPosition(null);
      return;
    }
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setLastTapPosition({ x: clientX, y: clientY });
  };

  const handleTap = (e: React.MouseEvent) => {
    if (isDragging || isHorizontalDrag || !lastTapPosition) return;

    const screenWidth = window.innerWidth;
    if (lastTapPosition.x < screenWidth / 2) {
      navigateBackward();
    } else {
      navigateForward();
    }
    setLastTapPosition(null);
  };

  const handleLongPressStart = () => {
    if (isDragging || isHorizontalDrag) return;

    setIsPaused(true);
    audioServiceRef.current?.pause();
    
    // Stop progress animation
    if (progressAnimationRef.current) {
      cancelAnimationFrame(progressAnimationRef.current);
      progressAnimationRef.current = null;
    }
  };

  const handleLongPressEnd = () => {
    if (isDragging || isHorizontalDrag || !isPaused) return;

    setIsPaused(false);
    audioServiceRef.current?.resume();
    
    // Resume progress animation
    if (audioDuration) {
      const remaining = audioDuration - (progressValue * audioDuration);
      if (remaining > 0) {
        startSlideProgress(remaining);
      }
    }
  };

  const handleVerticalDragStart = () => {
    setDragOffset(0);
    setHorizontalDragDistance(0);
    setIsDragging(true);
  };

  const handleVerticalDragUpdate = (deltaY: number) => {
    if (!isHorizontalDrag && Math.abs(horizontalDragDistance) < 20) {
      if (deltaY > 0) {
        setDragOffset(prev => Math.max(0, prev + deltaY));
      } else if (dragOffset > 0) {
        setDragOffset(prev => Math.max(0, prev + deltaY));
      }
    }
  };

  const handleVerticalDragEnd = () => {
    if (dragOffset > 100 && !isHorizontalDrag && Math.abs(horizontalDragDistance) < 20) {
      handleClose();
    } else {
      setDragOffset(0);
      setIsDragging(false);
    }
  };

  const handleHorizontalDragStart = () => {
    setLastTapPosition(null);
    if (progressAnimationRef.current) {
      cancelAnimationFrame(progressAnimationRef.current);
      progressAnimationRef.current = null;
    }
    setIsDragging(true);
    setIsHorizontalDrag(true);
    setHorizontalDragDistance(0);
  };

  const handleHorizontalDragUpdate = (deltaX: number) => {
    setHorizontalDragDistance(prev => prev + deltaX);
  };

  const handleHorizontalDragEnd = () => {
    // Horizontal swipes disabled - just resume progress
    const currentDuration = audioServiceRef.current?.duration || audioDuration;
    if (currentDuration && !isPaused) {
      startSlideProgress(currentDuration);
    }
    setHorizontalDragDistance(0);
    setIsDragging(false);
    setIsHorizontalDrag(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    handleTapDown(e);
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      handleLongPressStart();
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Cancel long press if moved
    if (longPressTimerRef.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal drag
      if (!isHorizontalDrag) {
        handleHorizontalDragStart();
      }
      handleHorizontalDragUpdate(deltaX);
    } else {
      // Vertical drag
      if (!isDragging) {
        handleVerticalDragStart();
      }
      handleVerticalDragUpdate(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isPaused) {
      handleLongPressEnd();
    }

    if (isHorizontalDrag) {
      handleHorizontalDragEnd();
    } else if (isDragging) {
      handleVerticalDragEnd();
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    handleTapDown(e);
    longPressTimerRef.current = setTimeout(() => {
      handleLongPressStart();
    }, 500);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isPaused) {
      handleLongPressEnd();
    } else {
      handleTap(e);
    }
  };

  if (!story.slides || story.slides.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}>
        No slides available
      </div>
    );
  }

  const currentSlide = story.slides[currentSlideIndex];
  const reciterPhotoUrl = reciter.photoUrl || null;
  const verseReference = currentSlide.verseReference || 'Қори';
  const opacity = 1.0 - Math.min(1, dragOffset / 300);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 9999,
        opacity: isClosing ? 0 : (fadeInRef.current ? 0 : 1),
        transition: 'opacity 0.3s ease',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Progress bars at top */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        right: '8px',
        zIndex: 10000,
      }}>
        <div style={{
          display: 'flex',
          gap: '4px',
        }}>
          {story.slides.map((_, index) => {
            const isActive = index === currentSlideIndex;
            const isCompleted = index < currentSlideIndex;

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '2px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isCompleted && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#fff',
                    borderRadius: '2px',
                  }} />
                )}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${progressValue * 100}%`,
                    backgroundColor: '#fff',
                    borderRadius: '2px',
                    transition: 'width 0.1s linear',
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Header with reciter image and title */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '16px',
        right: '16px',
        zIndex: 10000,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {/* Reciter image */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '2.5px solid #fff',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {reciterPhotoUrl ? (
              <img
                src={reciterPhotoUrl}
                alt={reciter.nameTajik || reciter.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '24px',
              }}>
                👤
              </div>
            )}
          </div>
          {/* Title and verse reference */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {story.title}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {verseReference}
            </div>
          </div>
        </div>
      </div>

      {/* Content area with swipe down to exit */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `translateY(${dragOffset}px)`,
          opacity,
        }}
      >
        {buildSlideContent(currentSlide, reciterPhotoUrl)}
      </div>
    </div>
  );

  function buildSlideContent(slide: StorySlide, photoUrl: string | null) {
    if (slide.type === 'image' || slide.type === 'video') {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '64px',
            }}>
              👤
            </div>
          )}
        </div>
      );
    } else if (slide.type === 'text') {
      // Check if content contains Arabic and translation (separated by \n\n)
      const parts = slide.content.split('\n\n');
      const hasArabicAndTranslation = parts.length >= 2;

      return (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}>
          {/* Reciter photo as background (blurred/darkened) */}
          {photoUrl && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(10px)',
              opacity: 0.3,
            }} />
          )}
          
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.95))',
          }} />
          
          {/* Dark overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8))',
          }} />

          {/* Scrollable text content */}
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '40px',
            right: '40px',
            bottom: '40px',
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '20px',
          }}>
            {hasArabicAndTranslation ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
                maxWidth: '100%',
              }}>
                {/* Arabic text */}
                <div style={{
                  color: '#fff',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  lineHeight: 1.5,
                  textAlign: 'center',
                  direction: 'rtl',
                  fontFamily: 'Noto_Naskh_Arabic, serif',
                }}>
                  {parts[0]}
                </div>
                {/* Translation */}
                <div style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '20px',
                  fontWeight: 'normal',
                  lineHeight: 1.4,
                  textAlign: 'center',
                }}>
                  {parts[1]}
                </div>
              </div>
            ) : (
              <div style={{
                color: '#fff',
                fontSize: '24px',
                fontWeight: 'bold',
                lineHeight: 1.3,
                textAlign: 'center',
              }}>
                {slide.content}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}>
        Unknown slide type
      </div>
    );
  }
}

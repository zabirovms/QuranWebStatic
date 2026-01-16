'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: Date;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

const CACHE_KEY = 'youtube_videos_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getCachedVideos(): YouTubeVideo[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { videos, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp < CACHE_DURATION) {
      return videos.map((v: any) => ({
        ...v,
        publishedAt: new Date(v.publishedAt),
      }));
    }
    
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
}

function setCachedVideos(videos: YouTubeVideo[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      videos,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore storage errors
  }
}

async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  // Check cache first
  const cached = getCachedVideos();
  if (cached && cached.length > 0) {
    return cached;
  }

  const channelId = 'UC1uNVG-KeUEVDAgw88_VPXA';
  const maxResults = 10;

  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    
    // Try multiple CORS proxy services as fallback
    const proxyServices = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`,
    ];

    let xmlContent = '';
    let lastError: Error | null = null;

    for (const proxyUrl of proxyServices) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-cache',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Handle allorigins.win response format
        if (data.contents) {
          xmlContent = data.contents;
        } else if (typeof data === 'string') {
          xmlContent = data;
        } else {
          xmlContent = JSON.stringify(data);
        }
        
        break; // Success, exit loop
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to fetch from ${proxyUrl}:`, error);
        continue; // Try next proxy
      }
    }

    if (!xmlContent) {
      throw lastError || new Error('All proxy services failed');
    }
    const videos: YouTubeVideo[] = [];

    // Parse XML to extract video information
    const entryPattern = /<entry>.*?<\/entry>/gs;
    const entries = xmlContent.match(entryPattern)?.slice(0, maxResults) || [];

    for (const entry of entries) {
      // Extract video ID
      const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      if (!videoIdMatch) continue;
      const videoId = videoIdMatch[1];

      // Extract title
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      if (!titleMatch) continue;
      const title = decodeHtmlEntities(titleMatch[1]);

      // Extract published date
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      let publishedAt = new Date();
      if (publishedMatch) {
        try {
          publishedAt = new Date(publishedMatch[1]);
        } catch (e) {
          // Use current date if parsing fails
        }
      }

      // Extract thumbnail URL
      const thumbnailMatch = entry.match(/<media:thumbnail url="(.*?)"/);
      const thumbnailUrl = thumbnailMatch
        ? thumbnailMatch[1]
        : `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      videos.push({
        videoId,
        title,
        thumbnailUrl,
        channelTitle: 'YouTube Channel',
        publishedAt,
      });
    }

    // Cache the videos
    if (videos.length > 0) {
      setCachedVideos(videos);
    }

    return videos;
  } catch (e) {
    console.error('Error fetching YouTube videos:', e);
    // Return cached videos even if expired, as fallback
    const cached = getCachedVideos();
    return cached || [];
  }
}

export default function YouTubeVideosSection() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load cached videos immediately
    const cached = getCachedVideos();
    if (cached && cached.length > 0) {
      setVideos(cached);
      setIsLoading(false);
    }

    // Fetch fresh videos in background
    fetchYouTubeVideos()
      .then((fetchedVideos) => {
        setVideos(fetchedVideos);
        setIsLoading(false);
        setError(null);
        if (fetchedVideos.length === 0 && (!cached || cached.length === 0)) {
          setError('Видеоҳо ёфт нашуд');
        }
      })
      .catch((err) => {
        console.error('Error loading YouTube videos:', err);
        // Only show error if we don't have cached videos
        if (!cached || cached.length === 0) {
          setError('Хатоги дар боргирии видеоҳо');
        }
        setIsLoading(false);
      });
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    fetchYouTubeVideos()
      .then((fetchedVideos) => {
        setVideos(fetchedVideos);
        setIsLoading(false);
        setError(null);
        if (fetchedVideos.length === 0) {
          setError('Видеоҳо ёфт нашуд');
        }
      })
      .catch((err) => {
        console.error('Error loading YouTube videos:', err);
        setError('Хатоги дар боргирии видеоҳо');
        setIsLoading(false);
      });
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          margin: 0,
          color: 'var(--color-text-primary)',
        }}>
          Видеоҳо
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            background: 'none',
            border: 'none',
            cursor: isLoading ? 'wait' : 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            opacity: isLoading ? 0.5 : 1,
          }}
          title="Навсозӣ"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div 
          className="scrollable-container"
          style={{ 
            display: 'inline-flex',
            gap: '12px',
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '8px 4px',
            maxWidth: '100%',
          }}
        >
          {error ? (
            <div style={{
              padding: '16px',
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              minWidth: '280px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          ) : isLoading ? (
            // Placeholder when loading
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '280px',
                  minWidth: '280px',
                  flexShrink: 0,
                  height: '200px',
                  borderRadius: '12px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-outline)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  height: '140px',
                  width: '100%',
                  backgroundColor: 'var(--color-outline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3 }}>
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
                  </svg>
                </div>
                <div style={{
                  flex: 1,
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  <div style={{
                    height: '14px',
                    backgroundColor: 'var(--color-outline)',
                    borderRadius: '4px',
                    width: '100%',
                  }} />
                  <div style={{
                    height: '14px',
                    backgroundColor: 'var(--color-outline)',
                    borderRadius: '4px',
                    width: '70%',
                  }} />
                </div>
              </div>
            ))
          ) : videos.length > 0 ? (
            videos.map((video, index) => (
              <Link
                key={index}
                href={`/youtube/${video.videoId}?title=${encodeURIComponent(video.title)}`}
                className="scrollable-container"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '280px',
                  minWidth: '280px',
                  flexShrink: 0,
                  height: '200px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-outline)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  height: '140px',
                  width: '100%',
                  backgroundColor: 'var(--color-outline)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7z" fill="white"/>
                    </svg>
                  </div>
                </div>
                <div style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  lineHeight: '1.3',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}>
                  <span style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {video.title}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            // Placeholder when no videos
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '280px',
                  height: '200px',
                  borderRadius: '12px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-outline)',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  height: '140px',
                  width: '100%',
                  backgroundColor: 'var(--color-outline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3 }}>
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" fill="currentColor"/>
                  </svg>
                </div>
                <div style={{
                  flex: 1,
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}>
                  <div style={{
                    height: '14px',
                    backgroundColor: 'var(--color-outline)',
                    borderRadius: '4px',
                    width: '100%',
                  }} />
                  <div style={{
                    height: '14px',
                    backgroundColor: 'var(--color-outline)',
                    borderRadius: '4px',
                    width: '70%',
                  }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


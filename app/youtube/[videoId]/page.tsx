'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface YouTubeVideo {
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
  const maxResults = 20;

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
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
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

export default function YouTubeVideoPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoId = params.videoId as string;
  const title = searchParams.get('title') || 'Видео';
  const [isClient, setIsClient] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Fetch videos list
    fetchYouTubeVideos().then((videosList) => {
      setVideos(videosList);
      setIsLoadingVideos(false);
    }).catch(() => {
      setIsLoadingVideos(false);
    });
  }, []);

  if (!isClient) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: 'var(--color-text-secondary)' }}>Боргирӣ...</div>
        </div>
      </div>
    );
  }

  // Filter out current video from the list
  const otherVideos = videos.filter(v => v.videoId !== videoId);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-background)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: '24px',
            padding: '12px 24px',
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>←</span>
          <span>Баргаштан</span>
        </button>

        {/* Title */}
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
          lineHeight: '1.4',
        }}>
          {decodeURIComponent(title)}
        </h1>

        {/* YouTube Video Embed */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          height: 0,
          marginBottom: '32px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--elevation-4)',
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={decodeURIComponent(title)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </div>

        {/* Other Videos - Below the playing video */}
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '20px',
          }}>
            Видеоҳои дигар
          </h2>
          
          {isLoadingVideos ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--color-text-secondary)',
            }}>
              Боргирӣ карда истодааст...
            </div>
          ) : otherVideos.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}>
              {otherVideos.map((video) => (
                <Link
                  key={video.videoId}
                  href={`/youtube/${video.videoId}?title=${encodeURIComponent(video.title)}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'inherit',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-outline)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface-variant)';
                    e.currentTarget.style.boxShadow = 'var(--elevation-2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: '100%',
                    paddingBottom: '56.25%', // 16:9 aspect ratio
                    height: 0,
                    position: 'relative',
                    background: 'var(--color-surface-variant)',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                      }}
                    />
                  </div>
                  
                  {/* Video Info */}
                  <div style={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'var(--color-text-primary)',
                      margin: 0,
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {video.title}
                    </h3>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {video.channelTitle}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
            }}>
              Видеои дигар ёфт нашуд
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

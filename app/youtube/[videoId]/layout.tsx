import type { Metadata } from 'next';

type Props = {
  params: { videoId: string };
};

// Fetch YouTube videos at build time for static generation
async function fetchYouTubeVideosForBuild(): Promise<{ videoId: string }[]> {
  const channelId = 'UC1uNVG-KeUEVDAgw88_VPXA';
  const maxResults = 50; // Fetch more videos for static generation
  
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
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
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
      console.warn('Failed to fetch YouTube videos for static generation:', lastError);
      return []; // Return empty array if fetch fails
    }

    const videos: { videoId: string }[] = [];

    // Parse XML to extract video IDs
    const entryPattern = /<entry>.*?<\/entry>/gs;
    const entries = xmlContent.match(entryPattern)?.slice(0, maxResults) || [];

    for (const entry of entries) {
      // Extract video ID
      const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      if (!videoIdMatch) continue;
      const videoId = videoIdMatch[1];
      videos.push({ videoId });
    }

    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos for static generation:', error);
    return []; // Return empty array on error
  }
}

// Generate static params for YouTube videos at build time
export async function generateStaticParams() {
  try {
    const videos = await fetchYouTubeVideosForBuild();
    return videos;
  } catch (error) {
    console.error('Error generating static params for YouTube videos:', error);
    return []; // Return empty array on error
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Видео',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function YouTubeVideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


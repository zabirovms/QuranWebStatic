export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: Date;
}

// For static site, we'll use a hardcoded list
// In production, this could be fetched at build time or from a static JSON file
export function getYouTubeVideos(): YouTubeVideo[] {
  // Return empty array for now - YouTube videos are dynamic
  // Can be populated at build time if needed
  return [];
}

export function getYouTubeVideoById(videoId: string): YouTubeVideo | undefined {
  return getYouTubeVideos().find(v => v.videoId === videoId);
}



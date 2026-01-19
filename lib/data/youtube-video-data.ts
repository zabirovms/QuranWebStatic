export interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: Date;
}

// For static export we can't depend on external network calls.
// Maintain a small curated list of videos that we want to have
// dedicated `/youtube/[videoId]` pages for.
//
// NOTE: This list is ONLY used for static generation (generateStaticParams).
// The runtime UI on the home page can still fetch the latest videos dynamically.
export function getYouTubeVideos(): YouTubeVideo[] {
  return [
    {
      videoId: 'oPrXRnF7rCo',
      title:
        'Сураи Муъминон 23:93-118 (Сура Ал-Муминун) - бо тарҷумаи тоҷикӣ',
      thumbnailUrl: 'https://img.youtube.com/vi/oPrXRnF7rCo/hqdefault.jpg',
      channelTitle: 'Quran.tj',
      // Approximate / static date is fine for SEO purposes
      publishedAt: new Date('2024-01-01T00:00:00Z'),
    },
    // TODO: add more videos here as needed for static pages
  ];
}

export function getYouTubeVideoById(videoId: string): YouTubeVideo | undefined {
  return getYouTubeVideos().find((v) => v.videoId === videoId);
}



export interface StorySlide {
  type: 'image' | 'video' | 'text';
  content: string; // URL for image/video, or text content for text slides
  verseReference?: string; // Verse reference like "Сураи Бақара 2:16"
  surahNumber?: number;
  verseNumber?: number;
}

export interface Story {
  id: string;
  title: string;
  category: string;
  isFeatured: boolean;
  isRead: boolean;
  slides: StorySlide[];
}


import { getAllVerses } from '@/lib/data/verse-data-client';
import { getAllSurahs } from '@/lib/data/surah-data-client';
import { getReciterPhotoUrl } from '@/lib/utils/reciter-image-helper';
import { Story, StorySlide } from '@/lib/types/story';
import { Reciter } from '@/lib/data/reciter-data-client';

// Track used verses to ensure uniqueness across reciters
const usedVerses = new Set<string>();

// Get surah name in Tajik
function getSurahNameTajik(surahNumber: number, surahs: any[]): string {
  const surah = surahs.find(s => s.number === surahNumber);
  return surah?.nameTajik || `Сураи ${surahNumber}`;
}

/**
 * Get random verses for a reciter (20 unique verses, not used by other reciters)
 */
async function getRandomVersesForReciter(reciterId: string): Promise<any[]> {
  const allVerses = await getAllVerses();
  const numberOfVerses = 20;
  const verses: any[] = [];
  const usedSurahs = new Set<number>();

  // Filter out already used verses
  const availableVerses = allVerses.filter(v => !usedVerses.has(v.uniqueKey));

  if (availableVerses.length === 0) {
    // If all verses are used, reset and start fresh
    usedVerses.clear();
    return getRandomVersesForReciter(reciterId);
  }

  // Shuffle available verses
  const shuffled = [...availableVerses].sort(() => Math.random() - 0.5);

  // Select verses ensuring variety (max 2 verses per surah)
  for (const verse of shuffled) {
    if (verses.length >= numberOfVerses) break;

    const surahCount = Array.from(usedSurahs).filter(s => s === verse.surahId).length;
    if (surahCount < 2 && !usedVerses.has(verse.uniqueKey)) {
      verses.push(verse);
      usedVerses.add(verse.uniqueKey);
      usedSurahs.add(verse.surahId);
    }
  }

  return verses;
}

/**
 * Get story for a reciter
 */
export async function getReciterStory(reciter: Reciter): Promise<Story> {
  try {
    const verses = await getRandomVersesForReciter(reciter.id);
    const surahs = await getAllSurahs();

    // Create slides from verses
    const slides: StorySlide[] = verses.map((verse) => {
      // Combine Arabic text and translation
      const verseText = `${verse.arabicText}\n\n${verse.tajikText || verse.arabicText}`;

      // Create verse reference
      const surahName = getSurahNameTajik(verse.surahId, surahs);
      const verseReference = `${surahName} ${verse.surahId}:${verse.verseNumber}`;

      return {
        type: 'text' as const,
        content: verseText,
        verseReference,
        surahNumber: verse.surahId,
        verseNumber: verse.verseNumber,
      };
    });

    // If no verses, create a default slide
    if (slides.length === 0) {
      slides.push({
        type: 'text',
        content: reciter.nameTajik || reciter.name,
      });
    }

    // Check if story is read (from localStorage)
    const readStatus = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('story_read_status') || '{}')
      : {};
    const isRead = readStatus[reciter.id] || false;

    return {
      id: reciter.id,
      title: reciter.nameTajik || reciter.name,
      category: 'reciter',
      isFeatured: false,
      isRead,
      slides,
    };
  } catch (error) {
    console.error('Error loading reciter story:', error);
    // Return empty story on error
    return {
      id: reciter.id,
      title: reciter.nameTajik || reciter.name,
      category: 'reciter',
      isFeatured: false,
      isRead: false,
      slides: [{
        type: 'text',
        content: reciter.nameTajik || reciter.name,
      }],
    };
  }
}

/**
 * Mark story as read
 */
export function markStoryAsRead(storyId: string): void {
  if (typeof window === 'undefined') return;
  
  const readStatus = JSON.parse(localStorage.getItem('story_read_status') || '{}');
  readStatus[storyId] = true;
  localStorage.setItem('story_read_status', JSON.stringify(readStatus));
}


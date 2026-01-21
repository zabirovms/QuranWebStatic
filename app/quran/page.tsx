import { getAllSurahs } from '@/lib/data/surah-data';
import { getAllVerses } from '@/lib/data/verse-data';
import { Surah, Verse } from '@/lib/types';
import QuranPageClient from '@/components/QuranPageClient';

interface JuzInfo {
  juz: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
}

interface PageInfo {
  page: number;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
}

export default async function QuranPage() {
  const surahs: Surah[] = await getAllSurahs();
  const verses: Verse[] = await getAllVerses();

  // Build juz list (1-30) based on verses, matching previous client logic
  const juzMap = new Map<number, JuzInfo>();
  for (const verse of verses) {
    if (verse.juz && !juzMap.has(verse.juz)) {
      const surah = surahs.find((s) => s.number === verse.surahId);
      juzMap.set(verse.juz, {
        juz: verse.juz,
        surahNumber: verse.surahId,
        surahName: surah?.nameTajik || `Сураи ${verse.surahId}`,
        ayahNumber: verse.verseNumber,
      });
    }
  }
  const juzList = Array.from(juzMap.values()).sort((a, b) => a.juz - b.juz);

  // Build page list (1-604) based on verses, matching previous client logic
  const pageMap = new Map<number, PageInfo>();
  for (const verse of verses) {
    if (verse.page && !pageMap.has(verse.page)) {
      const surah = surahs.find((s) => s.number === verse.surahId);
      pageMap.set(verse.page, {
        page: verse.page,
        surahNumber: verse.surahId,
        surahName: surah?.nameTajik || `Сураи ${verse.surahId}`,
        ayahNumber: verse.verseNumber,
      });
    }
  }
  const pageList = Array.from(pageMap.values()).sort((a, b) => a.page - b.page);

  return <QuranPageClient surahs={surahs} juzList={juzList} pageList={pageList} />;
}


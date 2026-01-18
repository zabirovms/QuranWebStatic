import { getQaidaModule } from '@/lib/data/qaida-data';

/**
 * Get ALL syllable IDs from syllables examples
 * Standard approach for lessons 2, 3, 4, 6, 7, 8
 * Returns array of ALL syllable IDs (not just first per letter)
 * This ensures all possible drill page routes are generated
 */
export async function getFirstSyllableIdPerLetter(lessonId: number): Promise<string[]> {
  const module = await getQaidaModule();
  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    console.warn(`[qaida-params] Lesson ${lessonId} not found`);
    return [];
  }
  
  const syllablesBlock = lesson.content.find(
    (b) => b.subtype === 'syllables_examples'
  );
  if (!syllablesBlock?.examples) {
    console.warn(`[qaida-params] No syllables examples found for lesson ${lessonId}`);
    return [];
  }
  
  // Return ALL syllable IDs, not just first per letter
  // This ensures all possible routes are generated
  const ids = syllablesBlock.examples
    .filter((syllable) => syllable?.id)
    .map((syllable) => syllable.id);
  
  console.log(`[qaida-params] Lesson ${lessonId}: Returning ${ids.length} syllable IDs (all syllables)`);
  return ids;
}

/**
 * Get letter IDs from letters chart for lessons 1 and 5
 */
export async function getLetterIdsFromChart(lessonId: number, chartType: 'letters_chart' | 'letters_forms_chart'): Promise<string[]> {
  const module = await getQaidaModule();
  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) return [];
  
  const lettersBlock = lesson.content.find(
    (b) => b.subtype === chartType
  );
  if (!lettersBlock?.letters) return [];
  
  return lettersBlock.letters.map((letter) => letter.id).filter(Boolean);
}

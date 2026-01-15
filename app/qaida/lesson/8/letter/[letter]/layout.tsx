import { getQaidaModule } from '@/lib/data/qaida-data';

export async function generateStaticParams() {
  const module = await getQaidaModule();
  const lesson = module.lessons.find((l) => l.id === 8);
  if (!lesson) return [];
  
  const syllablesBlock = lesson.content.find(
    (b) => b.subtype === 'syllables_examples'
  );
  const allSyllables = syllablesBlock?.examples || [];
  
  // Group by letter to get unique letters
  const letterGroups: { [key: string]: any[] } = {};
  for (const syllable of allSyllables) {
    const groupKey = syllable.letter;
    if (!letterGroups[groupKey]) {
      letterGroups[groupKey] = [];
    }
    letterGroups[groupKey].push(syllable);
  }
  
  const uniqueLetters = Object.keys(letterGroups);
  
  return uniqueLetters.map((letter) => ({
    letter,
  }));
}

export default function LetterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

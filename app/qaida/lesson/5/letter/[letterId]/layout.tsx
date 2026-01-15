import { getQaidaModule } from '@/lib/data/qaida-data';

export async function generateStaticParams() {
  const module = await getQaidaModule();
  const lesson = module.lessons.find((l) => l.id === 5);
  if (!lesson) return [];
  
  const lettersBlock = lesson.content.find(
    (b) => b.subtype === 'letters_forms_chart'
  );
  const letters = lettersBlock?.letters || [];
  
  return letters.map((letter) => ({
    letterId: letter.id,
  }));
}

export default function LetterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

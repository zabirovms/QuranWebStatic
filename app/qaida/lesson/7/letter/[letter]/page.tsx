import QaidaDrillPage from '@/components/QaidaDrillPage';
import { getFirstSyllableIdPerLetter } from '@/lib/utils/qaida-params';

export async function generateStaticParams() {
  const syllableIds = await getFirstSyllableIdPerLetter(7);
  return syllableIds.map((id) => ({
    letter: id, // Using 'letter' to match folder name [letter], but it's actually an ID
  }));
}

interface PageProps {
  params: {
    letter: string; // This is actually a syllable ID
  };
}

export default function SukunDrillPage({ params }: PageProps) {
  return (
    <QaidaDrillPage
      lessonNumber={7}
      syllableId={params.letter}
      drillType="sukun"
    />
  );
}


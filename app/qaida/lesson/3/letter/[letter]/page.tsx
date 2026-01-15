import QaidaDrillPage from '@/components/QaidaDrillPage';

interface PageProps {
  params: {
    letter: string;
  };
}

export default function VowelsDrillPage({ params }: PageProps) {
  return (
    <QaidaDrillPage
      lessonNumber={3}
      letter={params.letter}
      drillType="vowels"
    />
  );
}


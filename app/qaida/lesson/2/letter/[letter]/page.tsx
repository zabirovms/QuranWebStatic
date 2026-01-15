import QaidaDrillPage from '@/components/QaidaDrillPage';

interface PageProps {
  params: {
    letter: string;
  };
}

export default function PronunciationDrillPage({ params }: PageProps) {
  return (
    <QaidaDrillPage
      lessonNumber={2}
      letter={params.letter}
      drillType="pronunciation"
    />
  );
}


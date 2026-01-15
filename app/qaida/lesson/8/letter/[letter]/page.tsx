import QaidaDrillPage from '@/components/QaidaDrillPage';

interface PageProps {
  params: {
    letter: string;
  };
}

export default function MaddDrillPage({ params }: PageProps) {
  return (
    <QaidaDrillPage
      lessonNumber={8}
      letter={params.letter}
      drillType="madd"
    />
  );
}


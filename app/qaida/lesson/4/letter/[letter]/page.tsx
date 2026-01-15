import QaidaDrillPage from '@/components/QaidaDrillPage';

interface PageProps {
  params: {
    letter: string;
  };
}

export default function TanweenDrillPage({ params }: PageProps) {
  return (
    <QaidaDrillPage
      lessonNumber={4}
      letter={params.letter}
      drillType="tanween"
    />
  );
}


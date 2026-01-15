import QaidaDrillPage from '@/components/QaidaDrillPage';

interface PageProps {
  params: {
    letter: string;
  };
}

export default function ShaddaDrillPage({ params }: PageProps) {
  return (
    <QaidaDrillPage
      lessonNumber={6}
      letter={params.letter}
      drillType="shadda"
    />
  );
}


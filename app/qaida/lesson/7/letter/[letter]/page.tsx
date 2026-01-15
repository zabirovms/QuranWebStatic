import QaidaDrillPage from '@/components/QaidaDrillPage';

interface PageProps {
  params: {
    letter: string;
  };
}

export default function SukunDrillPage({ params }: PageProps) {
  return (
    <QaidaDrillPage
      lessonNumber={7}
      letter={params.letter}
      drillType="sukun"
    />
  );
}


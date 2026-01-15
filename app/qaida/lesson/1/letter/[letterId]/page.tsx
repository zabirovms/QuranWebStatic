import QaidaDrillPage from '@/components/QaidaDrillPage';

interface PageProps {
  params: {
    letterId: string;
  };
}

export default function AlphabetDrillPage({ params }: PageProps) {
  return (
    <QaidaDrillPage
      lessonNumber={1}
      letterId={params.letterId}
      drillType="alphabet"
    />
  );
}


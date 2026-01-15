import QaidaDrillPage from '@/components/QaidaDrillPage';

interface PageProps {
  params: {
    letterId: string;
  };
}

export default function LetterFormsDrillPage({ params }: PageProps) {
  return (
    <QaidaDrillPage
      lessonNumber={5}
      letterId={params.letterId}
      drillType="letterForms"
    />
  );
}


import QaidaDrillPage from '@/components/QaidaDrillPage';
import { getLetterIdsFromChart } from '@/lib/utils/qaida-params';

export async function generateStaticParams() {
  const letterIds = await getLetterIdsFromChart(5, 'letters_forms_chart');
  return letterIds.map((letterId) => ({
    letterId,
  }));
}

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


import QaidaDrillPage from '@/components/QaidaDrillPage';
import { getLetterIdsFromChart } from '@/lib/utils/qaida-params';

export async function generateStaticParams() {
  const letterIds = await getLetterIdsFromChart(1, 'letters_chart');
  return letterIds.map((letterId) => ({
    letterId,
  }));
}

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


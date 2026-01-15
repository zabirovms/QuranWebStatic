import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Қоидаи Бағдодӣ | Омӯзиши хондани Қуръон',
  description: 'Омӯзиши асосии хондани Қуръон: ҳарфҳо, ҳаракатҳо, таҷвид ва қоидаҳои асосии хондани Қуръони Карим.',
  alternates: {
    canonical: 'https://www.quran.tj/qaida',
  },
  openGraph: {
    title: 'Қоидаи Бағдодӣ | Омӯзиши хондани Қуръон',
    description: 'Омӯзиши асосии хондани Қуръон: ҳарфҳо, ҳаракатҳо ва қоидаҳои асосии хондани Қуръони Карим.',
    type: 'website',
    url: 'https://www.quran.tj/qaida',
  },
  twitter: {
    card: 'summary',
    title: 'Қоидаи Бағдодӣ | Омӯзиши хондани Қуръон',
    description: 'Омӯзиши асосии хондани Қуръон: ҳарфҳо, ҳаракатҳо ва қоидаҳои асосии хондани Қуръони Карим.',
  },
};

export default function QaidaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


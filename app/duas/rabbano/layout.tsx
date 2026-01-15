import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Дуоҳои Раббано | Дуоҳои Қуръонӣ',
  description: 'Рӯйхати пурраи дуоҳои Раббано аз Қуръони Карим. Дуоҳое, ки ба калимаи "Раббано" оғоз мешаванд бо тарҷума ва тафсири осонбаён.',
  alternates: {
    canonical: 'https://www.quran.tj/duas/rabbano',
  },
  openGraph: {
    title: 'Дуоҳои Раббано | Дуоҳои Қуръонӣ',
    description: 'Рӯйхати пурраи дуоҳои Раббано аз Қуръони Карим бо тарҷума ва тафсири осонбаён.',
    type: 'website',
    url: 'https://www.quran.tj/duas/rabbano',
  },
  twitter: {
    card: 'summary',
    title: 'Дуоҳои Раббано',
    description: 'Рӯйхати пурраи дуоҳои Раббано аз Қуръони Карим.',
  },
};

export default function RabbanoDuasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


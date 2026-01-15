import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Дуоҳо | Дуоҳои Раббано ва Паёмбарон',
  description: 'Рӯйхати пурраи дуоҳои Раббано ва дуоҳои паёмбарон аз Қуръони Карим. Хондани дуоҳо бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ.',
  alternates: {
    canonical: 'https://www.quran.tj/duas',
  },
  openGraph: {
    title: 'Дуоҳо | Дуоҳои Раббано ва Паёмбарон',
    description: 'Рӯйхати пурраи дуоҳои Раббано ва дуоҳои паёмбарон аз Қуръони Карим.',
    type: 'website',
    url: 'https://www.quran.tj/duas',
  },
  twitter: {
    card: 'summary',
    title: 'Дуоҳо | Дуоҳои Раббано ва Паёмбарон',
    description: 'Рӯйхати пурраи дуоҳои Раббано ва дуоҳои паёмбарон аз Қуръони Карим.',
  },
};

export default function DuasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


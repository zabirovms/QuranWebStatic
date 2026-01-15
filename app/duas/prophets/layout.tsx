import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Дуоҳои Паёмбарон дар Қуръон',
  description: 'Рӯйхати пурраи дуоҳои паёмбарон аз Қуръони Карим. Дуоҳои Ҳазрати Муҳаммад (с), Иброҳим (а), Мусо (а), Исо (а) ва дигар паёмбарон бо тарҷумаи тоҷикӣ.',
  alternates: {
    canonical: 'https://www.quran.tj/duas/prophets',
  },
  openGraph: {
    title: 'Дуоҳои Паёмбарон дар Қуръон',
    description: 'Рӯйхати пурраи дуоҳои паёмбарон аз Қуръони Карим бо тарҷумаи тоҷикӣ.',
    type: 'website',
    url: 'https://www.quran.tj/duas/prophets',
  },
  twitter: {
    card: 'summary',
    title: 'Дуоҳои Паёмбарон',
    description: 'Рӯйхати пурраи дуоҳои паёмбарон аз Қуръони Карим.',
  },
};

export default function ProphetsDuasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


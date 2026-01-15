import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Паёмбарон | Рӯйхати паёмбарон дар Қуръон',
  description: 'Рӯйхати пурраи паёмбарон, ки дар Қуръони Карим зикр шудаанд: Муҳаммад (с), Иброҳим, Мусо, Исо, Нӯҳ, Юсуф ва дигарон. Таърих ва қиссаҳои паёмбарон бо тафсири осонбаён.',
  alternates: {
    canonical: 'https://www.quran.tj/prophets',
  },
  openGraph: {
    title: 'Паёмбарон | Рӯйхати паёмбарон дар Қуръон',
    description: 'Рӯйхати пурраи паёмбарон, ки дар Қуръони Карим зикр шудаанд бо тафсири осонбаён.',
    type: 'website',
    url: 'https://www.quran.tj/prophets',
  },
  twitter: {
    card: 'summary',
    title: 'Паёмбарон | Рӯйхати паёмбарон',
    description: 'Рӯйхати пурраи паёмбарон, ки дар Қуръони Карим зикр шудаанд.',
  },
};

export default function ProphetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


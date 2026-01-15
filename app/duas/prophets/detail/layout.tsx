import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Дуоҳои Паёмбарон дар Қуръон | Дуоҳои паёмбарон',
  description: 'Дуоҳои паёмбарон дар Қуръони Карим. Рӯйхати пурраи дуоҳое, ки паёмбарон дар Қуръон кардаанд: дуоҳои Ҳазрати Муҳаммад (с), Иброҳим, Мусо, Исо, Нӯҳ, Юсуф ва дигарон (а). Хондани дуоҳои паёмбарон бо тарҷума ва тафсири осонбаён дар забони тоҷикӣ.',
  alternates: {
    canonical: 'https://www.quran.tj/duas/prophets/detail',
  },
  openGraph: {
    title: 'Дуоҳои Паёмбарон дар Қуръон | Дуоҳои паёмбарон',
    description: 'Дуоҳои паёмбарон дар Қуръони Карим. Рӯйхати пурраи дуоҳое, ки паёмбарон дар Қуръон кардаанд бо тарҷума ва тафсири осонбаён.',
    type: 'website',
    url: 'https://www.quran.tj/duas/prophets/detail',
  },
  twitter: {
    card: 'summary',
    title: 'Дуоҳои Паёмбарон дар Қуръон',
    description: 'Дуоҳои паёмбарон дар Қуръони Карим. Рӯйхати пурраи дуоҳое, ки паёмбарон дар Қуръон кардаанд.',
  },
};

export default function ProphetDuaDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


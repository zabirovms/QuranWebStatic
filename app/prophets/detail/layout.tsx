import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Паёмбарон дар Қуръон | Тафсилоти паёмбарон',
  description: 'Тафсилоти пурраи паёмбарон дар Қуръони Карим. Оятҳо, қиссаҳо ва таърихи паёмбарон: Ҳазрати Муҳаммад (с), Иброҳим, Мусо, Исо, Нӯҳ, Юсуф, Одам, Идрис ва дигарон. Маълумоти пурра бо тарҷума ва тафсири осонбаён бо забони тоҷикӣ.',
  alternates: {
    canonical: 'https://www.quran.tj/prophets/detail',
  },
  openGraph: {
    title: 'Паёмбарон дар Қуръон | Тафсилоти паёмбарон',
    description: 'Тафсилоти пурраи паёмбарон дар Қуръони Карим. Оятҳо, қиссаҳо ва таърихи паёмбарон бо тарҷума ва тафсири осонбаён.',
    type: 'website',
    url: 'https://www.quran.tj/prophets/detail',
  },
  twitter: {
    card: 'summary',
    title: 'Паёмбарон дар Қуръон',
    description: 'Тафсилоти пурраи паёмбарон дар Қуръони Карим. Оятҳо, қиссаҳо ва таърихи паёмбарон.',
  },
};

export default function ProphetDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


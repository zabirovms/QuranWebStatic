import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Омӯзиши калимаҳои Қуръон',
  description: 'Тарқумаи кулли калимаҳои Қуръони Карим. Тарқумаи оятҳои Қуръони Карим калима ба калима.',
  alternates: {
    canonical: 'https://www.quran.tj/learn-words',
  },
  openGraph: {
    title: 'Омӯзиши калимаҳои Қуръон',
    description: 'Омӯзиши калимаҳои Қуръони Карим бо роҳҳои интерактивӣ.',
    type: 'website',
    url: 'https://www.quran.tj/learn-words',
  },
  twitter: {
    card: 'summary',
    title: 'Омӯзиши Калимаҳои Қуръон',
    description: 'Омӯзиши калимаҳои Қуръони Карим.',
  },
};

export default function LearnWordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


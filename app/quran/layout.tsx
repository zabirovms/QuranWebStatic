import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Сураҳои Қуръони Карим',
  description: 'Роҳнамои пурраи Қуръони Карим: рӯйхати 114 сура, 30 ҷузъ, 604 саҳифа ва ҳамаи оятҳо. Навигатсияи осон барои ёфтани дихоҳ сура, ҷузъ, саҳифа ё ояти муайян.',
  alternates: {
    canonical: 'https://www.quran.tj/quran',
  },
  openGraph: {
    title: 'Сураҳои Қуръони Карим',
    description: 'Роҳнамои пурраи Қуръони Карим: рӯйхати 114 сура, 30 ҷузъ,604 саҳифа ва ҳамаи оятҳо.',
    type: 'website',
    url: 'https://www.quran.tj/quran',
  },
  twitter: {
    card: 'summary',
    title: 'Сураҳои Қуръони Карим',
    description: 'Роҳнамои пурраи Қуръони Карим: рӯйхати 114 сура, 30 ҷузъ,604 саҳифа ва ҳамаи оятҳо.',
  },
};

export default function QuranLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


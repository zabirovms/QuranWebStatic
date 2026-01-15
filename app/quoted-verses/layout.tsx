import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Иқтибосҳо аз Қуръон | Оятҳои машҳур ва бештар иқтибосшуда',
  description: 'Рӯйхати оятҳои машҳур ва бештар иқтибосшуда аз Қуръони Карим бо тарҷума ва тафсири тоҷикӣ.',
  alternates: {
    canonical: 'https://www.quran.tj/quoted-verses',
  },
  openGraph: {
    title: 'Иқтибосҳо аз Қуръон | Оятҳои машҳур',
    description: 'Рӯйхати оятҳои машҳур ва бештар иқтибосшуда аз Қуръони Карим бо тарҷума ва тафсири осонбаён.',
    type: 'website',
    url: 'https://www.quran.tj/quoted-verses',
  },
  twitter: {
    card: 'summary',
    title: 'Иқтибосҳо аз Қуръон',
    description: 'Рӯйхати оятҳои машҳур ва бештар иқтибосшуда аз Қуръони Карим бо тарҷума ва тафсири тоҷикӣ.',
  },
};

export default function QuotedVersesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


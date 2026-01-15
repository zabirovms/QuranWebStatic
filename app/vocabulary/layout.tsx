import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Луғатҳои Қуръон | Омӯзиши 85% калимаҳои Қуръон',
  description: 'Бо омӯхтани ҳудудан 750 калима шумо метавонед 85%-и Қуръонро бифаҳмед.',
  alternates: {
    canonical: 'https://www.quran.tj/vocabulary',
  },
  openGraph: {
    title: 'Луғатҳои Қуръон | Омӯзиши 85% калимаҳои Қуръон',
    description: 'Бо омӯхтани ҳудудан 750 калима шумо метавонед 85%-и Қуръонро бифаҳмед.',
    type: 'website',
    url: 'https://www.quran.tj/vocabulary',
  },
  twitter: {
    card: 'summary',
    title: 'Луғатҳои Қуръон | Омӯзиши 85% калимаҳои Қуръон',
    description: 'Омӯзиши калимаҳои асосии Қуръони Карим.',
  },
};

export default function VocabularyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


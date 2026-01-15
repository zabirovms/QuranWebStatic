import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Фарзи Айн',
  description: 'Хондани китоби Фарзи Айни тоҷикӣ.',
  alternates: {
    canonical: 'https://www.quran.tj/farzi-ayn',
  },
  openGraph: {
    title: 'Фарзи Айн',
    description: 'Хондани китоби Фарзи Айни тоҷикӣ.',
    type: 'website',
    url: 'https://www.quran.tj/farzi-ayn',
  },
  twitter: {
    card: 'summary',
    title: 'Фарзи Айн',
    description: 'Хондани китоби Фарзи Айни тоҷикӣ.',
  },
};

export default function FarziAynLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Махзани Маърифат | Қуръони Карим',
  description: 'Китобҳои динӣ, таърихӣ ва маърифатӣ барои боргирӣ ва хондан. Махзани китобҳои исломӣ, Қуръон, Ҳадис ва таърих.',
  alternates: {
    canonical: 'https://www.quran.tj/downloads',
  },
  openGraph: {
    title: 'Махзани Маърифат | Қуръони Карим',
    description: 'Китобҳои динӣ, таърихӣ ва маърифатӣ барои боргирӣ ва хондан.',
    type: 'website',
    url: 'https://www.quran.tj/downloads',
  },
  twitter: {
    card: 'summary',
    title: 'Махзани Маърифат | Қуръони Карим',
    description: 'Китобҳои динӣ, таърихӣ ва маърифатӣ барои боргирӣ ва хондан.',
  },
};

export default function DownloadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Зикрҳои Исломӣ',
  description: 'Рӯйхати зикрҳои исломӣ бо тасбеҳгӯяк барои зикр кардан.',
  alternates: {
    canonical: 'https://www.quran.tj/tasbeeh',
  },
  openGraph: {
    title: 'Зикрҳои Исломӣ',
    description: 'Рӯйхати зикрҳои исломӣ бо тасбеҳгӯяк барои зикр кардан.',
    type: 'website',
    url: 'https://www.quran.tj/tasbeeh',
  },
  twitter: {
    card: 'summary',
    title: 'Зикрҳои Исломӣ',
    description: 'Рӯйхати зикрҳои исломӣ бо тасбеҳгӯяк барои зикр кардан.',
  },
};

export default function TasbeehLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


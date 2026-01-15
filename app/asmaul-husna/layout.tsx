import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Асмоул Ҳусно | 99 Номи Аллоҳ',
  description: 'Рӯйхати пурраи 99 номи мубораки Аллоҳ (Асмоул Ҳусно) бо тарҷумаи тоҷикӣ.',
  alternates: {
    canonical: 'https://www.quran.tj/asmaul-husna',
  },
  openGraph: {
    title: 'Асмоул Ҳусно | 99 Номи Аллоҳ',
    description: 'Рӯйхати пурраи 99 номи мубораки Аллоҳ (Асмоул Ҳусно) бо тарҷумаи тоҷикӣ.',
    type: 'website',
    url: 'https://www.quran.tj/asmaul-husna',
  },
  twitter: {
    card: 'summary',
    title: 'Асмоул Ҳусно | 99 Номи Аллоҳ',
    description: 'Рӯйхати пурраи 99 номи мубораки Аллоҳ (Асмоул Ҳусно).',
  },
};

export default function AsmaulHusnaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


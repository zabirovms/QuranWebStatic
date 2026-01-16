import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Мухтасари Саҳеҳи Бухорӣ',
  description: 'Хондани Мухтасари Саҳеҳи Бухорӣ - Ҳадисҳои саҳеҳи Имом Бухорӣ бо забони тоҷикӣ',
  alternates: {
    canonical: 'https://www.quran.tj/bukhari',
  },
  openGraph: {
    title: 'Мухтасари Саҳеҳи Бухорӣ',
    description: 'Хондани Мухтасари Саҳеҳи Бухорӣ - Ҳадисҳои саҳеҳи Имом Бухорӣ бо забони тоҷикӣ',
    type: 'website',
    url: 'https://www.quran.tj/bukhari',
  },
  twitter: {
    card: 'summary',
    title: 'Мухтасари Саҳеҳи Бухорӣ',
    description: 'Хондани Мухтасари Саҳеҳи Бухорӣ - Ҳадисҳои саҳеҳи Имом Бухорӣ бо забони тоҷикӣ',
  },
};

export default function BukhariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

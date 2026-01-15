import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Қироати Қуръони Карим | Тиловати Қуръон',
  description: 'Рӯйхати пурраи қориҳои Қуръон бо таҷвид ва тартил. Гӯш кардани Қуръон бо қориҳои машҳури ҷаҳон.',
  alternates: {
    canonical: 'https://www.quran.tj/audio-home',
  },
  openGraph: {
    title: 'Қироати Қуръони Карим | Тиловати Қуръон',
    description: 'Рӯйхати пурраи қориҳои Қуръон бо таҷвид ва тартил. Гӯш кардани Қуръон бо қориҳои машҳури ҷаҳон.',
    type: 'website',
    url: 'https://www.quran.tj/audio-home',
  },
  twitter: {
    card: 'summary',
    title: 'Қироати Қуръони Карим | Тиловати Қуръон',
    description: 'Рӯйхати пурраи қориҳои Қуръон бо таҷвид ва тартил. Гӯш кардани Қуръон бо қориҳои машҳури ҷаҳон.',
  },
};

export default function AudioHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


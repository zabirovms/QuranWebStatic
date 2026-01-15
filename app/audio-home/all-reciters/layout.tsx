import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Рӯйхати қориҳои Қуръон',
  description: 'Рӯйхати пурраи қориҳои машҳури Қуръон. Тиловати Қуръон тавассути қориҳои машҳури ҷаҳон.',
  alternates: {
    canonical: 'https://www.quran.tj/audio-home/all-reciters',
  },
  openGraph: {
    title: 'Рӯйхати қориҳои Қуръон',
    description: 'Рӯйхати пурраи қориҳои машҳури Қуръон. Тиловати Қуръон тавассути қориҳои машҳури ҷаҳон.',
    type: 'website',
    url: 'https://www.quran.tj/audio-home/all-reciters',
  },
  twitter: {
    card: 'summary',
    title: 'Рӯйхати қориҳои Қуръон',
    description: 'Рӯйхати пурраи қориҳои машҳури Қуръон. Тиловати Қуръон тавассути қориҳои машҳури ҷаҳон.',
  },
};

export default function AllRecitersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Аксҳо ва тасвирҳои исломӣ',
  description: 'Тасвирҳои исломӣ, аксҳои исломӣ, дуоҳо ва ғайра.',
  alternates: {
    canonical: 'https://www.quran.tj/gallery',
  },
  openGraph: {
    title: 'Аксҳо ва тасвирҳои исломӣ',
    description: 'Тасвирҳои исломӣ, аксҳои исломӣ, дуоҳо ва ғайра.',
    type: 'website',
    url: 'https://www.quran.tj/gallery',
  },
  twitter: {
    card: 'summary',
    title: 'Аксҳо ва тасвирҳои исломӣ',
    description: 'Тасвирҳои исломӣ, аксҳои исломӣ, дуоҳо ва ғайра.',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


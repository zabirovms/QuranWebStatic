import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Плеер',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AudioPlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Китобхона',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AudioLibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


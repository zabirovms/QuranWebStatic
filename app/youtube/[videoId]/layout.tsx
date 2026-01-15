import type { Metadata } from 'next';

type Props = {
  params: { videoId: string };
};

// Dynamic route - no generateStaticParams needed for SSR
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Видео',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function YouTubeVideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


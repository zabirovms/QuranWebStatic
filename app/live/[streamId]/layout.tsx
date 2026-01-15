import type { Metadata } from 'next';
import { getAllLiveStreams } from '@/lib/data/live-stream-data';

type Props = {
  params: { streamId: string };
};

export async function generateStaticParams() {
  const streams = getAllLiveStreams();
  return streams.map((stream) => ({
    streamId: stream.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Пахши зинда',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function LiveStreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


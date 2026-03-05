import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import OrganizationSchema from '@/components/OrganizationSchema';
import { TopBarProvider } from '@/lib/contexts/TopBarContext';
import MainContentWrapper from '@/components/MainContentWrapper';

const ThemeInitializer = dynamic(() => import('@/components/ThemeInitializer'), {
  ssr: false,
});

const MiniAudioPlayer = dynamic(() => import('@/components/MiniAudioPlayer'), {
  ssr: false,
});

const ServiceWorkerInitializer = dynamic(
  () => import('@/components/ServiceWorkerInitializer'),
  {
    ssr: false,
  }
);

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'Қуръони Карим - Тафсири Осонбаён бо забони тоҷикӣ',
  description: 'Қуръони Карим бо тарҷума ва тафсири осонбаён дар забони тоҷикӣ. Хондани 114 сура, тиловати аудиоӣ бо 150+ қориҳои машҳур, дуоҳо, тафсир, тасбеҳ ва маводҳои дигари динӣ.',
  metadataBase: new URL('https://www.quran.tj'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tg">
      <head>
        <link rel="preload" href="/alquran.svg" as="image" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <OrganizationSchema />
        <ThemeInitializer />
        <ServiceWorkerInitializer />
        <TopBarProvider>
          <TopBar />
          <MainContentWrapper>{children}</MainContentWrapper>
          <Footer />
          <MiniAudioPlayer />
        </TopBarProvider>
      </body>
    </html>
  );
}


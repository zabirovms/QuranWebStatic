import type { Metadata } from 'next'
import './globals.css'
import TopBar from '@/components/TopBar'
import Footer from '@/components/Footer'
import ThemeInitializer from '@/components/ThemeInitializer'
import MiniAudioPlayer from '@/components/MiniAudioPlayer'
import MobileAppDownloadDialog from '@/components/MobileAppDownloadDialog'
import { TopBarProvider } from '@/lib/contexts/TopBarContext'

export const metadata: Metadata = {
  title: 'Қуръони Карим - Тафсири Осонбаён бо забони тоҷикӣ',
  description: 'Хондани Қуръони Карим бо тарҷумаи тоҷикӣ ва тафсири осонбаён. Рӯйхати ҳамаи 114 сураҳои Қуръони Карим. Тиловати оят ба оят ва кулли сура тавассути 150+ қориҳои машҳури ҷаҳон.',
  metadataBase: new URL('https://www.quran.tj'),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tg">
      <body style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <ThemeInitializer />
        <TopBarProvider>
        <TopBar />
          <main style={{ marginTop: '56px', flex: 1, paddingTop: 0 }}>
          {children}
        </main>
        <Footer />
        <MiniAudioPlayer />
        <MobileAppDownloadDialog />
        </TopBarProvider>
      </body>
    </html>
  )
}


import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вақти намоз',
  description: 'Вақти намозҳои панҷвақта барои шаҳру ноҳияҳои кишвар.',
  robots: {
    index: false, // User-specific scheduling
    follow: true,
  },
  alternates: {
    canonical: 'https://www.quran.tj/scheduler',
  },
};

export default function SchedulerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ҷустуҷӯи оятҳо ва калимаҳо дар Қуръони Карим',
  description: 'Ҷустуҷӯи оятҳо, сура, саҳифа, ҷузъ, калимаҳо ва мавзӯъҳо дар Қуръони Карим. Дастрасии зуд ба натиҷаҳои ёфташуда.',
  robots: {
    index: false, // Search results are dynamic and user-specific
    follow: true,
  },
  alternates: {
    canonical: 'https://www.quran.tj/search',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


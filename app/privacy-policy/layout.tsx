import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Сиёсати Махфият - Қуръон бо Тафсири Осонбаён',
  description: 'Сиёсати махфияти барномаи Қуръон бо Тафсири Осонбаён. Маълумоте, ки мо ҷамъ мекунем ва чӣ тавр онҳоро истифода мебарем.',
  openGraph: {
    title: 'Сиёсати Махфият - Қуръон бо Тафсири Осонбаён',
    description: 'Сиёсати махфияти барномаи Қуръон бо Тафсири Осонбаён',
    url: 'https://quran.tj/privacy-policy',
    type: 'website',
  },
  alternates: {
    canonical: 'https://quran.tj/privacy-policy',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

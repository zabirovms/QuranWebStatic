import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllAsmaulHusna, getAsmaulHusnaBySlug } from '@/lib/data/asmaul-husna-data';
import DetailPageClient from './detail-client';

interface PageProps {
  params: {
    slug: string;
  };
}

/**
 * Pre-renders all 99 names pages at build time.
 */
export async function generateStaticParams() {
  const names = await getAllAsmaulHusna();
  return names.map((name) => ({
    slug: name.slug,
  }));
}

/**
 * Dynamic metadata generator for search engine optimization.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const name = await getAsmaulHusnaBySlug(params.slug);
  if (!name) {
    return {
      title: 'Маънои ном ёфт нашуд - Асмоул Ҳусно',
    };
  }

  const displayName = name.tajik.transliteration;
  const canonicalUrl = `https://www.quran.tj/asmaul-husna/${name.slug}`;
  const displayTitle = `Шарҳ ва маънои номи ${displayName} (${name.arabic}) - 99 Номи Аллоҳ | quran.tj`;
  
  // Truncate the explanation for the SEO description
  const metaDescription = name.description.slice(0, 155).trim() + '...';

  return {
    title: displayTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: displayTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: displayTitle,
      description: metaDescription,
    },
  };
}

export default async function AsmaulHusnaDetailPage({ params }: PageProps) {
  const [names, name] = await Promise.all([
    getAllAsmaulHusna(),
    getAsmaulHusnaBySlug(params.slug),
  ]);

  if (!name) {
    notFound();
  }

  // Find navigation links in loop
  const currentIndex = names.findIndex((n) => n.id === name.id);
  const previousIndex = currentIndex > 0 ? currentIndex - 1 : names.length - 1;
  const nextIndex = currentIndex < names.length - 1 ? currentIndex + 1 : 0;
  
  const previousName = names[previousIndex];
  const nextName = names[nextIndex];

  // Breadcrumbs Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Асосӣ',
        'item': 'https://www.quran.tj'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Асмоул Ҳусно',
        'item': 'https://www.quran.tj/asmaul-husna'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': name.tajik.transliteration,
        'item': `https://www.quran.tj/asmaul-husna/${name.slug}`
      }
    ]
  };

  return (
    <>
      {/* Inject Breadcrumbs JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <DetailPageClient 
        name={name}
        previousName={previousName}
        nextName={nextName}
        currentIndex={currentIndex}
        totalNames={names.length}
      />
    </>
  );
}

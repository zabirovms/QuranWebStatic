import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDuaCategoryBySlug } from '@/lib/data/dua-categories-data';
import CategoryClient from './category-client';

interface PageProps {
  params: {
    slug: string;
  };
}

const validSlugs = [
  'etiquette-of-supplication',
  'praise-and-glorification',
  'duas-in-prayer',
  'seeking-refuge',
  'morning-adhkar',
  'evening-adhkar',
  'ruqya-healing'
];

/**
 * Pre-render all 7 dynamic daily Adhkar categories at build time.
 */
export async function generateStaticParams() {
  return validSlugs.map((slug) => ({
    slug,
  }));
}

/**
 * Dynamic SEO metadata generator.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!validSlugs.includes(params.slug)) {
    return {
      title: 'Саҳифа ёфт нашуд',
    };
  }

  const category = await getDuaCategoryBySlug(params.slug);
  if (!category) {
    return {
      title: 'Дуо ва зикрҳо',
    };
  }

  const displayTitle = `${category.category_name_tajik} - Дуо ва зикрҳо | quran.tj`;
  const metaDescription = `Маҷмӯаи мукаммали зикрҳо ва дуоҳои мавзӯи "${category.category_name_tajik}" (${category.category_name_en}) бо тарҷума, матни арабӣ ва аудио дар сайти quran.tj`;
  const canonicalUrl = `https://www.quran.tj/duas/${params.slug}`;

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

export default async function DuaCategoryDetailPage({ params }: PageProps) {
  if (!validSlugs.includes(params.slug)) {
    notFound();
  }

  const category = await getDuaCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  // Breadcrumbs JSON-LD schema
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
        'name': 'Дуоҳо',
        'item': 'https://www.quran.tj/duas'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': category.category_name_tajik,
        'item': `https://www.quran.tj/duas/${params.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CategoryClient 
        slug={params.slug}
        initialData={category}
      />
    </>
  );
}

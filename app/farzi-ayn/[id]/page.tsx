import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllFarziAynSections, getFarziAynSectionById } from '@/lib/data/farzi-ayn-data';
import FarziAynBlockRenderer, { getCategoryColor, getCategoryName } from '@/components/FarziAynBlockRenderer';
import DetailPageClient from './detail-client';

interface PageProps {
  params: {
    id: string;
  };
}

/**
 * SSG dynamic route generator - pre-renders all sections at build time
 */
export async function generateStaticParams() {
  const sections = await getAllFarziAynSections();
  return sections.map((section) => ({
    id: section.id,
  }));
}

/**
 * SSG dynamic metadata generator for search engine optimization
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const section = await getFarziAynSectionById(params.id);
  if (!section) {
    return {
      title: 'Мавзӯъ ёфт нашуд - Фарзи Айн',
    };
  }

  // Generate description from the first paragraph or block content
  let description = `Хондани боби ${section.title} аз китоби Фарзи Айн.`;
  const firstParagraph = section.content.find(block => block.type === 'paragraph');
  if (firstParagraph && firstParagraph.type === 'paragraph') {
    description = firstParagraph.text.slice(0, 155) + '...';
  } else {
    // Try list items or Q&As
    const firstList = section.content.find(block => block.type === 'list');
    if (firstList && firstList.type === 'list' && firstList.listItems.length > 0) {
      description = firstList.listItems[0].slice(0, 155) + '...';
    }
  }

  const canonicalUrl = `https://www.quran.tj/farzi-ayn/${section.id}`;
  const displayTitle = `${section.title} - Фарзи Айн | quran.tj`;

  return {
    title: displayTitle,
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: displayTitle,
      description: description,
      url: canonicalUrl,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: displayTitle,
      description: description,
    },
  };
}

export default async function FarziAynDetailPage({ params }: PageProps) {
  const [sections, section] = await Promise.all([
    getAllFarziAynSections(),
    getFarziAynSectionById(params.id),
  ]);

  if (!section) {
    notFound();
  }

  const currentIndex = sections.findIndex((s) => s.id === section.id);
  const previousSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
  const catColor = getCategoryColor(section.category);
  const catName = getCategoryName(section.category);

  // FAQ Schema generation if there are Q&A blocks
  const qnaBlocks = section.content.filter(block => block.type === 'qna');
  const hasFaq = qnaBlocks.length > 0;
  
  const faqSchema = hasFaq ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': qnaBlocks.flatMap(block => {
      if (block.type !== 'qna') return [];
      return block.qnaItems.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }));
    })
  } : null;

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
        'name': 'Фарзи Айн',
        'item': 'https://www.quran.tj/farzi-ayn'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': section.title,
        'item': `https://www.quran.tj/farzi-ayn/${section.id}`
      }
    ]
  };

  return (
    <>
      {/* Inject schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Render page wrapped in a client-side context for layout/spacing adjustment */}
      <DetailPageClient
        section={section}
        previousSection={previousSection}
        nextSection={nextSection}
        currentIndex={currentIndex}
        totalSections={sections.length}
        catColor={catColor}
        catName={catName}
      />
    </>
  );
}

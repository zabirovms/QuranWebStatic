import type { Metadata } from 'next';
import { getAllBooksMetadata, getBukhariBook } from '@/lib/data/bukhari-data';

interface Props {
  params: { bookNumber: string; chapterNumber: string };
}

// Generate static params for all chapters at build time
export async function generateStaticParams() {
  try {
    const books = await getAllBooksMetadata();
    const params: { bookNumber: string; chapterNumber: string }[] = [];
    
    for (const book of books) {
      try {
        const bookData = await getBukhariBook(book.number, book.sub_number);
        const bookNumberStr = book.sub_number 
          ? `${book.number}-${book.sub_number}` 
          : String(book.number);
        
        for (const chapter of bookData.chapters) {
          params.push({
            bookNumber: bookNumberStr,
            chapterNumber: String(chapter.number),
          });
        }
      } catch (error) {
        console.error(`Error loading book ${book.number} for static params:`, error);
      }
    }
    
    return params;
  } catch (error) {
    console.error('Error generating static params for chapters:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bookNumberStr = params.bookNumber;
  const chapterNumber = parseInt(params.chapterNumber, 10);
  const parts = bookNumberStr.split('-');
  const bookNumber = parseInt(parts[0], 10);
  const subNumber = parts.length > 1 ? parseInt(parts[1], 10) : null;

  try {
    const book = await getBukhariBook(bookNumber, subNumber);
    const chapter = book.chapters.find(ch => ch.number === chapterNumber);
    
    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const baseUrl = 'https://www.quran.tj';
    const canonicalUrl = `${baseUrl}/bukhari/${bookNumberStr}/${chapterNumber}`;

    // Enhanced description with multiple hadith previews for uniqueness
    const descriptionParts: string[] = [];
    
    // Chapter context
    descriptionParts.push(`Боби ${chapterNumber} аз китоби ${bookNumber} (${book.title}): "${chapter.title}"`);
    
    // Hadith count
    descriptionParts.push(`${chapter.hadiths.length} ҳадис`);
    
    // Add hadith previews (up to 2 hadiths for more uniqueness)
    if (chapter.hadiths.length > 0) {
      const firstHadith = chapter.hadiths[0].full_text.substring(0, 120).replace(/\s+/g, ' ').trim();
      descriptionParts.push(`Ҳадис: ${firstHadith}${chapter.hadiths[0].full_text.length > 120 ? '...' : ''}`);
      
      // Add second hadith if available for more uniqueness
      if (chapter.hadiths.length > 1) {
        const secondHadith = chapter.hadiths[1].full_text.substring(0, 80).replace(/\s+/g, ' ').trim();
        descriptionParts.push(`Ҳадиси дигар: ${secondHadith}${chapter.hadiths[1].full_text.length > 80 ? '...' : ''}`);
      }
    } else {
      descriptionParts.push('Ҳадисҳои саҳеҳи Имом Бухорӣ');
    }

    const description = descriptionParts.join('. ');

    const title = `Боби ${chapterNumber}: ${chapter.title} | Китоб ${bookNumber} | Мухтасари Саҳеҳи Бухорӣ`;

    return {
      title,
      description,
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `Боби ${chapterNumber}: ${chapter.title} | Мухтасари Саҳеҳи Бухорӣ`,
        description,
        type: 'article',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary',
        title: `Боби ${chapterNumber}: ${chapter.title} | Мухтасари Саҳеҳи Бухорӣ`,
        description,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for chapter:', error);
    const baseUrl = 'https://www.quran.tj';
    const canonicalUrl = `${baseUrl}/bukhari/${bookNumberStr}/${chapterNumber}`;
    
    return {
      title: `Боби ${chapterNumber} | Китоби ${bookNumber} | Мухтасари Саҳеҳи Бухорӣ`,
      description: `Боби ${chapterNumber} аз китоби ${bookNumber} - Ҳадисҳои саҳеҳи Имом Бухорӣ`,
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }
}

export default function ChapterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

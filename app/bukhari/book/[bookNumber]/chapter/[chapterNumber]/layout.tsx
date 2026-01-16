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
    const canonicalUrl = `${baseUrl}/bukhari/book/${bookNumberStr}/chapter/${chapterNumber}`;

    // Get first hadith text preview (first 150 characters)
    const hadithPreview = chapter.hadiths.length > 0
      ? chapter.hadiths[0].full_text.substring(0, 150).replace(/\s+/g, ' ').trim() + (chapter.hadiths[0].full_text.length > 150 ? '...' : '')
      : '';

    const title = `Боби ${chapterNumber}: ${chapter.title} | Китоб ${bookNumber} | Мухтасари Саҳеҳи Бухорӣ`;
    const description = hadithPreview
      ? `Боби ${chapterNumber} аз китоби ${bookNumber} (${book.title}): "${chapter.title}". ${chapter.hadiths.length} ҳадис. ${hadithPreview}`
      : `Боби ${chapterNumber} аз китоби ${bookNumber} (${book.title}): "${chapter.title}". ${chapter.hadiths.length} ҳадис. Ҳадисҳои саҳеҳи Имом Бухорӣ.`;

    return {
      title,
      description,
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
    const canonicalUrl = `${baseUrl}/bukhari/book/${bookNumberStr}/chapter/${chapterNumber}`;
    
    return {
      title: `Боби ${chapterNumber} | Китоби ${bookNumber} | Мухтасари Саҳеҳи Бухорӣ`,
      description: `Боби ${chapterNumber} аз китоби ${bookNumber} - Ҳадисҳои саҳеҳи Имом Бухорӣ`,
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

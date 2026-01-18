import type { Metadata } from 'next';
import { getAllBooksMetadata, getBukhariBook } from '@/lib/data/bukhari-data';

interface Props {
  params: { bookNumber: string };
}

// Generate static params for all books at build time
export async function generateStaticParams() {
  try {
    const books = await getAllBooksMetadata();
    return books.map((book) => ({
      bookNumber: book.sub_number 
        ? `${book.number}-${book.sub_number}` 
        : String(book.number),
    }));
  } catch (error) {
    console.error('Error generating static params for books:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bookNumberStr = params.bookNumber;
  const parts = bookNumberStr.split('-');
  const bookNumber = parseInt(parts[0], 10);
  const subNumber = parts.length > 1 ? parseInt(parts[1], 10) : null;

  try {
    const book = await getBukhariBook(bookNumber, subNumber);
    const baseUrl = 'https://www.quran.tj';
    const canonicalUrl = `${baseUrl}/bukhari/${bookNumberStr}`;

    const title = `Китоби ${bookNumber}: ${book.title} | Мухтасари Саҳеҳи Бухорӣ`;
    
    // Enhanced description with more context
    const descriptionParts: string[] = [];
    descriptionParts.push(`Китоби ${bookNumber} аз Мухтасари Саҳеҳи Бухорӣ: "${book.title}"`);
    descriptionParts.push(`${book.total_chapters} боб`);
    descriptionParts.push(`${book.total_hadiths} ҳадис`);
    descriptionParts.push('Ҳадисҳои саҳеҳи Имом Бухорӣ бо забони тоҷикӣ');
    
    const description = descriptionParts.join('. ');

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
        title: `Китоби ${bookNumber}: ${book.title} | Мухтасари Саҳеҳи Бухорӣ`,
        description,
        type: 'website',
        url: canonicalUrl,
      },
      twitter: {
        card: 'summary',
        title: `Китоби ${bookNumber}: ${book.title} | Мухтасари Саҳеҳи Бухорӣ`,
        description,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for book:', error);
    const baseUrl = 'https://www.quran.tj';
    const canonicalUrl = `${baseUrl}/bukhari/${bookNumberStr}`;
    
    return {
      title: `Китоби ${bookNumber} | Мухтасари Саҳеҳи Бухорӣ`,
      description: `Китоби ${bookNumber} аз Мухтасари Саҳеҳи Бухорӣ - Ҳадисҳои саҳеҳи Имом Бухорӣ`,
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

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

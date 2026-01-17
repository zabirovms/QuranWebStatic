'use client';

import { useEffect, useRef } from 'react';

interface BukhariStructuredDataProps {
  type: 'collection' | 'book' | 'chapter';
  bookNumber?: number;
  subNumber?: number | null;
  chapterNumber?: number;
  bookTitle?: string;
  chapterTitle?: string;
  totalBooks?: number;
  totalChapters?: number;
  totalHadiths?: number;
  chapterHadithCount?: number;
}

/**
 * StructuredData Component for Bukhari Pages
 * Adds Schema.org JSON-LD structured data for SEO
 * Compatible with static export (client-side injection)
 */
export default function BukhariStructuredData({
  type,
  bookNumber,
  subNumber,
  chapterNumber,
  bookTitle,
  chapterTitle,
  totalBooks,
  totalChapters,
  totalHadiths,
  chapterHadithCount,
}: BukhariStructuredDataProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Only run on client side after mount to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    // Remove any existing structured data script
    try {
      if (scriptRef.current && scriptRef.current.isConnected) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
      
      const existingScript = document.querySelector('script[type="application/ld+json"][data-seo="bukhari"]');
      if (existingScript && existingScript.isConnected && existingScript !== scriptRef.current) {
        existingScript.remove();
      }
    } catch (error) {
      console.warn('Error removing structured data script:', error);
    }

    const baseUrl = 'https://www.quran.tj';
    let structuredData: any;

    if (type === 'collection') {
      // Collection (Home page) structured data
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        '@id': `${baseUrl}/bukhari`,
        name: 'Мухтасари Саҳеҳи Бухорӣ',
        alternateName: 'Саҳеҳи Бухорӣ',
        description: 'Мухтасари Саҳеҳи Бухорӣ - Ҳадисҳои саҳеҳи Имом Бухорӣ бо забони тоҷикӣ',
        author: {
          '@type': 'Person',
          name: 'Имом Бухорӣ',
          alternateName: 'Muhammad ibn Ismail al-Bukhari',
        },
        inLanguage: 'tg',
        about: {
          '@type': 'Thing',
          name: 'Hadith',
        },
        bookFormat: 'Digital',
        genre: 'Religious Text',
        numberOfPages: totalBooks || 88,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Асосӣ',
              item: baseUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Саҳеҳи Бухорӣ',
              item: `${baseUrl}/bukhari`,
            },
          ],
        },
      };
    } else if (type === 'book' && bookNumber && bookTitle) {
      // Book structured data
      const bookNumberStr = subNumber ? `${bookNumber}-${subNumber}` : String(bookNumber);
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        '@id': `${baseUrl}/bukhari/${bookNumberStr}`,
        name: `Китоб ${bookNumber}: ${bookTitle}`,
        description: `Китоби ${bookNumber} аз Саҳеҳи Бухорӣ: "${bookTitle}". ${totalChapters || 0} боб, ${totalHadiths || 0} ҳадис.`,
        inLanguage: 'tg',
        about: {
          '@type': 'Thing',
          name: 'Hadith',
        },
        bookFormat: 'Digital',
        genre: 'Religious Text',
        isPartOf: {
          '@type': 'Book',
          name: 'Мухтасари Саҳеҳи Бухорӣ',
          '@id': `${baseUrl}/bukhari`,
        },
        position: bookNumber,
        numberOfPages: totalChapters || 0,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Асосӣ',
              item: baseUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Саҳеҳи Бухорӣ',
              item: `${baseUrl}/bukhari`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: `Китоб ${bookNumber}`,
              item: `${baseUrl}/bukhari/${bookNumberStr}`,
            },
          ],
        },
      };
    } else if (type === 'chapter' && bookNumber && chapterNumber && chapterTitle && bookTitle) {
      // Chapter structured data
      const bookNumberStr = subNumber ? `${bookNumber}-${subNumber}` : String(bookNumber);
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${baseUrl}/bukhari/${bookNumberStr}/${chapterNumber}`,
        headline: `Боб ${chapterNumber}: ${chapterTitle}`,
        description: `Боб ${chapterNumber} аз китоби ${bookNumber} (${bookTitle}): "${chapterTitle}". ${chapterHadithCount || 0} ҳадис.`,
        inLanguage: 'tg',
        about: {
          '@type': 'Thing',
          name: 'Hadith',
        },
        isPartOf: {
          '@type': 'Book',
          name: `Китоб ${bookNumber}: ${bookTitle}`,
          '@id': `${baseUrl}/bukhari/${bookNumberStr}`,
        },
        position: chapterNumber,
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Асосӣ',
              item: baseUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Саҳеҳи Бухорӣ',
              item: `${baseUrl}/bukhari`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: `Китоби ${bookNumber}`,
              item: `${baseUrl}/bukhari/${bookNumberStr}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: `Боби ${chapterNumber}`,
              item: `${baseUrl}/bukhari/${bookNumberStr}/${chapterNumber}`,
            },
          ],
        },
      };
    }

    // Create and append structured data script
    try {
      if (isMountedRef.current && document.head && structuredData) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', 'bukhari');
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
        scriptRef.current = script;
      }
    } catch (error) {
      console.warn('Error adding structured data script:', error);
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      try {
        if (scriptRef.current && scriptRef.current.isConnected) {
          scriptRef.current.remove();
          scriptRef.current = null;
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    };
  }, [type, bookNumber, subNumber, chapterNumber, bookTitle, chapterTitle, totalBooks, totalChapters, totalHadiths, chapterHadithCount]);

  return null;
}

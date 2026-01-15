'use client';

import { useEffect, useRef } from 'react';

interface StructuredDataProps {
  type: 'surah' | 'verse';
  surahNumber: number;
  surahName: string;
  verseNumber?: number;
  verseText?: string;
  verseTranslation?: string;
}

/**
 * StructuredData Component
 * Adds Schema.org JSON-LD structured data for SEO
 * Compatible with static export (client-side injection)
 */
export default function StructuredData({
  type,
  surahNumber,
  surahName,
  verseNumber,
  verseText,
  verseTranslation,
}: StructuredDataProps) {
  const isMountedRef = useRef(true);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  
  useEffect(() => {
    // Only run on client side after mount to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    // Remove any existing structured data script (safely)
    // Use .remove() instead of removeChild() to avoid conflicts with React's unmount
    // Check if element is still connected to DOM before removing
    try {
      // Only remove our own script
      if (scriptRef.current && scriptRef.current.isConnected) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
      
      // Also check for any scripts we might have created
      const existingScript = document.querySelector('script[type="application/ld+json"][data-seo="quran"]');
      if (existingScript && existingScript.isConnected && existingScript !== scriptRef.current) {
        existingScript.remove();
      }
    } catch (error) {
      // Ignore errors during DOM manipulation
      console.warn('Error removing structured data script:', error);
    }

    const baseUrl = 'https://www.quran.tj';
    let structuredData: any;

    if (type === 'verse' && verseNumber) {
      // Verse page structured data
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        '@id': `${baseUrl}/surah/${surahNumber}/${verseNumber}`,
        name: `${surahName} ${surahNumber}:${verseNumber}`,
        description: verseTranslation || `Сураи ${surahName} ояти ${verseNumber}`,
        inLanguage: ['ar', 'tg'],
        about: {
          '@type': 'Thing',
          name: 'Quran',
        },
        partOf: {
          '@type': 'CreativeWork',
          name: surahName,
          '@id': `${baseUrl}/surah/${surahNumber}`,
        },
        position: verseNumber,
        text: verseText || '',
        translation: verseTranslation || '',
      };
    } else {
      // Surah page structured data
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        '@id': `${baseUrl}/surah/${surahNumber}`,
        name: surahName,
        description: `Сураи ${surahName} - Қуръони Карим`,
        inLanguage: ['ar', 'tg'],
        about: {
          '@type': 'Thing',
          name: 'Quran',
        },
        bookFormat: 'Digital',
        genre: 'Religious Text',
      };
    }

    // Create and append structured data script (safely)
    try {
      if (isMountedRef.current && document.head) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', 'quran');
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
        scriptRef.current = script;
      }
    } catch (error) {
      console.warn('Error adding structured data script:', error);
    }

    // Cleanup on unmount - but only if component is still mounted
    return () => {
      isMountedRef.current = false;
      // Don't remove during cleanup - let React handle it
      // This prevents conflicts with React's unmount phase
    };
  }, [type, surahNumber, surahName, verseNumber, verseText, verseTranslation]);

  return null;
}


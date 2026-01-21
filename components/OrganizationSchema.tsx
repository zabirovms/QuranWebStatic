'use client';

import { useEffect, useRef } from 'react';

/**
 * Organization Structured Data Component
 * Adds Schema.org JSON-LD structured data for the organization
 * Compatible with static export (client-side injection)
 */
export default function OrganizationSchema() {
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Only run on client side after mount to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;

    // Remove any existing organization structured data script
    try {
      if (scriptRef.current && scriptRef.current.isConnected) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
      
      const existingScript = document.querySelector('script[type="application/ld+json"][data-seo="organization"]');
      if (existingScript && existingScript.isConnected && existingScript !== scriptRef.current) {
        existingScript.remove();
      }
    } catch (error) {
      console.warn('Error removing organization structured data script:', error);
    }

    const baseUrl = 'https://www.quran.tj';

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Quran.tj',
      alternateName: 'Қуръон бо Тафсири Осонбаён',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: 'Қуръони Карим бо тарҷума ва тафсири осонбаён дар забони тоҷикӣ',
      sameAs: [
        'https://www.instagram.com/quran.tj.official',
        'https://www.youtube.com/@balkhiverse',
        'https://play.google.com/store/apps/details?id=com.quran.tj.quranapp',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@quran.tj',
        contactType: 'Customer Service',
        availableLanguage: ['tg', 'ar'],
      },
      inLanguage: ['tg', 'ar'],
      areaServed: {
        '@type': 'Country',
        name: 'Tajikistan',
      },
    };

    // Create and append structured data script
    try {
      if (isMountedRef.current && document.head) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', 'organization');
        script.textContent = JSON.stringify(structuredData, null, 2);
        document.head.appendChild(script);
        scriptRef.current = script;
      }
    } catch (error) {
      console.warn('Error adding organization structured data script:', error);
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (scriptRef.current && scriptRef.current.isConnected) {
        try {
          scriptRef.current.remove();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return null;
}

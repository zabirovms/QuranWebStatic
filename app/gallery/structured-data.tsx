'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  data: any;
}

/**
 * Generic StructuredData Component for gallery
 * Adds Schema.org JSON-LD structured data for SEO
 */
export default function GalleryStructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Remove any existing structured data script for gallery
    const existingScript = document.querySelector('script[type="application/ld+json"][data-seo="gallery"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and append structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'gallery');
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"][data-seo="gallery"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data]);

  return null;
}

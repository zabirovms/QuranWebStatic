'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface DynamicMetadataProps {
  title: string;
  description: string;
  canonical?: string;
}

export default function DynamicMetadata({ title, description, canonical }: DynamicMetadataProps) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update canonical link
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }
    
    // Update Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    updateOGTag('og:title', title);
    updateOGTag('og:description', description);
    if (canonical) {
      updateOGTag('og:url', canonical);
    }
    
    // Update Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    updateTwitterTag('twitter:title', title);
    updateTwitterTag('twitter:description', description);
    
    // Remove noindex if present
    let robotsTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (robotsTag && robotsTag.content.includes('noindex')) {
      robotsTag.setAttribute('content', 'index, follow');
    }
  }, [title, description, canonical, searchParams]);
  
  return null;
}


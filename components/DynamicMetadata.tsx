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
    
    // Update or create meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    // Extract keywords from title and description
    const keywords = `${title}, ${description}`.toLowerCase();
    metaKeywords.setAttribute('content', keywords);
    
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
    updateOGTag('og:type', 'website');
    if (canonical) {
      updateOGTag('og:url', canonical);
    }
    updateOGTag('og:site_name', 'Quran.tj');
    updateOGTag('og:locale', 'tg_TJ');
    
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
    
    updateTwitterTag('twitter:card', 'summary_large_image');
    updateTwitterTag('twitter:title', title);
    updateTwitterTag('twitter:description', description);
    updateTwitterTag('twitter:site', '@quran_tj');
    
    // Remove noindex if present
    let robotsTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (robotsTag && robotsTag.content.includes('noindex')) {
      robotsTag.setAttribute('content', 'index, follow');
    }
  }, [title, description, canonical, searchParams]);
  
  return null;
}


'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * CanonicalHead Component
 * 
 * Handles canonical URLs for pages with query parameters.
 * Safely handles searchParams to prevent hydration errors.
 * 
 * Rules:
 * - /surah/{n}?verse={v} → canonical to /surah/{n} (no trailing slash)
 * - All other query params → canonical to base path (no trailing slash, except root)
 * - URLs match live site style: https://www.quran.tj/surah/36 (no trailing slash)
 */
export default function CanonicalHead() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMountedRef = useRef(true);
  const linkRef = useRef<HTMLLinkElement | null>(null);
  
  useEffect(() => {
    // Only run on client side after mount to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    isMountedRef.current = true;
    
    // Safely get search params
    let hasQueryParams = false;
    let searchParamsString = '';
    try {
      searchParamsString = searchParams?.toString() || '';
      hasQueryParams = searchParamsString.length > 0;
    } catch (error) {
      // searchParams might not be available during navigation
      return;
    }

    // Remove any existing canonical link (safely)
    // Use .remove() instead of removeChild() to avoid conflicts with React's unmount
    // Check if element is still connected to DOM before removing
    try {
      // Only remove our own link, not ones from metadata
      if (linkRef.current && linkRef.current.isConnected) {
        linkRef.current.remove();
        linkRef.current = null;
      }
      
      // Also check for any canonical links we might have created
      const existingCanonical = document.querySelector('link[rel="canonical"][data-dynamic="true"]');
      if (existingCanonical && existingCanonical.isConnected) {
        existingCanonical.remove();
      }
    } catch (error) {
      // Ignore errors during DOM manipulation
      console.warn('Error removing canonical link:', error);
    }

    // Only add canonical if there are query parameters
    // (Base canonical is already set via metadata in layout.tsx)
    if (hasQueryParams && pathname && isMountedRef.current) {
      const baseUrl = 'https://www.quran.tj';
      let canonicalUrl = `${baseUrl}${pathname}`;
      
      // Remove trailing slash if present (to match live site style)
      if (canonicalUrl.endsWith('/') && canonicalUrl !== `${baseUrl}/`) {
        canonicalUrl = canonicalUrl.slice(0, -1);
      }
      
      // For surah pages with verse query param, canonical to base surah page (no trailing slash)
      try {
        if (pathname.match(/^\/surah\/\d+$/) && searchParams?.has('verse')) {
          canonicalUrl = `${baseUrl}${pathname}`;
        }
      } catch (error) {
        // searchParams might not be available
      }
      
      // Create and append canonical link (safely)
      try {
        if (isMountedRef.current && document.head) {
          const link = document.createElement('link');
          link.rel = 'canonical';
          link.href = canonicalUrl;
          link.setAttribute('data-dynamic', 'true');
          document.head.appendChild(link);
          linkRef.current = link;
        }
      } catch (error) {
        console.warn('Error adding canonical link:', error);
      }
    }
    
    // Cleanup on unmount - but only if component is still mounted
    return () => {
      isMountedRef.current = false;
      // Don't remove during cleanup - let React handle it
      // This prevents conflicts with React's unmount phase
    };
  }, [pathname, searchParams]);

  return null;
}


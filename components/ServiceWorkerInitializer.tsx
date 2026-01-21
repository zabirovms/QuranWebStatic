'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker for offline caching and faster repeat visits.
 * Kept extremely small so it does not affect LCP.
 */
export default function ServiceWorkerInitializer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        // Cloudflare Pages serves the app from the root, so scope '/' works
        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
      } catch (error) {
        // Fail silently – SW is an enhancement
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('Service worker registration failed:', error);
        }
      }
    };

    // Delay registration slightly so it never blocks initial rendering
    const timeoutId = window.setTimeout(register, 2000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}


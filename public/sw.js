// Simple service worker for Quran.tj
// - Cache static assets with cache-first
// - Cache JSON data files with network-first, cache-fallback

const STATIC_CACHE = 'quran-static-v1';
const DATA_CACHE = 'quran-data-v1';

// Files that are very likely to be used on most pages
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/alquran.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => undefined);
    })
  );

  // Activate new SW as soon as it's finished installing
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE) {
            return caches.delete(key);
          }
          return undefined;
        })
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Cache strategy for JSON data files
  if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json.gz')) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(DATA_CACHE);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch {
          const cache = await caches.open(DATA_CACHE);
          const cached = await cache.match(request);
          if (cached) {
            return cached;
          }
          // As a last resort, fall back to network (which will likely fail)
          return fetch(request);
        }
      })()
    );
    return;
  }

  // Cache-first strategy for static assets (HTML, JS, CSS, images, icons)
  if (
    url.origin === self.location.origin &&
    (url.pathname === '/' ||
      url.pathname.startsWith('/surah/') ||
      url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/images/') ||
      url.pathname.startsWith('/fonts/') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.webp'))
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }

        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      })()
    );
  }
});


// MTA Bus Status service worker — offline shell + runtime caching.
const CACHE = 'mta-bus-v4';

// Core shell precached on install so the app boots offline after first visit.
// (Hashed JS/CSS bundles are cached at runtime as they're requested, since
// their names change per build.)
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Let the page trigger an immediate update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Never cache cross-origin (Mapbox tiles, Supabase, fonts) or API calls —
  // network-first, fall back to any cached copy when offline.
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Navigations: network-first, fall back to the cached app shell offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Same-origin static assets: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.status === 200) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});

/**
 * Service Worker — CMPSBL Substrate
 * Network-first for JS/CSS to prevent stale chunk errors after deploys.
 * Cache-first only for immutable assets (images, fonts).
 */

const CACHE_NAME = 'cmpsbl-v2';
const SCAN_CACHE = 'cmpsbl-scans-v1';
const STATIC_CACHE = 'cmpsbl-static-v2';

// Static assets to precache on install
const PRECACHE_URLS = [
  '/',
];

// Install: precache shell + force activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate: clean ALL old caches to prevent stale chunks
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== SCAN_CACHE && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // JS and CSS — NETWORK-FIRST to prevent "Importing a module script failed"
  // Vite produces hashed chunks; stale cache-first responses cause TypeError
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || new Response('', { status: 503 });
        })
    );
    return;
  }

  // Scan result API responses — network-first
  if (url.pathname.includes('/scan_results_cache') || url.pathname.includes('/scan/results')) {
    event.respondWith(
      caches.open(SCAN_CACHE).then(async (cache) => {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const cached = await cache.match(event.request);
          return cached || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })
    );
    return;
  }

  // Images, fonts — cache-first (these are immutable/hashed)
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|woff2?|ttf|otf|ico)$/)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          return new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // SPA navigation fallback
  if (event.request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match('/');
        return cached || new Response('Offline', { status: 503 });
      })
    );
    return;
  }
});

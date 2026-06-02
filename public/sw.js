const CACHE = 'rollcall-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests for same-origin or Next.js static assets
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Let Firebase / external requests pass through untouched
  if (url.hostname !== self.location.hostname) return;

  // Network-first: serve fresh content, fall back to cache when offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses (skip opaque / error responses)
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});

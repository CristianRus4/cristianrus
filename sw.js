const CACHE_NAME = 'left-cache-v1';
const ASSETS = [
  '/left.html',
  '/left.webmanifest',
  '/style.css',
  '/images/left-favicon/android-chrome-192x192.png',
  '/images/left-favicon/android-chrome-512x512.png',
  '/images/left-favicon/apple-touch-icon.png',
  '/images/left-favicon/favicon-32x32.png',
  '/images/left-favicon/favicon-16x16.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Network-first for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((c) => c.put('/left.html', copy));
        return res;
      }).catch(() => caches.match('/left.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

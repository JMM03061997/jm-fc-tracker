const CACHE_VERSION = 'jm-football-hub-v1.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon.svg',
  './assets/images/card-placeholder.svg',
  './css/style.css',
  './css/components.css',
  './css/responsive.css',
  './js/utils.js',
  './js/database.js',
  './js/images.js',
  './js/navigation.js',
  './js/cards.js',
  './js/squad.js',
  './js/backup.js',
  './js/app.js'
];

// Install: Cache static shell without touching IndexedDB
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean only old static caches, preserving IndexedDB untouched
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('jm-football-hub-') && name !== CACHE_VERSION)
          .map((oldCache) => caches.delete(oldCache))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for HTML/JS/CSS to ensure updates apply smoothly, fallback to cache offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// sw.js - Service Worker JM Football Hub v2.1
const CACHE_NAME = 'jm-football-hub-v2.1.0';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './components.css',
  './responsive.css',
  './utils.js',
  './database.js',
  './images.js',
  './navigation.js',
  './cards.js',
  './squad.js',
  './formations.js',
  './smart-import.js',
  './backup.js',
  './app.js',
  './manifest.webmanifest',
  './favicon.svg',
  './card-placeholder.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

const CACHE_NAME = 'bp-scanner-v1';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  'https://unpkg.com/@zxing/library@latest/umd/index.min.js',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

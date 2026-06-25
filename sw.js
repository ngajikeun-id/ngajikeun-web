const CACHE_NAME = 'ngajikeun-pwa-v4';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/assets/js/api-sync.js',
  '/assets/js/ui-render.js',
  '/assets/js/component-loader.js',
  '/assets/js/main.js',
  '/components/navbar.html',
  '/components/hero.html',
  '/components/about.html',
  '/components/programs.html',
  '/components/mentors.html',
  '/components/testimonials.html',
  '/components/articles.html',
  '/components/products.html',
  '/components/quiz.html',
  '/components/footer.html',
  '/components/floating-actions.html',
  '/images/logo/logo-ngk.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === self.location.origin && requestUrl.pathname.startsWith('/content/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });

          if (cachedResponse) {
            event.waitUntil(fetchPromise);
            return cachedResponse;
          }

          return fetchPromise;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache));

          return networkResponse;
        });
      })
  );
});

const CACHE_VERSION = 'v1';
const CACHE_NAME = `scaledspace-${CACHE_VERSION}`;
const BASE_PATH = '/ScaledSpace';

// Assets to cache
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/offline.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/assets/css/style.css`,
  `${BASE_PATH}/assets/js/app.js`,
  `${BASE_PATH}/components/notes.js`,
  `${BASE_PATH}/components/voicenotes.js`,
  `${BASE_PATH}/components/reminders.js`,
  `${BASE_PATH}/db/db.js`,
  `${BASE_PATH}/utils/helpers.js`,
  `${BASE_PATH}/assets/icons/icon-72.png`,
  `${BASE_PATH}/assets/icons/icon-96.png`,
  `${BASE_PATH}/assets/icons/icon-128.png`,
  `${BASE_PATH}/assets/icons/icon-144.png`,
  `${BASE_PATH}/assets/icons/icon-152.png`,
  `${BASE_PATH}/assets/icons/icon-192.png`,
  `${BASE_PATH}/assets/icons/icon-384.png`,
  `${BASE_PATH}/assets/icons/icon-512.png`,
  `${BASE_PATH}/assets/icons/note-96.png`,
  `${BASE_PATH}/assets/icons/reminder-96.png`
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName.startsWith('scaledspace-') && cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle requests with the base path
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith(BASE_PATH)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve from cache
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it can only be used once
            const responseToCache = response.clone();

            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache if the request is for the offline page
                if (event.request.url !== self.location.origin + BASE_PATH + '/offline.html') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // If fetch fails (offline) and the request is for a page, serve offline.html
            if (event.request.mode === 'navigate') {
              return caches.match(BASE_PATH + '/offline.html');
            }
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === self.location.origin + BASE_PATH + '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(BASE_PATH + '/');
        }
      })
  );
}); 
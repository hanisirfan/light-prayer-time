// service-worker-template.js

// This will be replaced by the build script with the actual array of URLs
/* %%PRECACHE_URLS%% */

// This will be replaced by the build script for cache busting
const CACHE_NAME = 'prayer-times-cache-v2'; // Placeholder for the script to replace

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache); // urlsToCache will be defined by the script
            })
            .catch(error => {
                console.error('[Service Worker] Failed to cache during install:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // This is important for the new service worker to take control immediately
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then((networkResponse) => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse; // Return whatever non-200 response was received
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We must clone it so that
                        // both the browser and the cache can consume it.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Only cache successful responses for GET requests
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Network request failed (e.g., offline) AND it wasn't in cache.
                        // If it's a navigation request, try to serve a fallback HTML page.
                        if (event.request.mode === 'navigate') {
                            // Assuming index.html is your main entry point and is ALWAYS included in urlsToCache
                            console.log('[Service Worker] Serving index.html as offline fallback for navigation:', event.request.url);
                            return caches.match('./index.html');
                            // If you have a dedicated offline.html, use that: return caches.match('./offline.html');
                        }
                        // For other assets (CSS, JS, images) if both cache and network fail,
                        // return a generic 503 response to prevent the default Chrome error page.
                        console.error('[Service Worker] Fetch failed and no cache match for:', event.request.url);
                        return new Response('', {status: 503, statusText: 'Service Unavailable', headers: new Headers({'Content-Type': 'text/plain'})});
                    });
            })
    );
});
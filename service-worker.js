// service-worker.js

const CACHE_NAME = 'prayer-times-cache-v2'; // Increment to force re-cache and update service worker
const urlsToCache = [
    './', // Caches the root (index.html)
    './index.html',
    './css/main.css',
    './js/main.js',
    './js/monthly-view.js', // Added monthly-view.js to cache
    './manifest.json',
    './monthly-view.html', // Ensure monthly-view.html is also cached
    './audio/notification1.mp3', // Added notification sound to cache
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap', // Updated font to Poppins
    'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JPVHnyEVuJAQtE.woff2', // Example Poppins font file (adjust if different font file is actually loaded)
    // Updated to PNG icons and new path
    './images/logo/logo-32x32.png',
    './images/logo/logo-192x192.png',
    './images/logo/logo-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Failed to cache during install:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache hit - fetch from network
                return fetch(event.request).catch(() => {
                    // If network also fails, and it's a navigation request,
                    // or if it's a critical asset, you might serve a fallback.
                    // For now, if a non-cached asset fails on network, it will just fail.
                    // Critical HTML pages (index.html, monthly-view.html) should be in urlsToCache.
                    if (event.request.mode === 'navigate') {
                        // Optional: return caches.match('./offline.html'); // Serve an offline page if you have one
                    }
                    console.log('Fetch failed for:', event.request.url);
                    // This catch block means the request failed from both cache and network.
                    // The browser will then show its default offline page or an error.
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

const CACHE_NAME = '1';
const urlsToCache = [
    '/',
    '/index.html',
    '/about',
    '/privacy-policy',
    '/terms-of-service',
    '/css/style.css',
    '/css/pages.css',
    '/js/script.js',
    '/js/pages.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css'
];
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
            )
    );
});
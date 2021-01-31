
const STATIC_CACHE = 'static-v1';

self.addEventListener('install', e => {

    // Caution: skipWaiting() means that your new service worker is likely controlling pages that were loaded with an older version. 
    // This means some of your page's fetches will have been handled by your old service worker, but your new service worker will be handling subsequent fetches. 
    // If this might break things, don't use skipWaiting().
    //self.skipWaiting();

    // Info that we need to work offline from the start
    const cacheStatic = caches.open(STATIC_CACHE)
        .then(cache => {

            // always with slash
            return cache.addAll([
                // '/',
                // '/index.html',
                // '/offline.html',
                // '/css/estilos.css',
                // '/img/banner.jpeg',
                // '/js/app.js',
                // '/favicon.ico',
                // 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'
            ]);

        });

    // Wait until everything is resolve
    e.waitUntil(cacheStatic);
});

self.addEventListener('fetch', e => {

    // https://webdev.imgix.net/offline-cookbook/ss-falling-back-to-network.png
    // Cache First (Cache with network fallback) - PLUS => then cache

    // The problem here is that dynamic content is mixed with inmutable content
    const response = caches.match(e.request)
        .then(res => {

            console.log("Fetching...");

            // If the request exists
            if (res) return res;

            console.log("Url not exists:", e.request.url);

            // If not exists, we have to go to the web
            return fetch(e.request).then(newResp => {

                // Here we save the response on the dynamic cache
                caches.open(STATIC_CACHE)
                    .then(cache => {
                        cache.put(e.request, newResp);
                    });

                // We need to clone because 'Response body is already used'
                return newResp.clone();
            })

        });


    e.respondWith(response);

});

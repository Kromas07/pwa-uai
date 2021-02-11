const CACHE_ACTUAL = 'cache-7';
const API_URL_ACTUALIZACION = 'https://localhost:44348/api/DatosActualizacion/';

const paginasModificadas = [];

const recursosACopiar = [
    '/',
    'css/estilos.css',
    'favicon.ico',
    'img/banner.jpeg',
    'img/no-img.jpg',
    'js/app.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css',
    'clientes.html',
    'about.html',
    'faq.html'
];

self.addEventListener("install", function(event) {

    const cacheSplit = CACHE_ACTUAL.split('-');
    const cacheAnterior = `${cacheSplit[0]}-${(cacheSplit[1] - 1)}`;

    // Pregunto si existe el cache anterior
    const response = caches.has(cacheAnterior).then(async existeCacheAnterior => {
            return existeCacheAnterior;
        })
        .then(existeCacheAnterior => {

            caches.open(CACHE_ACTUAL).then(async cache => {

                // Si existe un cache con version -1 
                if (existeCacheAnterior) {

                    // Abrimos el cache anterior y recorremos los recursos a copiar para ver si los encontramos
                    caches.open(cacheAnterior).then(async cacheVersionAnterior => {

                        var recursosNoEncontrados = [];

                        await Promise.all(recursosACopiar.map(async(url) => {
                            // solo analizamos si existe en el cache viejo
                            const response = await cacheVersionAnterior.match(url);
                            if (response) {
                                // Existe el recurso
                                cache.put(url, response);
                            } else {
                                recursosNoEncontrados.push(url);
                                return Promise.resolve();
                            }
                        }));

                        return cache.addAll(recursosNoEncontrados.concat(paginasModificadas));
                    })
                } else {

                    // No existe cache con versión -1 - Por lo que cacheamos todo
                    return cache.addAll(recursosACopiar.concat(paginasModificadas));
                }
            })
        })

    event.waitUntil(response);
});

self.addEventListener('fetch', function(event) {

    const fetchRequest = caches.match(event.request)
        .then(cachedResponse => {

            if (!event.request.url.includes('api')) { return cachedResponse; }

            if (!navigator.onLine) { return cachedResponse; }

            if (!cachedResponse) {

                return caches.open(CACHE_ACTUAL).then(cache => {
                    return fetch(event.request).then(newResponse => {
                        cache.put(event.request, newResponse.clone());
                        return newResponse;
                    });
                });
            }

            const cachedDate = new Date(cachedResponse.headers.get('date'));

            const apiRequested = event.request.url.split('/').pop();

            if (!apiRequested) { return fetch(event.request); }

            return fetch(API_URL_ACTUALIZACION + apiRequested)
                .then(r => r.text())
                .then(response => {

                    // si no existe información guardada en la base (no debería pasar) 
                    if (!response) { return cachedResponse; }

                    const fechaActualizacion = new Date(JSON.parse(response));

                    // si la información fue actualizada posteriormente a la fecha del cache, tengo que hacer un fetch y guardarla
                    if (cachedDate < fechaActualizacion) {

                        //Cache with Network Fallback
                        return fetch(event.request).then(newResponse => {
                            caches.open(CACHE_ACTUAL)
                                .then(cache => {
                                    cache.put(event.request, newResponse);
                                });
                            return newResponse.clone();
                        });
                    }
                    return cachedResponse;
                })
        });

    event.respondWith(fetchRequest);
});

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheVieja) {

                    if (cacheVieja !== CACHE_ACTUAL) {
                        return caches.delete(cacheVieja);
                    }
                })
            );
        })
    );

    return self.clients.claim(); //fuerza que todos los clientes se actualicen
});
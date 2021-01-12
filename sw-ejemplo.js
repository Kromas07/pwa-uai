const cacheActual = 'epUNLaM-56';

const paginasModificadas = [
    'u10_vi_archivos.html',
    'u11_vi_archivos.html',
    'u12_vi_archivos.html'
];

const recursosACopiar = [
    '/',
    'css/estilos.css',
    'favicon.ico',
    'img/banner.jpeg',
    'img/no-img.jpg',
    'js/app.js'
];

self.addEventListener("install", function (event) {
    console.log("Installing...");

    const cacheSplit = cacheActual.split('-');
    const cacheAnterior = `${cacheSplit[0]}-${(cacheSplit[1] - 1)}`;

    console.log(cacheAnterior);

    // Pregunto si existe el cache anterior
    const response = caches.has(cacheAnterior).then(async existeCacheAnterior => {
        return existeCacheAnterior;
    })
        .then(existeCacheAnterior => {

            console.log("Existe cache", existeCacheAnterior)

            caches.open(cacheActual).then(async cache => {

                // Si existe un cache con version -1 
                if (existeCacheAnterior) {

                    // Abrimos el cache anterior y recorremos los recursos a copiar para ver si los encontramos
                    caches.open(cacheAnterior).then(async cacheVersionAnterior => {

                        var recursosNoEncontrados = [];

                        await Promise.all(recursosACopiar.map(async (url) => {
                            // solo analizamos si existe en el cache viejo
                            const response = await cacheVersionAnterior.match(url);
                            if (response) {
                                // Existe el recurso
                                cache.put(url, response);
                            } else {
                                recursosNoEncontrados.push(url);
                                return Promise.resolve();
                            }
                        })
                        );

                        return cache.addAll(recursosNoEncontrados.concat(paginasModificadas));
                    })
                } else {

                    // No existe cache con versión -1 - Por lo que cacheamos todo
                    return cache.addAll(recursosACopiar.concat(paginasModificadas));

                    // var newImmutableRequests = [];
                    // await Promise.all(recursosACopiar.map(async (url) => {
                    //     const response = await caches.match(url);
                    //     if (response) {
                    //         return cache.put(url, response);
                    //     } else {
                    //         newImmutableRequests.push(url);
                    //         return Promise.resolve();
                    //     }
                    // })
                    // );

                    // return cache.addAll(newImmutableRequests.concat(paginasModificadas));
                }
            })
        })

    event.waitUntil(response);
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheVieja) {

                    if (cacheVieja !== cacheActual) {
                        return caches.delete(cacheVieja);
                    }
                })
            );
        })
    );
    return self.clients.claim(); //fuerza que todos los clientes se actualicen
});



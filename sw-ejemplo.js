const CACHE_ACTUAL = 'epUNLaM-56';
const STATIC_CACHE = 'static-v1';

const paginasModificadas = [
    // 'u10_vi_archivos.html',
    // 'u11_vi_archivos.html',
    // 'u12_vi_archivos.html'
];

const recursosACopiar = [
    '/',
    // 'css/estilos.css',
    // 'favicon.ico',
    'img/banner.jpeg',
    // 'img/no-img.jpg',
    // 'js/app.js'
];


var idbDatabase;

// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
function openDatabaseAndReplayRequests() {
    var indexedDBOpenRequest = indexedDB.open('service-worker', 1);

    indexedDBOpenRequest.onerror = function (error) {
        console.error('IndexedDB error:', error);
    };

    indexedDBOpenRequest.onupgradeneeded = function () {
        this.result.createObjectStore('files', { keyPath: 'file' });
    };

    indexedDBOpenRequest.onsuccess = function () {
        idbDatabase = this.result;
    };
}

self.addEventListener("install", function (event) {

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
                }
            })
        })

    event.waitUntil(response);
});

self.addEventListener('fetch', function (event) {

    // event.respondWith(
    //     caches.match(event.request)
    //         .then(function (response) {
    //             if (response) {
    //                 const date = new Date(response.headers.get('date'));
    //                 console.log(date);
    //                 console.log(date.getTime() + 1000 * 60 * 60 * 6)
    //                 return response;
    //             }
    //             return fetch(event.request);
    //         })
    // );

    const fetchRequest = caches.match(event.request)
        .then(cachedResponse => {
            // console.log("Fetching...");
            // console.log(event.request.url);

            if (!cachedResponse) { return fetch(event.request) }

            const cachedDate = new Date(cachedResponse.headers.get('date'));
            // console.log(date);
            console.log(cachedDate.getTime());

            const file = event.request.url.split('/').pop();

            // console.log(file);

            // si no existe file en el request - es para el caso que se catchea /
            if (!file) { return fetch(event.request) }

            return fetch("https://localhost:44348/api/ActualizacionArchivo/" + file)
                .then(r => r.json())
                .then(response => {

                    // console.log(response);

                    // si no existe información guardada en la base (no debería pasar) 
                    if (!response) { return cachedResponse; }


                    const fechaActualizacion = new Date(response);
                    // console.log(fechaActualizacion);
                    console.log(fechaActualizacion.getTime());

                    // si el archivo fue actualizado posteriormente a la fecha del cache, tengo que hacer un fetch
                    if (cachedDate < fechaActualizacion) { 
                        console.log(`Archivo ${file} descargado nuevamente`);

                        caches.open(CACHE_ACTUAL).then(cache => {
                            return fetch(event.request).then(newResponse => {
                                cache.put(event.request, newResponse.clone())
                                return newResponse;
                            })
                        })
                        
                    }

                    console.log("Cached response");
                    return cachedResponse;
                })


        });


    event.respondWith(fetchRequest);
});

openDatabaseAndReplayRequests();

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheVieja) {

                    if (cacheVieja !== CACHE_ACTUAL) {
                        return caches.delete(cacheVieja);
                    }
                })
            );
        })
    );

    return self.clients.claim(); //fuerza que todos los clientes se actualicen
});



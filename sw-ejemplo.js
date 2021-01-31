const cacheActual = 'epUNLaM-56';
const STATIC_CACHE = 'static-v1';

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

    const cacheSplit = cacheActual.split('-');
    const cacheAnterior = `${cacheSplit[0]}-${(cacheSplit[1] - 1)}`;

    // Pregunto si existe el cache anterior
    const response = caches.has(cacheAnterior).then(async existeCacheAnterior => {
        return existeCacheAnterior;
    })
        .then(existeCacheAnterior => {

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
                }
            })
        })

    event.waitUntil(response);
});

self.addEventListener('fetch', function (event) {

    // console.log(event.request.url);

    // event.respondWith(
    //     caches.match(event.request)
    //         .then(function (response) {
    //             if (response) {
    //                 return response;
    //             }
    //             return fetch(event.request);
    //         })
    // );

    // The problem here is that dynamic content is mixed with inmutable content
    const response = caches.match(event.request)
        .then(res => {

            // console.log("Fetching...");
            console.log(event.request.url);
            const file = event.request.url.split('/').pop();
            // console.log(file);

            return fetch("http://localhost:3000/files?name=" + file)
                .then(r => r.json())
                .then(response => {
                    // If the request exists
                    // if (res) return res;


                    console.log(response);


                    if (response.length == 0) {
                        fetch("http://localhost:3000/files", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ name: file, date: new Date() }) // body data type must match "Content-Type" header
                        });
                    }

                    try {
                        console.log(file + " " + response[0].date);
                    } catch (error) {
                        console.log(error);
                    }

                    // If not exists, we have to go to the web
                    return fetch(event.request).then(newResp => {

                        // Here we save the response on the dynamic cache
                        caches.open(STATIC_CACHE)
                            .then(cache => {
                                cache.put(event.request, newResp);
                            });

                        // We need to clone because 'Response body is already used'
                        return newResp.clone();
                    })
                })


        });


    event.respondWith(response);
});

openDatabaseAndReplayRequests();

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



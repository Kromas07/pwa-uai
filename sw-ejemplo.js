const cacheActual = 'epUNLaM-42';

const paginasModificadas = [
    'u10_vi_archivos.html',
    'u11_vi_archivos.html',
    //   'u10_archivos.html',
    //   'u8_strings.html',
    //   'u7_arrays.html',
    //   'u2_vi_secuencial.html',
    //   'u2_secuencial.html',
    //   'u3_lenguajeC.html',
    //   'u3_vi_lenguajeC.html',
    //   'u4_vi_decision.html',
    //   'u4_decision.html',
    //   'u5_iteracion.html',
    //   'u5_vi_iteracion.html',
    //   'index.html',
    //   'u5.1_ej_iteracionDefinida.html',
    //   'u5.2_ej_iteracionCondicionada.html' ,
    //   'herramientas.html' ,
    //   'u7_vi_arrays.html' ,
    //   'u6_funciones.html' ,
    //   'u6_vi_funciones.html',
    //   'u7.2_ej_matrices.html',
    //   'u7.1_ej_vectores.html' ,
    //   'u10_ej_archivos.html' ,
    //   'u11_corte_de_control.html',
    //   'u11_vi_corte_de_control.html',
    //   'u11_ej_corte_de_control.html' ,
    //   'u9_estructuras.html' ,
    //   'u9_vi_estructuras.html'
];

const recursosACopiar = [
    'css/style.css'
    //   'css/estilos.css',
    //   'css/materialize.min.css',
    //   'js/materialize.min.js',
    //   'icons/apoyo.svg',
    //   'icons/catedra.svg',
    //   'icons/consultas.svg',
    //   'icons/ejercicios.svg',
    //   'icons/expandir.svg',
    //   'icons/herramientas.svg',
    //   'icons/home.svg',
    //   'icons/icon192.png',
    //   'icons/icon512.png',
    //   'icons/linkweb.svg',
    //   'icons/list.svg',
    //   'icons/logo.svg',
    //   'icons/pdf.svg',
    //   'icons/programados.svg',
    //   'icons/ProgramadosApaisado.svg',
    //   'icons/seleccionar.svg',
    //   'icons/teoricos.svg',
    //   'icons/unidades.svg',
    //   'icons/videos.svg',
    //   'icons/volver.svg',
    //   'icons/menu.svg',
    //   'favicon.ico' ,
    //   'adicionales.html' ,
    //   'catedra.html' ,
    //   'iteracionCondicionada.html' ,
    //   'menu.html' ,
    //   'programados.html' ,
    //   'u10_ad_archivos.html' ,
    //   'u11_ad_corte_de_control.html' ,
    //   'u1_introduccion.html' ,
    //   'u1_vi_introduccion.html' ,
    //   'u2_ad_secuencial.html' ,
    //   'u2_ej_secuencial.html' ,
    //   'u3_ad_lenguajeC.html' ,
    //   'u3_lenguajeC.html' ,
    //   'u4_ej_decision.html' ,
    //   'u5.1_ej_iteracionDefinida.html' ,
    //   'u6_ej_funciones.html' ,
    //   'u7_ad_arrays.html' ,
    //   'u8_ej_strings.html' ,
    //   'u8_vi_strings.html' ,
    //   'u9_ej_estructuras.html' ,
    //   'unidades.html'
];

// Hola Franco te voy a enviar un artículo para que leas y te propongo que comiences a trabajar en el versionado, 
// esto es si detectas una versión nueva, el número de versión estará atrás del archivo, 
// pero es consecutiva a la ya instalada se descarga solo aquello que cambio, sino se instala todo.


self.addEventListener("install", function (event) {
    console.log("Installing...");
    
    const cacheAnterior = cacheActual.split('-')[0] + '-' + (cacheActual.split('-')[1] - 1);
    console.log(cacheAnterior);

    let response = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key === cacheAnterior) {
                console.log("Existe cache con versión -1");

                //aca va la logica de pedir solo lo necesario
                caches.open(cacheActual).then(async cache => {
                    var recursos, recursosNoEncontrados = [];
                    recursos = paginasModificadas.concat(recursosACopiar);

                    console.log(recursos);

                    await Promise.all(recursos.map(async (url) => {
                        console.log(url);
                        const response = await caches.match(url);
                        if (response) {
                            console.log("Existe", url);
                            cache.put(url, response);
                        } else {
                            console.log("No existe", url);
                            recursosNoEncontrados.push(url);
                            return Promise.resolve();
                        }
                    })
                    );
                    console.log("Recursos a agregar", recursosNoEncontrados);
                    return cache.addAll(recursosNoEncontrados);
                })

            } else {

                // "No existe cache con versión -1 - Por lo tanto bajamos todo
                caches.open(cacheActual).then(function (cache) {
                    var newImmutableRequests = [];
                    return Promise.all(
                        recursosACopiar.map(function (url) {
                            return caches.match(url).then(function (response) {
                                if (response) {
                                    return cache.put(url, response);
                                } else {
                                    newImmutableRequests.push(url);
                                    return Promise.resolve();
                                }
                            });
                        })
                    ).then(function () {
                        return cache.addAll(newImmutableRequests.concat(paginasModificadas));
                    });
                })
            }
        })
    })


    event.waitUntil(response);
});

self.addEventListener('fetch', function (event) {
    //console.log("Fetching...");
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {

                if (response) {
                    // console.log("Existe en cache");
                    return response;
                }

                // console.log("No existe en cache");
                return fetch(event.request);
            })
    );
});

self.addEventListener("activate", function (event) {
    console.log("Activating...");
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



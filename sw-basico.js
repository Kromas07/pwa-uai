
self.addEventListener('install', event => {

    // Caution: skipWaiting() means that your new service worker is likely controlling pages that were loaded with an older version. 
    // This means some of your page's fetches will have been handled by your old service worker, but your new service worker will be handling subsequent fetches. 
    // If this might break things, don't use skipWaiting().
    //self.skipWaiting();
});

self.addEventListener('fetch', event => {

    // Response with TEXT
    // const offlineResp = new Response(`
    
    //     ¡No internet connection!
    
    // `);


    // Response with HTML 
    // const offlineResp = new Response(`
    
    // <!DOCTYPE html>
    // <html lang="en">
    // <head>
    //     <meta charset="UTF-8">
    //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //     <meta http-equiv="X-UA-Compatible" content="ie=edge">
    //      <title>PWA UAI</title>

    // </head>
    // <body class="container p-3">
    
    // <h3>¡No internet connection!</h3>
    
    // </body>
    // </html>
    // `, {
    //     headers: {
    //         'Content-Type':'text/html'
    //     }
    // });

    // Response with HTML file
    // I had to catch this file
    const offlineResp = fetch( 'pages/offline.html' );


    const resp = fetch(event.request)
                    .catch( () => offlineResp );


    event.respondWith( resp );

});

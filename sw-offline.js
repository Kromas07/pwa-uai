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

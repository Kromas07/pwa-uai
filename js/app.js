const SW_TO_USE = '/sw-ejemplo.js';
const API_URL_CLIENTE = 'https://localhost:44348/api/cliente';

if (navigator.serviceWorker) {
    navigator.serviceWorker.register(SW_TO_USE);
}

function getClientes() {
    fetch(API_URL_CLIENTE)
        .then(r => r.json())
        .then(response => {

            console.log(response);

            document.getElementById("offline").style.display = !navigator.onLine ? "block" : "none";

            var ul = document.getElementById("listadoClientes");
            ul.innerHTML = "";

            response.forEach(cliente => {
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(cliente.nombre));
                ul.appendChild(li);
            });
        });
}
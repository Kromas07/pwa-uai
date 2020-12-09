
const SW_TO_USE = '/sw-ejemplo.js';

if (navigator.serviceWorker) {
    navigator.serviceWorker.register(SW_TO_USE);
}
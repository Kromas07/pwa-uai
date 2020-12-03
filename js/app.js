
const SW_TO_USE = '/sw-caching.js';

if (navigator.serviceWorker) {
    navigator.serviceWorker.register(SW_TO_USE);
}
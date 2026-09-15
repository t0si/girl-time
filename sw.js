// Simple network-first service worker for "girl time".
// Bump CACHE_NAME whenever you push an update so old cached copies get cleared out.
var CACHE_NAME = 'girl-time-v2';
var CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json?v=2',
  './icon-192.png?v=2',
  './icon-512.png?v=2',
  './icon-192-maskable.png?v=2',
  './icon-512-maskable.png?v=2'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Network-first for same-origin requests: always try to get the latest version,
// fall back to the cached copy when offline. This matters while the app is still
// actively changing — a cache-first strategy would leave visitors stuck on old code.
self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (e.g. fonts) pass through normally

  event.respondWith(
    fetch(req).then(function(res) {
      var resClone = res.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(req, resClone); });
      return res;
    }).catch(function() {
      return caches.match(req).then(function(cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});

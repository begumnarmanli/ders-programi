self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/script.js',
        '/icons/icon-192.png',
        '/icons/icon-512.png',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Cache'den yanıt var mı?
      return response || fetch(event.request); // Cache'den varsa onu ver, yoksa normal fetch
    })
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['v1']; // Yeni cache versiyonu
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Eski cache'leri sil
          }
        })
      );
    })
  );
});
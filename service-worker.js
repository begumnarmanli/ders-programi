self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/offline.html',          
        '/style.css',
        '/script.js',
        '/icons/icon-256.png',
        '/icons/icon-512.png',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        // Cache'den varsa onu ver
        return response;
      }
      // Cache’de yoksa ağı kullan
      return fetch(event.request).catch(function() {
        // Fetch başarısız olursa ve istek HTML ise offline.html döndür
        if (
          event.request.method === 'GET' &&
          event.request.headers.get('accept') &&
          event.request.headers.get('accept').includes('text/html')
        ) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['v1'];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

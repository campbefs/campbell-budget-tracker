const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  // HTML
  "./index.html",
  // CSS
  "./css/styles.css",
  // JAVASCRIPT
  "./js/index.js"
]

// CACHE RESOURCES
self.addEventListener('install', function(e) {

  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('installing cache : ' + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  )
})

// ACTIVATION CODE - DELETE OUTDATES CACHES
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keyList) {
      let cacheKeeplist = keyList.filter(function(key) {
        return key.indexOf(APP_PREFIX);
      });

      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function(key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log(`deleting cache : ` + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

// INTERCEPT FETCH REQUESTS
self.addEventListener(`fetch`, function(e) {
  console.log(`fetch reqeust : ` + e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(request) {
      if (request) {
        console.log(`responding with cache : ` + e.request.url);
        return request;
      } else {
        console.log(`file is not caches, fetching : ` + e.request.url);
        return fetch(e.request);
      }
    })
  )
})

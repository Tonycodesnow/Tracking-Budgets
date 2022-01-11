const DATA_CACHE_NAME = 'data-cache-v1';
const CACHE_NAME = 'my-site-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/js/index.js',
  '/manifest.json',
  '/js/idb.js',
  '/css/styles.css',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Respond with cached resources
self.addEventListener('fetch', function (e) {
  if (e.request.url.includes('/api/transaction')) {
    e.respondWith(
      caches
      .open(DATA_CACHE_NAME)
      .then(cache => {
        return fetch(e.request)
          .then(response => {
            if (response.status === 200) {
                cache.put(e.request, response.clone());
              }
              return response;
          });
      })
      .catch(err => console.log(err))
    );
  } else {
    e.respondWith(
      caches
      .match(e.request)
      .then(response => response || fetch(e.request))
    );
  }
  e.respondWith(
    fetch(e.request).catch(async function () {
        if (request) {
          const response = await caches
            .match(evt.request);
          if (response) {
            return response;
          } else if (evt.request.headers.get('accept')
            .includes('text/html')) {
            return caches.match('/');
          }
        }
      })
  );
});


// Cache resources
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      console.log("Files were pre-cached successfully");
      return cache.addAll(FILES_TO_CACHE)
    }));
});

// Delete outdated caches
// self.addEventListener('activate', function (e) {
//   e.waitUntil(
//     caches.keys().then(function (keyList) {
//       // `keyList` contains all cache names under your username.github.io
//       // filter out ones that has this app prefix to create keeplist
//       let cacheKeeplist = keyList.filter(function (key) {
//         return key.indexOf(APP_PREFIX);
//       })
//       // add current cache name to keeplist
//       cacheKeeplist.push(CACHE_NAME);

//       return Promise.all(keyList.map(function (key, i) {
//         if (cacheKeeplist.indexOf(key) === -1) {
//           console.log('deleting cache : ' + keyList[i] );
//           return caches.delete(keyList[i]);
//         }
//       }));
//     })
//   );
// });
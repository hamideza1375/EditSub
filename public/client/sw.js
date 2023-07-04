const random = String(Math.random())
const d_version = 24;
const version = 24;
const dynamicVersion = `dinamic-${d_version}`;
const preCacheName = `static-${version}`;
const preCache = [
  './client/index.html',
  '/',
  '/t',

  "./client/manifest.json",
  "./client/app.js",
  './client/axios.js',

];


self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(preCacheName)
      .then((cache) => {
        console.log('caching the static files');
        cache.addAll(preCache);
      })
      .catch(console.warn)
  );
});


self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== preCacheName)
            .map((key) => caches.delete(key))
        );
      })
      .catch(console.warn)
  );
});


self.addEventListener('fetch', (ev) => {
  ev.respondWith(
    caches.match(ev.request).then((cacheRes) => {
      return (
        cacheRes ||
        fetch(ev.request).then(
          (res) => {
            return caches.open(random).then((cache) => {
              cache.put(ev.request.url, res.clone())
              return res
            })
          },
          (err) => {
            if (
              ev.request.url.indexOf('.html') > -1 ||
              ev.request.mode == 'navigation'
            ) {
              return caches.match('/index.html');
            }
          }
        )
      );
    })
  );
});


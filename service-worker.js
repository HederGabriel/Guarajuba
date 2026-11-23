const CACHE = "guarajuba-v1";
const APP_SHELL = ["./", "./index.html", "./css/style.css", "./js/app.js", "./js/data.js",
  "./assets/bahia-hero.svg", "./assets/wave.svg", "./assets/wave-footer-sand.svg", "./manifest.webmanifest", "./roteiro.json"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (new URL(req.url).pathname.endsWith("/roteiro.json")) {
    event.respondWith(fetch(req).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(req, response.clone()));
      return response;
    }).catch(() => caches.match(req).then(cached => cached || caches.match("./roteiro.json"))));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(req, response.clone()));
    return response;
  })));
});

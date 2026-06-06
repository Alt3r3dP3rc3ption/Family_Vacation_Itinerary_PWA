/* Service worker — caches the app shell for offline use after first load. */
const CACHE = "trip-itinerary-v2";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./app/styles.css",
  "./app/seed.js",
  "./app/store.js",
  "./app/parser.js",
  "./app/components.jsx",
  "./app/place-sheet.jsx",
  "./app/itinerary.jsx",
  "./app/directory.jsx",
  "./app/map.jsx",
  "./app/import.jsx",
  "./app/settings.jsx",
  "./app/app.jsx",
  "./app/icon-192.png",
  "./app/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// cache-first for app shell + same-origin; network-first fallback to cache otherwise
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
